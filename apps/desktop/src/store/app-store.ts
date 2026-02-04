import { create } from 'zustand';
import {
  User,
  DailyCheckin,
  FinancialEntry,
  Project,
  Task,
  Alert,
  EstadoCalculado,
  Guidance,
  computeState,
  generateAlerts,
  computeActionMother,
  computeGuidance,
  // Advanced features
  computeAdvancedInsights,
  generateAdvancedAlerts,
  computeAdvancedActionMother,
  computeAdvancedGuidance,
  calculateHealthScore,
} from '@assistente/core';
import type {
  FinanceSummary,
  ProjectStats,
  OperationalInsights,
  EnhancedFinanceSummary,
} from '@assistente/core';

// Helper functions
function calculateFinanceSummary(entries: FinancialEntry[]): FinanceSummary {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recentEntries = entries.filter((e) => new Date(e.date).getTime() >= thirtyDaysAgo);

  const totals = recentEntries.reduce(
    (acc, entry) => {
      if (entry.type === 'entrada') {
        acc.entradas += entry.value;
      } else {
        acc.saidas += entry.value;
      }
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  const balance = totals.entradas - totals.saidas;
  const avgDailySpending = totals.saidas / 30;
  const forecastDays = avgDailySpending > 0 ? Math.floor(balance / avgDailySpending) : 999;

  return {
    total_entradas: totals.entradas,
    total_saidas: totals.saidas,
    balance,
    avg_daily_spending: avgDailySpending,
    forecast_days: Math.max(0, forecastDays),
  };
}

function calculateProjectStats(projects: Project[]): ProjectStats {
  return {
    active_count: projects.filter((p) => p.status === 'active').length,
    paused_count: projects.filter((p) => p.status === 'paused').length,
    done_count: projects.filter((p) => p.status === 'done').length,
    stalled_count: 0, // TODO: Implement stalled detection based on updated_at
  };
}

interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User) => void;

  // Today's context
  todayCheckin: DailyCheckin | null;
  todayState: EstadoCalculado | null;
  actionMother: string | null;
  guidance: Guidance | null;
  alerts: Alert[];

  // Advanced insights
  insights: OperationalInsights | null;
  healthScore: number;
  financeSummary: EnhancedFinanceSummary | null;

  // Collections
  recentCheckins: DailyCheckin[];
  recentFinance: FinancialEntry[];
  activeProjects: Project[];
  pendingTasks: Task[];

  // Actions
  setTodayCheckin: (checkin: DailyCheckin) => void;
  refreshDashboard: (finance: FinancialEntry[], projects: Project[], tasks: Task[]) => void;
  addFinanceEntry: (entry: FinancialEntry) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  addTask: (task: Task) => void;
  completeTask: (taskId: string) => void;
  resolveAlert: (alertId: string) => void;

  // UI state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  todayCheckin: null,
  todayState: null,
  actionMother: null,
  guidance: null,
  alerts: [],
  insights: null,
  healthScore: 0,
  financeSummary: null,
  recentCheckins: [],
  recentFinance: [],
  activeProjects: [],
  pendingTasks: [],
  isLoading: false,

  // User
  setCurrentUser: (user) => set({ currentUser: user }),

  // Today's check-in
  setTodayCheckin: (checkin) => {
    const state = computeState(checkin);
    const { recentFinance, activeProjects, recentCheckins } = get();

    // Use advanced insights
    const insights = computeAdvancedInsights(
      checkin,
      recentCheckins.length > 0 ? recentCheckins : [checkin],
      recentFinance,
      activeProjects,
      {} // taskCompletions - can be added later
    );

    const advancedAlerts = generateAdvancedAlerts(insights, checkin.user_id);
    const advancedAction = computeAdvancedActionMother(insights);
    const advancedGuidance = computeAdvancedGuidance(insights);

    set({
      todayCheckin: { ...checkin, estado_calculado: state },
      todayState: state,
      alerts: advancedAlerts as Alert[],
      actionMother: advancedAction,
      guidance: advancedGuidance,
      insights,
      healthScore: insights.health_score,
      financeSummary: insights.finance,
    });
  },

  // Refresh dashboard
  refreshDashboard: (finance, projects, tasks) => {
    const { todayCheckin, recentCheckins } = get();
    if (!todayCheckin) return;

    // Use advanced insights
    const insights = computeAdvancedInsights(
      todayCheckin,
      recentCheckins.length > 0 ? recentCheckins : [todayCheckin],
      finance,
      projects,
      {}
    );

    const advancedAlerts = generateAdvancedAlerts(insights, todayCheckin.user_id);
    const advancedAction = computeAdvancedActionMother(insights);
    const advancedGuidance = computeAdvancedGuidance(insights);

    set({
      recentFinance: finance,
      activeProjects: projects,
      pendingTasks: tasks,
      alerts: advancedAlerts as Alert[],
      actionMother: advancedAction,
      guidance: advancedGuidance,
      insights,
      healthScore: insights.health_score,
      financeSummary: insights.finance,
    });
  },

  // Finance
  addFinanceEntry: (entry) =>
    set((state) => ({
      recentFinance: [entry, ...state.recentFinance],
    })),

  // Projects
  addProject: (project) =>
    set((state) => ({
      activeProjects: [project, ...state.activeProjects],
    })),

  updateProject: (updated) =>
    set((state) => ({
      activeProjects: state.activeProjects.map((p) => (p.id === updated.id ? updated : p)),
    })),

  // Tasks
  addTask: (task) =>
    set((state) => ({
      pendingTasks: [task, ...state.pendingTasks],
    })),

  completeTask: (taskId) =>
    set((state) => ({
      pendingTasks: state.pendingTasks.filter((t) => t.id !== taskId),
    })),

  // Alerts
  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    })),

  // UI
  setLoading: (loading) => set({ isLoading: loading }),
}));
