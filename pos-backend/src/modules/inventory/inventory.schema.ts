import { z } from 'zod';

// Input schemas
export const restockSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().min(1),
  userId: z.string().optional(),
});

export const adjustStockSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0),
  reason: z.string().min(1).max(500),
  userId: z.string().optional(),
});

export const stockHistoryQuerySchema = z.object({
  productId: z.string().optional(),
  type: z.enum(['RESTOCK', 'ADJUSTMENT', 'SALE', 'VOID', 'INITIAL']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Output schemas
export const inventoryOperationResponseSchema = z.object({
  success: z.boolean(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    previous_stock: z.number(),
    new_stock: z.number(),
  }),
  operation: z.string(),
  timestamp: z.union([z.date(), z.string()]),
});

// TypeScript types
export type RestockInput = z.infer<typeof restockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type InventoryOperationResponse = z.infer<typeof inventoryOperationResponseSchema>;