import { computeState, generateAlerts, computeActionMother, computeGuidance } from '../engine';
import { DailyCheckin } from '../../entities/daily-checkin';
import { OperationalContext } from '../types';

describe('Rules Engine', () => {
  describe('computeState', () => {
    it('should return CRITICAL when caixa is critico', () => {
      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'u1',
        date: new Date(),
        caixa_status: 'critico',
        energia: 'alta',
        pressao: 'leve',
      };
      expect(computeState(checkin)).toBe('CRITICAL');
    });

    it('should return CRITICAL when caixa is atencao and energia is baixa', () => {
      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'u1',
        date: new Date(),
        caixa_status: 'atencao',
        energia: 'baixa',
        pressao: 'normal',
      };
      expect(computeState(checkin)).toBe('CRITICAL');
    });

    it('should return ATTACK when conditions are optimal', () => {
      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'u1',
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'leve',
      };
      expect(computeState(checkin)).toBe('ATTACK');
    });

    it('should return CAUTION for mixed conditions', () => {
      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'u1',
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'media',
        pressao: 'normal',
      };
      expect(computeState(checkin)).toBe('CAUTION');
    });
  });

  describe('generateAlerts', () => {
    it('should generate finance alert when spending is high', () => {
      const context: OperationalContext = {
        checkin: {
          id: '1',
          user_id: 'u1',
          date: new Date(),
          caixa_status: 'tranquilo',
          energia: 'alta',
          pressao: 'leve',
        },
        finance: {
          total_entradas: 500000,
          total_saidas: 400000,
          balance: 100000,
          avg_daily_spending: 250000, // > 2x baseline
          forecast_days: 30,
        },
        projects: {
          active_count: 2,
          paused_count: 0,
          done_count: 5,
          stalled_count: 0,
        },
      };

      const alerts = generateAlerts(context, 'u1');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('finance');
      expect(alerts[0].message).toContain('Gastos acima do esperado');
    });

    it('should generate overload alert when too many active projects', () => {
      const context: OperationalContext = {
        checkin: {
          id: '1',
          user_id: 'u1',
          date: new Date(),
          caixa_status: 'tranquilo',
          energia: 'alta',
          pressao: 'leve',
        },
        finance: {
          total_entradas: 500000,
          total_saidas: 300000,
          balance: 200000,
          avg_daily_spending: 50000,
          forecast_days: 60,
        },
        projects: {
          active_count: 8,
          paused_count: 0,
          done_count: 5,
          stalled_count: 0,
        },
      };

      const alerts = generateAlerts(context, 'u1');
      const overloadAlert = alerts.find((a) => a.type === 'overload');
      expect(overloadAlert).toBeDefined();
      expect(overloadAlert?.message).toContain('Muitos projetos ativos');
    });
  });

  describe('computeActionMother', () => {
    it('should prioritize finance in CRITICAL state', () => {
      const context: OperationalContext = {
        checkin: {
          id: '1',
          user_id: 'u1',
          date: new Date(),
          caixa_status: 'critico',
          energia: 'baixa',
          pressao: 'alta',
          estado_calculado: 'CRITICAL',
        },
        finance: {
          total_entradas: 100000,
          total_saidas: 200000,
          balance: -100000,
          avg_daily_spending: 10000,
          forecast_days: 0,
        },
        projects: {
          active_count: 3,
          paused_count: 0,
          done_count: 0,
          stalled_count: 1,
        },
      };

      const action = computeActionMother(context);
      expect(action).toContain('caixa');
      expect(action).toContain('🔴');
    });

    it('should suggest project advancement in ATTACK state', () => {
      const context: OperationalContext = {
        checkin: {
          id: '1',
          user_id: 'u1',
          date: new Date(),
          caixa_status: 'tranquilo',
          energia: 'alta',
          pressao: 'leve',
          estado_calculado: 'ATTACK',
        },
        finance: {
          total_entradas: 500000,
          total_saidas: 200000,
          balance: 300000,
          avg_daily_spending: 50000,
          forecast_days: 90,
        },
        projects: {
          active_count: 2,
          paused_count: 0,
          done_count: 5,
          stalled_count: 0,
        },
      };

      const action = computeActionMother(context);
      expect(action).toContain('projeto estratégico');
      expect(action).toContain('🟢');
    });
  });

  describe('computeGuidance', () => {
    it('should return CUT mode in CRITICAL state', () => {
      const guidance = computeGuidance('CRITICAL', []);
      expect(guidance.mode).toBe('CUT');
      expect(guidance.text).toContain('contenção');
    });

    it('should return DO mode in ATTACK state', () => {
      const guidance = computeGuidance('ATTACK', []);
      expect(guidance.mode).toBe('DO');
      expect(guidance.text).toContain('execução');
    });

    it('should return HOLD mode in CAUTION state', () => {
      const guidance = computeGuidance('CAUTION', []);
      expect(guidance.mode).toBe('HOLD');
      expect(guidance.text).toContain('estável');
    });
  });
});
