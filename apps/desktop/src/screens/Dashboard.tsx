import { useAppStore } from '../store/app-store';
import { alertRepo } from '../services/storage';
import type { EstadoCalculado } from '@assistente/core';
import HealthScore from '../components/HealthScore';
import FinanceInsights from '../components/FinanceInsights';
import './Dashboard.css';

const STATE_COLORS: Record<EstadoCalculado, string> = {
  ATTACK: '#22C55E',
  CAUTION: '#FACC15',
  CRITICAL: '#EF4444',
};

const STATE_LABELS: Record<EstadoCalculado, string> = {
  ATTACK: 'MODO ATAQUE',
  CAUTION: 'MODO ATENÇÃO',
  CRITICAL: 'MODO CRÍTICO',
};

const MODE_COLORS = {
  DO: '#22C55E',
  HOLD: '#FACC15',
  CUT: '#EF4444',
};

export default function DashboardScreen() {
  const todayState = useAppStore((state) => state.todayState);
  const actionMother = useAppStore((state) => state.actionMother);
  const guidance = useAppStore((state) => state.guidance);
  const alerts = useAppStore((state) => state.alerts);
  const resolveAlert = useAppStore((state) => state.resolveAlert);
  const healthScore = useAppStore((state) => state.healthScore);
  const financeSummary = useAppStore((state) => state.financeSummary);
  const insights = useAppStore((state) => state.insights);

  const handleResolveAlert = (alertId: string) => {
    alertRepo.resolve(alertId);
    resolveAlert(alertId);
  };

  if (!todayState) {
    return (
      <div className="dashboard-screen">
        <div className="empty-state">
          <h2>Nenhum check-in hoje</h2>
          <p>Faça seu check-in diário para ver seu dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-screen">
      <div className="dashboard-content">
        <div className="state-header">
          <div
            className="state-badge"
            style={{ backgroundColor: STATE_COLORS[todayState] + '20', color: STATE_COLORS[todayState] }}
          >
            {STATE_LABELS[todayState]}
          </div>
          <HealthScore score={healthScore} />
        </div>

        {actionMother && (
          <div className="card action-mother-card">
            <div className="card-header">
              <h3>🎯 Ação-Mãe do Dia</h3>
            </div>
            <p className="action-text">{actionMother}</p>
          </div>
        )}

        {insights && (
          <div className="card insights-card">
            <div className="card-header">
              <h3>📊 Insights do Dia</h3>
            </div>
            <div className="insights-content">
              {insights.energy_pattern && (
                <div className="energy-pattern">
                  <div className="pattern-item">
                    <span className="pattern-label">Melhor dia:</span>
                    <span className="pattern-value">{insights.energy_pattern.best_day}</span>
                  </div>
                  <div className="pattern-item">
                    <span className="pattern-label">Energia streak:</span>
                    <span className="pattern-value">{insights.energy_pattern.current_streak} dias</span>
                  </div>
                  {insights.top_priority_project && (
                    <div className="pattern-item">
                      <span className="pattern-label">Prioridade:</span>
                      <span className="pattern-value">{insights.top_priority_project}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {financeSummary && (
          <div className="card finance-card">
            <div className="card-header">
              <h3>💰 Finanças Avançadas</h3>
            </div>
            <FinanceInsights summary={financeSummary} />
          </div>
        )}

        {guidance && (
          <div className="card guidance-card">
            <div className="card-header">
              <h3>🧭 Orientação</h3>
              <div
                className="mode-badge"
                style={{ 
                  backgroundColor: MODE_COLORS[guidance.mode as keyof typeof MODE_COLORS] + '20', 
                  color: MODE_COLORS[guidance.mode as keyof typeof MODE_COLORS] 
                }}
              >
                {guidance.mode}
              </div>
            </div>
            <p className="guidance-text">{guidance.text}</p>
          </div>
        )}

        <div className="card alerts-card">
          <div className="card-header">
            <h3>⚠️ Alertas</h3>
            <span className="alert-count">{alerts.length}</span>
          </div>
          {alerts.length === 0 ? (
            <p className="empty-text">Nenhum alerta ativo</p>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-content">
                    <span className="alert-type">{alert.type.toUpperCase()}</span>
                    <p className="alert-message">{alert.message}</p>
                  </div>
                  <button className="resolve-button" onClick={() => handleResolveAlert(alert.id)}>
                    Resolver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
