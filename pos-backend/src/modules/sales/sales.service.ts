import prisma from '../../shared/prisma';
import { salesQueue } from '../../shared/queue';
import { CreateSaleInput, SalesPaginationQuery } from './sales.schema';
import { registerService } from '../register/register.service';


export class SalesService {
  /**
   * Create a new sale and queue stock deduction
   */
  async createSale(userId: string, data: CreateSaleInput) {
    try {
      // Calculate total upfront (no DB needed)
      const total = data.items.reduce(
        (sum, item) => sum + item.priceAtSale * item.quantity,
        0
      );

      // Single transaction: validate products + stock + create sale + items
      const result = await prisma.$transaction(async (tx) => {
        // Validate all products exist AND check stock in one query
        const productIds = data.items.map((item) => item.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, stock: true },
        });

        if (products.length !== productIds.length) {
          const foundIds = products.map((p) => p.id);
          const missingIds = productIds.filter((id) => !foundIds.includes(id));
          throw new Error(`Products not found: ${missingIds.join(', ')}`);
        }

        // Validate stock availability
        for (const item of data.items) {
          const product = products.find((p) => p.id === item.productId);
          if (product && product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }
        }

        // Validate Tab if provided
        if (data.tabId) {
          const tab = await tx.tab.findUnique({ where: { id: data.tabId } });
          if (!tab) throw new Error('Tab not found');
          if (tab.status !== 'ACTIVE') throw new Error('Tab is not active');
          if (Number(tab.balance) < total) {
            throw new Error(
              `Insufficient tab balance. Available: $${Number(tab.balance).toFixed(2)}, Required: $${total.toFixed(2)}`
            );
          }

          // Deduct from tab
          const newBalance = Number(tab.balance) - total;
          await tx.tab.update({
            where: { id: tab.id },
            data: {
              balance: newBalance,
              status: newBalance <= 0 ? 'EXHAUSTED' : 'ACTIVE',
            },
          });
        }

        // Create the sale
        const newSale = await tx.sale.create({
          data: {
            user_id: userId,
            tab_id: data.tabId,
            total,
            status: 'PENDING',
            payment_method: data.tabId ? 'TAB' : data.paymentMethod,
          },
        });

        // Create tab transaction if using tab
        if (data.tabId) {
          await tx.tabTransaction.create({
            data: {
              tab_id: data.tabId,
              type: 'PURCHASE',
              amount: total,
              sale_id: newSale.id,
              note: 'Purchase from tab',
            },
          });
        }

        // Create sale items
        await tx.saleItem.createMany({
          data: data.items.map((item) => ({
            sale_id: newSale.id,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_sale: item.priceAtSale,
          })),
        });

        // Return everything we need — no re-fetch required
        return {
          id: newSale.id,
          user_id: newSale.user_id,
          tab_id: newSale.tab_id,
          total: total.toString(),
          status: newSale.status,
          payment_method: newSale.payment_method,
          created_at: newSale.created_at,
          updated_at: newSale.updated_at,
          items: data.items.map((item, i) => ({
            id: `${newSale.id}-item-${i}`, // Placeholder ID (real IDs not needed by frontend)
            sale_id: newSale.id,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_sale: item.priceAtSale.toString(),
          })),
        };
      });

      console.log(`📝 Sale ${result.id} created with status PENDING`);

      // ⚡ Fire-and-forget: Queue stock deduction (don't await)
      salesQueue.add(
        'process-stock-deduction',
        {
          saleId: result.id,
          items: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        { jobId: `sale-${result.id}` }
      ).then(() => {
        console.log(`🚀 Stock deduction job queued for Sale ${result.id}`);
      }).catch((queueError) => {
        console.error('❌ Failed to queue stock deduction job:', queueError);
        // Sale is already created — mark as FAILED so it can be retried
        prisma.sale.update({
          where: { id: result.id },
          data: { status: 'FAILED' },
        }).catch((e) => console.error('Failed to mark sale as FAILED:', e));
      });

      // ⚡ Fire-and-forget: Record in cash register (only for non-tab sales)
      if (!data.tabId) {
        registerService.recordSale(userId, total).catch((regError) => {
          console.error('Failed to record sale to register:', regError);
        });
      }

      return result;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  /**
   * Void a sale validation and processing
   */
  async voidSale(saleId: string, voidedById: string, reason: string) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.status === 'VOIDED' as any) { // Type assertion until Prisma client updates
        throw new Error('Sale is already voided');
      }

      // 1. Transaction to update sale and restore stock
      await prisma.$transaction(async (tx) => {
        // Update sale status
        await tx.sale.update({
          where: { id: saleId },
          data: {
            status: 'VOIDED' as any,
            void_reason: reason,
            voided_by_id: voidedById,
            voided_at: new Date(),
          } as any, // Type assertions for new fields
        });

        // Restore stock
        for (const item of sale.items) {
          await tx.product.update({
            where: { id: item.product_id },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      });

      // 2. Record negative sale in register (if open) AND NOT TAB
      if (sale.payment_method === 'TAB' && sale.tab_id) {
        // Refund to tab
        await prisma.$transaction(async (tx) => {
          await tx.tabTransaction.create({
            data: {
              tab_id: sale.tab_id!,
              type: 'REFUND',
              amount: sale.total,
              sale_id: sale.id,
              note: 'Sale voided - amount returned to tab',
            },
          });

          await tx.tab.update({
            where: { id: sale.tab_id! },
            data: {
              balance: { increment: sale.total },
              status: 'ACTIVE', // Reactivate if was EXHAUSTED
            },
          });
        });
        console.log(`💳 Refunded to tab ${sale.tab_id}`);
      } else {
        // Refund to cash drawer log
        await registerService.recordSale(voidedById, -Number(sale.total));
      }

      console.log(`🚫 Sale ${saleId} voided by ${voidedById}`);
      return true;
    } catch (error) {
      console.error('Error voiding sale:', error);
      throw error;
    }
  }

  /**
   * Get sale by ID with product details
   */
  async getSaleById(saleId: string) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      if (!sale) {
        return null;
      }

      return {
        ...sale,
        total: sale.total.toString(),
        items: sale.items.map((item) => ({
          ...item,
          price_at_sale: item.price_at_sale.toString(),
          product: item.product,
        })),
      };
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  /**
   * Get all sales with pagination and filters
   */
  async getTodaySales(filters?: { userId?: string }) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where: any = {
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      };

      if (filters?.userId) {
        where.user_id = filters.userId;
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return {
        sales: sales.map((sale) => ({
          ...sale,
          total: sale.total.toString(),
          items: sale.items.map((item) => ({
            ...item,
            price_at_sale: item.price_at_sale.toString(),
            product: (item as any).product,
            productName: (item as any).product?.name,
          })),
        })),
        count: sales.length,
      };
    } catch (error) {
      console.error('Error fetching today\'s sales:', error);
      throw error;
    }
  }

  async getAllSales(
    filters?: { userId?: string; status?: string },
    pagination?: SalesPaginationQuery
  ) {
    try {
      const where: any = {};

      if (filters?.userId) {
        where.user_id = filters.userId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      // Get total count for pagination
      const total = await prisma.sale.count({ where });

      // Get paginated sales
      const sales = await prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: pagination?.skip || 0,
        take: pagination?.take || 20,
      });

      return {
        sales: sales.map((sale) => ({
          ...sale,
          total: sale.total.toString(),
          items: sale.items.map((item) => ({
            ...item,
            price_at_sale: item.price_at_sale.toString(),
            product: (item as any).product,
            productName: (item as any).product?.name,
          })),
        })),
        count: sales.length,
        pagination: pagination
          ? {
            skip: pagination.skip,
            take: pagination.take,
            total,
          }
          : undefined,
      };
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }
}

export const salesService = new SalesService();