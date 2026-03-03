import { FastifyRequest, FastifyReply } from 'fastify';
import { tapService } from './tap.service';
import { CreateTapInput, UpdateTapInput } from '../kegs/keg.schema';

export async function getAllTapsHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const taps = await tapService.getAllTaps();
        return reply.code(200).send(taps);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch taps',
        });
    }
}

export async function createTapHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const body = request.body as CreateTapInput;
        const tap = await tapService.createTap(body);
        return reply.code(201).send(tap);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create tap',
        });
    }
}

export async function updateTapHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { id } = request.params as { id: string };
        const body = request.body as UpdateTapInput;
        const tap = await tapService.updateTap(Number(id), body);
        return reply.code(200).send(tap);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to update tap',
        });
    }
}

export async function assignKegToTapHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { tapId } = request.params as { tapId: string };
        const { kegId } = request.body as { kegId: string };
        const tap = await tapService.assignKegToTap(Number(tapId), kegId);
        return reply.code(200).send(tap);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to assign keg to tap',
        });
    }
}
