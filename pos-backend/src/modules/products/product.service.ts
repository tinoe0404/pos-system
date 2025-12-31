import { PrismaClient } from '@prisma/client';
import redis from '../../shared/redis';
import { CreateProductInput, UpdateProductInput } from './product.schema';

const prisma = new PrismaClient();

const CACHE_KEY = 'all_products';
const CACHE_TTL = 3600; // 1 hour in seconds

// Helper type for serialized product
type SerializedProduct = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  sku: string;
  category: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export class ProductService {
  /**
   * Get all products with Redis caching
   */
  async getAllProducts() {
    try {
      // Try to get from cache first
      const cached = await redis.get(CACHE_KEY);
      
      if (cached) {
        console.log('🎯 Cache HIT: Returning products from Redis');
        return {
          products: JSON.parse(cached),
          count: JSON.parse(cached).length,
          cached: true,
        };
      }

      console.log('💾 Cache MISS: Fetching products from Database');
      
      // Fetch from database
      const products = await prisma.product.findMany({
        orderBy: { created_at: 'desc' },
      });

      // Convert Decimal to string for JSON serialization
      const serializedProducts: SerializedProduct[] = products.map((p) => ({
        ...p,
        price: p.price.toString(),
      }));

      // Save to Redis cache
      await redis.setex(
        CACHE_KEY,
        CACHE_TTL,
        JSON.stringify(serializedProducts)
      );

      return {
        products: serializedProducts,
        count: products.length,
        cached: false,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return null;
      }

      return {
        ...product,
        price: product.price.toString(),
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Create a new product and invalidate cache
   */
  async createProduct(data: CreateProductInput) {
    try {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          sku: data.sku,
          category: data.category,
          is_active: data.is_active,
        },
      });

      // Invalidate cache immediately
      await redis.del(CACHE_KEY);
      console.log('🗑️  Cache INVALIDATED after product creation');

      return {
        ...product,
        price: product.price.toString(),
      };
    } catch (error: unknown) {
      // Check for unique constraint violation (duplicate SKU)
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new Error('Product with this SKU already exists');
      }
      throw error;
    }
  }

  /**
   * Update product and invalidate cache
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.sku !== undefined) updateData.sku = data.sku;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      // Invalidate cache immediately
      await redis.del(CACHE_KEY);
      console.log('🗑️  Cache INVALIDATED after product update');

      return {
        ...product,
        price: product.price.toString(),
      };
    } catch (error: unknown) {
      // Check for record not found
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('Product not found');
      }
      // Check for unique constraint violation
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new Error('Product with this SKU already exists');
      }
      throw error;
    }
  }

  /**
   * Delete product and invalidate cache
   */
  async deleteProduct(id: string) {
    try {
      await prisma.product.delete({
        where: { id },
      });

      // Invalidate cache immediately
      await redis.del(CACHE_KEY);
      console.log('🗑️  Cache INVALIDATED after product deletion');

      return { success: true };
    } catch (error: unknown) {
      // Check for record not found
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

export const productService = new ProductService();