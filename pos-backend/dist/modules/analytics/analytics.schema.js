"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restockRecommendationsResponseSchema = exports.restockRecommendationSchema = exports.lowStockResponseSchema = exports.lowStockItemSchema = exports.bestSellersResponseSchema = exports.bestSellerItemSchema = exports.dailySummaryResponseSchema = void 0;
const zod_1 = require("zod");
// Output schemas
// Daily summary response
exports.dailySummaryResponseSchema = zod_1.z.object({
    totalRevenue: zod_1.z.string(), // Decimal as string
    totalTransactions: zod_1.z.number(),
    totalStock: zod_1.z.number(),
    date: zod_1.z.string(),
});
// Best seller item
exports.bestSellerItemSchema = zod_1.z.object({
    product_id: zod_1.z.string(),
    product_name: zod_1.z.string(),
    sku: zod_1.z.string(),
    total_quantity_sold: zod_1.z.number(),
    total_revenue: zod_1.z.string(), // Decimal as string
});
exports.bestSellersResponseSchema = zod_1.z.object({
    bestSellers: zod_1.z.array(exports.bestSellerItemSchema),
    count: zod_1.z.number(),
});
// Low stock item
exports.lowStockItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    sku: zod_1.z.string(),
    stock: zod_1.z.number(),
    category: zod_1.z.string().nullable(),
    price: zod_1.z.string(),
});
exports.lowStockResponseSchema = zod_1.z.object({
    lowStockProducts: zod_1.z.array(exports.lowStockItemSchema),
    count: zod_1.z.number(),
    threshold: zod_1.z.number(),
});
// Restock recommendation item
exports.restockRecommendationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    sku: zod_1.z.string(),
    current_stock: zod_1.z.number(),
    total_sold_last_7_days: zod_1.z.number(),
    category: zod_1.z.string().nullable(),
    reason: zod_1.z.string(),
});
exports.restockRecommendationsResponseSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.restockRecommendationSchema),
    count: zod_1.z.number(),
});
