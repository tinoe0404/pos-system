import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/product.routes';
import salesRoutes from './modules/sales/sales.routes';
import userRoutes from './modules/users/user.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
    },
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Set Zod validators
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register security plugins
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Register JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
    sign: {
      expiresIn: '24h',
    },
  });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(productRoutes, { prefix: '/api/products' });
  await app.register(salesRoutes, { prefix: '/api/sales' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(inventoryRoutes, { prefix: '/api/inventory' });

  return app;
}