import { FastifyRequest, FastifyReply } from 'fastify';
import { salesService } from './sales.service';
import { CreateSaleInput } from './sales.schema';

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
    const queryParams = request.query as { status?: string };

    // Cashiers can only see their own sales
    const filters: any = {};

    if (user.role === 'cashier') {
      filters.userId = user.id;
    }

    if (queryParams.status) {
      filters.status = queryParams.status;
    }

    const result = await salesService.getAllSales(filters);

    return reply.code(200).send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch sales',
    });
  }
}