/**
 * Tests for Overload Protection
 */

import { describe, it, expect } from '@jest/globals';
import {
  assessOverload,
  isOverloaded,
  suggestRestDay,
} from '../../automations/overload-protection';
import { DailyCheckin } from '../../entities/daily-checkin';
import { Project } from '../../entities/project';

describe('assessOverload', () => {
  it('should detect no overload for healthy patterns', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'tranquilo',
      energia: 'alta',
      pressao: 'leve',
    }));

    const projects: Project[] = [
      { id: '1', user_id: 'user1', name: 'P1', status: 'active', objective: 'Test', created_at: new Date(), updated_at: new Date() },
      { id: '2', user_id: 'user1', name: 'P2', status: 'active', objective: 'Test', created_at: new Date(), updated_at: new Date() },
    ];

    const assessment = assessOverload(checkins, projects);

    expect(assessment.overloadLevel).toBe('none');
    expect(assessment.score).toBeLessThan(25);
  });

  it('should detect moderate overload for some issues', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'atencao',
      energia: i < 3 ? ('baixa' as const) : ('media' as const), // 3 low energy days
      pressao: 'normal',
    }));

    const projects: Project[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      name: `P${i}`,
      status: 'active',
      objective: 'Test',
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const assessment = assessOverload(checkins, projects);

    expect(assessment.overloadLevel).toMatch(/moderate|high/);
    expect(assessment.factors.length).toBeGreaterThan(0);
  });

  it('should detect high overload for multiple severe factors', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'critico',
      energia: 'baixa', // All low energy
      pressao: 'alta', // All high pressure
    }));

    const projects: Project[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      name: `P${i}`,
      status: 'active',
      objective: 'Test',
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const assessment = assessOverload(checkins, projects);

    expect(assessment.overloadLevel).toMatch(/high|critical/);
    expect(assessment.score).toBeGreaterThan(50);
    expect(assessment.shouldPauseProjects).toBe(true);
  });

  it('should detect consecutive bad days factor', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = [
      // 4 consecutive bad days
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `bad-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        caixa_status: 'critico' as const,
        energia: 'baixa' as const,
        pressao: 'alta' as const,
      })),
      // Then some good days
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `good-${i}`,
        user_id: 'user1',
        date: new Date(today.getTime() - (i + 4) * 24 * 60 * 60 * 1000),
        caixa_status: 'tranquilo' as const,
        energia: 'alta' as const,
        pressao: 'leve' as const,
      })),
    ];

    const assessment = assessOverload(checkins, []);

    const consecutiveFactor = assessment.factors.find(
      (f) => f.type === 'consecutive_bad_days'
    );
    expect(consecutiveFactor).toBeDefined();
  });

  it('should detect no rest days factor', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'atencao',
      energia: 'media',
      pressao: 'alta', // No "leve" pressure days
    }));

    const assessment = assessOverload(checkins, []);

    const noRestFactor = assessment.factors.find((f) => f.type === 'no_rest_days');
    expect(noRestFactor).toBeDefined();
  });

  it('should suggest pausing projects when overloaded', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'critico',
      energia: 'baixa',
      pressao: 'alta',
    }));

    const projects: Project[] = [
      {
        id: '1',
        user_id: 'user1',
        name: 'P1',
        status: 'active',
        objective: 'Test',
        next_action: 'Do something',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '2',
        user_id: 'user1',
        name: 'P2',
        status: 'active',
        objective: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      }, // No next_action
      {
        id: '3',
        user_id: 'user1',
        name: 'P3',
        status: 'active',
        objective: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '4',
        user_id: 'user1',
        name: 'P4',
        status: 'active',
        objective: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '5',
        user_id: 'user1',
        name: 'P5',
        status: 'active',
        objective: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const assessment = assessOverload(checkins, projects);

    expect(assessment.shouldPauseProjects).toBe(true);
    expect(assessment.projectsToPause.length).toBeGreaterThan(0);
    // Should prioritize pausing projects without next_action
    expect(assessment.projectsToPause).toContain('2');
  });

  it('should provide actionable recommendations', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'critico',
      energia: 'baixa',
      pressao: 'alta',
    }));

    const assessment = assessOverload(checkins, []);

    expect(assessment.recommendations.length).toBeGreaterThan(0);
    expect(assessment.recommendations[0]).toBeTruthy();
  });
});

describe('isOverloaded', () => {
  it('should return true for critical overload', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'critico',
      energia: 'baixa',
      pressao: 'alta',
    }));

    expect(isOverloaded(checkins)).toBe(true);
  });

  it('should return false for healthy state', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'tranquilo',
      energia: 'alta',
      pressao: 'leve',
    }));

    expect(isOverloaded(checkins)).toBe(false);
  });
});

describe('suggestRestDay', () => {
  it('should suggest rest when no rest days in last 7 days', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'atencao',
      energia: 'media',
      pressao: 'alta', // No "leve"
    }));

    expect(suggestRestDay(checkins)).toBe(true);
  });

  it('should suggest rest for low average energy', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'atencao',
      energia: 'baixa', // All low energy
      pressao: 'normal',
    }));

    expect(suggestRestDay(checkins)).toBe(true);
  });

  it('should not suggest rest for balanced week', () => {
    const today = new Date();
    const checkins: DailyCheckin[] = Array.from({ length: 7 }, (_, i) => ({
      id: `${i}`,
      user_id: 'user1',
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      caixa_status: 'tranquilo',
      energia: i < 2 ? ('baixa' as const) : ('alta' as const), // Some rest days
      pressao: i < 2 ? ('leve' as const) : ('normal' as const),
    }));

    expect(suggestRestDay(checkins)).toBe(false);
  });
});
