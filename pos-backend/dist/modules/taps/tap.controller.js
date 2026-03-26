"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTapsHandler = getAllTapsHandler;
exports.createTapHandler = createTapHandler;
exports.updateTapHandler = updateTapHandler;
exports.assignKegToTapHandler = assignKegToTapHandler;
const tap_service_1 = require("./tap.service");
async function getAllTapsHandler(request, reply) {
    try {
        const taps = await tap_service_1.tapService.getAllTaps();
        return reply.code(200).send(taps);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch taps',
        });
    }
}
async function createTapHandler(request, reply) {
    try {
        const body = request.body;
        const tap = await tap_service_1.tapService.createTap(body);
        return reply.code(201).send(tap);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create tap',
        });
    }
}
async function updateTapHandler(request, reply) {
    try {
        const { id } = request.params;
        const body = request.body;
        const tap = await tap_service_1.tapService.updateTap(Number(id), body);
        return reply.code(200).send(tap);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to update tap',
        });
    }
}
async function assignKegToTapHandler(request, reply) {
    try {
        const { tapId } = request.params;
        const { kegId } = request.body;
        const tap = await tap_service_1.tapService.assignKegToTap(Number(tapId), kegId);
        return reply.code(200).send(tap);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to assign keg to tap',
        });
    }
}
