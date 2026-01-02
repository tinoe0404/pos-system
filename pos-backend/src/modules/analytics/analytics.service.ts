import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Get daily summary - Total revenue, transactions, and stock for TODAY
   */
  async getDailySummary() {
    try {
      // Get start and end of today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Get total revenue and transaction count for today
      const todaySales = await prisma.sale.aggregate({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: 'COMPLETED',
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      });

      // Get total stock across all products
      const stockAggregate = await prisma.product.aggregate({
        _sum: {
          stock: true,
        },
      });

      const totalRevenue = todaySales._sum.total || 0;
      const totalTransactions = todaySales._count.id || 0;
      const totalStock = stockAggregate._sum.stock || 0;

      return {
        totalRevenue: totalRevenue.toString(),
        totalTransactions,
        totalStock,
        date: startOfDay.toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw error;
    }
  }

  /**
   * Get top 5 best-selling products by quantity
   */
  async getBestSellers() {
    try {
      // Group sale items by product and sum quantities
      const bestSellers = await prisma.saleItem.groupBy({
        by: ['product_id'],
        _sum: {
          quantity: true,
          price_at_sale: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      // Fetch product details for each best seller
      const bestSellersWithDetails = await Promise.all(
        bestSellers.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.product_id },
            select: {
              id: true,
              name: true,
              sku: true,
            },
          });

          if (!product) {
            return null;
          }

          // Calculate total revenue for this product
          const revenueData = await prisma.saleItem.aggregate({
            where: {
              product_id: item.product_id,
            },
            _sum: {
              price_at_sale: true,
            },
          });

          return {
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            total_quantity_sold: item._sum.quantity || 0,
            total_revenue: (revenueData._sum.price_at_sale || 0).toString(),
          };
        })
      );

      // Filter out any null entries
      const validBestSellers = bestSellersWithDetails.filter(
        (item) => item !== null
      );

      return {
        bestSellers: validBestSellers,
        count: validBestSellers.length,
      };
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  }

  /**
   * Get products with low stock (stock < 10)
   */
  async getLowStockProducts() {
    try {
      const threshold = 10;

      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lt: threshold,
          },
          is_active: true,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          category: true,
          price: true,
        },
        orderBy: {
          stock: 'asc',
        },
      });

      return {
        lowStockProducts: lowStockProducts.map((p) => ({
          ...p,
          price: p.price.toString(),
        })),
        count: lowStockProducts.length,
        threshold,
      };
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  /**
   * Get restock recommendations
   * Logic: Products with high sales (sold > 5 in last 7 days) AND low stock (< 10)
   */
  async getRestockRecommendations() {
    try {
      // Get date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get sale items from last 7 days, grouped by product
      const recentSales = await prisma.saleItem.groupBy({
        by: ['product_id'],
        where: {
          sale: {
            created_at: {
              gte: sevenDaysAgo,
            },
            status: 'COMPLETED',
          },
        },
        _sum: {
          quantity: true,
        },
        having: {
          quantity: {
            _sum: {
              gt: 5, // More than 5 units sold
            },
          },
        },
      });

      // Get product details for items that meet criteria
      const recommendations = await Promise.all(
        recentSales.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.product_id },
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              category: true,
              is_active: true,
            },
          });

          // Only include if stock is low (< 10) and product is active
          if (product && product.stock < 10 && product.is_active) {
            return {
              id: product.id,
              name: product.name,
              sku: product.sku,
              current_stock: product.stock,
              total_sold_last_7_days: item._sum.quantity || 0,
              category: product.category,
              reason: `High demand: ${item._sum.quantity} units sold in last 7 days, only ${product.stock} remaining`,
            };
          }

          return null;
        })
      );

      // Filter out null entries
      const validRecommendations = recommendations.filter(
        (item) => item !== null
      );

      return {
        recommendations: validRecommendations,
        count: validRecommendations.length,
      };
    } catch (error) {
      console.error('Error fetching restock recommendations:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();