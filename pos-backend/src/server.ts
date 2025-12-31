import 'dotenv/config';
import { buildApp } from './app';
import { PrismaClient } from '@prisma/client';
import redis from './shared/redis';

const prisma = new PrismaClient();

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test Redis connection (already auto-connected, just verify)
    await redis.ping();

    const app = await buildApp();
    
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    
    console.log(`🚀 Server running at http://${host}:${port}`);
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

start();