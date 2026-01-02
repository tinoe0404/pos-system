import { PrismaClient } from '@prisma/client';
import redis from '../../shared/redis';
import { RestockInput, AdjustStockInput } from './inventory.schema';

const prisma = new PrismaClient();
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

      // Increment stock
      const updatedProduct = await prisma.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });

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

      // Set stock explicitly
      const updatedProduct = await prisma.product.update({
        where: { id: data.productId },
        data: {
          stock: data.quantity,
        },
      });

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
}

export const inventoryService = new InventoryService();