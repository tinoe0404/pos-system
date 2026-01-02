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

// JSON Report Schemas

// Daily JSON report
export const dailyJsonReportSchema = z.object({
  date: z.string(),
  totalRevenue: z.string(),
  totalTransactions: z.number(),
  completedTransactions: z.number(),
  pendingTransactions: z.number(),
  failedTransactions: z.number(),
  averageTransactionValue: z.string(),
  topProducts: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number(),
      revenue: z.string(),
    })
  ),
});

// Weekly JSON report
export const weeklyJsonReportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalRevenue: z.string(),
  totalTransactions: z.number(),
  averageDailyRevenue: z.string(),
  dailyBreakdown: z.array(
    z.object({
      date: z.string(),
      revenue: z.string(),
      transactions: z.number(),
    })
  ),
  topProducts: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number(),
      revenue: z.string(),
    })
  ),
});

// Monthly JSON report
export const monthlyJsonReportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalRevenue: z.string(),
  totalTransactions: z.number(),
  averageDailyRevenue: z.string(),
  weeklyBreakdown: z.array(
    z.object({
      weekStart: z.string(),
      weekEnd: z.string(),
      revenue: z.string(),
      transactions: z.number(),
    })
  ),
  topProducts: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number(),
      revenue: z.string(),
    })
  ),
  categoryBreakdown: z.array(
    z.object({
      category: z.string(),
      revenue: z.string(),
      transactions: z.number(),
    })
  ),
});

// TypeScript types
export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;
export type ReportSaleItem = z.infer<typeof reportSaleItemSchema>;
export type ReportSale = z.infer<typeof reportSaleSchema>;
export type DailyReportData = z.infer<typeof dailyReportDataSchema>;
export type DailyJsonReport = z.infer<typeof dailyJsonReportSchema>;
export type WeeklyJsonReport = z.infer<typeof weeklyJsonReportSchema>;
export type MonthlyJsonReport = z.infer<typeof monthlyJsonReportSchema>;