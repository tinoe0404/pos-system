import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createSaleSchema,
  saleResponseSchema,
  saleDetailResponseSchema,
  salesListResponseSchema,
  salesPaginationSchema,
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

  // GET /api/sales - Get all sales with pagination (Protected: All authenticated users)
  // Cashiers see only their own sales, Admins see all
  server.get(
    '/',
    {
      onRequest: [authenticate],
      schema: {
        querystring: salesPaginationSchema,
        response: {
          200: salesListResponseSchema,
        },
      },
    },
    getAllSalesHandler
  );

  // GET /api/sales/:id - Get sale by ID with product details (Protected: All authenticated users)
  server.get(
    '/:id',
    {
      onRequest: [authenticate],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: saleDetailResponseSchema,
        },
      },
    },
    getSaleByIdHandler
  );
}

export default salesRoutes;