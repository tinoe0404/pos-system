"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStockSheetPDFHandler = generateStockSheetPDFHandler;
const stocksheet_service_1 = require("./stocksheet.service");
async function generateStockSheetPDFHandler(request, reply) {
    try {
        const query = request.query;
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
        const pdfStream = await stocksheet_service_1.stockSheetService.generateStockSheetPDF(dateString);
        // Set headers for PDF download
        const filename = `daily-stock-sheet-${dateString || new Date().toISOString().split('T')[0]}.pdf`;
        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `inline; filename="${filename}"`);
        return reply.send(pdfStream);
    }
    catch (error) {
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
