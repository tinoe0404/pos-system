import { FastifyInstance } from 'fastify';
import { createRefundHandler } from './refund.controller';
import { authenticate } from '../auth/auth.middleware';
import { createRefundSchema } from './refund.schema';

export async function refundRoutes(app: FastifyInstance) {
    // POST /api/sales/:id/refund
    // Require authentication (any cashier or admin can process a refund? Maybe add PIN later)
    app.post(
        '/sales/:id/refund',
        {
            onRequest: [authenticate],
            schema: {
                body: createRefundSchema.omit({ saleId: true }), // saleId is in params
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' }
                    }
                }
            }
        },
        createRefundHandler as any // Cast to any to bypass complex Fastify/Zod typing mismatch
    );
}
