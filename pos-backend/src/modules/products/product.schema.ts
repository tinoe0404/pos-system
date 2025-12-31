import { z } from 'zod';

// Input schemas
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive().multipleOf(0.01),
  stock: z.number().int().min(0).default(0),
  sku: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  is_active: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().multipleOf(0.01).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().min(1).max(100).optional(),
  category: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
});

// Output schemas - Accept both Date and string for dates (for Redis cache compatibility)
export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(), // Decimal as string in JSON
  stock: z.number(),
  sku: z.string(),
  category: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.union([z.date(), z.string()]), // Accept both Date and string
  updated_at: z.union([z.date(), z.string()]), // Accept both Date and string
});

export const productsListResponseSchema = z.object({
  products: z.array(productResponseSchema),
  count: z.number(),
  cached: z.boolean().optional(),
});

// TypeScript types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;