/**
 * Intelligent Check-in Suggestions
 * Analyzes historical patterns to suggest check-in values
 */

import { DailyCheckin, CaixaStatus, Energia, Pressao } from '../entities';

export interface CheckinSuggestion {
  caixa: CaixaStatus;
  energia: Energia;
  pressao: Pressao;
  confidence: number; // 0-1
  reasoning: string;
}

export interface CheckinPattern {
  mostCommonCaixa: CaixaStatus;
  mostCommonEnergia: Energia;
  mostCommonPressao: Pressao;
  weekdayPatterns: Map<number, Partial<DailyCheckin>>;
  recentTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Analyze historical check-ins to find patterns
 */
export function analyzeCheckinPatterns(
  history: DailyCheckin[],
  lookbackDays: number = 30
): CheckinPattern {
  const recent = history.slice(0, lookbackDays);

  // Count occurrences
  const caixaCounts = new Map<CaixaStatus, number>();
  const energiaCounts = new Map<Energia, number>();
  const pressaoCounts = new Map<Pressao, number>();
  const weekdayData = new Map<number, DailyCheckin[]>();

  for (const checkin of recent) {
    // Count by dimension
    caixaCounts.set(checkin.caixa_status, (caixaCounts.get(checkin.caixa_status) || 0) + 1);
    energiaCounts.set(checkin.energia, (energiaCounts.get(checkin.energia) || 0) + 1);
    pressaoCounts.set(checkin.pressao, (pressaoCounts.get(checkin.pressao) || 0) + 1);

    // Group by weekday
    const weekday = new Date(checkin.date).getDay();
    if (!weekdayData.has(weekday)) weekdayData.set(weekday, []);
    weekdayData.get(weekday)!.push(checkin);
  }

  // Find most common values
  const mostCommonCaixa = Array.from(caixaCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  const mostCommonEnergia = Array.from(energiaCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  const mostCommonPressao = Array.from(pressaoCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

  // Analyze trend (last 7 days vs previous 7 days)
  const last7 = recent.slice(0, 7);
  const prev7 = recent.slice(7, 14);

  const last7Score = calculateWellbeingScoreFromCheckins(last7);
  const prev7Score = calculateWellbeingScoreFromCheckins(prev7);

  let recentTrend: 'improving' | 'stable' | 'declining';
  if (last7Score > prev7Score + 0.1) recentTrend = 'improving';
  else if (last7Score < prev7Score - 0.1) recentTrend = 'declining';
  else recentTrend = 'stable';

  // Calculate weekday patterns
  const weekdayPatterns = new Map<number, Partial<DailyCheckin>>();
  for (const [weekday, checkins] of weekdayData.entries()) {
    if (checkins.length >= 2) {
      const caixaMode = mode(checkins.map((c) => c.caixa_status));
      const energiaMode = mode(checkins.map((c) => c.energia));
      const pressaoMode = mode(checkins.map((c) => c.pressao));

      weekdayPatterns.set(weekday, {
        caixa_status: caixaMode,
        energia: energiaMode,
        pressao: pressaoMode,
      });
    }
  }

  return {
    mostCommonCaixa,
    mostCommonEnergia,
    mostCommonPressao,
    weekdayPatterns,
    recentTrend,
  };
}

/**
 * Generate smart check-in suggestion
 */
export function suggestCheckinValues(
  history: DailyCheckin[],
  targetDate: Date = new Date()
): CheckinSuggestion {
  if (history.length === 0) {
    // No history - suggest neutral defaults
    return {
      caixa: 'atencao',
      energia: 'media',
      pressao: 'normal',
      confidence: 0.3,
      reasoning: 'Valores padrão (sem histórico)',
    };
  }

  const patterns = analyzeCheckinPatterns(history);
  const weekday = targetDate.getDay();

  // Check if we have weekday-specific pattern
  const weekdayPattern = patterns.weekdayPatterns.get(weekday);

  if (weekdayPattern && history.length >= 7) {
    // Strong weekday pattern
    return {
      caixa: weekdayPattern.caixa_status || patterns.mostCommonCaixa,
      energia: weekdayPattern.energia || patterns.mostCommonEnergia,
      pressao: weekdayPattern.pressao || patterns.mostCommonPressao,
      confidence: 0.75,
      reasoning: `Baseado em ${getDayName(weekday)}s anteriores`,
    };
  }

  // Use overall patterns
  let confidence = 0.6;
  let reasoning = 'Baseado nos últimos 30 dias';

  if (history.length < 7) {
    confidence = 0.4;
    reasoning = 'Baseado em poucos dados';
  } else if (history.length >= 21) {
    confidence = 0.7;
    reasoning = 'Baseado em padrão consistente';
  }

  // Adjust for trend
  let suggestedCaixa = patterns.mostCommonCaixa;
  let suggestedEnergia = patterns.mostCommonEnergia;
  let suggestedPressao = patterns.mostCommonPressao;

  if (patterns.recentTrend === 'declining') {
    suggestedEnergia = downgradeDimension(suggestedEnergia, ['alta', 'media', 'baixa']);
    reasoning += ' (tendência de queda)';
  } else if (patterns.recentTrend === 'improving') {
    suggestedEnergia = upgradeDimension(suggestedEnergia, ['baixa', 'media', 'alta']);
    reasoning += ' (tendência de melhora)';
  }

  return {
    caixa: suggestedCaixa,
    energia: suggestedEnergia,
    pressao: suggestedPressao,
    confidence,
    reasoning,
  };
}

/**
 * Calculate overall wellbeing score from multiple check-ins (internal)
 */
function calculateWellbeingScoreFromCheckins(checkins: DailyCheckin[]): number {
  if (checkins.length === 0) return 0.5;

  const scores = checkins.map((c) => {
    let score = 0;

    // Caixa (40% weight)
    if (c.caixa_status === 'tranquilo') score += 0.4;
    else if (c.caixa_status === 'atencao') score += 0.2;

    // Energia (35% weight)
    if (c.energia === 'alta') score += 0.35;
    else if (c.energia === 'media') score += 0.175;

    // Pressão (25% weight)
    if (c.pressao === 'leve') score += 0.25;
    else if (c.pressao === 'normal') score += 0.125;

    return score;
  });

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Calculate overall wellbeing score (0-100) from individual check-in dimensions (public API)
 */
export function calculateWellbeingScore(caixa: number, energia: Energia, pressao: Pressao): number {
  let score = 0;

  // Caixa (40% weight) - normalize 0-10 to 0-40
  score += (caixa / 10) * 40;

  // Energia (35% weight)
  if (energia === 'alta') score += 35;
  else if (energia === 'media') score += 17.5;

  // Pressão (25% weight) - inverted: leve = high, alta = low
  if (pressao === 'leve') score += 25;
  else if (pressao === 'normal') score += 12.5;

  return Math.round(score);
}

/**
 * Find mode (most common value) in array
 */
function mode<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Get day name in Portuguese
 */
function getDayName(weekday: number): string {
  const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return names[weekday];
}

/**
 * Downgrade a dimension value
 */
function downgradeDimension<T>(current: T, scale: T[]): T {
  const index = scale.indexOf(current);
  return index > 0 ? scale[index - 1] : current;
}

/**
 * Upgrade a dimension value
 */
function upgradeDimension<T>(current: T, scale: T[]): T {
  const index = scale.indexOf(current);
  return index < scale.length - 1 ? scale[index + 1] : current;
}
