import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  loginSchema,
  authResponseSchema,
  meResponseSchema,
} from './auth.schema';
import { loginHandler, meHandler, logoutHandler } from './auth.controller';
import { authenticate } from './auth.middleware';

async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/auth/login
  server.post(
    '/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    loginHandler
  );

  // GET /api/auth/me - Returns only id, username, role
  server.get(
    '/me',
    {
      onRequest: [authenticate],
      schema: {
        response: {
          200: meResponseSchema,
        },
      },
    },
    meHandler
  );

  // POST /api/auth/logout
  server.post(
    '/logout',
    {
      onRequest: [authenticate],
      schema: {
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    logoutHandler
  );
}

export default authRoutes;