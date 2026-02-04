/**
 * Anomaly Detection for Financial Entries
 * Detects unusual spending patterns and generates alerts
 */

import { FinancialEntry } from '../entities';

export interface SpendingAnomaly {
  type: 'unusual_amount' | 'unusual_category' | 'unusual_frequency' | 'budget_breach';
  severity: 'low' | 'medium' | 'high';
  category: string;
  amount: number;
  message: string;
  threshold: number;
  deviation: number; // How much it deviates from normal (in %)
}

export interface SpendingStats {
  category: string;
  count: number;
  total: number;
  average: number;
  stdDev: number;
  min: number;
  max: number;
}

/**
 * Calculate statistics for each category
 */
export function calculateCategoryStats(
  entries: FinancialEntry[]
): Map<string, SpendingStats> {
  const categoryData = new Map<string, number[]>();

  // Group amounts by category
  for (const entry of entries) {
    if (entry.type === 'saida') {
      if (!categoryData.has(entry.category)) {
        categoryData.set(entry.category, []);
      }
      categoryData.get(entry.category)!.push(entry.value);
    }
  }

  // Calculate stats
  const stats = new Map<string, SpendingStats>();
  for (const [category, amounts] of categoryData.entries()) {
    const count = amounts.length;
    const total = amounts.reduce((a, b) => a + b, 0);
    const average = total / count;
    const variance =
      amounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    stats.set(category, {
      category,
      count,
      total,
      average,
      stdDev,
      min,
      max,
    });
  }

  return stats;
}

/**
 * Detect anomalies in spending
 */
export function detectSpendingAnomalies(
  entries: FinancialEntry[],
  lookbackDays: number = 30
): SpendingAnomaly[] {
  const anomalies: SpendingAnomaly[] = [];

  // Get recent entries (last lookbackDays)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  const recentEntries = entries.filter(
    (e) => new Date(e.date) >= cutoffDate && e.type === 'saida'
  );

  if (recentEntries.length < 5) {
    // Not enough data
    return anomalies;
  }

  const stats = calculateCategoryStats(recentEntries);

  // Check each recent entry (last 7 days) for anomalies
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const veryRecentEntries = recentEntries.filter((e) => new Date(e.date) >= last7Days);

  for (const entry of veryRecentEntries) {
    const categoryStats = stats.get(entry.category);
    if (!categoryStats || categoryStats.count < 3) continue;

    // Anomaly detection using standard deviation (Z-score)
    const zScore = Math.abs((entry.value - categoryStats.average) / categoryStats.stdDev);
    const deviation = ((entry.value - categoryStats.average) / categoryStats.average) * 100;

    // Unusual amount (2+ standard deviations above average)
    if (zScore > 2 && entry.value > categoryStats.average) {
      const severity: 'low' | 'medium' | 'high' =
        zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low';

      anomalies.push({
        type: 'unusual_amount',
        severity,
        category: entry.category,
        amount: entry.value,
        message: `Gasto ${deviation.toFixed(0)}% acima da média em ${entry.category}`,
        threshold: categoryStats.average,
        deviation,
      });
    }
  }

  // Frequency anomaly - too many transactions in short period
  const categoryFrequency = new Map<string, number>();
  for (const entry of veryRecentEntries) {
    categoryFrequency.set(entry.category, (categoryFrequency.get(entry.category) || 0) + 1);
  }

  for (const [category, count] of categoryFrequency.entries()) {
    const stats = calculateCategoryStats(
      recentEntries.filter((e) => e.category === category)
    ).get(category);

    if (stats) {
      const normalWeeklyFreq = (stats.count / lookbackDays) * 7;
      if (count > normalWeeklyFreq * 2 && count >= 5) {
        anomalies.push({
          type: 'unusual_frequency',
          severity: 'medium',
          category,
          amount: 0,
          message: `Frequência anormal em ${category}: ${count} transações em 7 dias`,
          threshold: normalWeeklyFreq,
          deviation: ((count - normalWeeklyFreq) / normalWeeklyFreq) * 100,
        });
      }
    }
  }

  return anomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Calculate burn rate (average daily NET spending: expenses - income)
 */
export function calculateBurnRate(
  entries: FinancialEntry[],
  days: number = 30
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentEntries = entries.filter((e) => new Date(e.date) >= cutoffDate);

  const totalIncome = recentEntries
    .filter((e) => e.type === 'entrada')
    .reduce((sum, e) => sum + e.value, 0);

  const totalExpenses = recentEntries
    .filter((e) => e.type === 'saida')
    .reduce((sum, e) => sum + e.value, 0);

  // Positive = surplus, Negative = deficit
  return (totalIncome - totalExpenses) / days;
}

/**
 * Predict runway (days until balance reaches zero)
 */
export function predictRunway(
  currentBalance: number,
  entries: FinancialEntry[],
  days: number = 30
): number {
  if (currentBalance <= 0) return 0;

  const burnRate = calculateBurnRate(entries, days);

  // If positive burn rate (making money), runway is infinite
  if (burnRate >= 0) return Infinity;

  // Negative burn rate means losing money
  // Days = balance / abs(burn rate)
  return Math.floor(currentBalance / Math.abs(burnRate));
}
