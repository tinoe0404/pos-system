"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const compress_1 = __importDefault(require("@fastify/compress"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const fastify_type_provider_zod_2 = require("fastify-type-provider-zod");
const errors_1 = require("./shared/errors");
const client_1 = require("@prisma/client");
// Import all route modules
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const sales_routes_1 = __importDefault(require("./modules/sales/sales.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const analytics_routes_1 = require("./modules/analytics/analytics.routes");
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const refund_routes_1 = require("./modules/refunds/refund.routes");
const stocksheet_routes_1 = __importDefault(require("./modules/stocksheet/stocksheet.routes"));
const tabs_routes_1 = __importDefault(require("./modules/tabs/tabs.routes"));
const keg_routes_1 = __importDefault(require("./modules/kegs/keg.routes"));
const prisma_1 = __importDefault(require("./shared/prisma"));
const redis_1 = __importDefault(require("./shared/redis"));
async function buildApp() {
    const app = (0, fastify_1.default)({
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
    }).withTypeProvider();
    // Set Zod validators
    app.setValidatorCompiler(fastify_type_provider_zod_2.validatorCompiler);
    app.setSerializerCompiler(fastify_type_provider_zod_2.serializerCompiler);
    // Register CORS
    await app.register(cors_1.default, {
        origin: (origin, cb) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin)
                return cb(null, true);
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
    await app.register(helmet_1.default, {
        contentSecurityPolicy: false, // Disable CSP for API
        crossOriginEmbedderPolicy: false,
    });
    // Register Response Compression (60-80% smaller JSON payloads)
    await app.register(compress_1.default, { global: true });
    // Register Rate Limiting
    await app.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
    });
    const jwtSecret = process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production' && !jwtSecret) {
        throw new Error('FATAL: JWT_SECRET environment variable is missing. It is strictly required in production.');
    }
    // Register JWT
    await app.register(jwt_1.default, {
        secret: jwtSecret || 'fallback-secret-change-this',
        sign: {
            expiresIn: '24h',
        },
    });
    // Register Swagger
    await app.register(swagger_1.default, {
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
        transform: fastify_type_provider_zod_1.jsonSchemaTransform,
    });
    await app.register(swagger_ui_1.default, {
        routePrefix: '/documentation',
    });
    // Health check endpoint with DB + Redis status
    app.get('/health', async () => {
        const dbHealthy = await prisma_1.default.$queryRawUnsafe('SELECT 1').then(() => true).catch(() => false);
        const redisHealthy = await redis_1.default.ping().then(() => true).catch(() => false);
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
    await app.register(auth_routes_1.default, { prefix: '/api/auth' });
    await app.register(product_routes_1.default, { prefix: '/api/products' });
    await app.register(sales_routes_1.default, { prefix: '/api/sales' });
    await app.register(user_routes_1.default, { prefix: '/api/users' });
    await app.register(inventory_routes_1.default, { prefix: '/api/inventory' });
    await app.register(analytics_routes_1.analyticsRoutes, { prefix: '/api/analytics' });
    await app.register(analytics_routes_1.notificationsRoutes, { prefix: '/api/notifications' });
    await app.register(analytics_routes_1.recommendationsRoutes, { prefix: '/api/recommendations' });
    await app.register(reports_routes_1.default, { prefix: '/api/reports' });
    await app.register(refund_routes_1.refundRoutes, { prefix: '/api' });
    await app.register(stocksheet_routes_1.default, { prefix: '/api/reports/stock-sheet' });
    await app.register(tabs_routes_1.default, { prefix: '/api/tabs' });
    await app.register(keg_routes_1.default, { prefix: '/api' });
    // Global Error Handler
    app.setErrorHandler((error, request, reply) => {
        // Log the error locally if not in tests
        if (process.env.NODE_ENV !== 'test') {
            request.log.error(error);
        }
        // 1. Uncaught custom API errors
        if (error instanceof errors_1.ApiError) {
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
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const target = error.meta?.target?.join(', ') || 'field';
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
