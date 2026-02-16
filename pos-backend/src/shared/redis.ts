import Redis, { RedisOptions } from 'ioredis';

// Build Redis connection options
// Supports REDIS_URL (Upstash / cloud) or individual host/port (local dev)
function getRedisOptions(): RedisOptions {
  const baseOptions: RedisOptions = {
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  };

  if (process.env.REDIS_URL) {
    return {
      ...baseOptions,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    };
  }

  return {
    ...baseOptions,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, getRedisOptions())
  : new Redis(getRedisOptions());

redis.on('connect', () => {
  console.log('✅ Redis Connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

// Export connection config for reuse by BullMQ
export function getRedisConnectionConfig() {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

export default redis;