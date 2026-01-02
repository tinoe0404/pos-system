import { FastifyRequest, FastifyReply } from 'fastify';
import { analyticsService } from './analytics.service';

export async function getDailySummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const summary = await analyticsService.getDailySummary();
    return reply.code(200).send(summary);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch daily summary',
    });
  }
}

export async function getBestSellersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const bestSellers = await analyticsService.getBestSellers();
    return reply.code(200).send(bestSellers);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch best sellers',
    });
  }
}

export async function getLowStockHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const lowStock = await analyticsService.getLowStockProducts();
    return reply.code(200).send(lowStock);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch low stock products',
    });
  }
}

export async function getRestockRecommendationsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const recommendations = await analyticsService.getRestockRecommendations();
    return reply.code(200).send(recommendations);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch restock recommendations',
    });
  }
}