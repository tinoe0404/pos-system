import { FastifyRequest, FastifyReply } from 'fastify';
import { inventoryService } from './inventory.service';
import { RestockInput, AdjustStockInput } from './inventory.schema';

export async function restockProductHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as RestockInput;
    const result = await inventoryService.restockProduct(body);
    return reply.code(200).send(result);
  } catch (error: unknown) {
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

export async function adjustStockHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as AdjustStockInput;
    const result = await inventoryService.adjustStock(body);
    return reply.code(200).send(result);
  } catch (error: unknown) {
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