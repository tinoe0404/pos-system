import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  setPinSchema,
  createUserSchema,
  userResponseSchema,
  usersListResponseSchema,
} from './user.schema';
import {
  getAllUsersHandler,
  createUserHandler,
  deactivateUserHandler,
  setPinHandler,
} from './user.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/users - Get all users (Protected: Admin only)
  server.get(
    '/',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        response: {
          200: usersListResponseSchema,
        },
      },
    },
    getAllUsersHandler
  );

  // POST /api/users - Create a new user (Protected: Admin only)
  server.post(
    '/',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        body: createUserSchema,
        response: {
          201: userResponseSchema,
        },
      },
    },
    createUserHandler
  );

  // PUT /api/users/:id/deactivate - Deactivate user (Protected: Admin only)
  server.put(
    '/:id/deactivate',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: userResponseSchema,
        },
      },
    },
    deactivateUserHandler
  );

  // PUT /api/users/:id/pin - Set user PIN (Protected: Admin only)
  server.put(
    '/:id/pin',
    {
      onRequest: [authenticate, requireRole('admin')],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: setPinSchema,
        response: {
          200: z.object({ message: z.string() }),
        },
      },
    },
    setPinHandler
  );
}

export default userRoutes;