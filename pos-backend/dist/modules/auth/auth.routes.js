"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_schema_1 = require("./auth.schema");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
async function authRoutes(app) {
    const server = app.withTypeProvider();
    server.post('/login', {
        schema: {
            body: auth_schema_1.loginSchema,
            response: {
                200: auth_schema_1.authResponseSchema,
            },
        },
    }, auth_controller_1.loginHandler);
    server.get('/me', {
        onRequest: [auth_middleware_1.authenticate],
        schema: {
            response: {
                200: auth_schema_1.userResponseSchema,
            },
        },
    }, auth_controller_1.meHandler);
}
exports.default = authRoutes;
//# sourceMappingURL=auth.routes.js.map