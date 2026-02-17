"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voidSaleSchema = exports.registerListResponseSchema = exports.registerResponseSchema = exports.cashMovementSchema = exports.closeRegisterSchema = exports.openRegisterSchema = void 0;
const zod_1 = require("zod");
// --- Request Schemas ---
exports.openRegisterSchema = zod_1.z.object({
    opening_amount: zod_1.z.number().min(0, 'Opening amount must be non-negative'),
});
exports.closeRegisterSchema = zod_1.z.object({
    closing_amount: zod_1.z.number().min(0, 'Closing amount must be non-negative'),
    notes: zod_1.z.string().optional(),
});
exports.cashMovementSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be positive'),
    note: zod_1.z.string().optional(),
});
// --- Response Schemas ---
exports.registerResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    opened_at: zod_1.z.string(),
    closed_at: zod_1.z.string().nullable(),
    opening_amount: zod_1.z.number(),
    closing_amount: zod_1.z.number().nullable(),
    expected_amount: zod_1.z.number().nullable(),
    notes: zod_1.z.string().nullable(),
    logs: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string(),
        amount: zod_1.z.number(),
        note: zod_1.z.string().nullable(),
        created_at: zod_1.z.string(),
    })).optional(),
});
exports.registerListResponseSchema = zod_1.z.object({
    registers: zod_1.z.array(exports.registerResponseSchema),
    total: zod_1.z.number(),
});
// Void sale
exports.voidSaleSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Void reason is required'),
    pin: zod_1.z.string().length(4, 'PIN must be 4 digits').optional(),
});
