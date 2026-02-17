"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryOperationResponseSchema = exports.adjustStockSchema = exports.restockSchema = void 0;
const zod_1 = require("zod");
// Input schemas
exports.restockSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().min(1),
});
exports.adjustStockSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().min(0),
    reason: zod_1.z.string().min(1).max(500),
});
// Output schemas
exports.inventoryOperationResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    product: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        sku: zod_1.z.string(),
        previous_stock: zod_1.z.number(),
        new_stock: zod_1.z.number(),
    }),
    operation: zod_1.z.string(),
    timestamp: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
});
