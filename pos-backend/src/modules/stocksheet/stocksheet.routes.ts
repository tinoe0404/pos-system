import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { stockSheetQuerySchema } from './stocksheet.schema';
import { generateStockSheetPDFHandler } from './stocksheet.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function stockSheetRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // GET /api/reports/stock-sheet/pdf - Generate daily stock sheet PDF (Admin + Cashier)
    server.get(
        '/pdf',
        {
            onRequest: [authenticate, requireRole('admin', 'cashier')],
            schema: {
                querystring: stockSheetQuerySchema,
                description: 'Generate and download daily stock sheet as PDF',
                tags: ['reports'],
            },
        },
        generateStockSheetPDFHandler
    );
}

export default stockSheetRoutes;
