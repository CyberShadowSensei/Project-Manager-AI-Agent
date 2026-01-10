type CacheEntry<T> = {
    data: T;
    expiry: number;
};

export class CacheService {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number;

    constructor(defaultTTLSeconds: number = 300) { // Default 5 minutes
        this.defaultTTL = defaultTTLSeconds * 1000;
    }

    set<T>(key: string, data: T, ttlSeconds?: number): void {
        const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    flush(): void {
        this.cache.clear();
    }
}

export const aiCache = new CacheService(600); // 10 minutes default for AI responses
