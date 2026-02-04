import type { EnhancedFinanceSummary } from '@assistente/core';
import './FinanceInsights.css';

interface FinanceInsightsProps {
  summary: EnhancedFinanceSummary;
}

export default function FinanceInsights({ summary }: FinanceInsightsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100); // Convert cents to reais
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'increasing') return '#EF4444';
    if (trend === 'decreasing') return '#22C55E';
    return '#FACC15';
  };

  return (
    <div className="finance-insights">
      <div className="insight-row">
        <div className="insight-card">
          <div className="insight-label">Saldo</div>
          <div
            className="insight-value"
            style={{ color: summary.balance >= 0 ? '#22C55E' : '#EF4444' }}
          >
            {formatCurrency(summary.balance)}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-label">Forecast</div>
          <div className="insight-value">{summary.forecast_days} dias</div>
        </div>

        <div className="insight-card">
          <div className="insight-label">Health Score</div>
          <div
            className="insight-value"
            style={{
              color:
                summary.health_score >= 70
                  ? '#22C55E'
                  : summary.health_score >= 40
                    ? '#FACC15'
                    : '#EF4444',
            }}
          >
            {summary.health_score}/100
          </div>
        </div>
      </div>

      <div className="insight-row">
        <div className="insight-card full-width">
          <div className="insight-label">Tendência {getTrendIcon(summary.spending_trend)}</div>
          <div className="insight-value" style={{ color: getTrendColor(summary.spending_trend) }}>
            {summary.spending_trend === 'increasing'
              ? 'Gastos Aumentando'
              : summary.spending_trend === 'decreasing'
                ? 'Gastos Diminuindo'
                : 'Gastos Estáveis'}
          </div>
        </div>
      </div>

      {summary.anomaly_detected && (
        <div className="anomaly-warning">🔍 Padrão incomum detectado nos gastos recentes</div>
      )}

      <div className="forecasts">
        <div className="forecast-label">Projeções de Gasto</div>
        <div className="forecast-grid">
          <div className="forecast-item">
            <span className="forecast-period">30 dias</span>
            <span className="forecast-value">{formatCurrency(summary.forecast_30d)}</span>
          </div>
          <div className="forecast-item">
            <span className="forecast-period">60 dias</span>
            <span className="forecast-value">{formatCurrency(summary.forecast_60d)}</span>
          </div>
          <div className="forecast-item">
            <span className="forecast-period">90 dias</span>
            <span className="forecast-value">{formatCurrency(summary.forecast_90d)}</span>
          </div>
        </div>
      </div>

      <div className="recommendation">
        <div className="recommendation-icon">💡</div>
        <div className="recommendation-text">{summary.recommended_action}</div>
      </div>
    </div>
  );
}
