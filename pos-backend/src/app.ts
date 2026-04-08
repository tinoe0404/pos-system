import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from './shared/errors';
import { Prisma } from '@prisma/client';

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
import { refundRoutes } from './modules/refunds/refund.routes';
import stockSheetRoutes from './modules/stocksheet/stocksheet.routes';
import tabRoutes from './modules/tabs/tabs.routes';
import kegRoutes from './modules/kegs/keg.routes';
import prisma from './shared/prisma';
import redis from './shared/redis';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: 'info', // Changed to 'info' for production visibility
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

  // Register CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return cb(null, true);

      // Allow localhost only in development
      if (process.env.NODE_ENV !== 'production') {
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return cb(null, true);
        }
      }

      // Check against configured production origins
      const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      cb(new Error('Not allowed by CORS'), false);
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

  // Register Response Compression (60-80% smaller JSON payloads)
  await app.register(compress, { global: true });

  // Register Rate Limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !jwtSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing. It is strictly required in production.');
  }

  // Register JWT
  await app.register(jwt, {
    secret: jwtSecret || 'fallback-secret-change-this',
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
          url: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
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

  // Health check endpoint with DB + Redis status
  app.get('/health', async () => {
    const dbHealthy = await prisma.$queryRawUnsafe('SELECT 1').then(() => true).catch(() => false);
    const redisHealthy = await redis.ping().then(() => true).catch(() => false);
    return {
      status: dbHealthy && redisHealthy ? 'ok' : 'degraded',
      db: dbHealthy,
      redis: redisHealthy,
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
        kegs: '/api/kegs',
        taps: '/api/taps',
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
  await app.register(refundRoutes, { prefix: '/api' });
  await app.register(stockSheetRoutes, { prefix: '/api/reports/stock-sheet' });
  await app.register(tabRoutes, { prefix: '/api/tabs' });
  await app.register(kegRoutes, { prefix: '/api' });

  // Global Error Handler
  app.setErrorHandler((error: FastifyError | ApiError | any, request: FastifyRequest, reply: FastifyReply) => {
    // Log the error locally if not in tests
    if (process.env.NODE_ENV !== 'test') {
      request.log.error(error);
    }

    // 1. Uncaught custom API errors
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        error: error.name.replace('Error', ''),
        message: error.message,
      });
    }

    // 2. Zod Validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data provided',
        details: error.validation,
      });
    }

    // 3. Prisma Database known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[])?.join(', ') || 'field';
        return reply.status(409).send({
          error: 'Conflict',
          message: `A record with this ${target} already exists.`,
        });
      }
      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'The requested record could not be found.',
        });
      }
    }

    // 4. JWT errors
    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' || error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      });
    }

    // 5. Generic Fallback
    const statusCode = error.statusCode || 500;
    const isProd = process.env.NODE_ENV === 'production';
    
    return reply.status(statusCode).send({
      error: statusCode === 500 ? 'Internal Server Error' : error.name,
      message: statusCode === 500 && isProd ? 'An unexpected error occurred' : error.message,
    });
  });

  return app;
}