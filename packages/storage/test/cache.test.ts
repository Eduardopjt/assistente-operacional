import { describe, it, expect, beforeEach } from 'vitest';
import { QueryCache, generateCacheKey } from '../src/cache';

describe('QueryCache', () => {
  let cache: QueryCache;

  beforeEach(() => {
    cache = new QueryCache(10, 1); // 10 entries max, 1 minute TTL
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', { data: 'value1' });
      const result = cache.get<{ data: string }>('key1');
      expect(result).toEqual({ data: 'value1' });
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle different data types', () => {
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('object', { a: 1, b: 2 });
      cache.set('array', [1, 2, 3]);

      expect(cache.get<string>('string')).toBe('hello');
      expect(cache.get<number>('number')).toBe(42);
      expect(cache.get<{ a: number; b: number }>('object')).toEqual({ a: 1, b: 2 });
      expect(cache.get<number[]>('array')).toEqual([1, 2, 3]);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when maxSize is reached', () => {
      const smallCache = new QueryCache(3, 1); // Specific cache with maxSize=3
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      
      // Cache is full (3 items)
      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');

      // Adding 4th item should evict key1 (oldest)
      smallCache.set('key4', 'value4');
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should update access timestamp on get', () => {
      const smallCache = new QueryCache(3, 1); // Specific cache with maxSize=3
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Access key1 to make it most recent
      smallCache.get('key1');

      // Add key4, should evict key2 (now oldest)
      smallCache.set('key4', 'value4');
      expect(smallCache.get('key2')).toBeNull();
      expect(smallCache.get('key1')).toBe('value1');
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      const shortCache = new QueryCache(10, 0.01); // 0.01 min = 600ms
      shortCache.set('key1', 'value1');
      
      expect(shortCache.get('key1')).toBe('value1');
      
      await new Promise((resolve) => setTimeout(resolve, 700));
      
      expect(shortCache.get('key1')).toBeNull();
    });

    it('should not expire entries before TTL', async () => {
      const longCache = new QueryCache(10, 10); // 10 minutes
      longCache.set('key1', 'value1');
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(longCache.get('key1')).toBe('value1');
    });
  });

  describe('invalidate', () => {
    it('should invalidate exact key match', () => {
      cache.set('user:123', 'data');
      cache.invalidate('user:123');
      expect(cache.get('user:123')).toBeNull();
    });

    it('should invalidate keys matching pattern', () => {
      cache.set('user:123:posts', 'data1');
      cache.set('user:123:comments', 'data2');
      cache.set('user:456:posts', 'data3');

      cache.invalidate('user:123');

      expect(cache.get('user:123:posts')).toBeNull();
      expect(cache.get('user:123:comments')).toBeNull();
      expect(cache.get('user:456:posts')).toBe('data3');
    });

    it('should handle wildcards in patterns', () => {
      cache.set('project:1:tasks', 'data1');
      cache.set('project:2:tasks', 'data2');
      cache.set('user:1:projects', 'data3');

      cache.invalidate('project:*:tasks');

      expect(cache.get('project:1:tasks')).toBeNull();
      expect(cache.get('project:2:tasks')).toBeNull();
      expect(cache.get('user:1:projects')).toBe('data3');
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('stats', () => {
    it('should track hit rate', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.stats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });

    it('should track average hits per key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.get('key1'); // 1 hit
      cache.get('key1'); // 2 hits
      cache.get('key2'); // 1 hit

      const stats = cache.stats();
      expect(stats.avgHitsPerKey).toBe(1.5); // (2 + 1) / 2
    });

    it('should handle zero hits gracefully', () => {
      const stats = cache.stats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.avgHitsPerKey).toBe(0);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent keys', () => {
      const key1 = generateCacheKey('users', ['123', 'posts']);
      const key2 = generateCacheKey('users', ['123', 'posts']);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const key1 = generateCacheKey('users', ['123']);
      const key2 = generateCacheKey('users', ['456']);
      expect(key1).not.toBe(key2);
    });

    it('should handle various parameter types', () => {
      const key1 = generateCacheKey('query', [123, 'string', true]);
      expect(typeof key1).toBe('string');
      expect(key1.length).toBeGreaterThan(0);
    });
  });
});
