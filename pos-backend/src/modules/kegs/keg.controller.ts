import { FastifyRequest, FastifyReply } from 'fastify';
import { kegService } from './keg.service';
import { CreateKegInput, UpdateKegInput } from './keg.schema';

export async function getAllKegsHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const kegs = await kegService.getAllKegs();
        return reply.code(200).send(kegs);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch kegs',
        });
    }
}

export async function createKegHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const body = request.body as CreateKegInput;
        const keg = await kegService.createKeg(body);
        return reply.code(201).send(keg);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create keg',
        });
    }
}

export async function updateKegHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { id } = request.params as { id: string };
        const body = request.body as UpdateKegInput;
        const keg = await kegService.updateKeg(id, body);
        return reply.code(200).send(keg);
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to update keg',
        });
    }
}
