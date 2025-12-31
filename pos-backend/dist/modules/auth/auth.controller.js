"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.meHandler = meHandler;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function loginHandler(request, reply) {
    const { username, password } = request.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            return reply.code(401).send({
                error: 'Invalid credentials',
            });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return reply.code(401).send({
                error: 'Invalid credentials',
            });
        }
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
        const userData = await prisma.user.findUnique({
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
        return reply.code(200).send(userData);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
        });
    }
}
//# sourceMappingURL=auth.controller.js.map