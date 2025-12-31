import { FastifyRequest, FastifyReply } from 'fastify';
type UserRole = 'admin' | 'cashier';
export declare function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function requireRole(...allowedRoles: UserRole[]): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map