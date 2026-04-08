import prisma from '../../shared/prisma';
import redis from '../../shared/redis';
import { memcache } from '../../shared/memcache';
import { CreateProductInput, UpdateProductInput } from './product.schema';


const CACHE_KEY = 'all_products';
const REDIS_TTL = 3600; // 1 hour in seconds
const MEMORY_TTL = 10;  // 10 seconds — fast L1 cache

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
  abv: string | null;
  ibu: number | null;
  brewery: string | null;
  style: string | null;
  is_tap_item: boolean;
  unit_volume: string | null;
  created_at: Date;
  updated_at: Date;
};

export class ProductService {
  /**
   * Get all products with L1 (memory) + L2 (Redis) caching
   */
  async getAllProducts() {
    try {
      // L1: In-memory cache (instant, no network)
      const memCached = memcache.get<SerializedProduct[]>(CACHE_KEY);
      if (memCached) {
        return {
          products: memCached,
          count: memCached.length,
          cached: true,
        };
      }

      // L2: Redis cache (remote, but faster than DB)
      const redisCached = await redis.get(CACHE_KEY);
      if (redisCached) {
        const parsed = JSON.parse(redisCached);
        // Warm up L1 cache
        memcache.set(CACHE_KEY, parsed, MEMORY_TTL);
        return {
          products: parsed,
          count: parsed.length,
          cached: true,
        };
      }

      // L3: Database (slowest)
      const products = await prisma.product.findMany({
        orderBy: { created_at: 'desc' },
      });

      // Convert Decimal to string for JSON serialization
      const serializedProducts: SerializedProduct[] = products.map((p) => ({
        ...p,
        price: p.price.toString(),
        abv: p.abv ? p.abv.toString() : null,
        unit_volume: p.unit_volume ? p.unit_volume.toString() : null,
        ibu: p.ibu,
        brewery: p.brewery,
        style: p.style,
        is_tap_item: p.is_tap_item,
      }));

      // Save to both caches
      memcache.set(CACHE_KEY, serializedProducts, MEMORY_TTL);
      await redis.setex(CACHE_KEY, REDIS_TTL, JSON.stringify(serializedProducts));

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
        abv: product.abv ? product.abv.toString() : null,
        unit_volume: product.unit_volume ? product.unit_volume.toString() : null,
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
          abv: data.abv,
          ibu: data.ibu,
          brewery: data.brewery,
          style: data.style,
          is_tap_item: data.is_tap_item,
          unit_volume: data.unit_volume,
        },
      });

      // Invalidate both caches immediately
      memcache.del(CACHE_KEY);
      await redis.del(CACHE_KEY);

      return {
        ...product,
        price: product.price.toString(),
        abv: product.abv ? product.abv.toString() : null,
        unit_volume: product.unit_volume ? product.unit_volume.toString() : null,
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

      // Beer-specific fields
      if (data.abv !== undefined) updateData.abv = data.abv;
      if (data.ibu !== undefined) updateData.ibu = data.ibu;
      if (data.brewery !== undefined) updateData.brewery = data.brewery;
      if (data.style !== undefined) updateData.style = data.style;
      if (data.is_tap_item !== undefined) updateData.is_tap_item = data.is_tap_item;
      if (data.unit_volume !== undefined) updateData.unit_volume = data.unit_volume;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      // Invalidate both caches immediately
      memcache.del(CACHE_KEY);
      await redis.del(CACHE_KEY);

      return {
        ...product,
        price: product.price.toString(),
        abv: product.abv ? product.abv.toString() : null,
        unit_volume: product.unit_volume ? product.unit_volume.toString() : null,
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

      // Invalidate both caches immediately
      memcache.del(CACHE_KEY);
      await redis.del(CACHE_KEY);

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