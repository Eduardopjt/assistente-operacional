/**
 * Weekly Automation System
 * Generates weekly summaries and insights
 */

import { DailyCheckin, FinancialEntry, Project, Decision } from '../entities';

export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  victories: string[];
  blockers: string[];
  decisions: Decision[];
  financialSnapshot: {
    totalIncome: number;
    totalExpenses: number;
    netCashflow: number;
    topCategories: Array<{ category: string; amount: number }>;
  };
  wellbeingSnapshot: {
    averageEnergy: number;
    averageCaixaScore: number;
    checkinsCompleted: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  projectsSnapshot: {
    activeCount: number;
    completedThisWeek: number;
    topProjects: Array<{ name: string; progress: string }>;
  };
  insights: string[];
}

/**
 * Generate weekly summary
 */
export function generateWeeklySummary(
  weekStart: Date,
  weekEnd: Date,
  checkins: DailyCheckin[],
  finances: FinancialEntry[],
  projects: Project[],
  decisions: Decision[]
): WeeklySummary {
  // Filter data for the week
  const weekCheckins = checkins.filter((c) => {
    const date = new Date(c.date);
    return date >= weekStart && date <= weekEnd;
  });

  const weekFinances = finances.filter((f) => {
    const date = new Date(f.date);
    return date >= weekStart && date <= weekEnd;
  });

  const weekDecisions = decisions.filter((d) => {
    const date = new Date(d.date);
    return date >= weekStart && date <= weekEnd;
  });

  // Calculate victories (days with high energy and good caixa)
  const victories: string[] = [];
  const goodDays = weekCheckins.filter(
    (c) => c.energia === 'alta' && c.caixa_status === 'tranquilo'
  );
  if (goodDays.length > 0) {
    victories.push(`${goodDays.length} dia(s) com alta energia e caixa tranquilo`);
  }

  const completedProjects = projects.filter((p) => {
    if (p.status !== 'done') return false;
    const updated = new Date(p.updated_at || p.created_at);
    return updated >= weekStart && updated <= weekEnd;
  });
  if (completedProjects.length > 0) {
    victories.push(`${completedProjects.length} projeto(s) finalizado(s)`);
  }

  const income = weekFinances
    .filter((f) => f.type === 'entrada')
    .reduce((sum, f) => sum + f.value, 0);
  if (income > 0) {
    victories.push(`Receita de R$ ${(income / 100).toFixed(2)}`);
  }

  // Calculate blockers (days with low energy or critical caixa)
  const blockers: string[] = [];
  const badDays = weekCheckins.filter((c) => c.energia === 'baixa' || c.caixa_status === 'critico');
  if (badDays.length >= 3) {
    blockers.push(`${badDays.length} dia(s) com baixa energia ou caixa crítico`);
  }

  const highPressureDays = weekCheckins.filter((c) => c.pressao === 'alta');
  if (highPressureDays.length >= 4) {
    blockers.push(`${highPressureDays.length} dia(s) sob alta pressão`);
  }

  // Financial snapshot
  const totalIncome = weekFinances
    .filter((f) => f.type === 'entrada')
    .reduce((sum, f) => sum + f.value, 0);

  const totalExpenses = weekFinances
    .filter((f) => f.type === 'saida')
    .reduce((sum, f) => sum + f.value, 0);

  const categoryTotals = new Map<string, number>();
  weekFinances
    .filter((f) => f.type === 'saida')
    .forEach((f) => {
      categoryTotals.set(f.category, (categoryTotals.get(f.category) || 0) + f.value);
    });

  const topCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount }));

  // Wellbeing snapshot
  const energyScore =
    weekCheckins.reduce((sum, c) => {
      if (c.energia === 'alta') return sum + 1;
      if (c.energia === 'media') return sum + 0.5;
      return sum;
    }, 0) / weekCheckins.length;

  const caixaScore =
    weekCheckins.reduce((sum, c) => {
      if (c.caixa_status === 'tranquilo') return sum + 1;
      if (c.caixa_status === 'atencao') return sum + 0.5;
      return sum;
    }, 0) / weekCheckins.length;

  // Trend analysis (compare to previous week if possible)
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  const prevWeekCheckins = checkins.filter((c) => {
    const date = new Date(c.date);
    return date >= prevWeekStart && date <= prevWeekEnd;
  });

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (prevWeekCheckins.length > 0) {
    const prevEnergyScore =
      prevWeekCheckins.reduce((sum, c) => {
        if (c.energia === 'alta') return sum + 1;
        if (c.energia === 'media') return sum + 0.5;
        return sum;
      }, 0) / prevWeekCheckins.length;

    if (energyScore > prevEnergyScore + 0.2) trend = 'improving';
    else if (energyScore < prevEnergyScore - 0.2) trend = 'declining';
  }

  // Projects snapshot
  const activeProjects = projects.filter((p) => p.status === 'active');
  const topProjects = activeProjects.slice(0, 3).map((p) => ({
    name: p.name,
    progress: p.next_action || 'Sem ação definida',
  }));

  // Generate insights
  const insights: string[] = [];

  if (weekCheckins.length < 5) {
    insights.push('⚠️ Baixa frequência de check-ins. Tente registrar diariamente.');
  }

  if (totalExpenses > totalIncome && totalIncome > 0) {
    const deficit = totalExpenses - totalIncome;
    insights.push(`⚠️ Déficit de R$ ${(deficit / 100).toFixed(2)} nesta semana. Revise gastos.`);
  }

  if (energyScore < 0.4) {
    insights.push('💡 Energia baixa persistente. Considere pausar projetos secundários.');
  }

  if (activeProjects.length > 5) {
    insights.push(
      '💡 Muitos projetos ativos. Considere pausar ou finalizar alguns para manter foco.'
    );
  }

  if (trend === 'improving') {
    insights.push('✅ Tendência positiva! Continue assim.');
  }

  return {
    weekStart,
    weekEnd,
    victories,
    blockers,
    decisions: weekDecisions,
    financialSnapshot: {
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      topCategories,
    },
    wellbeingSnapshot: {
      averageEnergy: energyScore,
      averageCaixaScore: caixaScore,
      checkinsCompleted: weekCheckins.length,
      trend,
    },
    projectsSnapshot: {
      activeCount: activeProjects.length,
      completedThisWeek: completedProjects.length,
      topProjects,
    },
    insights,
  };
}

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust for Monday start
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const result = new Date(start);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}
