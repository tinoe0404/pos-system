"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restockProductHandler = restockProductHandler;
exports.adjustStockHandler = adjustStockHandler;
exports.getLowStockHandler = getLowStockHandler;
exports.getStockHistoryHandler = getStockHistoryHandler;
exports.getAnalyticsHandler = getAnalyticsHandler;
const inventory_service_1 = require("./inventory.service");
const analytics_service_1 = require("./analytics.service");
async function restockProductHandler(request, reply) {
    try {
        const body = request.body;
        const user = request.user;
        if (user && user.id) {
            body.userId = user.id;
        }
        const result = await inventory_service_1.inventoryService.restockProduct(body);
        return reply.code(200).send(result);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error && error.message === 'Product not found') {
            return reply.code(404).send({
                error: 'Not found',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to restock product',
        });
    }
}
async function adjustStockHandler(request, reply) {
    try {
        const body = request.body;
        const user = request.user;
        if (user && user.id) {
            body.userId = user.id;
        }
        const result = await inventory_service_1.inventoryService.adjustStock(body);
        return reply.code(200).send(result);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error && error.message === 'Product not found') {
            return reply.code(404).send({
                error: 'Not found',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to adjust stock',
        });
    }
}
async function getLowStockHandler(request, reply) {
    try {
        const products = await inventory_service_1.inventoryService.getLowStockProducts();
        return reply.code(200).send(products);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch low stock products',
        });
    }
}
async function getStockHistoryHandler(request, reply) {
    try {
        const query = request.query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const filters = {
            productId: query.productId,
            type: query.type,
        };
        const history = await inventory_service_1.inventoryService.getStockHistory(filters, page, limit);
        return reply.code(200).send(history);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch stock history',
        });
    }
}
async function getAnalyticsHandler(request, reply) {
    try {
        const query = request.query;
        const days = query.days ? Number(query.days) : 30;
        const analytics = await analytics_service_1.analyticsService.getInventoryAnalytics(days);
        return reply.code(200).send(analytics);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch inventory analytics',
        });
    }
}
