"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundResponseSchema = exports.createRefundSchema = void 0;
const zod_1 = require("zod");
exports.createRefundSchema = zod_1.z.object({
    saleId: zod_1.z.string().cuid(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().cuid(),
        quantity: zod_1.z.number().int().positive(),
    })).min(1),
    reason: zod_1.z.string().optional(),
});
exports.refundResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    saleIds: zod_1.z.string(),
    totalAmount: zod_1.z.number(), // or string if Decimal
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'REJECTED']),
    createdAt: zod_1.z.date(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string(),
        quantity: zod_1.z.number(),
        amount: zod_1.z.number(),
    }))
});
