import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

// Mock Redis
const mockRedis = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  ttl: jest.fn(),
  expire: jest.fn(),
  flushdb: jest.fn(),
  info: jest.fn(),
  smembers: jest.fn(),
  sadd: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue(undefined),
  hincrby: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                REDIS_PASSWORD: '',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);

    // Initialize service
    await service.onModuleInit();

    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('Module Lifecycle', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should connect to Redis on module init', async () => {
      const freshService = new CacheService(configService);
      await freshService.onModuleInit();
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should disconnect from Redis on module destroy', async () => {
      await service.onModuleDestroy();
      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return cached value when exists', async () => {
      const testData = { name: 'John', age: 30 };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));
      mockRedis.hincrby.mockResolvedValue(1);

      const result = await service.get('test-key');

      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });

    it('should use custom prefix when provided', async () => {
      mockRedis.get.mockResolvedValue('"test"');

      await service.get('key', { prefix: 'custom' });

      expect(mockRedis.get).toHaveBeenCalledWith('custom:key');
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid-json{');

      const result = await service.get('bad-json');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value with default TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('test-key', { data: 'test' });

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        300, // default TTL
        JSON.stringify({ data: 'test' }),
      );
    });

    it('should store value with custom TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('test-key', { data: 'test' }, { ttl: 600 });

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        600,
        JSON.stringify({ data: 'test' }),
      );
    });

    it('should use custom prefix when provided', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('key', 'value', { prefix: 'custom', ttl: 100 });

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'custom:key',
        100,
        JSON.stringify('value'),
      );
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw
      await expect(
        service.set('key', 'value'),
      ).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a single key', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.delete('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should use custom prefix when provided', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.delete('key', 'custom');

      expect(mockRedis.del).toHaveBeenCalledWith('custom:key');
    });

    it('should handle delete errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(service.delete('key')).resolves.not.toThrow();
    });
  });

  describe('invalidateByTags', () => {
    it('should delete all keys with specific tags', async () => {
      mockRedis.smembers = jest.fn()
        .mockResolvedValueOnce(['cache:users:list', 'cache:users:detail'])
        .mockResolvedValueOnce(['cache:users:profile']);
      mockRedis.del.mockResolvedValue(3);

      await service.invalidateByTags(['users', 'profiles']);

      expect(mockRedis.smembers).toHaveBeenCalledWith('tag:users');
      expect(mockRedis.smembers).toHaveBeenCalledWith('tag:profiles');
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should handle no matching keys', async () => {
      mockRedis.smembers = jest.fn().mockResolvedValue([]);
      mockRedis.del.mockResolvedValue(0);

      await service.invalidateByTags(['nonexistent']);

      expect(mockRedis.smembers).toHaveBeenCalled();
    });

    it('should handle multiple tags', async () => {
      mockRedis.smembers = jest.fn()
        .mockResolvedValueOnce(['key1'])
        .mockResolvedValueOnce(['key2'])
        .mockResolvedValueOnce(['key3']);
      mockRedis.del.mockResolvedValue(3);

      await service.invalidateByTags(['tag1', 'tag2', 'tag3']);

      expect(mockRedis.smembers).toHaveBeenCalledTimes(3);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedData = { name: 'Cached' };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const factory = jest.fn();
      const result = await service.getOrSet('key', factory);

      expect(result).toEqual(cachedData);
      expect(factory).not.toHaveBeenCalled();
      expect(mockRedis.get).toHaveBeenCalled();
    });

    it('should call factory and cache result if not exists', async () => {
      const factoryData = { name: 'Fresh' };
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK');

      const factory = jest.fn().mockResolvedValue(factoryData);
      const result = await service.getOrSet('key', factory, { ttl: 100 });

      expect(result).toEqual(factoryData);
      expect(factory).toHaveBeenCalled();

      // Wait for async cache to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'key',
        100,
        JSON.stringify(factoryData),
      );
    });

    it('should handle factory errors gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);
      const factory = jest.fn().mockRejectedValue(new Error('Factory failed'));

      await expect(
        service.getOrSet('key', factory),
      ).rejects.toThrow('Factory failed');

      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    it('should flush all cache keys', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      await service.flush();

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      mockRedis.info.mockResolvedValue(`
# Stats
total_connections_received:1000
total_commands_processed:5000
keyspace_hits:3500
keyspace_misses:1500
used_memory:2097152
used_memory_peak:3145728
connected_clients:5
      `);

      const stats = await service.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('status');
    });

    it('should handle info command errors', async () => {
      mockRedis.info.mockRejectedValue(new Error('Redis error'));

      const stats = await service.getStats();

      expect(stats.status).toBe('error');
    });
  });

  describe('TTL Management', () => {
    it('should get TTL of a key', async () => {
      mockRedis.ttl.mockResolvedValue(300);

      const ttl = await service['redis'].ttl('cache:test');

      expect(ttl).toBe(300);
    });

    it('should update TTL of a key', async () => {
      mockRedis.expire.mockResolvedValue(1);

      await service['redis'].expire('cache:test', 600);

      expect(mockRedis.expire).toHaveBeenCalledWith('cache:test', 600);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long keys correctly', async () => {
      const longKey = 'a'.repeat(300);
      mockRedis.setex.mockResolvedValue('OK');

      await service.set(longKey, 'value');

      // Long keys should be hashed
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('hash:'),
        expect.any(Number),
        expect.any(String),
      );
    });

    it('should handle null values correctly', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('null-key', null);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'null-key',
        expect.any(Number),
        'null',
      );
    });

    it('should handle undefined values correctly', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('undefined-key', undefined);

      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should handle circular reference objects', async () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      // Should handle gracefully (either throw or log error)
      await expect(
        service.set('circular', circular),
      ).resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle concurrent get operations', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));
      mockRedis.hincrby.mockResolvedValue(1);

      const promises = Array(100)
        .fill(null)
        .map((_, i) => service.get(`key-${i}`));

      await expect(Promise.all(promises)).resolves.toHaveLength(100);
    });

    it('should handle concurrent set operations', async () => {
      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.hincrby.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const promises = Array(100)
        .fill(null)
        .map((_, i) => service.set(`key-${i}`, { index: i }));

      await expect(Promise.all(promises)).resolves.toHaveLength(100);
    });
  });
});
