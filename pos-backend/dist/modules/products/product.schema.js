"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsListResponseSchema = exports.productResponseSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().positive().multipleOf(0.01),
    stock: zod_1.z.number().int().min(0).default(0),
    sku: zod_1.z.string().min(1).max(100),
    category: zod_1.z.string().max(100).optional(),
    is_active: zod_1.z.boolean().default(true),
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().positive().multipleOf(0.01).optional(),
    stock: zod_1.z.number().int().min(0).optional(),
    sku: zod_1.z.string().min(1).max(100).optional(),
    category: zod_1.z.string().max(100).optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.productResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    price: zod_1.z.string(),
    stock: zod_1.z.number(),
    sku: zod_1.z.string(),
    category: zod_1.z.string().nullable(),
    is_active: zod_1.z.boolean(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
exports.productsListResponseSchema = zod_1.z.object({
    products: zod_1.z.array(exports.productResponseSchema),
    count: zod_1.z.number(),
    cached: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=product.schema.js.map