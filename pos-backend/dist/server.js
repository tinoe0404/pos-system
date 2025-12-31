"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const client_1 = require("@prisma/client");
const redis_1 = __importDefault(require("./shared/redis"));
const prisma = new client_1.PrismaClient();
async function start() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');
        await redis_1.default.ping();
        const app = await (0, app_1.buildApp)();
        const port = parseInt(process.env.PORT || '3000', 10);
        const host = process.env.HOST || '0.0.0.0';
        await app.listen({ port, host });
        console.log(`🚀 Server running at http://${host}:${port}`);
    }
    catch (err) {
        console.error('❌ Server startup error:', err);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    await redis_1.default.quit();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    await redis_1.default.quit();
    process.exit(0);
});
start();
//# sourceMappingURL=server.js.map