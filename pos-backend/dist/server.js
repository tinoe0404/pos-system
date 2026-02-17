"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const client_1 = require("@prisma/client");
const redis_1 = __importDefault(require("./shared/redis"));
const queue_1 = require("./shared/queue");
const prisma = new client_1.PrismaClient();
async function start() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');
        // Test Redis connection
        await redis_1.default.ping();
        const app = await (0, app_1.buildApp)();
        const port = parseInt(process.env.PORT || '4000', 10);
        const host = process.env.HOST || '0.0.0.0';
        await app.listen({ port, host });
        console.log(`🚀 Server running at http://${host}:${port}`);
        console.log('🔄 Sales worker is processing jobs in the background');
    }
    catch (err) {
        console.error('❌ Server startup error:', err);
        process.exit(1);
    }
}
// Graceful shutdown
async function shutdown() {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        // Close worker
        await queue_1.salesWorker.close();
        console.log('✅ Worker closed');
        // Close database
        await prisma.$disconnect();
        console.log('✅ Database disconnected');
        // Close Redis
        await redis_1.default.quit();
        console.log('✅ Redis disconnected');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
start();
