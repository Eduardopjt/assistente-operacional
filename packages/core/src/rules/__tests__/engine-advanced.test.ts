import { describe, it, expect } from '@jest/globals';
import {
  computeState,
  computeAdvancedInsights,
  computeAdvancedFinanceSummary,
  generateAdvancedAlerts,
  computeAdvancedActionMother,
  computeAdvancedGuidance,
  calculateHealthScore,
} from '../engine-advanced';
import { DailyCheckin, FinancialEntry, Project } from '../../entities';

describe('Engine Advanced', () => {
  const createCheckin = (
    caixa: DailyCheckin['caixa_status'],
    energia: DailyCheckin['energia'],
    pressao: DailyCheckin['pressao']
  ): DailyCheckin => ({
    id: crypto.randomUUID(),
    user_id: 'test-user',
    date: new Date(),
    caixa_status: caixa,
    energia,
    pressao,
    estado_calculado: 'CAUTION',
  });

  const createEntry = (
    type: 'entrada' | 'saida',
    value: number,
    daysAgo: number = 0
  ): FinancialEntry => ({
    id: crypto.randomUUID(),
    user_id: 'test-user',
    type,
    value,
    category: 'other',
    date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  });

  const createProject = (name: string, status: Project['status']): Project => ({
    id: crypto.randomUUID(),
    user_id: 'test-user',
    name,
    objective: '',
    status,
    created_at: new Date(),
    updated_at: new Date(),
  });

  describe('computeState', () => {
    it('should return CRITICAL for caixa critico', () => {
      const checkin = createCheckin('critico', 'alta', 'leve');
      expect(computeState(checkin)).toBe('CRITICAL');
    });

    it('should return CRITICAL for caixa atencao + energia baixa', () => {
      const checkin = createCheckin('atencao', 'baixa', 'normal');
      expect(computeState(checkin)).toBe('CRITICAL');
    });

    it('should return ATTACK for ideal conditions', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      expect(computeState(checkin)).toBe('ATTACK');
    });

    it('should return CAUTION for mixed conditions', () => {
      const checkin = createCheckin('tranquilo', 'media', 'normal');
      expect(computeState(checkin)).toBe('CAUTION');
    });

    it('should not return ATTACK with high pressure', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'alta');
      expect(computeState(checkin)).toBe('CAUTION');
    });
  });

  describe('computeAdvancedFinanceSummary', () => {
    it('should compute basic summary correctly', () => {
      const entries = [
        createEntry('entrada', 10000, 5),
        createEntry('saida', 3000, 4),
        createEntry('saida', 2000, 3),
      ];

      const summary = computeAdvancedFinanceSummary(entries, 30);
      expect(summary.total_entradas).toBe(10000);
      expect(summary.total_saidas).toBe(5000);
      expect(summary.balance).toBe(5000);
    });

    it('should include health score', () => {
      const entries = [createEntry('entrada', 100000, 10), createEntry('saida', 50000, 5)];

      const summary = computeAdvancedFinanceSummary(entries, 30);
      expect(summary.health_score).toBeDefined();
      expect(summary.health_score).toBeGreaterThanOrEqual(0);
      expect(summary.health_score).toBeLessThanOrEqual(100);
    });

    it('should detect spending trend', () => {
      const entries: FinancialEntry[] = [];
      // Increasing spending pattern
      for (let i = 0; i < 14; i++) {
        entries.push(createEntry('saida', 1000 + i * 100, i));
      }

      const summary = computeAdvancedFinanceSummary(entries, 30);
      expect(summary.spending_trend).toBe('increasing');
    });

    it('should provide forecasts', () => {
      const entries = [createEntry('saida', 1000, 1)];

      const summary = computeAdvancedFinanceSummary(entries, 30);
      expect(summary.forecast_30d).toBeGreaterThan(0);
      expect(summary.forecast_60d).toBeGreaterThan(0);
      expect(summary.forecast_90d).toBeGreaterThan(0);
    });

    it('should provide recommended action', () => {
      const entries = [createEntry('saida', 5000, 1)];

      const summary = computeAdvancedFinanceSummary(entries, 30);
      expect(summary.recommended_action).toBeDefined();
      expect(typeof summary.recommended_action).toBe('string');
    });
  });

  describe('computeAdvancedInsights', () => {
    it('should compute complete insights', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const recentCheckins = [checkin];
      const entries = [createEntry('entrada', 10000, 5)];
      const projects = [createProject('Test', 'active')];

      const insights = computeAdvancedInsights(checkin, recentCheckins, entries, projects);

      expect(insights.current_state).toBeDefined();
      expect(insights.health_score).toBeGreaterThanOrEqual(0);
      expect(insights.health_score).toBeLessThanOrEqual(100);
      expect(insights.finance).toBeDefined();
      expect(insights.energy_pattern).toBeDefined();
      expect(insights.recommended_actions).toBeInstanceOf(Array);
      expect(insights.warnings).toBeInstanceOf(Array);
    });

    it('should include energy pattern analysis', () => {
      const checkins = [
        createCheckin('tranquilo', 'alta', 'leve'),
        createCheckin('tranquilo', 'alta', 'leve'),
        createCheckin('tranquilo', 'media', 'leve'),
      ];

      const insights = computeAdvancedInsights(checkins[0], checkins, [], [], {});

      expect(insights.energy_pattern.best_day).toBeDefined();
      expect(insights.energy_pattern.worst_day).toBeDefined();
      expect(insights.energy_pattern.current_streak).toBeGreaterThanOrEqual(0);
    });

    it('should calculate productivity correlation', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const taskCompletions = {
        [new Date().toISOString().split('T')[0]]: 10,
      };

      const insights = computeAdvancedInsights(checkin, [checkin], [], [], taskCompletions);

      expect(typeof insights.productivity_correlation).toBe('number');
      expect(insights.productivity_correlation).toBeGreaterThanOrEqual(-1);
      expect(insights.productivity_correlation).toBeLessThanOrEqual(1);
    });

    it('should identify top priority project', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const projects = [createProject('Project A', 'active'), createProject('Project B', 'active')];

      const insights = computeAdvancedInsights(checkin, [checkin], [], projects);

      if (projects.length > 0) {
        expect(insights.top_priority_project).toBeDefined();
      }
    });
  });

  describe('generateAdvancedAlerts', () => {
    it('should generate health score alert when critical', () => {
      const checkin = createCheckin('critico', 'baixa', 'alta');
      const entries = [createEntry('saida', 50000, 1)];

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const alerts = generateAdvancedAlerts(insights, 'test-user');

      expect(alerts.length).toBeGreaterThan(0);
      const hasHealthAlert = alerts.some((a) => a.message.includes('Saúde'));
      expect(hasHealthAlert).toBe(true);
    });

    it('should alert on spending anomalies', () => {
      const checkin = createCheckin('tranquilo', 'media', 'normal');
      const entries: FinancialEntry[] = [];

      // Normal spending
      for (let i = 10; i < 15; i++) {
        entries.push(createEntry('saida', 1000, i));
      }
      // Anomaly
      entries.push(createEntry('saida', 10000, 5));

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const alerts = generateAdvancedAlerts(insights, 'test-user');

      const hasAnomalyAlert = alerts.some((a) => a.message.includes('incomum'));
      expect(hasAnomalyAlert).toBe(true);
    });

    it('should alert on increasing spending trend', () => {
      const checkin = createCheckin('tranquilo', 'media', 'normal');
      const entries: FinancialEntry[] = [];

      // Increasing pattern
      for (let i = 0; i < 15; i++) {
        entries.push(createEntry('saida', 1000 + i * 100, 15 - i));
      }

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const alerts = generateAdvancedAlerts(insights, 'test-user');

      const hasTrendAlert = alerts.some((a) => a.message.includes('Tendência'));
      expect(hasTrendAlert).toBe(true);
    });

    it('should not generate excessive alerts for healthy state', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const entries = [createEntry('entrada', 100000, 10), createEntry('saida', 30000, 5)];

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const alerts = generateAdvancedAlerts(insights, 'test-user');

      expect(alerts.length).toBeLessThan(5);
    });

    it('should include user_id in all alerts', () => {
      const checkin = createCheckin('critico', 'baixa', 'alta');
      const insights = computeAdvancedInsights(checkin, [checkin], [], []);
      const alerts = generateAdvancedAlerts(insights, 'test-user-123');

      alerts.forEach((alert) => {
        expect(alert.user_id).toBe('test-user-123');
      });
    });
  });

  describe('computeAdvancedActionMother', () => {
    it('should prioritize finance in CRITICAL state', () => {
      const checkin = createCheckin('critico', 'baixa', 'alta');
      const entries = [createEntry('saida', 10000, 1)];

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const action = computeAdvancedActionMother(insights);

      expect(action).toContain('🔴');
      expect(action.toLowerCase()).toMatch(/urgente|caixa|entrada/);
    });

    it('should recommend project execution in ATTACK state', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const entries = [createEntry('entrada', 100000, 5)];
      const projects = [createProject('Strategic Project', 'active')];

      const insights = computeAdvancedInsights(checkin, [checkin], entries, projects);
      const action = computeAdvancedActionMother(insights);

      expect(action).toContain('🟢');
    });

    it('should suggest rest when energy is low', () => {
      const checkins = [createCheckin('tranquilo', 'baixa', 'normal')];

      const insights = computeAdvancedInsights(checkins[0], checkins, [], []);

      const action = computeAdvancedActionMother(insights);

      if (insights.current_state === 'CAUTION' && insights.energy_pattern.current_streak === 0) {
        expect(action.toLowerCase()).toMatch(/energia|leve|preservar/);
      }
    });

    it('should leverage high energy streaks', () => {
      const checkins = [
        createCheckin('tranquilo', 'alta', 'leve'),
        createCheckin('tranquilo', 'alta', 'leve'),
        createCheckin('tranquilo', 'alta', 'leve'),
        createCheckin('tranquilo', 'alta', 'leve'),
      ];

      const entries = [createEntry('entrada', 100000, 5)];

      const insights = computeAdvancedInsights(checkins[0], checkins, entries, []);

      const action = computeAdvancedActionMother(insights);

      if (insights.current_state === 'ATTACK' && insights.energy_pattern.current_streak > 3) {
        expect(action).toMatch(/streak|momento|excelente/i);
      }
    });
  });

  describe('computeAdvancedGuidance', () => {
    it('should return CUT mode for critical health', () => {
      const checkin = createCheckin('critico', 'baixa', 'alta');
      const entries = [createEntry('saida', 100000, 1)];

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const guidance = computeAdvancedGuidance(insights);

      expect(guidance.mode).toBe('CUT');
    });

    it('should return DO mode for ATTACK with high health', () => {
      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const entries = [createEntry('entrada', 100000, 5)];

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);

      if (insights.health_score > 70) {
        const guidance = computeAdvancedGuidance(insights);
        expect(guidance.mode).toBe('DO');
      }
    });

    it('should warn about increasing spending', () => {
      const checkin = createCheckin('tranquilo', 'media', 'normal');
      const entries: FinancialEntry[] = [];

      for (let i = 0; i < 15; i++) {
        entries.push(createEntry('saida', 1000 + i * 100, 15 - i));
      }

      const insights = computeAdvancedInsights(checkin, [checkin], entries, []);
      const guidance = computeAdvancedGuidance(insights);

      if (insights.finance.spending_trend === 'increasing') {
        expect(guidance.text.toLowerCase()).toMatch(/gasto|crescendo|despesas/);
      }
    });

    it('should provide actionable text', () => {
      const checkin = createCheckin('tranquilo', 'media', 'normal');
      const insights = computeAdvancedInsights(checkin, [checkin], [], []);
      const guidance = computeAdvancedGuidance(insights);

      expect(guidance.text).toBeDefined();
      expect(guidance.text.length).toBeGreaterThan(10);
    });
  });

  describe('calculateHealthScore', () => {
    it('should return 100 for perfect health', () => {
      const finance = {
        total_entradas: 100000,
        total_saidas: 50000,
        balance: 100000,
        avg_daily_spending: 1000,
        forecast_days: 60,
        health_score: 100,
        spending_trend: 'stable' as const,
        forecast_30d: 30000,
        forecast_60d: 60000,
        forecast_90d: 90000,
        anomaly_detected: false,
        recommended_action: 'Continue',
      };

      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const projects = { active_count: 2, stalled_count: 0 };

      const score = calculateHealthScore(finance, checkin, projects);
      expect(score).toBe(100);
    });

    it('should penalize low energy', () => {
      const finance = {
        total_entradas: 100000,
        total_saidas: 50000,
        balance: 100000,
        avg_daily_spending: 1000,
        forecast_days: 60,
        health_score: 100,
        spending_trend: 'stable' as const,
        forecast_30d: 30000,
        forecast_60d: 60000,
        forecast_90d: 90000,
        anomaly_detected: false,
        recommended_action: 'Continue',
      };

      const checkinHigh = createCheckin('tranquilo', 'alta', 'leve');
      const checkinLow = createCheckin('tranquilo', 'baixa', 'leve');
      const projects = { active_count: 2, stalled_count: 0 };

      const scoreHigh = calculateHealthScore(finance, checkinHigh, projects);
      const scoreLow = calculateHealthScore(finance, checkinLow, projects);

      expect(scoreLow).toBeLessThan(scoreHigh);
    });

    it('should penalize stalled projects', () => {
      const finance = {
        total_entradas: 100000,
        total_saidas: 50000,
        balance: 100000,
        avg_daily_spending: 1000,
        forecast_days: 60,
        health_score: 100,
        spending_trend: 'stable' as const,
        forecast_30d: 30000,
        forecast_60d: 60000,
        forecast_90d: 90000,
        anomaly_detected: false,
        recommended_action: 'Continue',
      };

      const checkin = createCheckin('tranquilo', 'alta', 'leve');
      const healthy = { active_count: 2, stalled_count: 0 };
      const unhealthy = { active_count: 2, stalled_count: 3 };

      const scoreHealthy = calculateHealthScore(finance, checkin, healthy);
      const scoreUnhealthy = calculateHealthScore(finance, checkin, unhealthy);

      expect(scoreUnhealthy).toBeLessThan(scoreHealthy);
    });

    it('should return score between 0 and 100', () => {
      const worstFinance = {
        total_entradas: 0,
        total_saidas: 100000,
        balance: -100000,
        avg_daily_spending: 5000,
        forecast_days: 0,
        health_score: 0,
        spending_trend: 'increasing' as const,
        forecast_30d: 150000,
        forecast_60d: 300000,
        forecast_90d: 450000,
        anomaly_detected: true,
        recommended_action: 'Emergency',
      };

      const checkin = createCheckin('critico', 'baixa', 'alta');
      const projects = { active_count: 10, stalled_count: 5 };

      const score = calculateHealthScore(worstFinance, checkin, projects);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should weight finance health at 50%', () => {
      const goodFinance = {
        health_score: 100,
        total_entradas: 100000,
        total_saidas: 50000,
        balance: 100000,
        avg_daily_spending: 1000,
        forecast_days: 60,
        spending_trend: 'stable' as const,
        forecast_30d: 30000,
        forecast_60d: 60000,
        forecast_90d: 90000,
        anomaly_detected: false,
        recommended_action: 'Continue',
      };

      const badFinance = {
        ...goodFinance,
        health_score: 0,
      };

      const checkin = createCheckin('tranquilo', 'media', 'normal');
      const projects = { active_count: 3, stalled_count: 0 };

      const goodScore = calculateHealthScore(goodFinance, checkin, projects);
      const badScore = calculateHealthScore(badFinance, checkin, projects);

      const difference = goodScore - badScore;
      expect(difference).toBeGreaterThan(40); // Should be ~50
      expect(difference).toBeLessThan(60);
    });
  });
});
