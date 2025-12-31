"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponseSchema = exports.userResponseSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(100),
});
exports.userResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    role: zod_1.z.enum(['admin', 'cashier']),
    created_at: zod_1.z.date(),
});
exports.authResponseSchema = zod_1.z.object({
    token: zod_1.z.string(),
    user: exports.userResponseSchema,
});
//# sourceMappingURL=auth.schema.js.map