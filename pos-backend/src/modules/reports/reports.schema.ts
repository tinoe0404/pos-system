import { z } from 'zod';

// Query parameters for daily report
export const dailyReportQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // Format: YYYY-MM-DD
});

// Report data structure (internal use)
export const reportSaleItemSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  product_name: z.string(),
  quantity: z.number(),
  price_at_sale: z.string(),
  subtotal: z.string(),
});

export const reportSaleSchema = z.object({
  id: z.string(),
  user_username: z.string(),
  total: z.string(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  created_at: z.date(),
  items: z.array(reportSaleItemSchema),
});

export const dailyReportDataSchema = z.object({
  date: z.string(),
  totalRevenue: z.string(),
  totalTransactions: z.number(),
  sales: z.array(reportSaleSchema),
});

// TypeScript types
export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;
export type ReportSaleItem = z.infer<typeof reportSaleItemSchema>;
export type ReportSale = z.infer<typeof reportSaleSchema>;
export type DailyReportData = z.infer<typeof dailyReportDataSchema>;