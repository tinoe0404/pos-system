"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabSearchSchema = exports.closeTabSchema = exports.depositTabSchema = exports.createTabSchema = void 0;
const zod_1 = require("zod");
exports.createTabSchema = zod_1.z.object({
    customer_name: zod_1.z.string().min(1, 'Customer name is required').max(100),
    phone: zod_1.z.string().max(20).optional(),
    deposit_amount: zod_1.z.number().positive('Deposit must be greater than 0'),
});
exports.depositTabSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    note: zod_1.z.string().max(200).optional(),
});
exports.closeTabSchema = zod_1.z.object({
    note: zod_1.z.string().max(200).optional(),
});
exports.tabSearchSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'CLOSED', 'EXHAUSTED']).optional(),
});
