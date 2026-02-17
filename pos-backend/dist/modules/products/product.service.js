"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const redis_1 = __importDefault(require("../../shared/redis"));
const prisma = new client_1.PrismaClient();
const CACHE_KEY = 'all_products';
const CACHE_TTL = 3600; // 1 hour in seconds
class ProductService {
    /**
     * Get all products with Redis caching
     */
    async getAllProducts() {
        try {
            // Try to get from cache first
            const cached = await redis_1.default.get(CACHE_KEY);
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
            const serializedProducts = products.map((p) => ({
                ...p,
                price: p.price.toString(),
            }));
            // Save to Redis cache
            await redis_1.default.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(serializedProducts));
            return {
                products: serializedProducts,
                count: products.length,
                cached: false,
            };
        }
        catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
    /**
     * Get product by ID
     */
    async getProductById(id) {
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
        }
        catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }
    /**
     * Create a new product and invalidate cache
     */
    async createProduct(data) {
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
            await redis_1.default.del(CACHE_KEY);
            console.log('🗑️  Cache INVALIDATED after product creation');
            return {
                ...product,
                price: product.price.toString(),
            };
        }
        catch (error) {
            // Check for unique constraint violation (duplicate SKU)
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002') {
                throw new Error('Product with this SKU already exists');
            }
            throw error;
        }
    }
    /**
     * Update product and invalidate cache
     */
    async updateProduct(id, data) {
        try {
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.price !== undefined)
                updateData.price = data.price;
            if (data.stock !== undefined)
                updateData.stock = data.stock;
            if (data.sku !== undefined)
                updateData.sku = data.sku;
            if (data.category !== undefined)
                updateData.category = data.category;
            if (data.is_active !== undefined)
                updateData.is_active = data.is_active;
            const product = await prisma.product.update({
                where: { id },
                data: updateData,
            });
            // Invalidate cache immediately
            await redis_1.default.del(CACHE_KEY);
            console.log('🗑️  Cache INVALIDATED after product update');
            return {
                ...product,
                price: product.price.toString(),
            };
        }
        catch (error) {
            // Check for record not found
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2025') {
                throw new Error('Product not found');
            }
            // Check for unique constraint violation
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002') {
                throw new Error('Product with this SKU already exists');
            }
            throw error;
        }
    }
    /**
     * Delete product and invalidate cache
     */
    async deleteProduct(id) {
        try {
            await prisma.product.delete({
                where: { id },
            });
            // Invalidate cache immediately
            await redis_1.default.del(CACHE_KEY);
            console.log('🗑️  Cache INVALIDATED after product deletion');
            return { success: true };
        }
        catch (error) {
            // Check for record not found
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2025') {
                throw new Error('Product not found');
            }
            throw error;
        }
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
