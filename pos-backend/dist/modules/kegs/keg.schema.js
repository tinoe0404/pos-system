"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tapResponseSchema = exports.updateTapSchema = exports.createTapSchema = exports.kegResponseSchema = exports.updateKegSchema = exports.createKegSchema = exports.kegStatusEnum = void 0;
const zod_1 = require("zod");
exports.kegStatusEnum = zod_1.z.enum(['NEW', 'ACTIVE', 'EMPTY', 'TAP_RESERVED']);
exports.createKegSchema = zod_1.z.object({
    product_id: zod_1.z.string(),
    total_volume: zod_1.z.number().positive(),
    current_volume: zod_1.z.number().nonnegative().optional(),
    status: exports.kegStatusEnum.default('NEW'),
});
exports.updateKegSchema = zod_1.z.object({
    status: exports.kegStatusEnum.optional(),
    current_volume: zod_1.z.number().nonnegative().optional(),
    finished_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).optional(),
});
exports.kegResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    product_id: zod_1.z.string(),
    total_volume: zod_1.z.string(),
    current_volume: zod_1.z.string(),
    status: exports.kegStatusEnum,
    tapped_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).nullable(),
    finished_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).nullable(),
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    updated_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
});
exports.createTapSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    keg_id: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().default(true),
});
exports.updateTapSchema = zod_1.z.object({
    keg_id: zod_1.z.string().nullable().optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.tapResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    keg_id: zod_1.z.string().nullable(),
    is_active: zod_1.z.boolean(),
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    updated_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
});
