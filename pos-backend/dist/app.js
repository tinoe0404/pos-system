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
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
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
    app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
    app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
    await app.register(helmet_1.default, {
        contentSecurityPolicy: false,
    });
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
    await app.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
        sign: {
            expiresIn: '24h',
        },
    });
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    await app.register(auth_routes_1.default, { prefix: '/api/auth' });
    await app.register(product_routes_1.default, { prefix: '/api/products' });
    return app;
}
//# sourceMappingURL=app.js.map