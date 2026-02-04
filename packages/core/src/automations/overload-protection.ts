/**
 * Overload Protection System
 * Prevents burnout by detecting excessive workload
 */

import { DailyCheckin, Project } from '../entities';

export interface OverloadAssessment {
  overloadLevel: 'none' | 'moderate' | 'high' | 'critical';
  score: number; // 0-100 (higher = more overloaded)
  factors: OverloadFactor[];
  recommendations: string[];
  shouldPauseProjects: boolean;
  projectsToPause: string[]; // Project IDs to consider pausing
}

export interface OverloadFactor {
  type:
    | 'low_energy'
    | 'high_pressure'
    | 'too_many_projects'
    | 'consecutive_bad_days'
    | 'no_rest_days';
  severity: number; // 0-100
  description: string;
}

/**
 * Assess overload state
 */
export function assessOverload(
  recentCheckins: DailyCheckin[],
  activeProjects: Project[]
): OverloadAssessment {
  const factors: OverloadFactor[] = [];
  let totalScore = 0;

  // Factor 1: Consecutive days with low energy
  const last7Days = recentCheckins.slice(0, 7);
  const lowEnergyDays = last7Days.filter((c) => c.energia === 'baixa').length;

  if (lowEnergyDays >= 3) {
    const severity = Math.min(100, (lowEnergyDays / 7) * 100);
    factors.push({
      type: 'low_energy',
      severity,
      description: `${lowEnergyDays} dia(s) com baixa energia nos últimos 7 dias`,
    });
    totalScore += severity * 0.3; // 30% weight
  }

  // Factor 2: Persistent high pressure
  const highPressureDays = last7Days.filter((c) => c.pressao === 'alta').length;

  if (highPressureDays >= 4) {
    const severity = Math.min(100, (highPressureDays / 7) * 100);
    factors.push({
      type: 'high_pressure',
      severity,
      description: `${highPressureDays} dia(s) sob alta pressão`,
    });
    totalScore += severity * 0.25; // 25% weight
  }

  // Factor 3: Too many active projects
  const projectCount = activeProjects.length;
  if (projectCount > 5) {
    const severity = Math.min(100, ((projectCount - 5) / 5) * 100);
    factors.push({
      type: 'too_many_projects',
      severity,
      description: `${projectCount} projetos ativos (recomendado: 3-5)`,
    });
    totalScore += severity * 0.2; // 20% weight
  }

  // Factor 4: Consecutive bad days (low energy OR high pressure OR critical caixa)
  let consecutiveBadDays = 0;
  let maxConsecutiveBad = 0;

  for (const checkin of last7Days) {
    const isBadDay =
      checkin.energia === 'baixa' ||
      checkin.pressao === 'alta' ||
      checkin.caixa_status === 'critico';

    if (isBadDay) {
      consecutiveBadDays++;
      maxConsecutiveBad = Math.max(maxConsecutiveBad, consecutiveBadDays);
    } else {
      consecutiveBadDays = 0;
    }
  }

  if (maxConsecutiveBad >= 3) {
    const severity = Math.min(100, (maxConsecutiveBad / 7) * 100);
    factors.push({
      type: 'consecutive_bad_days',
      severity,
      description: `${maxConsecutiveBad} dia(s) consecutivos difíceis`,
    });
    totalScore += severity * 0.15; // 15% weight
  }

  // Factor 5: No rest days (all days with normal or high pressure)
  const restDays = last7Days.filter((c) => c.pressao === 'leve').length;
  if (restDays === 0 && last7Days.length >= 5) {
    const severity = 70;
    factors.push({
      type: 'no_rest_days',
      severity,
      description: 'Nenhum dia de descanso nos últimos 7 dias',
    });
    totalScore += severity * 0.1; // 10% weight
  }

  // Determine overload level
  let overloadLevel: 'none' | 'moderate' | 'high' | 'critical';
  if (totalScore >= 75) overloadLevel = 'critical';
  else if (totalScore >= 50) overloadLevel = 'high';
  else if (totalScore >= 25) overloadLevel = 'moderate';
  else overloadLevel = 'none';

  // Generate recommendations
  const recommendations: string[] = [];
  let shouldPauseProjects = false;
  const projectsToPause: string[] = [];

  if (overloadLevel === 'critical' || overloadLevel === 'high') {
    recommendations.push('🔴 Sobrecarga detectada! Ação imediata necessária.');

    if (lowEnergyDays >= 3) {
      recommendations.push('Priorize descanso e sono de qualidade');
    }

    if (projectCount > 3) {
      shouldPauseProjects = true;
      recommendations.push(
        `Pausar ${projectCount - 3} projeto(s) para reduzir carga cognitiva`
      );

      // Suggest pausing projects without next_action (lower priority)
      const lowPriorityProjects = activeProjects
        .filter((p) => !p.next_action)
        .map((p) => p.id);
      projectsToPause.push(...lowPriorityProjects.slice(0, projectCount - 3));
    }

    if (highPressureDays >= 4) {
      recommendations.push('Renegociar prazos ou delegar tarefas urgentes');
    }

    recommendations.push('Considere 1-2 dias de pausa completa');
  } else if (overloadLevel === 'moderate') {
    recommendations.push('🟡 Sobrecarga moderada. Ajustes recomendados:');

    if (projectCount > 5) {
      recommendations.push('Considere pausar 1-2 projetos secundários');
    }

    if (restDays === 0) {
      recommendations.push('Reserve pelo menos 1 dia de descanso por semana');
    }

    recommendations.push('Monitore níveis de energia nos próximos dias');
  } else {
    recommendations.push('✅ Carga de trabalho equilibrada. Continue assim!');
  }

  return {
    overloadLevel,
    score: Math.round(totalScore),
    factors,
    recommendations,
    shouldPauseProjects,
    projectsToPause,
  };
}

/**
 * Quick overload check
 */
export function isOverloaded(recentCheckins: DailyCheckin[]): boolean {
  const assessment = assessOverload(recentCheckins, []);
  return assessment.overloadLevel === 'high' || assessment.overloadLevel === 'critical';
}

/**
 * Suggest rest day
 */
export function suggestRestDay(recentCheckins: DailyCheckin[]): boolean {
  const last7Days = recentCheckins.slice(0, 7);
  const restDays = last7Days.filter((c) => c.pressao === 'leve').length;
  const avgEnergy =
    last7Days.reduce((sum, c) => {
      if (c.energia === 'alta') return sum + 1;
      if (c.energia === 'media') return sum + 0.5;
      return sum;
    }, 0) / last7Days.length;

  return restDays === 0 || avgEnergy < 0.4;
}
