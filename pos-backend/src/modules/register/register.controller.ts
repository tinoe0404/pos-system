import { FastifyRequest, FastifyReply } from 'fastify';
import { registerService } from './register.service';
import { OpenRegisterInput, CloseRegisterInput, CashMovementInput } from './register.schema';

export async function openRegisterHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const user = request.user as { id: string };
        const body = request.body as OpenRegisterInput;

        const register = await registerService.openRegister(user.id, body.opening_amount);
        return reply.code(201).send(register);
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('already have an open register')) {
            return reply.code(409).send({ error: 'Conflict', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to open register' });
    }
}

export async function closeRegisterHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const user = request.user as { id: string };
        const body = request.body as CloseRegisterInput;

        const result = await registerService.closeRegister(user.id, body.closing_amount, body.notes);
        return reply.code(200).send(result);
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('No open register')) {
            return reply.code(404).send({ error: 'Not found', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to close register' });
    }
}

export async function getCurrentRegisterHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const user = request.user as { id: string };
        const register = await registerService.getCurrentRegister(user.id);

        if (!register) {
            return reply.code(200).send({ register: null, isOpen: false });
        }

        return reply.code(200).send({ register, isOpen: true });
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to get register' });
    }
}

export async function cashInHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const user = request.user as { id: string };
        const body = request.body as CashMovementInput;

        const log = await registerService.cashIn(user.id, body.amount, body.note);
        return reply.code(201).send(log);
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('No open register')) {
            return reply.code(404).send({ error: 'Not found', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to record cash in' });
    }
}

export async function cashOutHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const user = request.user as { id: string };
        const body = request.body as CashMovementInput;

        const log = await registerService.cashOut(user.id, body.amount, body.note);
        return reply.code(201).send(log);
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('No open register')) {
            return reply.code(404).send({ error: 'Not found', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to record cash out' });
    }
}
