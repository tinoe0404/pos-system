import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  loginSchema,
  authResponseSchema,
  userResponseSchema,
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

  // GET /api/auth/me
  server.get(
    '/me',
    {
      onRequest: [authenticate],
      schema: {
        response: {
          200: userResponseSchema,
        },
      },
    },
    meHandler
  );
}

export default authRoutes;