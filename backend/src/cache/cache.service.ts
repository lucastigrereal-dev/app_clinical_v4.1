// backend/src/cache/cache.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
  compress?: boolean; // Compress large values
  tags?: string[]; // Cache tags for invalidation
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly MAX_KEY_LENGTH = 250;
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.configService.get('REDIS_PORT', '6379'), 10),
        password: this.configService.get('REDIS_PASSWORD'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.redis.on('connect', () => {
        this.logger.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.error('❌ Redis connection error:', error.message);
      });

      this.redis.on('reconnecting', () => {
        this.logger.warn('🔄 Redis reconnecting...');
      });

      await this.redis.ping();
      this.logger.log('🎯 Cache Service initialized with Redis');
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      // Create a mock Redis client for development
      this.logger.warn('⚠️ Running in NO-CACHE mode');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const value = await this.redis.get(fullKey);

      if (!value) {
        await this.recordCacheMetric('miss', key);
        return null;
      }

      // Record cache hit
      await this.recordCacheMetric('hit', key);

      return this.deserialize<T>(value, options?.compress);
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.redis) return;

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const ttl = options?.ttl || this.DEFAULT_TTL;
      const serialized = await this.serialize(value, options?.compress);

      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }

      // Add to tags if provided
      if (options?.tags) {
        await this.addToTags(fullKey, options.tags);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, prefix?: string): Promise<void> {
    if (!this.redis) return;

    try {
      const fullKey = this.buildKey(key, prefix);
      await this.redis.del(fullKey);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache delete by pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    if (!this.redis) return;

    try {
      const keys = new Set<string>();

      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const taggedKeys = await this.redis.smembers(tagKey);
        taggedKeys.forEach(key => keys.add(key));
        await this.redis.del(tagKey);
      }

      if (keys.size > 0) {
        await this.redis.del(...Array.from(keys));
      }
    } catch (error) {
      this.logger.error(`Cache invalidate by tags error:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const fullKey = this.buildKey(key, prefix);
      const exists = await this.redis.exists(fullKey);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Get fresh value
    const value = await factory();

    // Store in cache (async, don't wait)
    this.set(key, value, options).catch(err =>
      this.logger.error('Failed to cache value:', err)
    );

    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, increment: number = 1): Promise<number> {
    if (!this.redis) return 0;

    try {
      const fullKey = this.buildKey(key, 'counter');
      return await this.redis.incrby(fullKey, increment);
    } catch (error) {
      this.logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, decrement: number = 1): Promise<number> {
    if (!this.redis) return 0;

    try {
      const fullKey = this.buildKey(key, 'counter');
      return await this.redis.decrby(fullKey, decrement);
    } catch (error) {
      this.logger.error(`Cache decrement error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get TTL for key
   */
  async getTTL(key: string, prefix?: string): Promise<number> {
    if (!this.redis) return -1;

    try {
      const fullKey = this.buildKey(key, prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Set TTL for existing key
   */
  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.redis.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.flushdb();
      this.logger.warn('🗑️ Cache flushed!');
    } catch (error) {
      this.logger.error('Cache flush error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.redis) {
      return {
        status: 'disconnected',
        message: 'Redis not connected'
      };
    }

    try {
      const info = await this.redis.info('stats');
      const memory = await this.redis.info('memory');
      const stats = this.parseRedisInfo(info);
      const memoryStats = this.parseRedisInfo(memory);

      const hits = parseInt(stats.keyspace_hits || '0');
      const misses = parseInt(stats.keyspace_misses || '0');
      const total = hits + misses;

      return {
        status: 'connected',
        hits,
        misses,
        total,
        hitRate: total > 0 ? parseFloat(((hits / total) * 100).toFixed(2)) : 0,
        evictedKeys: parseInt(stats.evicted_keys || '0'),
        expiredKeys: parseInt(stats.expired_keys || '0'),
        connectedClients: parseInt(stats.connected_clients || '0'),
        usedMemory: memoryStats.used_memory_human,
        peakMemory: memoryStats.used_memory_peak_human,
        fragmentationRatio: parseFloat(memoryStats.mem_fragmentation_ratio || '0'),
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Build cache key
   */
  private buildKey(key: string, prefix?: string): string {
    const fullKey = prefix ? `${prefix}:${key}` : key;

    // Hash long keys
    if (fullKey.length > this.MAX_KEY_LENGTH) {
      const hash = createHash('sha256').update(fullKey).digest('hex');
      return prefix ? `${prefix}:hash:${hash}` : `hash:${hash}`;
    }

    return fullKey;
  }

  /**
   * Serialize value
   */
  private async serialize<T>(value: T, compress?: boolean): Promise<string> {
    const json = JSON.stringify(value);

    if (compress && json.length > 1024) {
      // Future: implement compression here (e.g., using zlib)
      return json;
    }

    return json;
  }

  /**
   * Deserialize value
   */
  private deserialize<T>(value: string, compressed?: boolean): T {
    if (compressed) {
      // Future: implement decompression here
      return JSON.parse(value);
    }

    return JSON.parse(value);
  }

  /**
   * Add key to tags
   */
  private async addToTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      await this.redis.sadd(tagKey, key);
      await this.redis.expire(tagKey, 86400); // Expire tag sets after 24 hours
    }
  }

  /**
   * Record cache metrics
   */
  private async recordCacheMetric(type: 'hit' | 'miss', key: string): Promise<void> {
    try {
      const metricKey = `metrics:cache:${type}`;
      await this.redis.hincrby(metricKey, 'total', 1);

      // Record by hour
      const hour = new Date().toISOString().slice(0, 13);
      await this.redis.hincrby(metricKey, hour, 1);

      // Expire old hourly metrics
      await this.redis.expire(metricKey, 86400); // Keep for 24 hours
    } catch (error) {
      // Don't log to avoid spam
    }
  }

  /**
   * Parse Redis INFO output
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const lines = info.split('\r\n');
    const stats: Record<string, string> = {};

    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      }
    });

    return stats;
  }
}
