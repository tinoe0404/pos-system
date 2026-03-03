import { z } from 'zod';

export const kegStatusEnum = z.enum(['NEW', 'ACTIVE', 'EMPTY', 'TAP_RESERVED']);

export const createKegSchema = z.object({
    product_id: z.string(),
    total_volume: z.number().positive(),
    current_volume: z.number().nonnegative().optional(),
    status: kegStatusEnum.default('NEW'),
});

export const updateKegSchema = z.object({
    status: kegStatusEnum.optional(),
    current_volume: z.number().nonnegative().optional(),
    finished_at: z.union([z.date(), z.string()]).optional(),
});

export const kegResponseSchema = z.object({
    id: z.string(),
    product_id: z.string(),
    total_volume: z.string(),
    current_volume: z.string(),
    status: kegStatusEnum,
    tapped_at: z.union([z.date(), z.string()]).nullable(),
    finished_at: z.union([z.date(), z.string()]).nullable(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
});

export const createTapSchema = z.object({
    id: z.number().int().positive(),
    keg_id: z.string().optional(),
    is_active: z.boolean().default(true),
});

export const updateTapSchema = z.object({
    keg_id: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
});

export const tapResponseSchema = z.object({
    id: z.number(),
    keg_id: z.string().nullable(),
    is_active: z.boolean(),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
});

export type CreateKegInput = z.infer<typeof createKegSchema>;
export type UpdateKegInput = z.infer<typeof updateKegSchema>;
export type CreateTapInput = z.infer<typeof createTapSchema>;
export type UpdateTapInput = z.infer<typeof updateTapSchema>;
