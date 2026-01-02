import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

// Import all route modules
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/product.routes';
import salesRoutes from './modules/sales/sales.routes';
import userRoutes from './modules/users/user.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import {
  analyticsRoutes,
  notificationsRoutes,
  recommendationsRoutes,
} from './modules/analytics/analytics.routes';
import reportsRoutes from './modules/reports/reports.routes';

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

  // Register CORS - Allow all origins for development
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*', // Use '*' for development, specify domains in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register Helmet - Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
  });

  // Register JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
    sign: {
      expiresIn: '24h',
    },
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // API info endpoint
  app.get('/', async () => {
    return {
      name: 'POS Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        sales: '/api/sales',
        users: '/api/users',
        inventory: '/api/inventory',
        analytics: '/api/analytics',
        notifications: '/api/notifications',
        recommendations: '/api/recommendations',
        reports: '/api/reports',
      },
    };
  });

  // Register all route modules
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(productRoutes, { prefix: '/api/products' });
  await app.register(salesRoutes, { prefix: '/api/sales' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(inventoryRoutes, { prefix: '/api/inventory' });
  await app.register(analyticsRoutes, { prefix: '/api/analytics' });
  await app.register(notificationsRoutes, { prefix: '/api/notifications' });
  await app.register(recommendationsRoutes, { prefix: '/api/recommendations' });
  await app.register(reportsRoutes, { prefix: '/api/reports' });

  return app;
}