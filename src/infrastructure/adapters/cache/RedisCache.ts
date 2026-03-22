import { createClient, RedisClientType } from 'redis';

export class RedisCache {
  private client: RedisClientType<any, any>;

  constructor(url?: string) {
    const redisUrl = url || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    this.client = createClient({ url: redisUrl });
    // connect in background; callers should handle availability
    this.client.connect().catch((err) => {
      // don't throw during construction; log for visibility
      // eslint-disable-next-line no-console
      console.warn('Redis connect failed:', err?.message || err);
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const raw = JSON.stringify(value);
    if (typeof ttlSeconds === 'number') {
      await this.client.set(key, raw, { EX: ttlSeconds });
    } else {
      await this.client.set(key, raw);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (err) {
      // ignore
    }
  }
}
