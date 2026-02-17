"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundRoutes = refundRoutes;
const refund_controller_1 = require("./refund.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const refund_schema_1 = require("./refund.schema");
async function refundRoutes(app) {
    // POST /api/sales/:id/refund
    // Require authentication (any cashier or admin can process a refund? Maybe add PIN later)
    app.post('/sales/:id/refund', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            body: refund_schema_1.createRefundSchema.omit({ saleId: true }), // saleId is in params
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, refund_controller_1.createRefundHandler // Cast to any to bypass complex Fastify/Zod typing mismatch
    );
}
