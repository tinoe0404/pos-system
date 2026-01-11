import { PrismaClient } from '@prisma/client';
import { salesQueue } from '../../shared/queue';
import { CreateSaleInput, SalesPaginationQuery } from './sales.schema';

const prisma = new PrismaClient();

export class SalesService {
  /**
   * Create a new sale and queue stock deduction
   */
  async createSale(userId: string, data: CreateSaleInput) {
    try {
      // Validate all products exist BEFORE creating sale
      const productIds = data.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      // Check if all products were found
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

      // Calculate total
      const total = data.items.reduce(
        (sum, item) => sum + item.priceAtSale * item.quantity,
        0
      );

      // Create sale with items in a transaction
      const sale = await prisma.$transaction(async (tx) => {
        // Create the sale
        const newSale = await tx.sale.create({
          data: {
            user_id: userId,
            total,
            status: 'PENDING',
            payment_method: data.paymentMethod,
          },
        });

        // Create sale items
        await tx.saleItem.createMany({
          data: data.items.map((item) => ({
            sale_id: newSale.id,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_sale: item.priceAtSale,
          })),
        });

        return newSale;
      });

      console.log(`📝 Sale ${sale.id} created with status PENDING`);

      // Add job to queue for background stock deduction
      try {
        await salesQueue.add(
          'process-stock-deduction',
          {
            saleId: sale.id,
            items: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
          {
            jobId: `sale-${sale.id}`, // Unique job ID to prevent duplicates
          }
        );
        console.log(`🚀 Stock deduction job queued for Sale ${sale.id}`);
      } catch (queueError) {
        console.error('❌ Failed to queue stock deduction job. Rolling back sale...', queueError);

        // ROLLBACK: Delete the sale if we can't ensure stock deduction
        await prisma.sale.delete({
          where: { id: sale.id },
        });

        throw new Error('Failed to process sale. System busy, please try again.');
      }

      // Return sale with items
      const saleWithItems = await prisma.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: true,
        },
      });

      return {
        ...saleWithItems!,
        total: saleWithItems!.total.toString(),
        items: saleWithItems!.items.map((item) => ({
          ...item,
          price_at_sale: item.price_at_sale.toString(),
        })),
      };
    } catch (error) {
      console.error('Error creating sale:', error);
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
                  id: true,
                  name: true,
                  sku: true,
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
          items: true,
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