import { FastifyRequest, FastifyReply } from 'fastify';

// Define role type locally since Prisma enum may not be exported yet
type UserRole = 'admin' | 'cashier';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or missing token',
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: UserRole };

    if (!user || !allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
  };
}