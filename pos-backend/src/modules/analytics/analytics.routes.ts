import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  dailySummaryResponseSchema,
  bestSellersResponseSchema,
  lowStockResponseSchema,
  restockRecommendationsResponseSchema,
} from './analytics.schema';
import {
  getDailySummaryHandler,
  getBestSellersHandler,
  getLowStockHandler,
  getRestockRecommendationsHandler,
} from './analytics.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function analyticsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/analytics/summary - Daily summary (Admin only)
  server.get(
    '/summary',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: dailySummaryResponseSchema,
        },
      },
    },
    getDailySummaryHandler
  );

  // GET /api/analytics/best-sellers - Top 5 best sellers (Admin only)
  server.get(
    '/best-sellers',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: bestSellersResponseSchema,
        },
      },
    },
    getBestSellersHandler
  );
}

async function notificationsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/notifications/low-stock - Low stock alerts (Admin only)
  server.get(
    '/low-stock',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: lowStockResponseSchema,
        },
      },
    },
    getLowStockHandler
  );
}

async function recommendationsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/recommendations/restock - Restock recommendations (Admin only)
  server.get(
    '/restock',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: restockRecommendationsResponseSchema,
        },
      },
    },
    getRestockRecommendationsHandler
  );
}

export { analyticsRoutes, notificationsRoutes, recommendationsRoutes };