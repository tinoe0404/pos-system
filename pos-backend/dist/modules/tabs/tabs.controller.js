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
        const userId = request.user.id;
        const tab = await tabs_service_1.tabsService.createTab(userId, request.body);
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
        const tab = await tabs_service_1.tabsService.getTabById(request.params.id);
        return reply.send(tab);
    }
    catch (error) {
        return reply.code(404).send({ message: error.message });
    }
}
async function depositToTabHandler(request, reply) {
    try {
        const tab = await tabs_service_1.tabsService.depositToTab(request.params.id, request.body.amount, request.body.note);
        return reply.send(tab);
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
async function closeTabHandler(request, reply) {
    try {
        const result = await tabs_service_1.tabsService.closeTab(request.params.id, request.body.note);
        return reply.send(result);
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
