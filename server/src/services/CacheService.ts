import NodeCache from 'node-cache';

class CacheService {
    private cache: NodeCache;

    constructor() {
        // TTL: 60 seconds (Updates take max 1 min to reflect, improves reads significantly)
        this.cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set(key: string, value: any, ttl?: number): boolean {
        return this.cache.set(key, value, ttl || 60);
    }

    del(key: string): number {
        return this.cache.del(key);
    }

    flush(): void {
        this.cache.flushAll();
    }
}

export const cacheService = new CacheService();
