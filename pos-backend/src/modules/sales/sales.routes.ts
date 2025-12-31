import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createSaleSchema,
  saleResponseSchema,
  salesListResponseSchema,
} from './sales.schema';
import {
  createSaleHandler,
  getSaleByIdHandler,
  getAllSalesHandler,
} from './sales.controller';
import { authenticate } from '../auth/auth.middleware';

async function salesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/sales - Create a new sale (Protected: All authenticated users)
  server.post(
    '/',
    {
      onRequest: [authenticate],
      schema: {
        body: createSaleSchema,
        response: {
          201: saleResponseSchema,
        },
      },
    },
    createSaleHandler
  );

  // GET /api/sales - Get all sales (Protected: All authenticated users)
  server.get(
    '/',
    {
      onRequest: [authenticate],
      schema: {
        querystring: z.object({
          status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
        }),
        response: {
          200: salesListResponseSchema,
        },
      },
    },
    getAllSalesHandler
  );

  // GET /api/sales/:id - Get sale by ID (Protected: All authenticated users)
  server.get(
    '/:id',
    {
      onRequest: [authenticate],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: saleResponseSchema,
        },
      },
    },
    getSaleByIdHandler
  );
}

export default salesRoutes;