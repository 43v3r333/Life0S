export interface CacheEntry {
  value: any;
  expiresAt: number | null;
}

class RedisCacheStore {
  private cache = new Map<string, CacheEntry>();

  public set(key: string, value: any, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
    console.log(`[REDIS CACHE] SET ${key} (TTL: ${ttlSeconds || "infinite"}s)`);
  }

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[REDIS CACHE] EXPIRED key: ${key}`);
      return null;
    }

    console.log(`[REDIS CACHE] GET HIT key: ${key}`);
    return entry.value;
  }

  public delete(key: string): boolean {
    console.log(`[REDIS CACHE] DEL key: ${key}`);
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    console.log("[REDIS CACHE] FLUSHALL executed");
  }

  public getKeys(): string[] {
    const activeKeys: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (!entry.expiresAt || Date.now() <= entry.expiresAt) {
        activeKeys.push(key);
      }
    }
    return activeKeys;
  }
}

export const cacheStore = new RedisCacheStore();
export default cacheStore;
