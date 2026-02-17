import { z } from 'zod';

// --- Request Schemas ---

export const openRegisterSchema = z.object({
    opening_amount: z.number().min(0, 'Opening amount must be non-negative'),
});
export type OpenRegisterInput = z.infer<typeof openRegisterSchema>;

export const closeRegisterSchema = z.object({
    closing_amount: z.number().min(0, 'Closing amount must be non-negative'),
    notes: z.string().optional(),
});
export type CloseRegisterInput = z.infer<typeof closeRegisterSchema>;

export const cashMovementSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
});
export type CashMovementInput = z.infer<typeof cashMovementSchema>;

// --- Response Schemas ---

export const registerResponseSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    opened_at: z.string(),
    closed_at: z.string().nullable(),
    opening_amount: z.number(),
    closing_amount: z.number().nullable(),
    expected_amount: z.number().nullable(),
    notes: z.string().nullable(),
    logs: z.array(z.object({
        id: z.string(),
        type: z.string(),
        amount: z.number(),
        note: z.string().nullable(),
        created_at: z.string(),
    })).optional(),
});

export const registerListResponseSchema = z.object({
    registers: z.array(registerResponseSchema),
    total: z.number(),
});

// Void sale
export const voidSaleSchema = z.object({
    reason: z.string().min(1, 'Void reason is required'),
    pin: z.string().length(4, 'PIN must be 4 digits').optional(),
});
export type VoidSaleInput = z.infer<typeof voidSaleSchema>;
