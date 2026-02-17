import { FastifyRequest, FastifyReply } from 'fastify';
import { refundService } from './refund.service';
import { CreateRefundInput } from './refund.schema';
import { z } from 'zod';

export async function createRefundHandler(
    request: FastifyRequest<{
        Params: { id: string };
        Body: CreateRefundInput;
    }>,
    reply: FastifyReply
) {
    try {
        const saleId = request.params.id;
        const { items, reason } = request.body;
        const userId = request.user.id;

        // Call service
        const refund = await refundService.processRefund(userId, {
            saleId,
            items,
            reason
        });

        return reply.code(201).send(refund);
    } catch (error: any) {
        request.log.error(error);
        return reply.code(400).send({
            message: error.message || 'Refund processing failed',
            error: 'Bad Request'
        });
    }
}
