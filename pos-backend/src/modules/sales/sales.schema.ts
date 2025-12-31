import { z } from 'zod';

// Input schemas
export const saleItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().min(1),
  priceAtSale: z.number().positive().multipleOf(0.01),
});

export const createSaleSchema = z.object({
  items: z.array(saleItemInputSchema).min(1, 'At least one item is required'),
});

// Output schemas
export const saleItemResponseSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  price_at_sale: z.string(), // Decimal as string
});

export const saleResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  total: z.string(), // Decimal as string
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  items: z.array(saleItemResponseSchema).optional(),
});

export const salesListResponseSchema = z.object({
  sales: z.array(saleResponseSchema),
  count: z.number(),
});

// TypeScript types
export type SaleItemInput = z.infer<typeof saleItemInputSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleItemResponse = z.infer<typeof saleItemResponseSchema>;
export type SaleResponse = z.infer<typeof saleResponseSchema>;
export type SalesListResponse = z.infer<typeof salesListResponseSchema>;