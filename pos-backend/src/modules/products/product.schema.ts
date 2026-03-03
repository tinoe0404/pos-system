import { z } from 'zod';

// Input schemas
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive().multipleOf(0.01),
  stock: z.number().int().min(0).default(0),
  min_stock: z.number().int().min(0).default(10),
  sku: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  is_active: z.boolean().default(true),
  // Beer-specific fields
  abv: z.number().min(0).max(100).optional(),
  ibu: z.number().int().min(0).optional(),
  brewery: z.string().max(200).optional(),
  style: z.string().max(100).optional(),
  is_tap_item: z.boolean().default(false),
  unit_volume: z.number().positive().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().multipleOf(0.01).optional(),
  stock: z.number().int().min(0).optional(),
  min_stock: z.number().int().min(0).optional(),
  sku: z.string().min(1).max(100).optional(),
  category: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
  // Beer-specific fields
  abv: z.number().min(0).max(100).optional(),
  ibu: z.number().int().min(0).optional(),
  brewery: z.string().max(200).optional(),
  style: z.string().max(100).optional(),
  is_tap_item: z.boolean().optional(),
  unit_volume: z.number().positive().optional(),
});

// Output schemas - Accept both Date and string for dates (for Redis cache compatibility)
export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(), // Decimal as string in JSON
  stock: z.number(),
  min_stock: z.number(),
  sku: z.string(),
  category: z.string().nullable(),
  is_active: z.boolean(),
  // Beer-specific fields
  abv: z.string().nullable().optional(), // Decimal as string from Prisma
  ibu: z.number().nullable().optional(),
  brewery: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  is_tap_item: z.boolean().optional(),
  unit_volume: z.string().nullable().optional(), // Decimal as string from Prisma
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