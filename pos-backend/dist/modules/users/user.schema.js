"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersListResponseSchema = exports.userResponseSchema = exports.setPinSchema = exports.deactivateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
// Input schemas
exports.createUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(100),
    role: zod_1.z.enum(['admin', 'cashier']).default('cashier'),
});
exports.deactivateUserSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.setPinSchema = zod_1.z.object({
    pin: zod_1.z.string().length(4).regex(/^\d+$/, 'PIN must be 4 digits'),
});
// Output schemas
exports.userResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    role: zod_1.z.enum(['admin', 'cashier']),
    is_active: zod_1.z.boolean(),
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
});
exports.usersListResponseSchema = zod_1.z.object({
    users: zod_1.z.array(exports.userResponseSchema),
    count: zod_1.z.number(),
});
