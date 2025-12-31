const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

async function clearRedis() {
  try {
    console.log('🗑️  Clearing Redis...');
    await redis.flushall();
    console.log('✅ Redis cleared successfully');
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing Redis:', error);
    process.exit(1);
  }
}

clearRedis();