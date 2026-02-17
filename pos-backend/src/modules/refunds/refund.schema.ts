import { z } from 'zod';

export const createRefundSchema = z.object({
    saleId: z.string().cuid(),
    items: z.array(z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().positive(),
    })).min(1),
    reason: z.string().optional(),
});

export const refundResponseSchema = z.object({
    id: z.string(),
    saleIds: z.string(),
    totalAmount: z.number(), // or string if Decimal
    status: z.enum(['PENDING', 'COMPLETED', 'REJECTED']),
    createdAt: z.date(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
        amount: z.number(),
    }))
});

export type CreateRefundInput = z.infer<typeof createRefundSchema>;
