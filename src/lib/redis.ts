import { Redis } from '@upstash/redis';

// In-Memory Fallback Cache when Upstash keys are not present in .env
class MemoryRedisFallback {
  private store: Map<string, { value: any; expiresAt?: number }> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    try {
      return typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value;
    } catch {
      return entry.value as T;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<'OK'> {
    const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    this.store.set(key, { value: stringified, expiresAt });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: any): Promise<'OK'> {
    return this.set(key, value, { ex: seconds });
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const k of keys) {
      if (this.store.delete(k)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = Array.from(this.store.keys());
    if (pattern === '*' || !pattern) return allKeys;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return allKeys.filter((k) => regex.test(k));
  }
}

const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Export singleton Redis instance (Live Upstash in Prod, Memory Fallback otherwise)
export const redis: Redis | any = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : new MemoryRedisFallback();

export const isRedisRemote = isUpstashConfigured;