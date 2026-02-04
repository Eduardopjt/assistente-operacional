import { DailyCheckin } from '../entities/daily-checkin';

export type GuidanceMode = 'DO' | 'HOLD' | 'CUT';

export interface Guidance {
  mode: GuidanceMode;
  text: string;
}

export interface FinanceSummary {
  total_entradas: number; // last 30 days
  total_saidas: number; // last 30 days
  balance: number;
  avg_daily_spending: number;
  forecast_days: number; // days until balance hits zero (simple)
}

export interface ProjectStats {
  active_count: number;
  paused_count: number;
  done_count: number;
  stalled_count: number; // projects with no recent activity
}

export interface OperationalContext {
  checkin: DailyCheckin;
  finance: FinanceSummary;
  projects: ProjectStats;
}
