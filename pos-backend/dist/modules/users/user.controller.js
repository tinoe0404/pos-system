"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPinHandler = setPinHandler;
exports.getAllUsersHandler = getAllUsersHandler;
exports.createUserHandler = createUserHandler;
exports.deactivateUserHandler = deactivateUserHandler;
const user_service_1 = require("./user.service");
async function setPinHandler(request, reply) {
    try {
        const { id } = request.params;
        const { pin } = request.body;
        await user_service_1.userService.setPin(id, pin);
        return reply.code(200).send({ message: 'PIN updated successfully' });
    }
    catch (error) {
        if (error instanceof Error && error.message === 'PIN must be 4 digits') {
            return reply.code(400).send({ message: error.message });
        }
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to set PIN',
        });
    }
}
async function getAllUsersHandler(request, reply) {
    try {
        const result = await user_service_1.userService.getAllUsers();
        return reply.code(200).send(result);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch users',
        });
    }
}
async function createUserHandler(request, reply) {
    try {
        const body = request.body;
        const user = await user_service_1.userService.createUser(body);
        return reply.code(201).send(user);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error &&
            error.message === 'User with this username already exists') {
            return reply.code(409).send({
                error: 'Conflict',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create user',
        });
    }
}
async function deactivateUserHandler(request, reply) {
    try {
        const { id } = request.params;
        const user = await user_service_1.userService.deactivateUser(id);
        return reply.code(200).send(user);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error && error.message === 'User not found') {
            return reply.code(404).send({
                error: 'Not found',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to deactivate user',
        });
    }
}
