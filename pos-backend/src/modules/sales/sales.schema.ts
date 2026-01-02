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

// Pagination query schema
export const salesPaginationSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

// Output schemas
export const saleItemResponseSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  price_at_sale: z.string(), // Decimal as string
});

// Extended sale item with product details
export const saleItemWithProductSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  price_at_sale: z.string(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    category: z.string().nullable(),
  }),
});

export const userInfoSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'cashier']),
});

export const saleResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  total: z.string(), // Decimal as string
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  items: z.array(saleItemResponseSchema).optional(),
  user: userInfoSchema.optional(),
});

// Detailed sale response with product info
export const saleDetailResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  total: z.string(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  created_at: z.union([z.date(), z.string()]),
  updated_at: z.union([z.date(), z.string()]),
  items: z.array(saleItemWithProductSchema),
  user: userInfoSchema,
});

export const salesListResponseSchema = z.object({
  sales: z.array(saleResponseSchema),
  count: z.number(),
  pagination: z.object({
    skip: z.number(),
    take: z.number(),
    total: z.number(),
  }).optional(),
});

// TypeScript types
export type SaleItemInput = z.infer<typeof saleItemInputSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SalesPaginationQuery = z.infer<typeof salesPaginationSchema>;
export type SaleItemResponse = z.infer<typeof saleItemResponseSchema>;
export type SaleItemWithProduct = z.infer<typeof saleItemWithProductSchema>;
export type SaleResponse = z.infer<typeof saleResponseSchema>;
export type SaleDetailResponse = z.infer<typeof saleDetailResponseSchema>;
export type SalesListResponse = z.infer<typeof salesListResponseSchema>;