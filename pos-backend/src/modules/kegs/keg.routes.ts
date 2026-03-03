import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
    createKegSchema,
    updateKegSchema,
    kegResponseSchema,
    createTapSchema,
    updateTapSchema,
    tapResponseSchema,
} from './keg.schema';
import {
    getAllKegsHandler,
    createKegHandler,
    updateKegHandler,
} from './keg.controller';
import {
    getAllTapsHandler,
    createTapHandler,
    updateTapHandler,
    assignKegToTapHandler,
} from '../taps/tap.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function kegRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // Keg Routes
    server.get(
        '/kegs',
        {
            onRequest: [authenticate],
        },
        getAllKegsHandler
    );

    server.post(
        '/kegs',
        {
            onRequest: [authenticate, requireRole('admin')],
            schema: {
                body: createKegSchema,
                response: {
                    201: kegResponseSchema,
                },
            },
        },
        createKegHandler
    );

    server.put(
        '/kegs/:id',
        {
            onRequest: [authenticate, requireRole('admin')],
            schema: {
                params: z.object({ id: z.string() }),
                body: updateKegSchema,
                response: {
                    200: kegResponseSchema,
                },
            },
        },
        updateKegHandler
    );

    // Tap Routes
    server.get(
        '/taps',
        {
            onRequest: [authenticate],
        },
        getAllTapsHandler
    );

    server.post(
        '/taps',
        {
            onRequest: [authenticate, requireRole('admin')],
            schema: {
                body: createTapSchema,
                response: {
                    201: tapResponseSchema,
                },
            },
        },
        createTapHandler
    );

    server.put(
        '/taps/:id',
        {
            onRequest: [authenticate, requireRole('admin')],
            schema: {
                params: z.object({ id: z.string() }),
                body: updateTapSchema,
                response: {
                    200: tapResponseSchema,
                },
            },
        },
        updateTapHandler
    );

    server.post(
        '/taps/:tapId/assign',
        {
            onRequest: [authenticate, requireRole('admin')],
            schema: {
                params: z.object({ tapId: z.string() }),
                body: z.object({ kegId: z.string() }),
                response: {
                    200: tapResponseSchema,
                },
            },
        },
        assignKegToTapHandler
    );
}

export default kegRoutes;
