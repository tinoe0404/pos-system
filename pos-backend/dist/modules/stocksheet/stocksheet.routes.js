"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stocksheet_schema_1 = require("./stocksheet.schema");
const stocksheet_controller_1 = require("./stocksheet.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function stockSheetRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/reports/stock-sheet/pdf - Generate daily stock sheet PDF (Admin + Cashier)
    server.get('/pdf', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin', 'cashier')],
        schema: {
            querystring: stocksheet_schema_1.stockSheetQuerySchema,
            description: 'Generate and download daily stock sheet as PDF',
            tags: ['reports'],
        },
    }, stocksheet_controller_1.generateStockSheetPDFHandler);
}
exports.default = stockSheetRoutes;
