import { z } from 'zod';

// Output schemas

// Daily summary response
export const dailySummaryResponseSchema = z.object({
  totalRevenue: z.string(), // Decimal as string
  totalTransactions: z.number(),
  totalStock: z.number(),
  date: z.string(),
});

// Best seller item
export const bestSellerItemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  sku: z.string(),
  total_quantity_sold: z.number(),
  total_revenue: z.string(), // Decimal as string
});

export const bestSellersResponseSchema = z.object({
  bestSellers: z.array(bestSellerItemSchema),
  count: z.number(),
});

// Low stock item
export const lowStockItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  stock: z.number(),
  category: z.string().nullable(),
  price: z.string(),
});

export const lowStockResponseSchema = z.object({
  lowStockProducts: z.array(lowStockItemSchema),
  count: z.number(),
  threshold: z.number(),
});

// Restock recommendation item
export const restockRecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  current_stock: z.number(),
  total_sold_last_7_days: z.number(),
  category: z.string().nullable(),
  reason: z.string(),
});

export const restockRecommendationsResponseSchema = z.object({
  recommendations: z.array(restockRecommendationSchema),
  count: z.number(),
});

// TypeScript types
export type DailySummaryResponse = z.infer<typeof dailySummaryResponseSchema>;
export type BestSellerItem = z.infer<typeof bestSellerItemSchema>;
export type BestSellersResponse = z.infer<typeof bestSellersResponseSchema>;
export type LowStockItem = z.infer<typeof lowStockItemSchema>;
export type LowStockResponse = z.infer<typeof lowStockResponseSchema>;
export type RestockRecommendation = z.infer<typeof restockRecommendationSchema>;
export type RestockRecommendationsResponse = z.infer<typeof restockRecommendationsResponseSchema>;