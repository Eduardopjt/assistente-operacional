import { DailyCheckin, Project } from '../entities';
import { FinanceSummary } from '../rules/types';

/**
 * Advanced analytics for financial data
 */
export class FinanceAnalytics {
  /**
   * Calculate exponential moving average for spending prediction
   */
  static calculateEMA(values: number[], period: number = 7): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];

    const multiplier = 2 / (period + 1);
    let ema = values[0];

    for (let i = 1; i < values.length; i++) {
      ema = values[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  /**
   * Detect spending anomalies using standard deviation
   */
  static detectAnomalies(values: number[], threshold: number = 2): boolean[] {
    if (values.length < 3) return values.map(() => false);

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return values.map((val) => Math.abs(val - mean) > threshold * stdDev);
  }

  /**
   * Calculate health score (0-100) based on financial metrics
   */
  static calculateHealthScore(summary: FinanceSummary): number {
    let score = 100;

    // Balance factor (40 points)
    if (summary.balance < 0) {
      score -= 40;
    } else if (summary.balance < 10000) {
      score -= 20;
    } else if (summary.balance < 50000) {
      score -= 10;
    }

    // Spending vs income (30 points)
    const spendingRatio = summary.total_saidas / Math.max(summary.total_entradas, 1);
    if (spendingRatio > 1.5) {
      score -= 30;
    } else if (spendingRatio > 1.0) {
      score -= 20;
    } else if (spendingRatio > 0.8) {
      score -= 10;
    }

    // Forecast runway (30 points)
    if (summary.forecast_days < 7) {
      score -= 30;
    } else if (summary.forecast_days < 15) {
      score -= 20;
    } else if (summary.forecast_days < 30) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate spending forecast for next N days
   */
  static forecastSpending(
    dailySpending: number[],
    daysAhead: number = 30
  ): { min: number; avg: number; max: number }[] {
    const ema = this.calculateEMA(dailySpending);
    const variance = this.calculateVariance(dailySpending);
    const stdDev = Math.sqrt(variance);

    return Array.from({ length: daysAhead }, () => ({
      min: Math.max(0, ema - stdDev * 1.5),
      avg: ema,
      max: ema + stdDev * 1.5,
    }));
  }

  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}

/**
 * Advanced analytics for projects
 */
export class ProjectAnalytics {
  /**
   * Detect stalled projects (no activity for 7+ days)
   */
  static findStalledProjects(projects: Project[]): Project[] {
    const now = Date.now();
    const stalledThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    return projects.filter((p) => {
      if (p.status !== 'active') return false;
      const lastUpdate = new Date(p.updated_at).getTime();
      return now - lastUpdate > stalledThreshold;
    });
  }

  /**
   * Calculate project velocity (tasks completed per week)
   */
  static calculateVelocity(completedTasks: number, weeks: number): number {
    return weeks > 0 ? completedTasks / weeks : 0;
  }

  /**
   * Estimate project completion using current velocity
   */
  static estimateCompletion(
    remainingTasks: number,
    velocity: number
  ): { weeks: number; confidence: 'low' | 'medium' | 'high' } {
    if (velocity === 0) {
      return { weeks: Infinity, confidence: 'low' };
    }

    const weeks = remainingTasks / velocity;
    const confidence = velocity >= 3 ? 'high' : velocity >= 1 ? 'medium' : 'low';

    return { weeks, confidence };
  }

  /**
   * Score project priority based on multiple factors
   */
  static calculatePriorityScore(
    project: Project,
    context: {
      financialImpact: number; // 0-10
      energyRequired: number; // 0-10
      deadline?: Date;
    }
  ): number {
    let score = 0;

    // Financial impact (40%)
    score += context.financialImpact * 4;

    // Deadline urgency (30%)
    if (context.deadline) {
      const daysUntil = (context.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntil < 7) score += 30;
      else if (daysUntil < 30) score += 20;
      else if (daysUntil < 90) score += 10;
    }

    // Energy/effort alignment (20%)
    const energyScore = 10 - context.energyRequired;
    score += energyScore * 2;

    // Status bonus (10%)
    if (project.status === 'active') score += 10;

    return Math.min(100, score);
  }
}

/**
 * Pattern detection for behavior analysis
 */
export class PatternDetector {
  /**
   * Detect weekly patterns in check-ins
   */
  static analyzeWeeklyPatterns(checkins: DailyCheckin[]): {
    bestDay: string;
    worstDay: string;
    avgEnergyByDay: Record<string, number>;
  } {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const energyByDay: Record<string, number[]> = {};

    checkins.forEach((c) => {
      const day = days[new Date(c.date).getDay()];
      if (!energyByDay[day]) energyByDay[day] = [];

      const energyValue = c.energia === 'alta' ? 3 : c.energia === 'media' ? 2 : 1;
      energyByDay[day].push(energyValue);
    });

    const avgByDay: Record<string, number> = {};
    Object.entries(energyByDay).forEach(([day, values]) => {
      avgByDay[day] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    const sorted = Object.entries(avgByDay).sort((a, b) => b[1] - a[1]);
    const bestDay = sorted[0]?.[0] || 'Unknown';
    const worstDay = sorted[sorted.length - 1]?.[0] || 'Unknown';

    return { bestDay, worstDay, avgEnergyByDay: avgByDay };
  }

  /**
   * Detect correlation between mood and productivity
   */
  static correlateMoodAndProductivity(
    checkins: DailyCheckin[],
    taskCompletions: Record<string, number> // date -> count
  ): number {
    // Returns Pearson correlation coefficient (-1 to 1)
    const pairs: [number, number][] = [];

    checkins.forEach((c) => {
      const date = new Date(c.date).toISOString().split('T')[0];
      const tasks = taskCompletions[date] || 0;
      const energy = c.energia === 'alta' ? 3 : c.energia === 'media' ? 2 : 1;
      pairs.push([energy, tasks]);
    });

    if (pairs.length < 2) return 0;

    const n = pairs.length;
    const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
    const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);
    const sumY2 = pairs.reduce((sum, [, y]) => sum + y * y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}
