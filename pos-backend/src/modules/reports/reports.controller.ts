import { FastifyRequest, FastifyReply } from 'fastify';
import { reportsService } from './reports.service';
import { DailyReportQuery } from './reports.schema';

export async function generateDailyPDFHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const query = request.query as DailyReportQuery;
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
    const pdfStream = await reportsService.generateDailyPDF(dateString);

    // Set headers for PDF download
    const filename = `daily-sales-report-${dateString || new Date().toISOString().split('T')[0]}.pdf`;
    
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the stream
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
      message: 'Failed to generate PDF report',
    });
  }
}