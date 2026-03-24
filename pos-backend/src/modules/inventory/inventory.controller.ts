import { FastifyRequest, FastifyReply } from 'fastify';
import { inventoryService } from './inventory.service';
import { analyticsService } from './analytics.service';
import { RestockInput, AdjustStockInput } from './inventory.schema';

export async function restockProductHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as RestockInput;
    const user = (request as any).user;
    if (user && user.id) {
      body.userId = user.id;
    }
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
    const user = (request as any).user;
    if (user && user.id) {
      body.userId = user.id;
    }
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

export async function getLowStockHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const products = await inventoryService.getLowStockProducts();
    return reply.code(200).send(products);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch low stock products',
    });
  }
}

export async function getStockHistoryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const query = request.query as any;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    
    const filters = {
      productId: query.productId,
      type: query.type,
    };

    const history = await inventoryService.getStockHistory(filters, page, limit);
    return reply.code(200).send(history);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch stock history',
    });
  }
}

export async function getAnalyticsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const query = request.query as any;
    const days = query.days ? Number(query.days) : 30;
    const analytics = await analyticsService.getInventoryAnalytics(days);
    return reply.code(200).send(analytics);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch inventory analytics',
    });
  }
}