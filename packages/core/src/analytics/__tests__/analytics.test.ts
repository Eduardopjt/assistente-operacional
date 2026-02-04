import { describe, it, expect } from '@jest/globals';
import {
  FinanceAnalytics,
  ProjectAnalytics,
  PatternDetector,
} from '../index';
import { DailyCheckin, Project } from '../../entities';

describe('FinanceAnalytics', () => {
  describe('calculateEMA', () => {
    it('should return 0 for empty array', () => {
      expect(FinanceAnalytics.calculateEMA([])).toBe(0);
    });

    it('should return single value for single-element array', () => {
      expect(FinanceAnalytics.calculateEMA([100])).toBe(100);
    });

    it('should calculate EMA correctly for sequence', () => {
      const values = [100, 110, 105, 120, 115];
      const ema = FinanceAnalytics.calculateEMA(values, 3);
      expect(ema).toBeGreaterThan(100);
      expect(ema).toBeLessThan(120);
    });

    it('should weight recent values more heavily', () => {
      const increasing = [100, 110, 120, 130, 140];
      const ema = FinanceAnalytics.calculateEMA(increasing, 3);
      expect(ema).toBeGreaterThan(120); // Should be closer to recent values
    });
  });

  describe('detectAnomalies', () => {
    it('should return all false for short arrays', () => {
      const result = FinanceAnalytics.detectAnomalies([100, 110]);
      expect(result).toEqual([false, false]);
    });

    it('should detect outliers in spending', () => {
      const values = [100, 105, 102, 500, 103]; // 500 is anomaly
      const anomalies = FinanceAnalytics.detectAnomalies(values, 1.5); // Lower threshold
      expect(anomalies[3]).toBe(true); // Index 3 should be flagged
    });

    it('should not flag normal variations', () => {
      const values = [100, 110, 95, 105, 98, 103];
      const anomalies = FinanceAnalytics.detectAnomalies(values, 2);
      const hasAnomaly = anomalies.some((a) => a);
      expect(hasAnomaly).toBe(false);
    });
  });

  describe('calculateHealthScore', () => {
    it('should return 100 for perfect finances', () => {
      const summary = {
        total_entradas: 100000,
        total_saidas: 50000,
        balance: 100000,
        avg_daily_spending: 1000,
        forecast_days: 60,
      };
      const score = FinanceAnalytics.calculateHealthScore(summary);
      expect(score).toBe(100);
    });

    it('should penalize negative balance heavily', () => {
      const summary = {
        total_entradas: 10000,
        total_saidas: 50000,
        balance: -40000,
        avg_daily_spending: 2000,
        forecast_days: 0,
      };
      const score = FinanceAnalytics.calculateHealthScore(summary);
      expect(score).toBeLessThan(50);
    });

    it('should penalize high spending ratio', () => {
      const summary = {
        total_entradas: 50000,
        total_saidas: 90000,
        balance: 10000,
        avg_daily_spending: 3000,
        forecast_days: 3,
      };
      const score = FinanceAnalytics.calculateHealthScore(summary);
      expect(score).toBeLessThan(50);
    });

    it('should penalize low forecast days', () => {
      const summary = {
        total_entradas: 30000,
        total_saidas: 25000,
        balance: 5000,
        avg_daily_spending: 1000,
        forecast_days: 5,
      };
      const score = FinanceAnalytics.calculateHealthScore(summary);
      expect(score).toBeLessThan(80);
    });

    it('should return score between 0 and 100', () => {
      const summary = {
        total_entradas: 0,
        total_saidas: 100000,
        balance: -100000,
        avg_daily_spending: 5000,
        forecast_days: 0,
      };
      const score = FinanceAnalytics.calculateHealthScore(summary);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('forecastSpending', () => {
    it('should generate forecast for specified days', () => {
      const dailySpending = [1000, 1100, 1050, 1200, 1150];
      const forecast = FinanceAnalytics.forecastSpending(dailySpending, 7);
      expect(forecast).toHaveLength(7);
    });

    it('should include min, avg, max for each day', () => {
      const dailySpending = [1000, 1100, 1050];
      const forecast = FinanceAnalytics.forecastSpending(dailySpending, 3);
      forecast.forEach((f) => {
        expect(f).toHaveProperty('min');
        expect(f).toHaveProperty('avg');
        expect(f).toHaveProperty('max');
        expect(f.min).toBeLessThanOrEqual(f.avg);
        expect(f.avg).toBeLessThanOrEqual(f.max);
      });
    });

    it('should have consistent avg across forecast', () => {
      const dailySpending = [1000, 1000, 1000];
      const forecast = FinanceAnalytics.forecastSpending(dailySpending, 5);
      const avgValues = forecast.map((f) => f.avg);
      const allSame = avgValues.every((v) => Math.abs(v - avgValues[0]) < 1);
      expect(allSame).toBe(true);
    });
  });
});

describe('ProjectAnalytics', () => {
  const createProject = (name: string, status: Project['status'], daysAgo: number = 0): Project => ({
    id: crypto.randomUUID(),
    user_id: 'test-user',
    name,
    objective: '',
    status,
    created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  });

  describe('findStalledProjects', () => {
    it('should return empty for no projects', () => {
      const stalled = ProjectAnalytics.findStalledProjects([]);
      expect(stalled).toEqual([]);
    });

    it('should detect projects stalled for 7+ days', () => {
      const projects = [
        createProject('Active Recent', 'active', 1),
        createProject('Active Stalled', 'active', 10),
        createProject('Paused', 'paused', 20),
      ];
      const stalled = ProjectAnalytics.findStalledProjects(projects);
      expect(stalled).toHaveLength(1);
      expect(stalled[0].name).toBe('Active Stalled');
    });

    it('should not flag recently updated projects', () => {
      const projects = [
        createProject('Project 1', 'active', 0),
        createProject('Project 2', 'active', 3),
        createProject('Project 3', 'active', 6),
      ];
      const stalled = ProjectAnalytics.findStalledProjects(projects);
      expect(stalled).toHaveLength(0);
    });

    it('should ignore non-active projects', () => {
      const projects = [
        createProject('Done Old', 'done', 30),
        createProject('Paused Old', 'paused', 30),
      ];
      const stalled = ProjectAnalytics.findStalledProjects(projects);
      expect(stalled).toHaveLength(0);
    });
  });

  describe('calculateVelocity', () => {
    it('should return 0 for zero weeks', () => {
      expect(ProjectAnalytics.calculateVelocity(10, 0)).toBe(0);
    });

    it('should calculate tasks per week correctly', () => {
      expect(ProjectAnalytics.calculateVelocity(20, 4)).toBe(5);
    });

    it('should handle decimal results', () => {
      const velocity = ProjectAnalytics.calculateVelocity(10, 3);
      expect(velocity).toBeCloseTo(3.33, 2);
    });
  });

  describe('estimateCompletion', () => {
    it('should return infinity for zero velocity', () => {
      const estimate = ProjectAnalytics.estimateCompletion(10, 0);
      expect(estimate.weeks).toBe(Infinity);
      expect(estimate.confidence).toBe('low');
    });

    it('should estimate weeks correctly', () => {
      const estimate = ProjectAnalytics.estimateCompletion(15, 5);
      expect(estimate.weeks).toBe(3);
    });

    it('should rate high velocity as high confidence', () => {
      const estimate = ProjectAnalytics.estimateCompletion(10, 5);
      expect(estimate.confidence).toBe('high');
    });

    it('should rate medium velocity as medium confidence', () => {
      const estimate = ProjectAnalytics.estimateCompletion(10, 2);
      expect(estimate.confidence).toBe('medium');
    });

    it('should rate low velocity as low confidence', () => {
      const estimate = ProjectAnalytics.estimateCompletion(10, 0.5);
      expect(estimate.confidence).toBe('low');
    });
  });

  describe('calculatePriorityScore', () => {
    const project = createProject('Test', 'active');

    it('should score high financial impact highly', () => {
      const score = ProjectAnalytics.calculatePriorityScore(project, {
        financialImpact: 10,
        energyRequired: 5,
      });
      expect(score).toBeGreaterThan(40);
    });

    it('should score urgent deadlines highly', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const score = ProjectAnalytics.calculatePriorityScore(project, {
        financialImpact: 5,
        energyRequired: 5,
        deadline: tomorrow,
      });
      expect(score).toBeGreaterThan(50);
    });

    it('should prefer low energy requirements', () => {
      const lowEnergy = ProjectAnalytics.calculatePriorityScore(project, {
        financialImpact: 5,
        energyRequired: 2,
      });
      const highEnergy = ProjectAnalytics.calculatePriorityScore(project, {
        financialImpact: 5,
        energyRequired: 8,
      });
      expect(lowEnergy).toBeGreaterThan(highEnergy);
    });

    it('should cap score at 100', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const score = ProjectAnalytics.calculatePriorityScore(project, {
        financialImpact: 10,
        energyRequired: 1,
        deadline: tomorrow,
      });
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

describe('PatternDetector', () => {
  const createCheckin = (daysAgo: number, energia: DailyCheckin['energia']): DailyCheckin => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
      id: crypto.randomUUID(),
      user_id: 'test-user',
      date: date,
      caixa_status: 'tranquilo',
      energia,
      pressao: 'normal',
      estado_calculado: 'CAUTION',
    };
  };

  describe('analyzeWeeklyPatterns', () => {
    it('should handle empty checkins', () => {
      const patterns = PatternDetector.analyzeWeeklyPatterns([]);
      expect(patterns.bestDay).toBe('Unknown');
      expect(patterns.worstDay).toBe('Unknown');
    });

    it('should identify best and worst days', () => {
      const checkins = [
        createCheckin(0, 'alta'), // Today
        createCheckin(1, 'baixa'),
        createCheckin(2, 'media'),
        createCheckin(7, 'alta'), // Same weekday as today
        createCheckin(8, 'baixa'), // Same weekday as yesterday
      ];
      const patterns = PatternDetector.analyzeWeeklyPatterns(checkins);
      expect(patterns.bestDay).toBeDefined();
      expect(patterns.worstDay).toBeDefined();
      expect(patterns.bestDay).not.toBe(patterns.worstDay);
    });

    it('should calculate average energy by day', () => {
      const checkins = [createCheckin(0, 'alta'), createCheckin(7, 'media')];
      const patterns = PatternDetector.analyzeWeeklyPatterns(checkins);
      expect(patterns.avgEnergyByDay).toBeDefined();
      expect(Object.keys(patterns.avgEnergyByDay).length).toBeGreaterThan(0);
    });

    it('should average energia values correctly', () => {
      const today = new Date().getDay();
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      const checkins = [
        createCheckin(0, 'alta'), // 3
        createCheckin(7, 'baixa'), // 1
        // Average should be 2.0 for this day
      ];

      const patterns = PatternDetector.analyzeWeeklyPatterns(checkins);
      const todayName = dayNames[today];
      expect(patterns.avgEnergyByDay[todayName]).toBe(2.0);
    });
  });

  describe('correlateMoodAndProductivity', () => {
    it('should return 0 for insufficient data', () => {
      const correlation = PatternDetector.correlateMoodAndProductivity([], {});
      expect(correlation).toBe(0);
    });

    it('should detect positive correlation', () => {
      const checkins = [
        createCheckin(0, 'alta'),
        createCheckin(1, 'alta'),
        createCheckin(2, 'media'),
        createCheckin(3, 'baixa'),
      ];

      const tasks: Record<string, number> = {
        [new Date(Date.now()).toISOString().split('T')[0]]: 10,
        [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 9,
        [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 5,
        [new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 2,
      };

      const correlation = PatternDetector.correlateMoodAndProductivity(checkins, tasks);
      expect(correlation).toBeGreaterThan(0.5); // Strong positive correlation
    });

    it('should detect no correlation', () => {
      const checkins = [
        createCheckin(0, 'alta'),
        createCheckin(1, 'baixa'),
        createCheckin(2, 'alta'),
        createCheckin(3, 'baixa'),
      ];

      const tasks: Record<string, number> = {
        [new Date(Date.now()).toISOString().split('T')[0]]: 5,
        [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 5,
        [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 5,
        [new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 5,
      };

      const correlation = PatternDetector.correlateMoodAndProductivity(checkins, tasks);
      expect(Math.abs(correlation)).toBeLessThan(0.3);
    });

    it('should return value between -1 and 1', () => {
      const checkins = [createCheckin(0, 'alta'), createCheckin(1, 'baixa')];
      const tasks: Record<string, number> = {
        [new Date().toISOString().split('T')[0]]: 10,
        [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 1,
      };

      const correlation = PatternDetector.correlateMoodAndProductivity(checkins, tasks);
      expect(correlation).toBeGreaterThanOrEqual(-1);
      expect(correlation).toBeLessThanOrEqual(1);
    });
  });
});
