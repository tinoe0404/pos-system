import { FastifyRequest, FastifyReply } from 'fastify';
import { salesService } from './sales.service';
import { CreateSaleInput, SalesPaginationQuery, VoidSaleInput } from './sales.schema';
import { registerService } from '../register/register.service';

export async function createSaleHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as { id: string; username: string; role: string };
    const body = request.body as CreateSaleInput;

    const sale = await salesService.createSale(user.id, body);

    return reply.code(201).send(sale);
  } catch (error: unknown) {
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

export async function getSaleByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const sale = await salesService.getSaleById(id);

    if (!sale) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Sale not found',
      });
    }

    return reply.code(200).send(sale);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch sale',
    });
  }
}

export async function getAllSalesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as { id: string; role: string };
    const queryParams = request.query as SalesPaginationQuery;

    // Cashiers can only see their own sales
    const filters: any = {};

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

    const result = await salesService.getAllSales(filters, pagination);

    return reply.code(200).send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch sales',
    });
  }
}

export async function getTodaySalesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as { id: string; role: string };

    // Cashiers can only see their own sales
    const filters: any = {};
    if (user.role === 'cashier') {
      filters.userId = user.id;
    }

    const result = await salesService.getTodaySales(filters);
    return reply.code(200).send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch today\'s sales',
    });
  }
}

export async function getPublicReceiptHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const sale = await salesService.getSaleById(id);

    if (!sale) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Receipt not found',
      });
    }

    return reply.code(200).send(sale);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch receipt',
    });
  }
}

export async function voidSaleHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };
    const body = request.body as VoidSaleInput;

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

    await salesService.voidSale(id, user.id, body.reason);

    return reply.code(200).send({ message: 'Sale voided successfully' });
  } catch (error: unknown) {
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