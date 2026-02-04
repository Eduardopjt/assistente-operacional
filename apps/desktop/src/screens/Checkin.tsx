import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { checkinRepo } from '../services/storage';
import type { CaixaStatus, Energia, Pressao } from '@assistente/core';
import './Checkin.css';

const CAIXA_OPTIONS: { value: CaixaStatus; label: string; emoji: string }[] = [
  { value: 'tranquilo', label: 'Tranquilo', emoji: '✅' },
  { value: 'atencao', label: 'Atenção', emoji: '⚠️' },
  { value: 'critico', label: 'Crítico', emoji: '🔴' },
];

const ENERGIA_OPTIONS: { value: Energia; label: string; emoji: string }[] = [
  { value: 'alta', label: 'Alta', emoji: '⚡' },
  { value: 'media', label: 'Média', emoji: '🔋' },
  { value: 'baixa', label: 'Baixa', emoji: '🪫' },
];

const PRESSAO_OPTIONS: { value: Pressao; label: string; emoji: string }[] = [
  { value: 'leve', label: 'Leve', emoji: '😌' },
  { value: 'normal', label: 'Normal', emoji: '😐' },
  { value: 'alta', label: 'Alta', emoji: '😰' },
];

export default function CheckinScreen() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const setTodayCheckin = useAppStore((state) => state.setTodayCheckin);

  const [caixa, setCaixa] = useState<CaixaStatus>('tranquilo');
  const [energia, setEnergia] = useState<Energia>('media');
  const [pressao, setPressao] = useState<Pressao>('normal');

  const handleGenerate = () => {
    if (!currentUser) return;

    const checkin = checkinRepo.create({
      user_id: currentUser.id,
      date: new Date(),
      caixa_status: caixa,
      energia,
      pressao,
    });

    setTodayCheckin(checkin);
    navigate('/dashboard');
  };

  return (
    <div className="checkin-screen">
      <div className="checkin-content">
        <h1 className="checkin-title">Check-in Diário</h1>
        <p className="checkin-subtitle">Como você está hoje?</p>

        <div className="selector-group">
          <label className="selector-label">💰 Status Financeiro (Caixa)</label>
          <div className="selector-buttons">
            {CAIXA_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`selector-button ${caixa === option.value ? 'active' : ''}`}
                onClick={() => setCaixa(option.value)}
              >
                <span className="selector-emoji">{option.emoji}</span>
                <span className="selector-text">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="selector-group">
          <label className="selector-label">⚡ Nível de Energia</label>
          <div className="selector-buttons">
            {ENERGIA_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`selector-button ${energia === option.value ? 'active' : ''}`}
                onClick={() => setEnergia(option.value)}
              >
                <span className="selector-emoji">{option.emoji}</span>
                <span className="selector-text">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="selector-group">
          <label className="selector-label">🎯 Nível de Pressão</label>
          <div className="selector-buttons">
            {PRESSAO_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`selector-button ${pressao === option.value ? 'active' : ''}`}
                onClick={() => setPressao(option.value)}
              >
                <span className="selector-emoji">{option.emoji}</span>
                <span className="selector-text">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="generate-button" onClick={handleGenerate}>
          Gerar meu dia
        </button>
      </div>
    </div>
  );
}
