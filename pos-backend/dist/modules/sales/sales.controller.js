"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSaleHandler = createSaleHandler;
exports.getSaleByIdHandler = getSaleByIdHandler;
exports.getAllSalesHandler = getAllSalesHandler;
exports.getTodaySalesHandler = getTodaySalesHandler;
exports.getPublicReceiptHandler = getPublicReceiptHandler;
exports.voidSaleHandler = voidSaleHandler;
const sales_service_1 = require("./sales.service");
async function createSaleHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const sale = await sales_service_1.salesService.createSale(user.id, body);
        return reply.code(201).send(sale);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error) {
            // Handle product not found error
            if (error.message.startsWith('Products not found:')) {
                return reply.code(404).send({
                    error: 'Not found',
                    message: error.message,
                });
            }
            // Handle insufficient stock error
            if (error.message.startsWith('Insufficient stock')) {
                return reply.code(400).send({
                    error: 'Bad Request',
                    message: error.message,
                });
            }
            return reply.code(500).send({
                error: 'Internal server error',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create sale',
        });
    }
}
async function getSaleByIdHandler(request, reply) {
    try {
        const { id } = request.params;
        const sale = await sales_service_1.salesService.getSaleById(id);
        if (!sale) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Sale not found',
            });
        }
        return reply.code(200).send(sale);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch sale',
        });
    }
}
async function getAllSalesHandler(request, reply) {
    try {
        const user = request.user;
        const queryParams = request.query;
        // Cashiers can only see their own sales
        const filters = {};
        if (user.role === 'cashier') {
            filters.userId = user.id;
        }
        if (queryParams.status) {
            filters.status = queryParams.status;
        }
        // Pass pagination params
        const pagination = {
            skip: queryParams.skip,
            take: queryParams.take,
        };
        const result = await sales_service_1.salesService.getAllSales(filters, pagination);
        return reply.code(200).send(result);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch sales',
        });
    }
}
async function getTodaySalesHandler(request, reply) {
    try {
        const user = request.user;
        // Cashiers can only see their own sales
        const filters = {};
        if (user.role === 'cashier') {
            filters.userId = user.id;
        }
        const result = await sales_service_1.salesService.getTodaySales(filters);
        return reply.code(200).send(result);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch today\'s sales',
        });
    }
}
async function getPublicReceiptHandler(request, reply) {
    try {
        const { id } = request.params;
        const sale = await sales_service_1.salesService.getSaleById(id);
        if (!sale) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Receipt not found',
            });
        }
        return reply.code(200).send(sale);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch receipt',
        });
    }
}
async function voidSaleHandler(request, reply) {
    try {
        const { id } = request.params;
        const user = request.user;
        const body = request.body;
        // If cashier, ensure PIN was verified by middleware if required
        // But middleware check is generic. The business logic is:
        // "Voiding requires Admin role OR Admin PIN".
        // We already use `requirePinOrRole('admin')` middleware on this route.
        // So if we reach here, user is allowed.
        // Who is actually voiding?
        // If Admin logged in: user.id
        // If Cashier with PIN override: user.id (the cashier performs action authorized by PIN)
        // Or should we track OF WHICH ADMIN the PIN was used?
        // For now, track the user who performed the action (Cashier), and maybe add "authorized_by" later.
        // The current schema has `voided_by_id`. We'll use current user ID.
        await sales_service_1.salesService.voidSale(id, user.id, body.reason);
        return reply.code(200).send({ message: 'Sale voided successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Sale not found') {
                return reply.code(404).send({ error: 'Not found', message: error.message });
            }
            if (error.message === 'Sale is already voided') {
                return reply.code(400).send({ error: 'Bad Request', message: error.message });
            }
        }
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to void sale',
        });
    }
}
