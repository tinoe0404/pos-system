"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restockProductHandler = restockProductHandler;
exports.adjustStockHandler = adjustStockHandler;
exports.getLowStockHandler = getLowStockHandler;
const inventory_service_1 = require("./inventory.service");
async function restockProductHandler(request, reply) {
    try {
        const body = request.body;
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
