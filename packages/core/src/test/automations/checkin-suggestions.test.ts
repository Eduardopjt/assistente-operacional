/**
 * Tests for Check-in Suggestions
 */

import { describe, it, expect } from '@jest/globals';
import {
  analyzeCheckinPatterns,
  suggestCheckinValues,
} from '../../automations/checkin-suggestions';
import { DailyCheckin } from '../../entities/daily-checkin';

describe('analyzeCheckinPatterns', () => {
  it('should find most common values with sufficient history', () => {
    const history: DailyCheckin[] = [
      {
        id: '1',
        user_id: 'user1',
        date: new Date('2024-01-15'),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'normal',
      },
      {
        id: '2',
        user_id: 'user1',
        date: new Date('2024-01-14'),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'normal',
      },
      {
        id: '3',
        user_id: 'user1',
        date: new Date('2024-01-13'),
        caixa_status: 'atencao',
        energia: 'media',
        pressao: 'leve',
      },
    ];

    const patterns = analyzeCheckinPatterns(history);

    expect(patterns.mostCommonCaixa).toBe('tranquilo');
    expect(patterns.mostCommonEnergia).toBe('alta');
    expect(patterns.mostCommonPressao).toBe('normal');
  });

  it('should detect weekday patterns', () => {
    const monday = new Date('2024-01-02'); // Tuesday (getDay() = 1)
    const history: DailyCheckin[] = Array.from({ length: 8 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(monday.getTime() - i * 7 * 24 * 60 * 60 * 1000), // Every Monday
      caixa_status: 'tranquilo',
      energia: 'alta',
      pressao: 'alta',
    }));

    const patterns = analyzeCheckinPatterns(history);
    const mondayPattern = patterns.weekdayPatterns.get(1); // Monday = 1

    expect(mondayPattern).toBeDefined();
    expect(mondayPattern?.caixa_status).toBe('tranquilo');
    expect(mondayPattern?.energia).toBe('alta');
  });

  it('should detect improving trends', () => {
    const today = new Date();
    const history: DailyCheckin[] = [
      // Last 7 days: high scores
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `recent-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        caixa_status: 'tranquilo' as const,
        energia: 'alta' as const,
        pressao: 'leve' as const,
      })),
      // Previous 7 days: low scores
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `old-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - (i + 7) * 24 * 60 * 60 * 1000),
        caixa_status: 'critico' as const,
        energia: 'baixa' as const,
        pressao: 'alta' as const,
      })),
    ];

    const patterns = analyzeCheckinPatterns(history);

    expect(patterns.recentTrend).toBe('improving');
  });

  it('should detect declining trends', () => {
    const today = new Date();
    const history: DailyCheckin[] = [
      // Last 7 days: low scores
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `recent-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        caixa_status: 'critico' as const,
        energia: 'baixa' as const,
        pressao: 'alta' as const,
      })),
      // Previous 7 days: high scores
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `old-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - (i + 7) * 24 * 60 * 60 * 1000),
        caixa_status: 'tranquilo' as const,
        energia: 'alta' as const,
        pressao: 'leve' as const,
      })),
    ];

    const patterns = analyzeCheckinPatterns(history);

    expect(patterns.recentTrend).toBe('declining');
  });
});

describe('suggestCheckinValues', () => {
  it('should suggest values with high confidence for rich history', () => {
    const today = new Date();
    const history: DailyCheckin[] = Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'tranquilo',
      energia: 'alta',
      pressao: 'normal',
    }));

    const suggestion = suggestCheckinValues(history, today);

    expect(suggestion.caixa).toBe('tranquilo');
    expect(suggestion.energia).toBe('alta');
    expect(suggestion.pressao).toBe('normal');
    expect(suggestion.confidence).toBeGreaterThan(0.6);
  });

  it('should use defaults for insufficient history', () => {
    const suggestion = suggestCheckinValues([], new Date());

    expect(suggestion.caixa).toBe('atencao');
    expect(suggestion.energia).toBe('media');
    expect(suggestion.pressao).toBe('normal');
    expect(suggestion.confidence).toBe(0.3);
    expect(suggestion.reasoning).toContain('sem histórico');
  });

  it('should prefer weekday patterns when available', () => {
    const monday = new Date('2024-01-02'); // Tuesday (getDay() = 1)
    const history: DailyCheckin[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(monday.getTime() - i * 7 * 24 * 60 * 60 * 1000),
      caixa_status: 'tranquilo',
      energia: 'alta',
      pressao: 'alta',
    }));

    const nextMonday = new Date('2024-01-09'); // Also Monday
    const suggestion = suggestCheckinValues(history, nextMonday);

    expect(suggestion.caixa).toBe('tranquilo');
    expect(suggestion.reasoning).toContain('Segunda'); // Should mention weekday (Segundas anteriores)
  });
});
