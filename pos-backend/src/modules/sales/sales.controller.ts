import { FastifyRequest, FastifyReply } from 'fastify';
import { salesService } from './sales.service';
import { CreateSaleInput, SalesPaginationQuery, VoidSaleInput } from './sales.schema';

import { NotFoundError, BadRequestError } from '../../shared/errors';

export async function createSaleHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as { id: string; username: string; role: string };
    const body = request.body as CreateSaleInput;

    const sale = await salesService.createSale(user.id, body);

    return reply.code(201).send(sale);
  } catch (error: any) {
    if (error.message?.startsWith('Products not found:')) {
      throw new NotFoundError(error.message);
    }
    if (error.message?.startsWith('Insufficient stock')) {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
}

export async function getSaleByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const sale = await salesService.getSaleById(id);

  if (!sale) {
    throw new NotFoundError('Sale not found');
  }

  return reply.code(200).send(sale);
}

export async function getAllSalesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  const queryParams = request.query as SalesPaginationQuery;

  const filters: any = {};
  if (user.role === 'cashier') {
    filters.userId = user.id;
  }
  if (queryParams.status) {
    filters.status = queryParams.status;
  }
  if (queryParams.from) {
    filters.from = queryParams.from;
  }
  if (queryParams.to) {
    filters.to = queryParams.to;
  }

  const pagination = {
    skip: queryParams.skip,
    take: queryParams.take,
  };

  const result = await salesService.getAllSales(filters, pagination);
  return reply.code(200).send(result);
}

export async function getTodaySalesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };

  const filters: any = {};
  if (user.role === 'cashier') {
    filters.userId = user.id;
  }

  const result = await salesService.getTodaySales(filters);
  return reply.code(200).send(result);
}

export async function getPublicReceiptHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const sale = await salesService.getSaleById(id);

  if (!sale) {
    throw new NotFoundError('Receipt not found');
  }

  return reply.code(200).send(sale);
}

export async function voidSaleHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };
    const body = request.body as VoidSaleInput;

    await salesService.voidSale(id, user.id, body.reason);
    return reply.code(200).send({ message: 'Sale voided successfully' });
  } catch (error: any) {
    if (error.message === 'Sale not found') {
      throw new NotFoundError(error.message);
    }
    if (error.message === 'Sale is already voided') {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
}