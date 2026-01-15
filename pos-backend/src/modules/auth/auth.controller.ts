import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { LoginInput } from './auth.schema';

const prisma = new PrismaClient();

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const { username, password } = request.body;

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return reply.code(401).send({
        error: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return reply.code(403).send({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return reply.code(401).send({
        error: 'Invalid credentials',
      });
    }

    // Generate JWT
    const token = request.server.jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return reply.code(200).send({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
    });
  }
}

export async function meHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as {
      id: string;
      username: string;
      role: string;
    };

    // Fetch fresh user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    if (!userData) {
      return reply.code(404).send({
        error: 'User not found',
      });
    }

    // Return only id, username, role (as per requirements)
    return reply.code(200).send({
      id: userData.id,
      username: userData.username,
      role: userData.role,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
    });
  }
}

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.code(200).send({ message: 'Logged out successfully' });
}