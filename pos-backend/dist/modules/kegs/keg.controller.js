"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllKegsHandler = getAllKegsHandler;
exports.createKegHandler = createKegHandler;
exports.updateKegHandler = updateKegHandler;
const keg_service_1 = require("./keg.service");
async function getAllKegsHandler(request, reply) {
    try {
        const kegs = await keg_service_1.kegService.getAllKegs();
        return reply.code(200).send(kegs);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch kegs',
        });
    }
}
async function createKegHandler(request, reply) {
    try {
        const body = request.body;
        const keg = await keg_service_1.kegService.createKeg(body);
        return reply.code(201).send(keg);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create keg',
        });
    }
}
async function updateKegHandler(request, reply) {
    try {
        const { id } = request.params;
        const body = request.body;
        const keg = await keg_service_1.kegService.updateKeg(id, body);
        return reply.code(200).send(keg);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to update keg',
        });
    }
}
