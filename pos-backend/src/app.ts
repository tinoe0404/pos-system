import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
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
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return cb(null, true);
      // Allow localhost requests
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return cb(null, true);
      }
      // Error out others
      cb(new Error("Not allowed by CORS"), false);
    },
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
  // Register JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
    sign: {
      expiresIn: '24h',
    },
  });

  // Register Swagger
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'POS System API',
        description: 'Antigravity POS Backend Documentation',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
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