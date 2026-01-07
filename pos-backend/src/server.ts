import 'dotenv/config';
import { buildApp } from './app';
import { PrismaClient } from '@prisma/client';
import redis from './shared/redis';
import { salesWorker } from './shared/queue';

const prisma = new PrismaClient();

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test Redis connection
    await redis.ping();

    const app = await buildApp();

    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`🚀 Server running at http://${host}:${port}`);
    console.log('🔄 Sales worker is processing jobs in the background');
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');

  try {
    // Close worker
    await salesWorker.close();
    console.log('✅ Worker closed');

    // Close database
    await prisma.$disconnect();
    console.log('✅ Database disconnected');

    // Close Redis
    await redis.quit();
    console.log('✅ Redis disconnected');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();