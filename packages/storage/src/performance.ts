/**
 * Performance Monitor - Track query performance and bottlenecks
 */

export interface QueryMetric {
  query: string;
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  lastExecuted: number;
}

export class PerformanceMonitor {
  private metrics = new Map<string, QueryMetric>();
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * Start timing a query
   */
  start(query: string): () => void {
    if (!this.enabled) return () => {};

    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(query, duration);
    };
  }

  /**
   * Record query metric
   */
  private recordMetric(query: string, duration: number): void {
    const existing = this.metrics.get(query);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.lastExecuted = Date.now();
    } else {
      this.metrics.set(query, {
        query,
        count: 1,
        totalTime: duration,
        avgTime: duration,
        minTime: duration,
        maxTime: duration,
        lastExecuted: Date.now(),
      });
    }
  }

  /**
   * Get metrics for a specific query
   */
  getMetric(query: string): QueryMetric | null {
    return this.metrics.get(query) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): QueryMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit: number = 10): QueryMetric[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  /**
   * Get most frequent queries
   */
  getMostFrequentQueries(limit: number = 10): QueryMetric[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get summary statistics
   */
  /**
   * Get summary statistics
   */
  getSummary(): {
    totalQueries: number;
    totalExecutions: number;
    totalTime: number;
    avgExecutionTime: number;
  } {
    const metrics = Array.from(this.metrics.values());
    const totalExecutions = metrics.reduce((sum, m) => sum + m.count, 0);
    const totalTime = metrics.reduce((sum, m) => sum + m.totalTime, 0);

    return {
      totalQueries: this.metrics.size,
      totalExecutions,
      totalTime,
      avgExecutionTime: totalExecutions > 0 ? totalTime / totalExecutions : 0,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if query is slow (above threshold)
   */
  isSlow(query: string, thresholdMs: number = 100): boolean {
    const metric = this.metrics.get(query);
    return metric ? metric.avgTime > thresholdMs : false;
  }

  /**
   * Log slow queries to console
   */
  logSlowQueries(thresholdMs: number = 100): void {
    const slow = Array.from(this.metrics.values()).filter(
      (m) => m.avgTime > thresholdMs
    );

    if (slow.length === 0) {
      console.log('✅ No slow queries detected');
      return;
    }

    console.warn(`⚠️ ${slow.length} slow queries detected (>${thresholdMs}ms):`);
    slow
      .sort((a, b) => b.avgTime - a.avgTime)
      .forEach((m) => {
        console.warn(
          `  ${m.avgTime.toFixed(2)}ms avg (${m.count}x): ${m.query.substring(0, 60)}...`
        );
      });
  }
}

/**
 * Wrap a function with performance monitoring
 */
export function withMonitoring<T extends (...args: any[]) => any>(
  monitor: PerformanceMonitor,
  label: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const end = monitor.start(label);
    try {
      const result = fn(...args);
      end();
      return result;
    } catch (err) {
      end();
      throw err;
    }
  }) as T;
}
