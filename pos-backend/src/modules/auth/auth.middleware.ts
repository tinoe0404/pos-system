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

export function requirePinOrRole(requiredRole: UserRole) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: UserRole };
    const body = request.body as { pin?: string } | undefined;

    // 1. Check if user already has the role
    if (user && user.role === requiredRole) {
      return;
    }

    // 2. Check if a valid PIN is provided
    if (body?.pin) {
      // Lazy import to avoid circular dependency if any
      const { userService } = await import('../users/user.service');
      const isValid = await userService.verifyAdminPin(body.pin);
      if (isValid) {
        return;
      }
    }

    // 3. Forbidden
    return reply.code(403).send({
      error: 'Forbidden',
      message: 'Insufficient permissions. Admin PIN required.',
    });
  };
}