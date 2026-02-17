require('dotenv').config();
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error('❌ REDIS_URL not set in .env');
    process.exit(1);
}

const redis = new Redis(redisUrl, {
    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
});

async function main() {
    try {
        console.log('🗑️  Clearing Upstash Redis (all_products key)...');
        const result = await redis.del('all_products');
        console.log(`✅ Deleted ${result} key(s)`);

        // Also flushall if needed
        console.log('🗑️  Flushing entire Redis...');
        await redis.flushall();
        console.log('✅ Redis flushed successfully');

        await redis.quit();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
