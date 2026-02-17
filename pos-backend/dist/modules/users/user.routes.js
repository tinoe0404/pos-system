"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const user_schema_1 = require("./user.schema");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function userRoutes(app) {
    const server = app.withTypeProvider();
    // GET /api/users - Get all users (Protected: Admin only)
    server.get('/', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            response: {
                200: user_schema_1.usersListResponseSchema,
            },
        },
    }, user_controller_1.getAllUsersHandler);
    // POST /api/users - Create a new user (Protected: Admin only)
    server.post('/', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            body: user_schema_1.createUserSchema,
            response: {
                201: user_schema_1.userResponseSchema,
            },
        },
    }, user_controller_1.createUserHandler);
    // PUT /api/users/:id/deactivate - Deactivate user (Protected: Admin only)
    server.put('/:id/deactivate', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            response: {
                200: user_schema_1.userResponseSchema,
            },
        },
    }, user_controller_1.deactivateUserHandler);
    // PUT /api/users/:id/pin - Set user PIN (Protected: Admin only)
    server.put('/:id/pin', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
            body: user_schema_1.setPinSchema,
            response: {
                200: zod_1.z.object({ message: zod_1.z.string() }),
            },
        },
    }, user_controller_1.setPinHandler);
}
exports.default = userRoutes;
