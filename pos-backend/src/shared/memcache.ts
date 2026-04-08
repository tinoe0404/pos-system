/**
 * Simple in-memory cache with TTL.
 * Used as a fast L1 cache in front of Redis (L2) to avoid
 * network round-trips to Upstash for hot data like products.
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemCache {
    private store = new Map<string, CacheEntry<any>>();

    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.data as T;
    }

    set<T>(key: string, data: T, ttlSeconds: number): void {
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    del(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}

export const memcache = new MemCache();
