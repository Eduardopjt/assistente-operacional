import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { checkinRepo } from '../services/storage';
import './Home.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const todayCheckin = useAppStore((state) => state.todayCheckin);
  const [hasCheckin, setHasCheckin] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const today = new Date().toISOString().split('T')[0];
      const checkin = checkinRepo.getByDate(currentUser.id, new Date(today));
      setHasCheckin(!!checkin);
    }
  }, [currentUser, todayCheckin]);

  const handleStartDay = () => {
    if (hasCheckin) {
      navigate('/dashboard');
    } else {
      navigate('/checkin');
    }
  };

  return (
    <div className="home-screen">
      <div className="home-content">
        <h1 className="home-title">Assistente Operacional</h1>
        <p className="home-subtitle">Sistema de gestão pessoal offline-first</p>

        <button className="primary-button" onClick={handleStartDay}>
          {hasCheckin ? '📊 Ver meu dia' : '✅ Começar o dia'}
        </button>

        <div className="quick-actions">
          <button className="secondary-button" onClick={() => navigate('/finance')}>
            💰 Finanças
          </button>
          <button className="secondary-button" onClick={() => navigate('/projects')}>
            📁 Projetos
          </button>
          <button className="secondary-button" onClick={() => navigate('/history')}>
            📜 Histórico
          </button>
        </div>
      </div>
    </div>
  );
}
