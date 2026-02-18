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
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const fastify_type_provider_zod_2 = require("fastify-type-provider-zod");
// Import all route modules
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const sales_routes_1 = __importDefault(require("./modules/sales/sales.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const analytics_routes_1 = require("./modules/analytics/analytics.routes");
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const register_routes_1 = __importDefault(require("./modules/register/register.routes"));
const refund_routes_1 = require("./modules/refunds/refund.routes");
const stocksheet_routes_1 = __importDefault(require("./modules/stocksheet/stocksheet.routes"));
async function buildApp() {
    const app = (0, fastify_1.default)({
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
            // Always allow localhost in development
            if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
                return cb(null, true);
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
    // Register JWT
    // Register JWT
    await app.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
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
    await app.register(auth_routes_1.default, { prefix: '/api/auth' });
    await app.register(product_routes_1.default, { prefix: '/api/products' });
    await app.register(sales_routes_1.default, { prefix: '/api/sales' });
    await app.register(user_routes_1.default, { prefix: '/api/users' });
    await app.register(inventory_routes_1.default, { prefix: '/api/inventory' });
    await app.register(analytics_routes_1.analyticsRoutes, { prefix: '/api/analytics' });
    await app.register(analytics_routes_1.notificationsRoutes, { prefix: '/api/notifications' });
    await app.register(analytics_routes_1.recommendationsRoutes, { prefix: '/api/recommendations' });
    await app.register(reports_routes_1.default, { prefix: '/api/reports' });
    await app.register(register_routes_1.default, { prefix: '/api/register' });
    await app.register(refund_routes_1.refundRoutes, { prefix: '/api' });
    await app.register(stocksheet_routes_1.default, { prefix: '/api/reports/stock-sheet' });
    await app.register(tabRoutes, { prefix: '/api/tabs' });
    return app;
}
