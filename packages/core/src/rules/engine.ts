import { DailyCheckin, EstadoCalculado } from '../entities/daily-checkin';
import { Alert } from '../entities/alert';
import { OperationalContext, Guidance } from './types';

/**
 * Core rules engine - computes operational state, alerts, action-mother, and guidance.
 * Pure functions, no side effects, testable.
 */

/**
 * Computes the operational state from a daily check-in.
 * Rules:
 * - CRITICAL: caixa=critico OR (caixa=atencao AND energia=baixa)
 * - ATTACK: caixa=tranquilo AND energia=alta AND pressao!=alta
 * - CAUTION: everything else
 */
export function computeState(checkin: DailyCheckin): EstadoCalculado {
  const { caixa_status, energia, pressao } = checkin;

  // Critical conditions
  if (caixa_status === 'critico') {
    return 'CRITICAL';
  }
  if (caixa_status === 'atencao' && energia === 'baixa') {
    return 'CRITICAL';
  }

  // Attack conditions
  if (caixa_status === 'tranquilo' && energia === 'alta' && pressao !== 'alta') {
    return 'ATTACK';
  }

  // Default to caution
  return 'CAUTION';
}

/**
 * Generates alerts based on the operational context.
 */
export function generateAlerts(
  context: OperationalContext,
  userId: string
): Omit<Alert, 'id' | 'date'>[] {
  const alerts: Omit<Alert, 'id' | 'date'>[] = [];

  // Finance alert: spending spike (avg > 2x baseline assumed as 1000/day)
  const baseline = 1000 * 100; // 1000 in cents
  if (context.finance.avg_daily_spending > baseline * 2) {
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
 * Computes the "Action-Mother" - the ONE thing to do today.
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
 * Computes guidance based on state and alerts.
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
