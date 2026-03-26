"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const keg_schema_1 = require("./keg.schema");
const keg_controller_1 = require("./keg.controller");
const tap_controller_1 = require("../taps/tap.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function kegRoutes(app) {
    const server = app.withTypeProvider();
    // Keg Routes
    server.get('/kegs', {
        onRequest: [auth_middleware_1.authenticate],
    }, keg_controller_1.getAllKegsHandler);
    server.post('/kegs', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            body: keg_schema_1.createKegSchema,
            response: {
                201: keg_schema_1.kegResponseSchema,
            },
        },
    }, keg_controller_1.createKegHandler);
    server.put('/kegs/:id', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({ id: zod_1.z.string() }),
            body: keg_schema_1.updateKegSchema,
            response: {
                200: keg_schema_1.kegResponseSchema,
            },
        },
    }, keg_controller_1.updateKegHandler);
    // Tap Routes
    server.get('/taps', {
        onRequest: [auth_middleware_1.authenticate],
    }, tap_controller_1.getAllTapsHandler);
    server.post('/taps', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            body: keg_schema_1.createTapSchema,
            response: {
                201: keg_schema_1.tapResponseSchema,
            },
        },
    }, tap_controller_1.createTapHandler);
    server.put('/taps/:id', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({ id: zod_1.z.string() }),
            body: keg_schema_1.updateTapSchema,
            response: {
                200: keg_schema_1.tapResponseSchema,
            },
        },
    }, tap_controller_1.updateTapHandler);
    server.post('/taps/:tapId/assign', {
        onRequest: [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('admin')],
        schema: {
            params: zod_1.z.object({ tapId: zod_1.z.string() }),
            body: zod_1.z.object({ kegId: zod_1.z.string() }),
            response: {
                200: keg_schema_1.tapResponseSchema,
            },
        },
    }, tap_controller_1.assignKegToTapHandler);
}
exports.default = kegRoutes;
