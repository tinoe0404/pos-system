"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsListResponseSchema = exports.productResponseSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
// Input schemas
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().positive().multipleOf(0.01),
    stock: zod_1.z.number().int().min(0).default(0),
    min_stock: zod_1.z.number().int().min(0).default(10),
    sku: zod_1.z.string().min(1).max(100),
    category: zod_1.z.string().max(100).optional(),
    is_active: zod_1.z.boolean().default(true),
    // Beer-specific fields
    abv: zod_1.z.number().min(0).max(100).optional(),
    ibu: zod_1.z.number().int().min(0).optional(),
    brewery: zod_1.z.string().max(200).optional(),
    style: zod_1.z.string().max(100).optional(),
    is_tap_item: zod_1.z.boolean().default(false),
    unit_volume: zod_1.z.number().positive().optional(),
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().positive().multipleOf(0.01).optional(),
    stock: zod_1.z.number().int().min(0).optional(),
    min_stock: zod_1.z.number().int().min(0).optional(),
    sku: zod_1.z.string().min(1).max(100).optional(),
    category: zod_1.z.string().max(100).optional(),
    is_active: zod_1.z.boolean().optional(),
    // Beer-specific fields
    abv: zod_1.z.number().min(0).max(100).optional(),
    ibu: zod_1.z.number().int().min(0).optional(),
    brewery: zod_1.z.string().max(200).optional(),
    style: zod_1.z.string().max(100).optional(),
    is_tap_item: zod_1.z.boolean().optional(),
    unit_volume: zod_1.z.number().positive().optional(),
});
// Output schemas - Accept both Date and string for dates (for Redis cache compatibility)
exports.productResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    price: zod_1.z.string(), // Decimal as string in JSON
    stock: zod_1.z.number(),
    min_stock: zod_1.z.number(),
    sku: zod_1.z.string(),
    category: zod_1.z.string().nullable(),
    is_active: zod_1.z.boolean(),
    // Beer-specific fields
    abv: zod_1.z.string().nullable().optional(), // Decimal as string from Prisma
    ibu: zod_1.z.number().nullable().optional(),
    brewery: zod_1.z.string().nullable().optional(),
    style: zod_1.z.string().nullable().optional(),
    is_tap_item: zod_1.z.boolean().optional(),
    unit_volume: zod_1.z.string().nullable().optional(), // Decimal as string from Prisma
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]), // Accept both Date and string
    updated_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]), // Accept both Date and string
});
exports.productsListResponseSchema = zod_1.z.object({
    products: zod_1.z.array(exports.productResponseSchema),
    count: zod_1.z.number(),
    cached: zod_1.z.boolean().optional(),
});
