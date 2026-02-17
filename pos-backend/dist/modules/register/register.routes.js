"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const register_schema_1 = require("./register.schema");
const register_controller_1 = require("./register.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function registerRoutes(app) {
    const server = app.withTypeProvider();
    // POST /api/register/open - Open a new cash register
    server.post('/open', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: register_schema_1.openRegisterSchema },
    }, register_controller_1.openRegisterHandler);
    // POST /api/register/close - Close current register
    server.post('/close', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: register_schema_1.closeRegisterSchema },
    }, register_controller_1.closeRegisterHandler);
    // GET /api/register/current - Get current open register
    server.get('/current', {
        onRequest: [auth_middleware_1.authenticate],
    }, register_controller_1.getCurrentRegisterHandler);
    // POST /api/register/cash-in - Record a cash deposit
    server.post('/cash-in', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: register_schema_1.cashMovementSchema },
    }, register_controller_1.cashInHandler);
    // POST /api/register/cash-out - Record a cash withdrawal
    server.post('/cash-out', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: register_schema_1.cashMovementSchema },
    }, register_controller_1.cashOutHandler);
}
exports.default = registerRoutes;
