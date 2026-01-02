import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from './user.service';
import { CreateUserInput } from './user.schema';

export async function getAllUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await userService.getAllUsers();
    return reply.code(200).send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch users',
    });
  }
}

export async function createUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as CreateUserInput;
    const user = await userService.createUser(body);
    return reply.code(201).send(user);
  } catch (error: unknown) {
    request.log.error(error);

    if (
      error instanceof Error &&
      error.message === 'User with this username already exists'
    ) {
      return reply.code(409).send({
        error: 'Conflict',
        message: error.message,
      });
    }

    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to create user',
    });
  }
}

export async function deactivateUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const user = await userService.deactivateUser(id);
    return reply.code(200).send(user);
  } catch (error: unknown) {
    request.log.error(error);

    if (error instanceof Error && error.message === 'User not found') {
      return reply.code(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to deactivate user',
    });
  }
}