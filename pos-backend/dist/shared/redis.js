"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisConnectionConfig = getRedisConnectionConfig;
const ioredis_1 = __importDefault(require("ioredis"));
// Build Redis connection options
// Supports REDIS_URL (Upstash / cloud) or individual host/port (local dev)
function getRedisOptions() {
    const baseOptions = {
        retryStrategy: (times) => {
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
    ? new ioredis_1.default(process.env.REDIS_URL, getRedisOptions())
    : new ioredis_1.default(getRedisOptions());
redis.on('connect', () => {
    console.log('✅ Redis Connected');
});
redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});
// Export connection config for reuse by BullMQ
function getRedisConnectionConfig() {
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
exports.default = redis;
