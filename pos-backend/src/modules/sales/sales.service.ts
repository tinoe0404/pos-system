import { PrismaClient } from '@prisma/client';
import { salesQueue } from '../../shared/queue';
import { CreateSaleInput } from './sales.schema';

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
   * Get sale by ID
   */
  async getSaleById(saleId: string) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
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
        })),
      };
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  /**
   * Get all sales with optional filters
   */
  async getAllSales(filters?: { userId?: string; status?: string }) {
    try {
      const where: any = {};

      if (filters?.userId) {
        where.user_id = filters.userId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

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
      };
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }
}

export const salesService = new SalesService();