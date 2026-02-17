"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const sales_schema_1 = require("./sales.schema");
const sales_controller_1 = require("./sales.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function salesRoutes(app) {
    const server = app.withTypeProvider();
    // POST /api/sales - Create a new sale (Protected: All authenticated users)
    server.post('/', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            body: sales_schema_1.createSaleSchema,
            response: {
                201: sales_schema_1.saleResponseSchema,
            },
        },
    }, sales_controller_1.createSaleHandler);
    // GET /api/sales - Get all sales with pagination (Protected: All authenticated users)
    // Cashiers see only their own sales, Admins see all
    server.get('/', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            querystring: sales_schema_1.salesPaginationSchema,
            response: {
                200: sales_schema_1.salesListResponseSchema,
            },
        },
    }, sales_controller_1.getAllSalesHandler);
    // GET /api/sales/today - Get sales for current day (Protected: All authenticated users)
    server.get('/today', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            response: {
                200: sales_schema_1.salesListResponseSchema, // Reusing list schema as structure matches
            },
        },
    }, sales_controller_1.getTodaySalesHandler);
    // GET /api/sales/:id - Get sale by ID with product details (Protected: All authenticated users)
    server.get('/:id', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            response: {
                200: sales_schema_1.saleDetailResponseSchema,
            },
        },
    }, sales_controller_1.getSaleByIdHandler);
    // GET /api/sales/:id/receipt - Public receipt details (No Auth required)
    server.get('/:id/receipt', {
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            response: {
                200: sales_schema_1.publicReceiptResponseSchema,
            },
        },
    }, sales_controller_1.getPublicReceiptHandler);
    // POST /api/sales/:id/void - Void a sale (Protected: Admin or PIN)
    server.post('/:id/void', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requirePinOrRole)('admin')],
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            body: sales_schema_1.voidSaleSchema,
            response: {
                200: zod_1.z.object({ message: zod_1.z.string() })
            }
        },
    }, sales_controller_1.voidSaleHandler);
}
exports.default = salesRoutes;
