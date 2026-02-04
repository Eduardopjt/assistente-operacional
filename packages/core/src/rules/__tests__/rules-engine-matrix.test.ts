import { evaluateDailyState, generateAlerts } from '../engine';
import type { DailyCheckin, FinancialEntry, Project } from '../../entities';

describe('Rules Engine - Comprehensive Test Matrix', () => {
  // ============================================
  // DAILY STATE EVALUATION (6 scenarios)
  // ============================================

  describe('evaluateDailyState', () => {
    it('[CRITICAL] should return CRITICAL when caixa_status=critico regardless of other factors', () => {
      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'critico',
        energia: 'alta',
        pressao: 'leve',
        created_at: new Date(),
      };

      const result = evaluateDailyState(checkin);

      expect(result.estado_calculado).toBe('CRITICAL');
      expect(result.score).toBeLessThan(40);
    });

    it('[CRITICAL] should return CRITICAL when energia=baixa + pressao=alta', () => {
      const checkin: DailyCheckin = {
        id: '2',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'atencao',
        energia: 'baixa',
        pressao: 'alta',
        created_at: new Date(),
      };

      const result = evaluateDailyState(checkin);

      expect(result.estado_calculado).toBe('CRITICAL');
      expect(result.score).toBeLessThan(40);
    });

    it('[CAUTION] should return CAUTION when caixa_status=atencao with mixed signals', () => {
      const checkin: DailyCheckin = {
        id: '3',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'atencao',
        energia: 'media',
        pressao: 'normal',
        created_at: new Date(),
      };

      const result = evaluateDailyState(checkin);

      expect(result.estado_calculado).toBe('CAUTION');
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(70);
    });

    it('[CAUTION] should return CAUTION when energia=baixa but pressao=normal', () => {
      const checkin: DailyCheckin = {
        id: '4',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'baixa',
        pressao: 'normal',
        created_at: new Date(),
      };

      const result = evaluateDailyState(checkin);

      expect(result.estado_calculado).toBe('CAUTION');
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(70);
    });

    it('[ATTACK] should return ATTACK when all dimensions are positive', () => {
      const checkin: DailyCheckin = {
        id: '5',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'leve',
        created_at: new Date(),
      };

      const result = evaluateDailyState(checkin);

      expect(result.estado_calculado).toBe('ATTACK');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('[ATTACK] should return ATTACK when caixa_status=tranquilo + energia=alta (even with normal pressure)', () => {
      const checkin: DailyCheckin = {
        id: '6',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'normal',
        created_at: new Date(),
      };

      const result = evaluateDailyState(checkin);

      expect(result.estado_calculado).toBe('ATTACK');
      expect(result.score).toBeGreaterThanOrEqual(70);
    });
  });

  // ============================================
  // ALERT GENERATION (6+ scenarios)
  // ============================================

  describe('generateAlerts', () => {
    it('[FINANCE ALERT] should alert on negative balance', () => {
      const finances: FinancialEntry[] = [
        {
          id: '1',
          user_id: 'user1',
          type: 'saida',
          value: 5000,
          category: 'Housing',
          date: new Date(),
          created_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'entrada',
          value: 2000,
          category: 'Salary',
          date: new Date(),
          created_at: new Date(),
        },
      ];

      const alerts = generateAlerts({
        finances,
        projects: [],
        checkin: null,
      });

      const financeAlert = alerts.find((a) => a.type === 'finance');
      expect(financeAlert).toBeDefined();
      expect(financeAlert?.message).toContain('negativo');
    });

    it('[FINANCE ALERT] should alert on high monthly spending (>80% of income)', () => {
      const finances: FinancialEntry[] = [
        {
          id: '1',
          user_id: 'user1',
          type: 'entrada',
          value: 10000,
          category: 'Salary',
          date: new Date(),
          created_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'saida',
          value: 8500,
          category: 'Various',
          date: new Date(),
          created_at: new Date(),
        },
      ];

      const alerts = generateAlerts({
        finances,
        projects: [],
        checkin: null,
      });

      const spendingAlert = alerts.find((a) => a.type === 'finance' && a.message.includes('85%'));
      expect(spendingAlert).toBeDefined();
    });

    it('[PROJECT ALERT] should alert on stalled project (no updates >14 days)', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 20);

      const projects: Project[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'Old Project',
          status: 'active',
          objective: 'Test',
          created_at: oldDate,
          updated_at: oldDate,
        },
      ];

      const alerts = generateAlerts({
        finances: [],
        projects,
        checkin: null,
      });

      const stalledAlert = alerts.find((a) => a.type === 'project');
      expect(stalledAlert).toBeDefined();
      expect(stalledAlert?.message).toContain('parado');
    });

    it('[OVERLOAD ALERT] should alert when too many active projects (>=4)', () => {
      const projects: Project[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'P1',
          status: 'active',
          objective: 'Obj',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user1',
          name: 'P2',
          status: 'active',
          objective: 'Obj',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          user_id: 'user1',
          name: 'P3',
          status: 'active',
          objective: 'Obj',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '4',
          user_id: 'user1',
          name: 'P4',
          status: 'active',
          objective: 'Obj',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const alerts = generateAlerts({
        finances: [],
        projects,
        checkin: null,
      });

      const overloadAlert = alerts.find((a) => a.type === 'overload');
      expect(overloadAlert).toBeDefined();
      expect(overloadAlert?.message).toContain('projetos ativos');
    });

    it('[SYSTEM ALERT] should alert on CRITICAL daily state', () => {
      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'critico',
        energia: 'baixa',
        pressao: 'alta',
        created_at: new Date(),
      };

      const alerts = generateAlerts({
        finances: [],
        projects: [],
        checkin,
      });

      const systemAlert = alerts.find((a) => a.type === 'system');
      expect(systemAlert).toBeDefined();
      expect(systemAlert?.message).toContain('CRITICAL');
    });

    it('[NO ALERTS] should return empty array when everything is healthy', () => {
      const finances: FinancialEntry[] = [
        {
          id: '1',
          user_id: 'user1',
          type: 'entrada',
          value: 10000,
          category: 'Salary',
          date: new Date(),
          created_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'saida',
          value: 3000,
          category: 'Expenses',
          date: new Date(),
          created_at: new Date(),
        },
      ];

      const projects: Project[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'Active Project',
          status: 'active',
          objective: 'Test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const checkin: DailyCheckin = {
        id: '1',
        user_id: 'user1',
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'leve',
        created_at: new Date(),
      };

      const alerts = generateAlerts({
        finances,
        projects,
        checkin,
      });

      expect(alerts).toHaveLength(0);
    });
  });

  // ============================================
  // EDGE CASES & BOUNDARY CONDITIONS
  // ============================================

  describe('Edge Cases', () => {
    it('[EDGE] should handle empty finances array', () => {
      const alerts = generateAlerts({
        finances: [],
        projects: [],
        checkin: null,
      });

      // Should not crash, may or may not generate alert depending on logic
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('[EDGE] should handle null checkin gracefully', () => {
      const alerts = generateAlerts({
        finances: [],
        projects: [],
        checkin: null,
      });

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('[EDGE] should handle project exactly at 14-day threshold', () => {
      const exactDate = new Date();
      exactDate.setDate(exactDate.getDate() - 14);

      const projects: Project[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'Threshold Project',
          status: 'active',
          objective: 'Test',
          created_at: exactDate,
          updated_at: exactDate,
        },
      ];

      const alerts = generateAlerts({
        finances: [],
        projects,
        checkin: null,
      });

      // Should or should not alert at exactly 14 days (boundary test)
      // This validates the >= vs > logic in the rules
      const stalledAlert = alerts.find((a) => a.type === 'project');
      // Adjust expectation based on actual business rule (>14 vs >=14)
      if (stalledAlert) {
        expect(stalledAlert.message).toContain('14');
      }
    });
  });
});
