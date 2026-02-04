import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { initStorage, userRepo } from './services/storage';
import { useAppStore } from './store/app-store';
import Layout from './components/Layout';
import HomeScreen from './screens/Home';
import CheckinScreen from './screens/Checkin';
import DashboardScreen from './screens/Dashboard';
import FinanceScreen from './screens/Finance';
import ProjectsScreen from './screens/Projects';
import HistoryScreen from './screens/History';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    async function init() {
      try {
        await initStorage();

        // Get or create user
        const existingUsers = userRepo.getAll();
        let user = existingUsers.length > 0 ? existingUsers[0] : null;
        if (!user) {
          user = userRepo.create({
            settings: {},
          });
        }

        setCurrentUser(user);
        setInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    init();
  }, [setCurrentUser]);

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ color: '#EF4444' }}>Initialization Error</h2>
        <p style={{ color: '#9CA3AF' }}>{error}</p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ color: '#FFFFFF' }}>Loading...</h2>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeScreen />} />
            <Route path="checkin" element={<CheckinScreen />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="finance" element={<FinanceScreen />} />
            <Route path="projects" element={<ProjectsScreen />} />
            <Route path="history" element={<HistoryScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
