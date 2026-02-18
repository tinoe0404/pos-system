import { z } from 'zod';

export const createTabSchema = z.object({
    customer_name: z.string().min(1, 'Customer name is required').max(100),
    phone: z.string().max(20).optional(),
    deposit_amount: z.number().positive('Deposit must be greater than 0'),
});

export const depositTabSchema = z.object({
    amount: z.number().positive('Amount must be greater than 0'),
    note: z.string().max(200).optional(),
});

export const closeTabSchema = z.object({
    note: z.string().max(200).optional(),
});

export const tabSearchSchema = z.object({
    q: z.string().optional(),
    status: z.enum(['ACTIVE', 'CLOSED', 'EXHAUSTED']).optional(),
});

export type CreateTabInput = z.infer<typeof createTabSchema>;
export type DepositTabInput = z.infer<typeof depositTabSchema>;
export type CloseTabInput = z.infer<typeof closeTabSchema>;
export type TabSearchQuery = z.infer<typeof tabSearchSchema>;
