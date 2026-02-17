import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createSaleSchema,
  saleResponseSchema,
  saleDetailResponseSchema,
  salesListResponseSchema,
  salesPaginationSchema,
  publicReceiptResponseSchema,
  voidSaleSchema,
} from './sales.schema';
import {
  createSaleHandler,
  getSaleByIdHandler,
  getAllSalesHandler,
  getTodaySalesHandler,
  getPublicReceiptHandler,
  voidSaleHandler,
} from './sales.controller';
import { authenticate, requirePinOrRole } from '../auth/auth.middleware';

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

  // GET /api/sales/today - Get sales for current day (Protected: All authenticated users)
  server.get(
    '/today',
    {
      onRequest: [authenticate],
      schema: {
        response: {
          200: salesListResponseSchema, // Reusing list schema as structure matches
        },
      },
    },
    getTodaySalesHandler
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

  // GET /api/sales/:id/receipt - Public receipt details (No Auth required)
  server.get(
    '/:id/receipt',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: publicReceiptResponseSchema,
        },
      },
    },
    getPublicReceiptHandler
  );

  // POST /api/sales/:id/void - Void a sale (Protected: Admin or PIN)
  server.post(
    '/:id/void',
    {
      onRequest: [authenticate, requirePinOrRole('admin')],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: voidSaleSchema,
        response: {
          200: z.object({ message: z.string() })
        }
      },
    },
    voidSaleHandler
  );
}

export default salesRoutes;