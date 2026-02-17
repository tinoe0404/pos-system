"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyPDFHandler = generateDailyPDFHandler;
exports.getDailyJsonReportHandler = getDailyJsonReportHandler;
exports.getWeeklyJsonReportHandler = getWeeklyJsonReportHandler;
exports.getMonthlyJsonReportHandler = getMonthlyJsonReportHandler;
const reports_service_1 = require("./reports.service");
async function generateDailyPDFHandler(request, reply) {
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
        const pdfStream = await reports_service_1.reportsService.generateDailyPDF(dateString);
        // Set headers for PDF download
        const filename = `daily-sales-report-${dateString || new Date().toISOString().split('T')[0]}.pdf`;
        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        // Send the stream
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
            message: 'Failed to generate PDF report',
        });
    }
}
async function getDailyJsonReportHandler(request, reply) {
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
        const report = await reports_service_1.reportsService.getDailyJsonReport(dateString);
        return reply.code(200).send(report);
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
            message: 'Failed to fetch daily report',
        });
    }
}
async function getWeeklyJsonReportHandler(request, reply) {
    try {
        const report = await reports_service_1.reportsService.getWeeklyJsonReport();
        return reply.code(200).send(report);
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
            message: 'Failed to fetch weekly report',
        });
    }
}
async function getMonthlyJsonReportHandler(request, reply) {
    try {
        const report = await reports_service_1.reportsService.getMonthlyJsonReport();
        return reply.code(200).send(report);
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
            message: 'Failed to fetch monthly report',
        });
    }
}
