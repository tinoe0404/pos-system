"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSaleHandler = createSaleHandler;
exports.getSaleByIdHandler = getSaleByIdHandler;
exports.getAllSalesHandler = getAllSalesHandler;
exports.getTodaySalesHandler = getTodaySalesHandler;
exports.getPublicReceiptHandler = getPublicReceiptHandler;
exports.voidSaleHandler = voidSaleHandler;
const sales_service_1 = require("./sales.service");
const errors_1 = require("../../shared/errors");
async function createSaleHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const sale = await sales_service_1.salesService.createSale(user.id, body);
        return reply.code(201).send(sale);
    }
    catch (error) {
        if (error.message?.startsWith('Products not found:')) {
            throw new errors_1.NotFoundError(error.message);
        }
        if (error.message?.startsWith('Insufficient stock')) {
            throw new errors_1.BadRequestError(error.message);
        }
        throw error;
    }
}
async function getSaleByIdHandler(request, reply) {
    const { id } = request.params;
    const sale = await sales_service_1.salesService.getSaleById(id);
    if (!sale) {
        throw new errors_1.NotFoundError('Sale not found');
    }
    return reply.code(200).send(sale);
}
async function getAllSalesHandler(request, reply) {
    const user = request.user;
    const queryParams = request.query;
    const filters = {};
    if (user.role === 'cashier') {
        filters.userId = user.id;
    }
    if (queryParams.status) {
        filters.status = queryParams.status;
    }
    const pagination = {
        skip: queryParams.skip,
        take: queryParams.take,
    };
    const result = await sales_service_1.salesService.getAllSales(filters, pagination);
    return reply.code(200).send(result);
}
async function getTodaySalesHandler(request, reply) {
    const user = request.user;
    const filters = {};
    if (user.role === 'cashier') {
        filters.userId = user.id;
    }
    const result = await sales_service_1.salesService.getTodaySales(filters);
    return reply.code(200).send(result);
}
async function getPublicReceiptHandler(request, reply) {
    const { id } = request.params;
    const sale = await sales_service_1.salesService.getSaleById(id);
    if (!sale) {
        throw new errors_1.NotFoundError('Receipt not found');
    }
    return reply.code(200).send(sale);
}
async function voidSaleHandler(request, reply) {
    try {
        const { id } = request.params;
        const user = request.user;
        const body = request.body;
        await sales_service_1.salesService.voidSale(id, user.id, body.reason);
        return reply.code(200).send({ message: 'Sale voided successfully' });
    }
    catch (error) {
        if (error.message === 'Sale not found') {
            throw new errors_1.NotFoundError(error.message);
        }
        if (error.message === 'Sale is already voided') {
            throw new errors_1.BadRequestError(error.message);
        }
        throw error;
    }
}
