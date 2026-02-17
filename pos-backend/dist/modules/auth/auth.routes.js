"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const auth_schema_1 = require("./auth.schema");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
async function authRoutes(app) {
    const server = app.withTypeProvider();
    // POST /api/auth/login
    server.post('/login', {
        schema: {
            body: auth_schema_1.loginSchema,
            response: {
                200: auth_schema_1.authResponseSchema,
            },
        },
    }, auth_controller_1.loginHandler);
    // GET /api/auth/me - Returns only id, username, role
    server.get('/me', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            response: {
                200: auth_schema_1.meResponseSchema,
            },
        },
    }, auth_controller_1.meHandler);
    // POST /api/auth/logout
    server.post('/logout', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            response: {
                200: zod_1.z.object({
                    message: zod_1.z.string(),
                }),
            },
        },
    }, auth_controller_1.logoutHandler);
}
exports.default = authRoutes;
