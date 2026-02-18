import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
    createTabSchema,
    depositTabSchema,
    closeTabSchema,
    tabSearchSchema,
} from './tabs.schema';
import {
    createTabHandler,
    getTabsHandler,
    getTabByIdHandler,
    depositToTabHandler,
    closeTabHandler,
} from './tabs.controller';
import { authenticate } from '../auth/auth.middleware';

async function tabRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/tabs - Create a new tab
    server.post(
        '/',
        {
            onRequest: [authenticate],
            schema: { body: createTabSchema },
        },
        createTabHandler
    );

    // GET /api/tabs - List all tabs
    server.get(
        '/',
        {
            onRequest: [authenticate],
            schema: { querystring: tabSearchSchema },
        },
        getTabsHandler
    );

    // GET /api/tabs/:id - Get tab details
    server.get(
        '/:id',
        {
            onRequest: [authenticate],
            schema: {
                params: z.object({ id: z.string() }),
            },
        },
        getTabByIdHandler
    );

    // POST /api/tabs/:id/deposit - Add money to tab
    server.post(
        '/:id/deposit',
        {
            onRequest: [authenticate],
            schema: {
                params: z.object({ id: z.string() }),
                body: depositTabSchema,
            },
        },
        depositToTabHandler
    );

    // POST /api/tabs/:id/close - Close tab
    server.post(
        '/:id/close',
        {
            onRequest: [authenticate],
            schema: {
                params: z.object({ id: z.string() }),
                body: closeTabSchema,
            },
        },
        closeTabHandler
    );
}

export default tabRoutes;

// POST /api/tabs/:id/close - Close tab
server.post(
    '/:id/close',
    {
        onRequest: [authenticate],
        schema: { body: closeTabSchema },
    },
    closeTabHandler
);
}

export default tabRoutes;
