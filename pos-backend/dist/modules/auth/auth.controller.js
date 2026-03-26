"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.meHandler = meHandler;
exports.logoutHandler = logoutHandler;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function loginHandler(request, reply) {
    const { username, password } = request.body;
    try {
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { username },
        });
        if (!user) {
            return reply.code(401).send({
                error: 'Invalid credentials',
            });
        }
        // Check if user is active
        if (!user.is_active) {
            return reply.code(403).send({
                error: 'Account deactivated',
                message: 'Your account has been deactivated. Please contact an administrator.',
            });
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return reply.code(401).send({
                error: 'Invalid credentials',
            });
        }
        // Generate JWT
        const token = request.server.jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role,
        });
        return reply.code(200).send({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                created_at: user.created_at,
            },
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
        });
    }
}
async function meHandler(request, reply) {
    try {
        const user = request.user;
        // Fetch fresh user data
        const userData = await prisma_1.default.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                username: true,
                role: true,
                created_at: true,
            },
        });
        if (!userData) {
            return reply.code(404).send({
                error: 'User not found',
            });
        }
        // Return only id, username, role (as per requirements)
        return reply.code(200).send({
            id: userData.id,
            username: userData.username,
            role: userData.role,
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
        });
    }
}
async function logoutHandler(request, reply) {
    return reply.code(200).send({ message: 'Logged out successfully' });
}
