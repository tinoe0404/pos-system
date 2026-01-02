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

declare module 'fastify' {
  interface FastifyInstance {
    jwt: {
      sign: (payload: any) => string;
      verify: (token: string) => any;
    };
  }
  
  interface FastifyRequest {
    jwtVerify(): Promise<void>;
    user: {
      id: string;
      username: string;
      role: 'admin' | 'cashier';
    };
  }
}