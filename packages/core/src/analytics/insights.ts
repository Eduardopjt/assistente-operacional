import { FinanceAnalytics, ProjectAnalytics, PatternDetector } from '../analytics';
import { DailyCheckin, FinancialEntry, Project } from '../entities';
import { FinanceSummary } from '../rules/types';

/**
 * Enhanced finance summary with predictive analytics
 */
export interface EnhancedFinanceSummary extends FinanceSummary {
  health_score: number; // 0-100
  spending_trend: 'increasing' | 'stable' | 'decreasing';
  forecast_30d: number;
  forecast_60d: number;
  forecast_90d: number;
  anomaly_detected: boolean;
  recommended_action: string;
}

/**
 * Enhanced operational insights with ML-like predictions
 */
export interface OperationalInsights {
  current_state: 'CRITICAL' | 'CAUTION' | 'ATTACK';
  health_score: number; // Overall 0-100
  finance: EnhancedFinanceSummary;
  energy_pattern: {
    best_day: string;
    worst_day: string;
    current_streak: number; // Days of consistent energy
  };
  productivity_correlation: number; // -1 to 1
  top_priority_project?: string;
  recommended_actions: string[];
  warnings: string[];
}

/**
 * Compute enhanced finance summary with predictions
 */
export function computeEnhancedFinanceSummary(
  entries: FinancialEntry[],
  period_days: number = 30
): EnhancedFinanceSummary {
  const now = Date.now();
  const cutoff = now - period_days * 24 * 60 * 60 * 1000;

  const recentEntries = entries.filter((e) => new Date(e.date).getTime() >= cutoff);

  // Basic calculations
  const totals = recentEntries.reduce(
    (acc, entry) => {
      if (entry.type === 'entrada') {
        acc.entradas += entry.value;
      } else {
        acc.saidas += entry.value;
      }
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  const balance = totals.entradas - totals.saidas;
  const avgDailySpending = totals.saidas / period_days;
  const forecastDays = avgDailySpending > 0 ? Math.floor(balance / avgDailySpending) : 999;

  const baseSummary: FinanceSummary = {
    total_entradas: totals.entradas,
    total_saidas: totals.saidas,
    balance,
    avg_daily_spending: avgDailySpending,
    forecast_days: Math.max(0, forecastDays),
  };

  // Advanced analytics
  const dailySpending = getDailySpending(recentEntries, period_days);
  const healthScore = FinanceAnalytics.calculateHealthScore(baseSummary);
  const trend = calculateTrend(dailySpending);
  const anomalies = FinanceAnalytics.detectAnomalies(dailySpending);
  const anomalyDetected = anomalies.some((a) => a);

  // Forecasts
  const forecasts = FinanceAnalytics.forecastSpending(dailySpending, 90);
  const forecast_30d = forecasts.slice(0, 30).reduce((sum, f) => sum + f.avg, 0);
  const forecast_60d = forecasts.slice(0, 60).reduce((sum, f) => sum + f.avg, 0);
  const forecast_90d = forecasts.reduce((sum, f) => sum + f.avg, 0);

  // Recommendations
  let recommendedAction = 'Continue monitorando gastos';
  if (healthScore < 30) {
    recommendedAction = 'Urgente: Reduzir gastos e buscar entradas imediatas';
  } else if (healthScore < 60) {
    recommendedAction = 'Atenção: Revisar despesas não essenciais';
  } else if (anomalyDetected) {
    recommendedAction = 'Investigar gastos incomuns detectados';
  }

  return {
    ...baseSummary,
    health_score: healthScore,
    spending_trend: trend,
    forecast_30d,
    forecast_60d,
    forecast_90d,
    anomaly_detected: anomalyDetected,
    recommended_action: recommendedAction,
  };
}

/**
 * Helper: Get daily spending array
 */
function getDailySpending(entries: FinancialEntry[], days: number): number[] {
  const dailyMap: Record<string, number> = {};

  entries
    .filter((e) => e.type === 'saida')
    .forEach((e) => {
      const date = new Date(e.date).toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] || 0) + e.value;
    });

  // Fill missing days with 0
  const result: number[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push(dailyMap[key] || 0);
  }

  return result.reverse();
}

/**
 * Helper: Calculate spending trend
 */
function calculateTrend(dailyValues: number[]): 'increasing' | 'stable' | 'decreasing' {
  if (dailyValues.length < 7) return 'stable';

  const firstHalf = dailyValues.slice(0, Math.floor(dailyValues.length / 2));
  const secondHalf = dailyValues.slice(Math.floor(dailyValues.length / 2));

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const change = (avgSecond - avgFirst) / Math.max(avgFirst, 1);

  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

/**
 * Compute complete operational insights
 */
export function computeOperationalInsights(
  checkin: DailyCheckin,
  recentCheckins: DailyCheckin[],
  entries: FinancialEntry[],
  projects: Project[],
  taskCompletions: Record<string, number>
): OperationalInsights {
  // Current state (from existing engine)
  const state = computeStateFromCheckin(checkin);

  // Enhanced finance
  const finance = computeEnhancedFinanceSummary(entries);

  // Energy patterns
  const patterns = PatternDetector.analyzeWeeklyPatterns(recentCheckins);
  const energyPattern = {
    best_day: patterns.bestDay,
    worst_day: patterns.worstDay,
    current_streak: calculateEnergyStreak(recentCheckins),
  };

  // Productivity correlation
  const productivity_correlation = PatternDetector.correlateMoodAndProductivity(
    recentCheckins,
    taskCompletions
  );

  // Overall health score (weighted average)
  const health_score = Math.round(
    finance.health_score * 0.5 + // 50% finance
      (state === 'ATTACK' ? 100 : state === 'CAUTION' ? 60 : 20) * 0.3 + // 30% state
      calculateEnergyScore(checkin) * 0.2 // 20% energy
  );

  // Top priority project
  const activeProjects = projects.filter((p) => p.status === 'active');
  const scoredProjects = activeProjects.map((p) => ({
    project: p,
    score: ProjectAnalytics.calculatePriorityScore(p, {
      financialImpact: 5, // Would need real data
      energyRequired: 5,
    }),
  }));
  scoredProjects.sort((a, b) => b.score - a.score);
  const top_priority_project = scoredProjects[0]?.project.name;

  // Recommended actions
  const recommended_actions: string[] = [];
  const warnings: string[] = [];

  if (health_score < 40) {
    warnings.push('Saúde operacional crítica');
    recommended_actions.push(finance.recommended_action);
  }

  if (finance.spending_trend === 'increasing') {
    warnings.push('Gastos em tendência de alta');
    recommended_actions.push('Revisar despesas dos últimos 7 dias');
  }

  if (finance.anomaly_detected) {
    warnings.push('Anomalia detectada nos gastos');
  }

  const stalledProjects = ProjectAnalytics.findStalledProjects(projects);
  if (stalledProjects.length > 0) {
    warnings.push(`${stalledProjects.length} projeto(s) parado(s)`);
    recommended_actions.push('Definir próximas ações para projetos travados');
  }

  if (state === 'ATTACK' && top_priority_project) {
    recommended_actions.push(`Avançar projeto: ${top_priority_project}`);
  }

  return {
    current_state: state,
    health_score,
    finance,
    energy_pattern: energyPattern,
    productivity_correlation,
    top_priority_project,
    recommended_actions,
    warnings,
  };
}

// Helper functions
function computeStateFromCheckin(checkin: DailyCheckin): 'CRITICAL' | 'CAUTION' | 'ATTACK' {
  const { caixa_status, energia, pressao } = checkin;

  if (caixa_status === 'critico') return 'CRITICAL';
  if (caixa_status === 'atencao' && energia === 'baixa') return 'CRITICAL';
  if (caixa_status === 'tranquilo' && energia === 'alta' && pressao !== 'alta') return 'ATTACK';

  return 'CAUTION';
}

function calculateEnergyStreak(checkins: DailyCheckin[]): number {
  let streak = 0;
  const sorted = [...checkins].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const c of sorted) {
    if (c.energia === 'alta' || c.energia === 'media') {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateEnergyScore(checkin: DailyCheckin): number {
  if (checkin.energia === 'alta') return 100;
  if (checkin.energia === 'media') return 60;
  return 20;
}
