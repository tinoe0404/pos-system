import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { dailyReportQuerySchema } from './reports.schema';
import { generateDailyPDFHandler } from './reports.controller';
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
}

export default reportsRoutes;