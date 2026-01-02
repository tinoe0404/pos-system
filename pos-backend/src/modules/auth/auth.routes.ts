import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  loginSchema,
  authResponseSchema,
  meResponseSchema,
} from './auth.schema';
import { loginHandler, meHandler } from './auth.controller';
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
}

export default authRoutes;