"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTabHandler = createTabHandler;
exports.getTabsHandler = getTabsHandler;
exports.getTabByIdHandler = getTabByIdHandler;
exports.depositToTabHandler = depositToTabHandler;
exports.closeTabHandler = closeTabHandler;
const tabs_service_1 = require("./tabs.service");
async function createTabHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const tab = await tabs_service_1.tabsService.createTab(user.id, body);
        return reply.code(201).send(tab);
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
async function getTabsHandler(request, reply) {
    try {
        const { q, status } = request.query;
        const tabs = await tabs_service_1.tabsService.getTabs({ q, status });
        return reply.send({ tabs, count: tabs.length });
    }
    catch (error) {
        return reply.code(500).send({ message: error.message });
    }
}
async function getTabByIdHandler(request, reply) {
    try {
        const { id } = request.params;
        const tab = await tabs_service_1.tabsService.getTabById(id);
        return reply.send(tab);
    }
    catch (error) {
        return reply.code(404).send({ message: error.message });
    }
}
async function depositToTabHandler(request, reply) {
    try {
        const { id } = request.params;
        const body = request.body;
        const tab = await tabs_service_1.tabsService.depositToTab(id, body.amount, body.note);
        return reply.send(tab);
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
async function closeTabHandler(request, reply) {
    try {
        const { id } = request.params;
        const body = request.body;
        const result = await tabs_service_1.tabsService.closeTab(id, body.note);
        return reply.send(result);
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
