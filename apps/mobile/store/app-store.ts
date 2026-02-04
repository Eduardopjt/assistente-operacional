import { create } from 'zustand';
import { 
  User, 
  DailyCheckin, 
  FinancialEntry, 
  Project, 
  Task, 
  Alert,
  EstadoCalculado,
  computeState,
  computeActionMother,
  computeGuidance,
  generateAlerts,
  OperationalContext,
  Guidance
} from '@assistente/core';

interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Today's context
  todayCheckin: DailyCheckin | null;
  todayState: EstadoCalculado | null;
  actionMother: string | null;
  guidance: Guidance | null;
  alerts: Alert[];

  // Data
  recentCheckins: DailyCheckin[];
  recentFinance: FinancialEntry[];
  activeProjects: Project[];
  pendingTasks: Task[];

  // Actions
  setTodayCheckin: (checkin: DailyCheckin) => void;
  refreshDashboard: () => void;
  addFinanceEntry: (entry: FinancialEntry) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  addTask: (task: Task) => void;
  completeTask: (taskId: string) => void;
  resolveAlert: (alertId: string) => void;

  // Loading states
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
    const checkinWithState = { ...checkin, estado_calculado: state };

    // Build context for rules engine
    const context: OperationalContext = {
      checkin: checkinWithState,
      finance: calculateFinanceSummary(get().recentFinance),
      projects: calculateProjectStats(get().activeProjects),
    };

    const newAlerts = generateAlerts(context, checkin.user_id);
    const actionMother = computeActionMother(context);
    
    // Add IDs and dates to new alerts
    const alertsWithIds: Alert[] = newAlerts.map((a, i) => ({
      ...a,
      id: `alert-${Date.now()}-${i}`,
      date: new Date(),
    }));

    const guidance = computeGuidance(state, [...get().alerts, ...alertsWithIds]);

    set({
      todayState: state,
      actionMother,
      guidance,
      alerts: [...get().alerts, ...alertsWithIds],
    });
  },

  // Refresh dashboard
  refreshDashboard: () => {
    const { todayCheckin, recentFinance, activeProjects, alerts } = get();
    if (!todayCheckin) return;

    const context: OperationalContext = {
      checkin: todayCheckin,
      finance: calculateFinanceSummary(recentFinance),
      projects: calculateProjectStats(activeProjects),
    };

    const actionMother = computeActionMother(context);
    const guidance = computeGuidance(todayCheckin.estado_calculado!, alerts);

    set({ actionMother, guidance });
  },

  // Finance
  addFinanceEntry: (entry) => {
    set((state) => ({
      recentFinance: [entry, ...state.recentFinance],
    }));
    get().refreshDashboard();
  },

  // Projects
  addProject: (project) => {
    set((state) => ({
      activeProjects: [...state.activeProjects, project],
    }));
    get().refreshDashboard();
  },

  updateProject: (project) => {
    set((state) => ({
      activeProjects: state.activeProjects.map((p) =>
        p.id === project.id ? project : p
      ),
    }));
    get().refreshDashboard();
  },

  // Tasks
  addTask: (task) => {
    set((state) => ({
      pendingTasks: [task, ...state.pendingTasks],
    }));
  },

  completeTask: (taskId) => {
    set((state) => ({
      pendingTasks: state.pendingTasks.filter((t) => t.id !== taskId),
    }));
  },

  // Alerts
  resolveAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, resolved: true } : a
      ),
    }));
    get().refreshDashboard();
  },

  // Loading
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Helper functions
function calculateFinanceSummary(entries: FinancialEntry[]) {
  const entradas = entries.filter((e) => e.type === 'entrada');
  const saidas = entries.filter((e) => e.type === 'saida');

  const total_entradas = entradas.reduce((sum, e) => sum + e.value, 0);
  const total_saidas = saidas.reduce((sum, e) => sum + e.value, 0);
  const balance = total_entradas - total_saidas;

  const avg_daily_spending = saidas.length > 0 
    ? total_saidas / 30 
    : 0;

  const forecast_days = avg_daily_spending > 0 
    ? Math.floor(balance / avg_daily_spending)
    : 999;

  return {
    total_entradas,
    total_saidas,
    balance,
    avg_daily_spending,
    forecast_days,
  };
}

function calculateProjectStats(projects: Project[]) {
  return {
    active_count: projects.filter((p) => p.status === 'active').length,
    paused_count: projects.filter((p) => p.status === 'paused').length,
    done_count: projects.filter((p) => p.status === 'done').length,
    stalled_count: projects.filter((p) => {
      const daysSinceUpdate = (Date.now() - p.updated_at.getTime()) / (1000 * 60 * 60 * 24);
      return p.status === 'active' && daysSinceUpdate > 7;
    }).length,
  };
}
