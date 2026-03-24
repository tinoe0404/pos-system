import prisma from '../../shared/prisma';
import redis from '../../shared/redis';
import { RestockInput, AdjustStockInput } from './inventory.schema';

const CACHE_KEY = 'all_products';

export class InventoryService {
  /**
   * Restock product - INCREMENT stock
   */
  async restockProduct(data: RestockInput) {
    try {
      // Get current product
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const previousStock = product.stock;

      // Use a transaction to update stock and record movement
      const [updatedProduct] = await prisma.$transaction([
        prisma.product.update({
          where: { id: data.productId },
          data: {
            stock: {
              increment: data.quantity,
            },
          },
        }),
        prisma.stockMovement.create({
          data: {
            product_id: data.productId,
            type: 'RESTOCK',
            quantity_change: data.quantity,
            previous_stock: previousStock,
            new_stock: previousStock + data.quantity,
            created_by: data.userId,
          },
        }),
      ]);

      // Invalidate cache
      await redis.del(CACHE_KEY);
      console.log('🗑️  Cache INVALIDATED after restock');

      console.log(
        `📦 Restocked ${product.name} (SKU: ${product.sku}): ${previousStock} → ${updatedProduct.stock} (+${data.quantity})`
      );

      return {
        success: true,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          sku: updatedProduct.sku,
          previous_stock: previousStock,
          new_stock: updatedProduct.stock,
        },
        operation: 'restock',
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('Product not found');
      }
      throw error;
    }
  }

  /**
   * Adjust stock - SET stock explicitly
   */
  async adjustStock(data: AdjustStockInput) {
    try {
      // Get current product
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const previousStock = product.stock;
      const quantityChange = data.quantity - previousStock;

      // Set stock explicitly and record movement
      const [updatedProduct] = await prisma.$transaction([
        prisma.product.update({
          where: { id: data.productId },
          data: {
            stock: data.quantity,
          },
        }),
        prisma.stockMovement.create({
          data: {
            product_id: data.productId,
            type: 'ADJUSTMENT',
            quantity_change: quantityChange,
            previous_stock: previousStock,
            new_stock: data.quantity,
            reason: data.reason,
            created_by: data.userId,
          },
        }),
      ]);

      // Invalidate cache
      await redis.del(CACHE_KEY);
      console.log('🗑️  Cache INVALIDATED after stock adjustment');

      console.log(
        `🔧 Adjusted stock for ${product.name} (SKU: ${product.sku}): ${previousStock} → ${updatedProduct.stock}`
      );
      console.log(`📝 Reason: ${data.reason}`);

      return {
        success: true,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          sku: updatedProduct.sku,
          previous_stock: previousStock,
          new_stock: updatedProduct.stock,
        },
        operation: `adjustment: ${data.reason}`,
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('Product not found');
      }
      throw error;
    }
  }
  async getLowStockProducts() {
    try {
      // Find products where stock <= min_stock
      // Using raw query or findMany with where clause
      // Prisma doesn't support field comparison in where clause directly efficiently in all versions, 
      // but we can query all active products and filter, or use raw query.
      // Since stock and min_stock are fields on the same model, we can use Prisma's raw query for best performance,
      // OR since we added an index, we can just fetch them if we had a computed column.
      // But standard Prisma findMany `where: { stock: { lte: prisma.product.fields.min_stock } }` is not supported.

      // Let's use queryRaw for efficiency
      const products = await prisma.$queryRaw`
        SELECT id, name, sku, stock, min_stock as "minStock", price 
        FROM products 
        WHERE stock <= min_stock AND is_active = true
        ORDER BY stock ASC
      `;

      return products;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  /**
   * Get paginated stock movement history
   */
  async getStockHistory(filters: { productId?: string; type?: any }, page: number, limit: number) {
    const where: any = {};
    if (filters.productId) where.product_id = filters.productId;
    if (filters.type) where.type = filters.type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: {
            select: { name: true, sku: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    // Populate user names if needed, but for now we just return created_by
    return {
      movements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const inventoryService = new InventoryService();