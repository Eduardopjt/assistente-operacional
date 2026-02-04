/**
 * Tests for Anomaly Detection
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateCategoryStats,
  detectSpendingAnomalies,
  calculateBurnRate,
  predictRunway,
} from '../../automations/anomaly-detection';
import { FinancialEntry } from '../../entities/financial-entry';

describe('calculateCategoryStats', () => {
  it('should calculate statistics per category', () => {
    const entries: FinancialEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: new Date('2024-01-15'),
        type: 'saida',
        category: 'alimentacao',
        value: 100,
      },
      {
        id: '2',
        user_id: 'user1',
        date: new Date('2024-01-14'),
        type: 'saida',
        category: 'alimentacao',
        value: 120,
      },
      {
        id: '3',
        user_id: 'user1',
        date: new Date('2024-01-13'),
        type: 'saida',
        category: 'alimentacao',
        value: 80,
      },
    ];

    const stats = calculateCategoryStats(entries);
    const foodStats = stats.get('alimentacao')!;

    expect(foodStats.average).toBe(100);
    expect(foodStats.count).toBe(3);
    expect(foodStats.min).toBe(80);
    expect(foodStats.max).toBe(120);
  });

  it('should handle multiple categories', () => {
    const entries: FinancialEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: new Date(),
        type: 'saida',
        category: 'alimentacao',
        value: 100,
      },
      {
        id: '2',
        user_id: 'user1',
        date: new Date(),
        type: 'saida',
        category: 'transporte',
        value: 50,
      },
    ];

    const stats = calculateCategoryStats(entries);

    expect(stats.size).toBe(2);
    expect(stats.get('alimentacao')?.average).toBe(100);
    expect(stats.get('transporte')?.average).toBe(50);
  });
});

describe('detectSpendingAnomalies', () => {
  it('should detect unusual amounts using Z-scores', () => {
    const today = new Date();
    const entries: FinancialEntry[] = [
      // Normal spending: 100
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        type: 'saida' as const,
        category: 'alimentacao',
        value: 100,
      })),
      // Anomaly: 500 (5x normal)
      {
        id: 'anomaly',
        user_id: 'user1',
        date: today,
        type: 'saida' as const,
        category: 'alimentacao',
        value: 500,
        notes: 'Festa',
      },
    ];

    const anomalies = detectSpendingAnomalies(entries, 30);

    expect(anomalies.length).toBeGreaterThan(0);
    const anomaly = anomalies.find((a) => a.type === 'unusual_amount');
    expect(anomaly).toBeDefined();
    expect(anomaly?.severity).toBe('high');
  });

  it('should detect unusual frequency', () => {
    const today = new Date();
    const entries: FinancialEntry[] = [
      // Normal: 1 transaction per week (last 30 days = ~4 transactions)
      {
        id: '1',
        user_id: 'user1',
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        type: 'saida' as const,
        category: 'lazer',
        value: 100,
      },
      {
        id: '2',
        user_id: 'user1',
        date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        type: 'saida' as const,
        category: 'lazer',
        value: 100,
      },
      // Spike: 10 transactions this week
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `spike-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        type: 'saida' as const,
        category: 'lazer',
        value: 50,
      })),
    ];

    const anomalies = detectSpendingAnomalies(entries, 30);

    const frequencyAnomaly = anomalies.find((a) => a.type === 'unusual_frequency');
    expect(frequencyAnomaly).toBeDefined();
  });

  it('should not flag normal spending', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: 'saida' as const,
      category: 'alimentacao',
      value: 100 + Math.random() * 20, // Small variation
    }));

    const anomalies = detectSpendingAnomalies(entries, 30);

    expect(anomalies.length).toBe(0);
  });
});

describe('calculateBurnRate', () => {
  it('should calculate average daily spending', () => {
    const today = new Date();
    const entries: FinancialEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        type: 'entrada',
        category: 'salario',
        value: 3000,
      },
      {
        id: '2',
        user_id: 'user1',
        date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        type: 'saida',
        category: 'alimentacao',
        value: 100,
      },
      {
        id: '3',
        user_id: 'user1',
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        type: 'saida',
        category: 'transporte',
        value: 50,
      },
    ];

    const burnRate = calculateBurnRate(entries, 7);

    // Net: +3000 -100 -50 = +2850 over 7 days
    expect(burnRate).toBeCloseTo(2850 / 7, 2);
  });

  it('should handle negative burn rate (spending more than earning)', () => {
    const today = new Date();
    const entries: FinancialEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: today,
        type: 'saida',
        category: 'alimentacao',
        value: 1000,
      },
    ];

    const burnRate = calculateBurnRate(entries, 7);

    expect(burnRate).toBeLessThan(0);
  });
});

describe('predictRunway', () => {
  it('should calculate days until balance reaches zero', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: 'saida' as const,
      category: 'alimentacao',
      value: 100, // -100/day
    }));

    const runway = predictRunway(10000, entries, 30);

    // 10000 / 100 = 100 days
    expect(runway).toBe(100);
  });

  it('should return Infinity for positive burn rate', () => {
    const today = new Date();
    const entries: FinancialEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: today,
        type: 'entrada',
        category: 'salario',
        value: 5000,
      },
    ];

    const runway = predictRunway(10000, entries, 30);

    expect(runway).toBe(Infinity);
  });

  it('should return 0 for already negative balance', () => {
    const runway = predictRunway(-1000, [], 30);

    expect(runway).toBe(0);
  });
});
