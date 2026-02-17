"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const product_schema_1 = require("./product.schema");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function productRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/products - Get all products (Public)
    server.get('/', {
        schema: {
            response: {
                200: product_schema_1.productsListResponseSchema,
            },
        },
    }, product_controller_1.getAllProductsHandler);
    // GET /api/products/:id - Get product by ID (Public)
    server.get('/:id', {
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            response: {
                200: product_schema_1.productResponseSchema,
            },
        },
    }, product_controller_1.getProductByIdHandler);
    // POST /api/products - Create product (Protected: Admin only)
    server.post('/', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            body: product_schema_1.createProductSchema,
            response: {
                201: product_schema_1.productResponseSchema,
            },
        },
    }, product_controller_1.createProductHandler);
    // PUT /api/products/:id - Update product (Protected: Admin only)
    server.put('/:id', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            body: product_schema_1.updateProductSchema,
            response: {
                200: product_schema_1.productResponseSchema,
            },
        },
    }, product_controller_1.updateProductHandler);
    // DELETE /api/products/:id - Delete product (Protected: Admin only)
    server.delete('/:id', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
        },
    }, product_controller_1.deleteProductHandler);
}
exports.default = productRoutes;
