"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabs_schema_1 = require("./tabs.schema");
const tabs_controller_1 = require("./tabs.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
async function tabRoutes(app) {
    const server = app.withTypeProvider();
    // POST /api/tabs - Create a new tab
    server.post('/', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: tabs_schema_1.createTabSchema },
    }, tabs_controller_1.createTabHandler);
    // GET /api/tabs - List all tabs
    server.get('/', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { querystring: tabs_schema_1.tabSearchSchema },
    }, tabs_controller_1.getTabsHandler);
    // GET /api/tabs/:id - Get tab details
    server.get('/:id', {
        onRequest: [auth_middleware_1.authenticate],
    }, tabs_controller_1.getTabByIdHandler);
    // POST /api/tabs/:id/deposit - Add money to tab
    server.post('/:id/deposit', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: tabs_schema_1.depositTabSchema },
    }, tabs_controller_1.depositToTabHandler);
    // POST /api/tabs/:id/close - Close tab
    server.post('/:id/close', {
        onRequest: [auth_middleware_1.authenticate],
        schema: { body: tabs_schema_1.closeTabSchema },
    }, tabs_controller_1.closeTabHandler);
}
exports.default = tabRoutes;
