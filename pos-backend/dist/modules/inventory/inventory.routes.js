"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_schema_1 = require("./inventory.schema");
const inventory_controller_1 = require("./inventory.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function inventoryRoutes(app) {
    const server = app.withTypeProvider();
    // POST /api/inventory/restock - Restock product (Protected: Admin only)
    server.post('/restock', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            body: inventory_schema_1.restockSchema,
            response: {
                200: inventory_schema_1.inventoryOperationResponseSchema,
            },
        },
    }, inventory_controller_1.restockProductHandler);
    // PUT /api/inventory/adjust - Adjust stock (Protected: Admin only)
    server.put('/adjust', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            body: inventory_schema_1.adjustStockSchema,
            response: {
                200: inventory_schema_1.inventoryOperationResponseSchema,
            },
        },
    }, inventory_controller_1.adjustStockHandler);
    // GET /api/inventory/low-stock - Get products with low stock (Protected: Admin only)
    server.get('/low-stock', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
    }, inventory_controller_1.getLowStockHandler);
    // GET /api/inventory/history - Get stock movement history (Protected: Admin only)
    server.get('/history', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            querystring: inventory_schema_1.stockHistoryQuerySchema,
        },
    }, inventory_controller_1.getStockHistoryHandler);
    // GET /api/inventory/analytics - Get comprehensive analytics (Protected: Admin only)
    server.get('/analytics', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
    }, inventory_controller_1.getAnalyticsHandler);
}
exports.default = inventoryRoutes;
