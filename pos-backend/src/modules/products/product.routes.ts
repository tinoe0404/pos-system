import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createProductSchema,
  updateProductSchema,
  productResponseSchema,
  productsListResponseSchema,
} from './product.schema';
import {
  getAllProductsHandler,
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from './product.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function productRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/products - Get all products (Protected: All authenticated users)
  server.get(
    '/',
    {
      onRequest: [authenticate],
      schema: {
        response: {
          200: productsListResponseSchema,
        },
      },
    },
    getAllProductsHandler
  );

  // GET /api/products/:id - Get product by ID (Protected: All authenticated users)
  server.get(
    '/:id',
    {
      onRequest: [authenticate],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: productResponseSchema,
        },
      },
    },
    getProductByIdHandler
  );

  // POST /api/products - Create product (Protected: Admin only)
  server.post(
    '/',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        body: createProductSchema,
        response: {
          201: productResponseSchema,
        },
      },
    },
    createProductHandler
  );

  // PUT /api/products/:id - Update product (Protected: Admin only)
  server.put(
    '/:id',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: updateProductSchema,
        response: {
          200: productResponseSchema,
        },
      },
    },
    updateProductHandler
  );

  // DELETE /api/products/:id - Delete product (Protected: Admin only)
  server.delete(
    '/:id',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    deleteProductHandler
  );
}

export default productRoutes;