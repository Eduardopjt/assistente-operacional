import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { checkinRepo, alertRepo } from '../services/storage';
import type { DailyCheckin, Decision, Alert, EstadoCalculado } from '@assistente/core';
import './History.css';

const STATE_COLORS: Record<EstadoCalculado, string> = {
  ATTACK: '#22C55E',
  CAUTION: '#FACC15',
  CRITICAL: '#EF4444',
};

type Tab = 'checkins' | 'decisions' | 'alerts';

export default function HistoryScreen() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState<Tab>('checkins');
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (currentUser) {
      setCheckins(checkinRepo.getRecent(currentUser.id, 30));
      setDecisions([]); // TODO: Implement decision tracking
      setAlerts(alertRepo.getUnresolved(currentUser.id));
    }
  }, [currentUser]);

  return (
    <div className="history-screen">
      <div className="history-content">
        <h1>📜 Histórico</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'checkins' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkins')}
          >
            Check-ins
          </button>
          <button
            className={`tab ${activeTab === 'decisions' ? 'active' : ''}`}
            onClick={() => setActiveTab('decisions')}
          >
            Decisões
          </button>
          <button
            className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alertas
          </button>
        </div>

        {activeTab === 'checkins' && (
          <div className="tab-content">
            {checkins.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum check-in registrado</p>
              </div>
            ) : (
              checkins.map((checkin) => (
                <div key={checkin.id} className="history-card">
                  <div className="card-header">
                    <span className="card-date">
                      {new Date(checkin.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {checkin.estado_calculado && (
                      <div
                        className="state-badge"
                        style={{
                          backgroundColor: STATE_COLORS[checkin.estado_calculado] + '20',
                          color: STATE_COLORS[checkin.estado_calculado],
                        }}
                      >
                        {checkin.estado_calculado}
                      </div>
                    )}
                  </div>
                  <div className="checkin-details">
                    <div className="checkin-item">
                      <span className="checkin-label">Caixa:</span>
                      <span className="checkin-value">{checkin.caixa_status}</span>
                    </div>
                    <div className="checkin-item">
                      <span className="checkin-label">Energia:</span>
                      <span className="checkin-value">{checkin.energia}</span>
                    </div>
                    <div className="checkin-item">
                      <span className="checkin-label">Pressão:</span>
                      <span className="checkin-value">{checkin.pressao}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="tab-content">
            {decisions.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma decisão registrada</p>
              </div>
            ) : (
              decisions.map((decision) => (
                <div key={decision.id} className="history-card">
                  <span className="card-date">
                    {new Date(decision.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <p className="decision-context">{decision.context}</p>
                  <div className="decision-box">
                    <span className="decision-label">Decisão:</span>
                    <p className="decision-text">{decision.decision}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="tab-content">
            {alerts.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum alerta ativo</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="history-card">
                  <div className="card-header">
                    <span className="card-date">
                      {new Date(alert.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span className="alert-type">{alert.type.toUpperCase()}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
