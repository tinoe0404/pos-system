"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRoutes = analyticsRoutes;
exports.notificationsRoutes = notificationsRoutes;
exports.recommendationsRoutes = recommendationsRoutes;
const analytics_schema_1 = require("./analytics.schema");
const analytics_controller_1 = require("./analytics.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function analyticsRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/analytics/summary - Daily summary (Admin only)
    server.get('/summary', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: analytics_schema_1.dailySummaryResponseSchema,
            },
        },
    }, analytics_controller_1.getDailySummaryHandler);
    // GET /api/analytics/best-sellers - Top 5 best sellers (Admin only)
    server.get('/best-sellers', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: analytics_schema_1.bestSellersResponseSchema,
            },
        },
    }, analytics_controller_1.getBestSellersHandler);
}
async function notificationsRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/notifications/low-stock - Low stock alerts (Admin only)
    server.get('/low-stock', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: analytics_schema_1.lowStockResponseSchema,
            },
        },
    }, analytics_controller_1.getLowStockHandler);
}
async function recommendationsRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/recommendations/restock - Restock recommendations (Admin only)
    server.get('/restock', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: analytics_schema_1.restockRecommendationsResponseSchema,
            },
        },
    }, analytics_controller_1.getRestockRecommendationsHandler);
}
