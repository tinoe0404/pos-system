"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySummaryHandler = getDailySummaryHandler;
exports.getBestSellersHandler = getBestSellersHandler;
exports.getLowStockHandler = getLowStockHandler;
exports.getRestockRecommendationsHandler = getRestockRecommendationsHandler;
const analytics_service_1 = require("./analytics.service");
async function getDailySummaryHandler(request, reply) {
    try {
        const summary = await analytics_service_1.analyticsService.getDailySummary();
        return reply.code(200).send(summary);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch daily summary',
        });
    }
}
async function getBestSellersHandler(request, reply) {
    try {
        const bestSellers = await analytics_service_1.analyticsService.getBestSellers();
        return reply.code(200).send(bestSellers);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch best sellers',
        });
    }
}
async function getLowStockHandler(request, reply) {
    try {
        const lowStock = await analytics_service_1.analyticsService.getLowStockProducts();
        return reply.code(200).send(lowStock);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch low stock products',
        });
    }
}
async function getRestockRecommendationsHandler(request, reply) {
    try {
        const recommendations = await analytics_service_1.analyticsService.getRestockRecommendations();
        return reply.code(200).send(recommendations);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch restock recommendations',
        });
    }
}
