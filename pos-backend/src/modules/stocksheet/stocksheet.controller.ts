import { FastifyRequest, FastifyReply } from 'fastify';
import { stockSheetService } from './stocksheet.service';
import { StockSheetQuery } from './stocksheet.schema';

export async function generateStockSheetPDFHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const query = request.query as StockSheetQuery;
        const dateString = query.date;

        // Validate date format if provided
        if (dateString) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dateString)) {
                return reply.code(400).send({
                    error: 'Bad request',
                    message: 'Invalid date format. Use YYYY-MM-DD',
                });
            }
        }

        // Generate PDF stream
        const pdfStream = await stockSheetService.generateStockSheetPDF(dateString);

        // Set headers for PDF download
        const filename = `daily-stock-sheet-${dateString || new Date().toISOString().split('T')[0]}.pdf`;

        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `inline; filename="${filename}"`);

        return reply.send(pdfStream);
    } catch (error: unknown) {
        request.log.error(error);

        if (error instanceof Error) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: error.message,
            });
        }

        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to generate stock sheet PDF',
        });
    }
}
