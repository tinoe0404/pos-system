import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  restockSchema,
  adjustStockSchema,
  inventoryOperationResponseSchema,
} from './inventory.schema';
import {
  restockProductHandler,
  adjustStockHandler,
  getLowStockHandler,
} from './inventory.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function inventoryRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/inventory/restock - Restock product (Protected: Admin only)
  server.post(
    '/restock',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        body: restockSchema,
        response: {
          200: inventoryOperationResponseSchema,
        },
      },
    },
    restockProductHandler
  );

  // PUT /api/inventory/adjust - Adjust stock (Protected: Admin only)
  server.put(
    '/adjust',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        body: adjustStockSchema,
        response: {
          200: inventoryOperationResponseSchema,
        },
      },
    },
    adjustStockHandler
  );

  // GET /api/inventory/low-stock - Get products with low stock (Protected: Admin only)
  server.get(
    '/low-stock',
    {
      onRequest: [authenticate, requireRole('admin')],
    },
    getLowStockHandler
  );
}

export default inventoryRoutes;