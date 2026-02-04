/**
 * Query Cache - In-memory LRU cache for frequently accessed queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessOrder: number; // For LRU: higher = more recent
  hits: number;
}

export class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds
  private accessCounter = 0; // Monotonic counter for access order

  constructor(maxSize: number = 100, ttlMinutes: number = 5) {
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  private hits = 0;
  private misses = 0;

  /**
   * Get cached value if exists and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Increment hits and update access order for LRU
    entry.hits++;
    entry.accessOrder = ++this.accessCounter;
    this.hits++;
    return entry.data as T;
  }

  /**
   * Set cache value
   */
  set<T>(key: string, data: T): void {
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessOrder: ++this.accessCounter,
      hits: 0,
    });
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string): void {
    // Convert wildcard pattern to regex
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}`);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; hits: number; misses: number; hitRate: number; avgHitsPerKey: number } {
    let totalHitsPerKey = 0;
    let entries = 0;

    for (const entry of this.cache.values()) {
      totalHitsPerKey += entry.hits;
      entries++;
    }

    const totalAccesses = this.hits + this.misses;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalAccesses > 0 ? this.hits / totalAccesses : 0,
      avgHitsPerKey: entries > 0 ? totalHitsPerKey / entries : 0,
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestOrder = this.accessCounter + 1; // Start higher than any possible value

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessOrder < oldestOrder) {
        oldestOrder = entry.accessOrder;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

/**
 * Generate cache key from query and params
 */
export function generateCacheKey(query: string, params: unknown[]): string {
  const paramsStr = JSON.stringify(params);
  return `${query}:${paramsStr}`;
}
