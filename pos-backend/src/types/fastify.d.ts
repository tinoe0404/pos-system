import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      username: string;
      role: 'admin' | 'cashier';
    };
  }
}