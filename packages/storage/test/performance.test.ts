import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor, withMonitoring } from '../src/performance';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('start and stop tracking', () => {
    it('should track query execution time', async () => {
      const end = monitor.start('test.query');

      await new Promise((resolve) => setTimeout(resolve, 50));

      end();

      const metric = monitor.getMetric('test.query');
      expect(metric).toBeDefined();
      expect(metric!.count).toBe(1);
      expect(metric!.totalTime).toBeGreaterThanOrEqual(50);
      expect(metric!.avgTime).toBeGreaterThanOrEqual(50);
    });

    it('should track multiple executions of same query', () => {
      for (let i = 0; i < 5; i++) {
        const end = monitor.start('test.query');
        end();
      }

      const metric = monitor.getMetric('test.query');
      expect(metric!.count).toBe(5);
    });

    it('should track different queries independently', () => {
      const end1 = monitor.start('query1');
      end1();

      const end2 = monitor.start('query2');
      end2();

      const metric1 = monitor.getMetric('query1');
      const metric2 = monitor.getMetric('query2');

      expect(metric1!.count).toBe(1);
      expect(metric2!.count).toBe(1);
    });
  });

  describe('metrics calculation', () => {
    it('should calculate average time correctly', () => {
      const times = [10, 20, 30, 40, 50];

      times.forEach((time) => {
        const end = monitor.start('test.query');
        // Simulate execution time
        const startTime = Date.now();
        while (Date.now() - startTime < time) {
          // Busy wait
        }
        end();
      });

      const metric = monitor.getMetric('test.query');
      expect(metric!.count).toBe(5);
      expect(metric!.avgTime).toBeGreaterThan(0);
      expect(metric!.avgTime).toBe(metric!.totalTime / metric!.count);
    });

    it('should track min and max times', async () => {
      const end1 = monitor.start('test.query');
      await new Promise((resolve) => setTimeout(resolve, 10));
      end1();

      const end2 = monitor.start('test.query');
      await new Promise((resolve) => setTimeout(resolve, 50));
      end2();

      const end3 = monitor.start('test.query');
      await new Promise((resolve) => setTimeout(resolve, 30));
      end3();

      const metric = monitor.getMetric('test.query');
      expect(metric!.minTime).toBeLessThanOrEqual(metric!.maxTime);
      expect(metric!.minTime).toBeGreaterThanOrEqual(10);
      expect(metric!.maxTime).toBeGreaterThanOrEqual(50);
    });

    it('should update lastExecuted timestamp', () => {
      const before = Date.now();

      const end = monitor.start('test.query');
      end();

      const after = Date.now();
      const metric = monitor.getMetric('test.query');

      expect(metric!.lastExecuted).toBeGreaterThanOrEqual(before);
      expect(metric!.lastExecuted).toBeLessThanOrEqual(after);
    });
  });

  describe('getSlowestQueries', () => {
    it('should return queries sorted by average time', async () => {
      // Query 1: ~10ms
      const end1 = monitor.start('fast');
      await new Promise((resolve) => setTimeout(resolve, 10));
      end1();

      // Query 2: ~50ms
      const end2 = monitor.start('slow');
      await new Promise((resolve) => setTimeout(resolve, 50));
      end2();

      // Query 3: ~30ms
      const end3 = monitor.start('medium');
      await new Promise((resolve) => setTimeout(resolve, 30));
      end3();

      const slowest = monitor.getSlowestQueries(3);

      expect(slowest).toHaveLength(3);
      expect(slowest[0].query).toBe('slow');
      expect(slowest[1].query).toBe('medium');
      expect(slowest[2].query).toBe('fast');
    });

    it('should limit results to specified count', async () => {
      const end1 = monitor.start('query1');
      await new Promise((resolve) => setTimeout(resolve, 10));
      end1();

      const end2 = monitor.start('query2');
      await new Promise((resolve) => setTimeout(resolve, 20));
      end2();

      const end3 = monitor.start('query3');
      await new Promise((resolve) => setTimeout(resolve, 30));
      end3();

      const slowest = monitor.getSlowestQueries(2);

      expect(slowest).toHaveLength(2);
    });
  });

  describe('getMostFrequentQueries', () => {
    it('should return queries sorted by execution count', () => {
      for (let i = 0; i < 5; i++) {
        const end = monitor.start('frequent');
        end();
      }

      for (let i = 0; i < 2; i++) {
        const end = monitor.start('rare');
        end();
      }

      for (let i = 0; i < 10; i++) {
        const end = monitor.start('very-frequent');
        end();
      }

      const frequent = monitor.getMostFrequentQueries(3);

      expect(frequent).toHaveLength(3);
      expect(frequent[0].query).toBe('very-frequent');
      expect(frequent[0].count).toBe(10);
      expect(frequent[1].query).toBe('frequent');
      expect(frequent[1].count).toBe(5);
      expect(frequent[2].query).toBe('rare');
      expect(frequent[2].count).toBe(2);
    });
  });

  describe('getSummary', () => {
    it('should return overview of all metrics', () => {
      const end1 = monitor.start('query1');
      end1();

      const end2 = monitor.start('query2');
      end2();

      const summary = monitor.getSummary();

      expect(summary.totalQueries).toBe(2);
      expect(summary.totalExecutions).toBe(2);
      expect(summary.totalTime).toBeGreaterThan(0);
      expect(summary.avgExecutionTime).toBeGreaterThan(0);
    });

    it('should handle empty metrics', () => {
      const summary = monitor.getSummary();

      expect(summary.totalQueries).toBe(0);
      expect(summary.totalExecutions).toBe(0);
      expect(summary.totalTime).toBe(0);
      expect(summary.avgExecutionTime).toBe(0);
    });
  });

  describe('logSlowQueries', () => {
    it('should detect slow queries above threshold', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Fast query (should not log)
      const end1 = monitor.start('fast');
      await new Promise((resolve) => setTimeout(resolve, 10));
      end1();

      // Slow query (should log)
      const end2 = monitor.start('slow');
      await new Promise((resolve) => setTimeout(resolve, 150));
      end2();

      monitor.logSlowQueries(100);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('slow');

      consoleSpy.mockRestore();
    });

    it('should use default threshold if not provided', async () => {
      const monitorWithDefaults = new PerformanceMonitor(true);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const end = monitorWithDefaults.start('slow-query');
      await new Promise((resolve) => setTimeout(resolve, 50));
      end();

      monitorWithDefaults.logSlowQueries(1); // 1ms threshold

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('disabled monitoring', () => {
    it('should not track when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);

      const end = disabledMonitor.start('query');
      end();

      const metric = disabledMonitor.getMetric('query');
      expect(metric).toBeNull();
    });
  });

  describe('withMonitoring wrapper', () => {
    it('should wrap function and track execution', async () => {
      const testFn = async (x: number) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return x * 2;
      };

      const wrapped = withMonitoring(monitor, 'test.function', testFn);

      const result = await wrapped(5);

      expect(result).toBe(10);

      const metric = monitor.getMetric('test.function');
      expect(metric).toBeDefined();
      expect(metric!.count).toBe(1);
      expect(metric!.totalTime).toBeGreaterThan(0);
    });

    it('should track multiple invocations', async () => {
      const testFn = (x: number) => x + 1;

      const wrapped = withMonitoring(monitor, 'test.function', testFn);

      wrapped(1);
      wrapped(2);
      wrapped(3);

      const metric = monitor.getMetric('test.function');
      expect(metric!.count).toBe(3);
    });

    it('should preserve function behavior on error', async () => {
      const testFn = () => {
        throw new Error('Test error');
      };

      const wrapped = withMonitoring(monitor, 'test.function', testFn);

      expect(() => wrapped()).toThrow('Test error');

      const metric = monitor.getMetric('test.function');
      expect(metric).toBeDefined();
      expect(metric!.count).toBe(1);
    });
  });
});
