/**
 * Financial Projections (30/60/90 days)
 * Predictive models for future financial state
 */

import { FinancialEntry } from '../entities';

export interface FinancialProjection {
  days: 30 | 60 | 90;
  scenarios: {
    optimistic: ProjectionScenario;
    realistic: ProjectionScenario;
    pessimistic: ProjectionScenario;
  };
  assumptions: {
    averageIncome: number;
    averageExpenses: number;
    incomeGrowthRate: number;
    expenseGrowthRate: number;
  };
}

export interface ProjectionScenario {
  estimatedBalance: number;
  estimatedIncome: number;
  estimatedExpenses: number;
  runway: number; // Days until balance reaches zero
  confidence: number; // 0-1
  warnings: string[];
}

/**
 * Calculate historical trends
 */
function calculateTrends(
  entries: FinancialEntry[],
  lookbackDays: number
): {
  incomeGrowth: number;
  expenseGrowth: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
} {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const recentEntries = entries.filter((e) => new Date(e.date) >= cutoff);

  // Split into first half and second half
  const midpoint = new Date(cutoff);
  midpoint.setDate(midpoint.getDate() + lookbackDays / 2);

  const firstHalf = recentEntries.filter((e) => new Date(e.date) < midpoint);
  const secondHalf = recentEntries.filter((e) => new Date(e.date) >= midpoint);

  const firstIncome = firstHalf
    .filter((e) => e.type === 'entrada')
    .reduce((sum, e) => sum + e.value, 0);
  const firstExpenses = firstHalf
    .filter((e) => e.type === 'saida')
    .reduce((sum, e) => sum + e.value, 0);

  const secondIncome = secondHalf
    .filter((e) => e.type === 'entrada')
    .reduce((sum, e) => sum + e.value, 0);
  const secondExpenses = secondHalf
    .filter((e) => e.type === 'saida')
    .reduce((sum, e) => sum + e.value, 0);

  const incomeGrowth = firstIncome > 0 ? (secondIncome - firstIncome) / firstIncome : 0;
  const expenseGrowth = firstExpenses > 0 ? (secondExpenses - firstExpenses) / firstExpenses : 0;

  // Calculate monthly averages
  const monthlyIncome =
    recentEntries.filter((e) => e.type === 'entrada').reduce((sum, e) => sum + e.value, 0) /
    (lookbackDays / 30);
  const monthlyExpenses =
    recentEntries.filter((e) => e.type === 'saida').reduce((sum, e) => sum + e.value, 0) /
    (lookbackDays / 30);

  return {
    incomeGrowth: Math.max(-0.5, Math.min(0.5, incomeGrowth)), // Cap at ±50%
    expenseGrowth: Math.max(-0.5, Math.min(0.5, expenseGrowth)),
    avgMonthlyIncome: monthlyIncome,
    avgMonthlyExpenses: monthlyExpenses,
  };
}

/**
 * Project financial state for N days
 */
export function projectFinances(
  currentBalance: number,
  entries: FinancialEntry[],
  days: 30 | 60 | 90,
  lookbackDays: number = 90
): FinancialProjection {
  const trends = calculateTrends(entries, lookbackDays);
  const months = days / 30;

  // Optimistic scenario (10% better than trend)
  const optimisticIncomeGrowth = trends.incomeGrowth * 1.1;
  const optimisticExpenseGrowth = trends.expenseGrowth * 0.9;

  const optimisticIncome = trends.avgMonthlyIncome * months * (1 + optimisticIncomeGrowth);
  const optimisticExpenses = trends.avgMonthlyExpenses * months * (1 + optimisticExpenseGrowth);
  const optimisticBalance = currentBalance + optimisticIncome - optimisticExpenses;

  // Realistic scenario (current trend)
  const realisticIncome = trends.avgMonthlyIncome * months * (1 + trends.incomeGrowth);
  const realisticExpenses = trends.avgMonthlyExpenses * months * (1 + trends.expenseGrowth);
  const realisticBalance = currentBalance + realisticIncome - realisticExpenses;

  // Pessimistic scenario (10% worse than trend)
  const pessimisticIncomeGrowth = trends.incomeGrowth * 0.9;
  const pessimisticExpenseGrowth = trends.expenseGrowth * 1.1;

  const pessimisticIncome = trends.avgMonthlyIncome * months * (1 + pessimisticIncomeGrowth);
  const pessimisticExpenses = trends.avgMonthlyExpenses * months * (1 + pessimisticExpenseGrowth);
  const pessimisticBalance = currentBalance + pessimisticIncome - pessimisticExpenses;

  // Calculate runways
  const avgMonthlyBurn = trends.avgMonthlyExpenses - trends.avgMonthlyIncome;

  function calculateRunway(balance: number, burn: number): number {
    if (burn <= 0) return Infinity;
    return Math.floor((balance / burn) * 30);
  }

  // Generate warnings
  const warnings: string[] = [];

  if (realisticBalance < 0) {
    warnings.push(`Saldo negativo projetado em ${days} dias`);
  }

  if (realisticBalance < currentBalance * 0.5) {
    warnings.push(`Redução de 50%+ no saldo esperada`);
  }

  if (trends.expenseGrowth > 0.2) {
    warnings.push(`Despesas crescendo ${(trends.expenseGrowth * 100).toFixed(0)}%`);
  }

  if (avgMonthlyBurn > trends.avgMonthlyIncome) {
    warnings.push(`Queima de caixa mensal: ${(avgMonthlyBurn / 100).toFixed(2)}`);
  }

  // Confidence based on data quality
  let confidence = 0.7;
  if (entries.length < 30) confidence = 0.4;
  else if (entries.length < 60) confidence = 0.6;
  else if (entries.length >= 90) confidence = 0.8;

  return {
    days,
    scenarios: {
      optimistic: {
        estimatedBalance: optimisticBalance,
        estimatedIncome: optimisticIncome,
        estimatedExpenses: optimisticExpenses,
        runway: calculateRunway(
          optimisticBalance,
          trends.avgMonthlyExpenses * (1 + optimisticExpenseGrowth) -
            trends.avgMonthlyIncome * (1 + optimisticIncomeGrowth)
        ),
        confidence,
        warnings: [],
      },
      realistic: {
        estimatedBalance: realisticBalance,
        estimatedIncome: realisticIncome,
        estimatedExpenses: realisticExpenses,
        runway: calculateRunway(realisticBalance, avgMonthlyBurn),
        confidence,
        warnings,
      },
      pessimistic: {
        estimatedBalance: pessimisticBalance,
        estimatedIncome: pessimisticIncome,
        estimatedExpenses: pessimisticExpenses,
        runway: calculateRunway(
          pessimisticBalance,
          trends.avgMonthlyExpenses * (1 + pessimisticExpenseGrowth) -
            trends.avgMonthlyIncome * (1 + pessimisticIncomeGrowth)
        ),
        confidence,
        warnings: [
          ...warnings,
          pessimisticBalance < 0 ? 'Risco alto de saldo negativo' : '',
        ].filter(Boolean),
      },
    },
    assumptions: {
      averageIncome: trends.avgMonthlyIncome,
      averageExpenses: trends.avgMonthlyExpenses,
      incomeGrowthRate: trends.incomeGrowth,
      expenseGrowthRate: trends.expenseGrowth,
    },
  };
}

/**
 * Get quick projection summary
 */
export function getProjectionSummary(
  currentBalance: number,
  entries: FinancialEntry[]
): {
  days30: number;
  days60: number;
  days90: number;
  recommendation: string;
} {
  const p30 = projectFinances(currentBalance, entries, 30);
  const p60 = projectFinances(currentBalance, entries, 60);
  const p90 = projectFinances(currentBalance, entries, 90);

  let recommendation = '';

  if (p30.scenarios.realistic.estimatedBalance < 0) {
    recommendation = '🔴 Ação urgente: Reduzir despesas ou aumentar receita';
  } else if (p60.scenarios.realistic.estimatedBalance < currentBalance * 0.3) {
    recommendation = '🟡 Atenção: Revisar despesas e buscar novas receitas';
  } else if (p90.scenarios.realistic.estimatedBalance > currentBalance * 1.5) {
    recommendation = '🟢 Excelente: Considere investir o excedente';
  } else {
    recommendation = '🟢 Estável: Continue monitorando';
  }

  return {
    days30: p30.scenarios.realistic.estimatedBalance,
    days60: p60.scenarios.realistic.estimatedBalance,
    days90: p90.scenarios.realistic.estimatedBalance,
    recommendation,
  };
}
