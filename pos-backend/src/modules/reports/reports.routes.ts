import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  dailyReportQuerySchema,
  dailyJsonReportSchema,
  weeklyJsonReportSchema,
  monthlyJsonReportSchema,
} from './reports.schema';
import {
  generateDailyPDFHandler,
  getDailyJsonReportHandler,
  getWeeklyJsonReportHandler,
  getMonthlyJsonReportHandler,
} from './reports.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function reportsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/reports/daily/pdf - Generate daily sales PDF (Admin only)
  server.get(
    '/daily/pdf',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        querystring: dailyReportQuerySchema,
        description: 'Generate and download daily sales report as PDF',
        tags: ['reports'],
      },
    },
    generateDailyPDFHandler
  );

  // GET /api/reports/daily - Get daily JSON report (Admin only)
  server.get(
    '/daily',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        querystring: dailyReportQuerySchema,
        response: {
          200: dailyJsonReportSchema,
        },
        description: 'Get daily sales statistics as JSON for charts',
        tags: ['reports'],
      },
    },
    getDailyJsonReportHandler
  );

  // GET /api/reports/weekly - Get weekly JSON report (Admin only)
  server.get(
    '/weekly',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: weeklyJsonReportSchema,
        },
        description: 'Get last 7 days sales statistics as JSON for charts',
        tags: ['reports'],
      },
    },
    getWeeklyJsonReportHandler
  );

  // GET /api/reports/monthly - Get monthly JSON report (Admin only)
  server.get(
    '/monthly',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: monthlyJsonReportSchema,
        },
        description: 'Get last 30 days sales statistics as JSON for charts',
        tags: ['reports'],
      },
    },
    getMonthlyJsonReportHandler
  );
}

export default reportsRoutes;