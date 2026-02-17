"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openRegisterHandler = openRegisterHandler;
exports.closeRegisterHandler = closeRegisterHandler;
exports.getCurrentRegisterHandler = getCurrentRegisterHandler;
exports.cashInHandler = cashInHandler;
exports.cashOutHandler = cashOutHandler;
const register_service_1 = require("./register.service");
async function openRegisterHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const register = await register_service_1.registerService.openRegister(user.id, body.opening_amount);
        return reply.code(201).send(register);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('already have an open register')) {
            return reply.code(409).send({ error: 'Conflict', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to open register' });
    }
}
async function closeRegisterHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const result = await register_service_1.registerService.closeRegister(user.id, body.closing_amount, body.notes);
        return reply.code(200).send(result);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('No open register')) {
            return reply.code(404).send({ error: 'Not found', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to close register' });
    }
}
async function getCurrentRegisterHandler(request, reply) {
    try {
        const user = request.user;
        const register = await register_service_1.registerService.getCurrentRegister(user.id);
        if (!register) {
            return reply.code(200).send({ register: null, isOpen: false });
        }
        return reply.code(200).send({ register, isOpen: true });
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to get register' });
    }
}
async function cashInHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const log = await register_service_1.registerService.cashIn(user.id, body.amount, body.note);
        return reply.code(201).send(log);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('No open register')) {
            return reply.code(404).send({ error: 'Not found', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to record cash in' });
    }
}
async function cashOutHandler(request, reply) {
    try {
        const user = request.user;
        const body = request.body;
        const log = await register_service_1.registerService.cashOut(user.id, body.amount, body.note);
        return reply.code(201).send(log);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('No open register')) {
            return reply.code(404).send({ error: 'Not found', message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error', message: 'Failed to record cash out' });
    }
}
