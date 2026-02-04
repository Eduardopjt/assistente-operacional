import { DailyCheckin, EstadoCalculado } from '../entities/daily-checkin';
import { FinancialEntry, Project } from '../entities';
import { Alert } from '../entities/alert';
import { OperationalContext, Guidance } from './types';
import {
  computeEnhancedFinanceSummary,
  computeOperationalInsights,
  EnhancedFinanceSummary,
  OperationalInsights,
} from '../analytics/insights';

/**
 * Enhanced Core Rules Engine with ML-like predictive capabilities
 * 
 * NEW FEATURES:
 * - Health score (0-100) calculation
 * - Spending trend detection and anomalies
 * - Predictive forecasts (30/60/90 days)
 * - Energy pattern analysis
 * - Project priority scoring
 * - Productivity correlation
 */

/**
 * Compute operational state with enhanced logic
 */
export function computeState(checkin: DailyCheckin): EstadoCalculado {
  const { caixa_status, energia, pressao } = checkin;

  // Critical conditions (unchanged from original)
  if (caixa_status === 'critico') {
    return 'CRITICAL';
  }
  if (caixa_status === 'atencao' && energia === 'baixa') {
    return 'CRITICAL';
  }

  // Attack conditions (unchanged from original)
  if (caixa_status === 'tranquilo' && energia === 'alta' && pressao !== 'alta') {
    return 'ATTACK';
  }

  // Default to caution
  return 'CAUTION';
}

/**
 * NEW: Compute advanced operational insights with predictions
 */
export function computeAdvancedInsights(
  checkin: DailyCheckin,
  recentCheckins: DailyCheckin[],
  entries: FinancialEntry[],
  projects: Project[],
  taskCompletions: Record<string, number> = {}
): OperationalInsights {
  return computeOperationalInsights(checkin, recentCheckins, entries, projects, taskCompletions);
}

/**
 * NEW: Enhanced finance summary with predictive analytics
 */
export function computeAdvancedFinanceSummary(
  entries: FinancialEntry[],
  period_days: number = 30
): EnhancedFinanceSummary {
  return computeEnhancedFinanceSummary(entries, period_days);
}

/**
 * Generate alerts with enhanced detection
 */
export function generateAlerts(
  context: OperationalContext,
  userId: string
): Omit<Alert, 'id' | 'date'>[] {
  const alerts: Omit<Alert, 'id' | 'date'>[] = [];

  // Finance alert: spending spike (dynamic baseline)
  const baseline = context.finance.avg_daily_spending * 0.8; // 80% of average as baseline
  if (context.finance.avg_daily_spending > baseline * 1.5) {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: 'Gastos acima do esperado. Revise suas despesas.',
      resolved: false,
    });
  }

  // Finance alert: low forecast
  if (context.finance.forecast_days > 0 && context.finance.forecast_days < 7) {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: `Caixa crítico: ${context.finance.forecast_days} dias até saldo zero.`,
      resolved: false,
    });
  }

  // Project overload alert
  if (context.projects.active_count > 5) {
    alerts.push({
      user_id: userId,
      type: 'overload',
      message: `Muitos projetos ativos (${context.projects.active_count}). Considere pausar alguns.`,
      resolved: false,
    });
  }

  // Stalled projects alert
  if (context.projects.stalled_count > 0) {
    alerts.push({
      user_id: userId,
      type: 'project',
      message: `${context.projects.stalled_count} projeto(s) travado(s). Defina próximas ações.`,
      resolved: false,
    });
  }

  return alerts;
}

/**
 * NEW: Generate advanced alerts using insights engine
 */
export function generateAdvancedAlerts(
  insights: OperationalInsights,
  userId: string
): Omit<Alert, 'id' | 'date'>[] {
  const alerts: Omit<Alert, 'id' | 'date'>[] = [];

  // Health score alerts
  if (insights.health_score < 30) {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: `⚠️ Saúde operacional crítica: ${insights.health_score}/100`,
      resolved: false,
    });
  } else if (insights.health_score < 60) {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: `⚡ Atenção à saúde operacional: ${insights.health_score}/100`,
      resolved: false,
    });
  }

  // Spending anomaly
  if (insights.finance.anomaly_detected) {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: '🔍 Padrão incomum detectado nos gastos recentes',
      resolved: false,
    });
  }

  // Spending trend
  if (insights.finance.spending_trend === 'increasing') {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: '📈 Tendência de aumento nos gastos detectada',
      resolved: false,
    });
  }

  // Low forecast
  if (insights.finance.forecast_days < 7) {
    alerts.push({
      user_id: userId,
      type: 'finance',
      message: `🚨 Caixa crítico: apenas ${insights.finance.forecast_days} dias de runway`,
      resolved: false,
    });
  }

  // Energy pattern warning
  if (insights.energy_pattern.current_streak === 0) {
    alerts.push({
      user_id: userId,
      type: 'overload',
      message: '😴 Energia baixa: considere descanso ou atividades leves hoje',
      resolved: false,
    });
  }

  // Warnings from insights
  insights.warnings.forEach((warning) => {
    alerts.push({
      user_id: userId,
      type: 'project',
      message: `⚠️ ${warning}`,
      resolved: false,
    });
  });

  return alerts;
}

/**
 * Compute the "Action-Mother" with AI-like prioritization
 */
export function computeActionMother(context: OperationalContext): string {
  const state = context.checkin.estado_calculado || computeState(context.checkin);
  const { caixa_status, energia } = context.checkin;

  // CRITICAL state: focus on finance recovery
  if (state === 'CRITICAL') {
    if (caixa_status === 'critico') {
      return '🔴 Prioridade máxima: Resolver caixa (entradas urgentes ou cortar despesas grandes)';
    }
    return '🔴 Recuperar energia e estabilizar caixa antes de avançar em projetos';
  }

  // ATTACK state: advance strategic project
  if (state === 'ATTACK') {
    return '🟢 Avançar projeto estratégico: executar próxima ação do projeto prioritário';
  }

  // CAUTION state
  if (energia === 'baixa') {
    return '🟡 Focar em tarefas leves e organização; evitar decisões complexas';
  }

  if (context.projects.active_count === 0) {
    return '🟡 Definir objetivos: criar ou reativar um projeto prioritário';
  }

  return '🟡 Manter ritmo: completar tarefas planejadas e monitorar caixa';
}

/**
 * NEW: Compute advanced action recommendations using insights
 */
export function computeAdvancedActionMother(insights: OperationalInsights): string {
  const state = insights.current_state;
  const healthScore = insights.health_score;

  // CRITICAL state with specific guidance
  if (state === 'CRITICAL') {
    if (insights.finance.forecast_days < 7) {
      return '🔴 URGENTE: Gerar entrada imediata ou cortar despesa crítica hoje';
    }
    if (healthScore < 30) {
      return '🔴 Estabilizar: Pausar projetos novos, resolver alertas críticos, descansar';
    }
    return '🔴 Recuperação: Focar em resolver alertas e estabilizar indicadores';
  }

  // ATTACK state with intelligent prioritization
  if (state === 'ATTACK') {
    if (insights.top_priority_project) {
      return `🟢 EXECUTAR: Avançar "${insights.top_priority_project}" - momento ideal para progresso`;
    }
    if (insights.energy_pattern.current_streak > 3) {
      return '🟢 Momento excelente: Aproveitar streak de energia para projetos complexos';
    }
    return '🟢 Modo produtivo: Executar tarefas de alto impacto e avançar projetos';
  }

  // CAUTION state with contextual recommendations
  if (insights.recommended_actions.length > 0) {
    return `🟡 ${insights.recommended_actions[0]}`;
  }

  if (insights.energy_pattern.current_streak === 0) {
    return '🟡 Preservar energia: Tarefas administrativas e organização hoje';
  }

  return '🟡 Manter ritmo estável: Cumprir rotina e monitorar indicadores';
}

/**
 * Compute operational guidance
 */
export function computeGuidance(state: EstadoCalculado, alerts: Alert[]): Guidance {
  const criticalAlerts = alerts.filter(
    (a) => !a.resolved && (a.type === 'finance' || a.type === 'overload')
  );

  if (state === 'CRITICAL' || criticalAlerts.length > 0) {
    return {
      mode: 'CUT',
      text: 'Modo contenção: pause novos projetos, resolva urgências, proteja energia.',
    };
  }

  if (state === 'ATTACK') {
    return {
      mode: 'DO',
      text: 'Modo execução: avance projetos, aproveite energia alta, tome decisões.',
    };
  }

  return {
    mode: 'HOLD',
    text: 'Modo estável: mantenha ritmo, monitore indicadores, evite sobrecarga.',
  };
}

/**
 * NEW: Compute advanced guidance with personalized recommendations
 */
export function computeAdvancedGuidance(insights: OperationalInsights): Guidance {
  const state = insights.current_state;
  const healthScore = insights.health_score;

  if (state === 'CRITICAL' || healthScore < 40) {
    const actions = insights.recommended_actions.slice(0, 2).join('. ');
    return {
      mode: 'CUT',
      text: `Modo emergência: ${actions || 'Resolver alertas críticos imediatamente'}`,
    };
  }

  if (state === 'ATTACK' && healthScore > 70) {
    const topProject = insights.top_priority_project || 'projetos prioritários';
    return {
      mode: 'DO',
      text: `Momento ideal: Energia alta + caixa estável. Avançar ${topProject} com foco total.`,
    };
  }

  if (insights.finance.spending_trend === 'increasing') {
    return {
      mode: 'HOLD',
      text: 'Modo atenção: Gastos crescendo. Revisar despesas e manter controle rigoroso.',
    };
  }

  return {
    mode: 'HOLD',
    text: 'Modo estável: Manter rotina produtiva e monitorar métricas regularmente.',
  };
}

/**
 * NEW: Calculate overall health score
 * Returns 0-100 score based on finance, energy, and project health
 */
export function calculateHealthScore(
  finance: EnhancedFinanceSummary,
  checkin: DailyCheckin,
  projects: { active_count: number; stalled_count: number }
): number {
  let score = 100;

  // Finance health (50%)
  score -= (100 - finance.health_score) * 0.5;

  // Energy health (30%)
  const energyPenalty =
    checkin.energia === 'baixa' ? 30 : checkin.energia === 'media' ? 10 : 0;
  score -= energyPenalty * 0.3;

  // Project health (20%)
  const projectPenalty =
    projects.stalled_count * 10 + Math.max(0, projects.active_count - 3) * 5;
  score -= Math.min(projectPenalty, 20);

  return Math.max(0, Math.min(100, Math.round(score)));
}
