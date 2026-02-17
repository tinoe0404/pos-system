import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
    openRegisterSchema,
    closeRegisterSchema,
    cashMovementSchema,
} from './register.schema';
import {
    openRegisterHandler,
    closeRegisterHandler,
    getCurrentRegisterHandler,
    cashInHandler,
    cashOutHandler,
} from './register.controller';
import { authenticate } from '../auth/auth.middleware';

async function registerRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/register/open - Open a new cash register
    server.post(
        '/open',
        {
            onRequest: [authenticate],
            schema: { body: openRegisterSchema },
        },
        openRegisterHandler
    );

    // POST /api/register/close - Close current register
    server.post(
        '/close',
        {
            onRequest: [authenticate],
            schema: { body: closeRegisterSchema },
        },
        closeRegisterHandler
    );

    // GET /api/register/current - Get current open register
    server.get(
        '/current',
        {
            onRequest: [authenticate],
        },
        getCurrentRegisterHandler
    );

    // POST /api/register/cash-in - Record a cash deposit
    server.post(
        '/cash-in',
        {
            onRequest: [authenticate],
            schema: { body: cashMovementSchema },
        },
        cashInHandler
    );

    // POST /api/register/cash-out - Record a cash withdrawal
    server.post(
        '/cash-out',
        {
            onRequest: [authenticate],
            schema: { body: cashMovementSchema },
        },
        cashOutHandler
    );
}

export default registerRoutes;
