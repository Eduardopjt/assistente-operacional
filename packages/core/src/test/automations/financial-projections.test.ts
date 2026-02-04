/**
 * Tests for Financial Projections
 */

import { describe, it, expect } from '@jest/globals';
import { projectFinances, getProjectionSummary } from '../../automations/financial-projections';
import { FinancialEntry } from '../../entities/financial-entry';

describe('projectFinances', () => {
  it('should project 30 days with stable income/expenses', () => {
    const today = new Date();
    const entries: FinancialEntry[] = [
      // 2 months of income (lookback = 60 days)
      {
        id: '1',
        user_id: 'user1',
        date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
        type: 'entrada',
        category: 'salario',
        value: 3000,
      },
      {
        id: '2',
        user_id: 'user1',
        date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
        type: 'entrada',
        category: 'salario',
        value: 3000,
      },
      // 60 days of expenses
      ...Array.from({ length: 60 }, (_, i) => ({
        id: `exp-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        type: 'saida' as const,
        category: 'alimentacao',
        value: 2000 / 30, // Daily: ~66.67
      })),
    ];

    const projection = projectFinances(5000, entries, 30, 60);

    // Historical data shows:
    // - 2 months = 6000 income, 4000 expenses
    // - Monthly avg: 3000 income, 2000 expenses
    // - Net monthly: +1000
    //
    // Projection for 30 days (1 month):
    // Current: 5000
    // Expected: 5000 + 3000 - 2000 = 6000
    expect(projection.scenarios.realistic.estimatedBalance).toBeCloseTo(6000, -1);
    expect(projection.scenarios.realistic.estimatedIncome).toBeCloseTo(3000, -1);
    expect(projection.scenarios.realistic.estimatedExpenses).toBeCloseTo(2000, -1);
  });

  it('should handle optimistic scenario', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 60 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: i % 30 === 0 ? ('entrada' as const) : ('saida' as const),
      category: i % 30 === 0 ? 'salario' : 'alimentacao',
      value: i % 30 === 0 ? 3000 : 50,
    }));

    const projection = projectFinances(10000, entries, 30, 60);

    // Optimistic should be >= realistic (or equal if no growth)
    expect(projection.scenarios.optimistic.estimatedBalance).toBeGreaterThanOrEqual(
      projection.scenarios.realistic.estimatedBalance
    );
  });

  it('should handle pessimistic scenario', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 60 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: i % 30 === 0 ? ('entrada' as const) : ('saida' as const),
      category: i % 30 === 0 ? 'salario' : 'alimentacao',
      value: i % 30 === 0 ? 3000 : 50,
    }));

    const projection = projectFinances(10000, entries, 30, 60);

    // Pessimistic should be <= realistic (or equal if no growth)
    expect(projection.scenarios.pessimistic.estimatedBalance).toBeLessThanOrEqual(
      projection.scenarios.realistic.estimatedBalance
    );
  });

  it('should generate warnings for negative balance', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: 'saida' as const,
      category: 'alimentacao',
      value: 200, // -6000/month
    }));

    const projection = projectFinances(1000, entries, 30, 30);

    expect(projection.scenarios.realistic.warnings.length).toBeGreaterThan(0);
    expect(projection.scenarios.realistic.warnings.some((w) => w.includes('Saldo negativo'))).toBe(
      true
    );
  });

  it('should adjust confidence based on data quantity', () => {
    const lowDataProjection = projectFinances(5000, [], 30, 30);
    expect(lowDataProjection.scenarios.realistic.confidence).toBeLessThan(0.5);

    const today = new Date();
    const richData: FinancialEntry[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: i % 2 === 0 ? ('entrada' as const) : ('saida' as const),
      category: 'test',
      value: 100,
    }));

    const highDataProjection = projectFinances(5000, richData, 30, 90);
    expect(highDataProjection.scenarios.realistic.confidence).toBeGreaterThan(0.7);
  });
});

describe('getProjectionSummary', () => {
  it('should provide quick overview for 30/60/90 days', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 60 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: i % 30 === 0 ? ('entrada' as const) : ('saida' as const),
      category: 'test',
      value: i % 30 === 0 ? 5000 : 50,
    }));

    const summary = getProjectionSummary(10000, entries);

    expect(summary.days30).toBeDefined();
    expect(summary.days60).toBeDefined();
    expect(summary.days90).toBeDefined();
    expect(summary.recommendation).toBeTruthy();
  });

  it('should recommend urgent action for negative projection', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: 'saida' as const,
      category: 'test',
      value: 500, // -15000/month
    }));

    const summary = getProjectionSummary(1000, entries);

    expect(summary.recommendation).toContain('🔴');
  });

  it('should recommend investing for excellent projections', () => {
    const today = new Date();
    const entries: FinancialEntry[] = Array.from({ length: 60 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      type: 'entrada' as const,
      category: 'salario',
      value: 500, // +15000/month
    }));

    const summary = getProjectionSummary(10000, entries);

    expect(summary.recommendation).toContain('🟢');
    expect(summary.recommendation.toLowerCase()).toContain('invest');
  });
});
