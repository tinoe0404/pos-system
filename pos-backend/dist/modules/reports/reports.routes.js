"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reports_schema_1 = require("./reports.schema");
const reports_controller_1 = require("./reports.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function reportsRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/reports/daily/pdf - Generate daily sales PDF (Admin only)
    server.get('/daily/pdf', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            querystring: reports_schema_1.dailyReportQuerySchema,
            description: 'Generate and download daily sales report as PDF',
            tags: ['reports'],
        },
    }, reports_controller_1.generateDailyPDFHandler);
    // GET /api/reports/daily - Get daily JSON report (Admin only)
    server.get('/daily', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            querystring: reports_schema_1.dailyReportQuerySchema,
            response: {
                200: reports_schema_1.dailyJsonReportSchema,
            },
            description: 'Get daily sales statistics as JSON for charts',
            tags: ['reports'],
        },
    }, reports_controller_1.getDailyJsonReportHandler);
    // GET /api/reports/weekly - Get weekly JSON report (Admin only)
    server.get('/weekly', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: reports_schema_1.weeklyJsonReportSchema,
            },
            description: 'Get last 7 days sales statistics as JSON for charts',
            tags: ['reports'],
        },
    }, reports_controller_1.getWeeklyJsonReportHandler);
    // GET /api/reports/monthly - Get monthly JSON report (Admin only)
    server.get('/monthly', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: reports_schema_1.monthlyJsonReportSchema,
            },
            description: 'Get last 30 days sales statistics as JSON for charts',
            tags: ['reports'],
        },
    }, reports_controller_1.getMonthlyJsonReportHandler);
    // GET /api/reports/weekly/pdf - Generate weekly sales PDF (Admin only)
    server.get('/weekly/pdf', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            description: 'Generate and download weekly sales report as PDF',
            tags: ['reports'],
        },
    }, reports_controller_1.generateWeeklyPDFHandler);
    // GET /api/reports/monthly/pdf - Generate monthly sales PDF (Admin only)
    server.get('/monthly/pdf', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            description: 'Generate and download monthly sales report as PDF',
            tags: ['reports'],
        },
    }, reports_controller_1.generateMonthlyPDFHandler);
}
exports.default = reportsRoutes;
