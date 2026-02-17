"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyJsonReportSchema = exports.weeklyJsonReportSchema = exports.dailyJsonReportSchema = exports.dailyReportDataSchema = exports.reportSaleSchema = exports.reportSaleItemSchema = exports.dailyReportQuerySchema = void 0;
const zod_1 = require("zod");
// Query parameters for daily report
exports.dailyReportQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // Format: YYYY-MM-DD
});
// Report data structure (internal use)
exports.reportSaleItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sale_id: zod_1.z.string(),
    product_name: zod_1.z.string(),
    quantity: zod_1.z.number(),
    price_at_sale: zod_1.z.string(),
    subtotal: zod_1.z.string(),
});
exports.reportSaleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_username: zod_1.z.string(),
    total: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED', 'VOIDED']),
    created_at: zod_1.z.date(),
    items: zod_1.z.array(exports.reportSaleItemSchema),
});
exports.dailyReportDataSchema = zod_1.z.object({
    date: zod_1.z.string(),
    totalRevenue: zod_1.z.string(),
    totalTransactions: zod_1.z.number(),
    sales: zod_1.z.array(exports.reportSaleSchema),
});
// JSON Report Schemas
// Daily JSON report
exports.dailyJsonReportSchema = zod_1.z.object({
    date: zod_1.z.string(),
    totalRevenue: zod_1.z.string(),
    totalTransactions: zod_1.z.number(),
    completedTransactions: zod_1.z.number(),
    pendingTransactions: zod_1.z.number(),
    failedTransactions: zod_1.z.number(),
    averageTransactionValue: zod_1.z.string(),
    paymentMethodBreakdown: zod_1.z.object({
        cash: zod_1.z.string(),
        ecocash: zod_1.z.string(),
    }),
    topProducts: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string(),
        productName: zod_1.z.string(),
        quantity: zod_1.z.number(),
        revenue: zod_1.z.string(),
    })),
});
// Weekly JSON report
exports.weeklyJsonReportSchema = zod_1.z.object({
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    totalRevenue: zod_1.z.string(),
    totalTransactions: zod_1.z.number(),
    averageDailyRevenue: zod_1.z.string(),
    dailyBreakdown: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string(),
        revenue: zod_1.z.string(),
        transactions: zod_1.z.number(),
    })),
    topProducts: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string(),
        productName: zod_1.z.string(),
        quantity: zod_1.z.number(),
        revenue: zod_1.z.string(),
    })),
});
// Monthly JSON report
exports.monthlyJsonReportSchema = zod_1.z.object({
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    totalRevenue: zod_1.z.string(),
    totalTransactions: zod_1.z.number(),
    averageDailyRevenue: zod_1.z.string(),
    weeklyBreakdown: zod_1.z.array(zod_1.z.object({
        weekStart: zod_1.z.string(),
        weekEnd: zod_1.z.string(),
        revenue: zod_1.z.string(),
        transactions: zod_1.z.number(),
    })),
    topProducts: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string(),
        productName: zod_1.z.string(),
        quantity: zod_1.z.number(),
        revenue: zod_1.z.string(),
    })),
    categoryBreakdown: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.string(),
        revenue: zod_1.z.string(),
        transactions: zod_1.z.number(),
    })),
});
