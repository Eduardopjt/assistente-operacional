import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h1>🚀 Assistente</h1>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            🏠 Home
          </NavLink>
          <NavLink to="/checkin" className={({ isActive }) => (isActive ? 'active' : '')}>
            ✅ Check-in
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/finance" className={({ isActive }) => (isActive ? 'active' : '')}>
            💰 Finanças
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
            📁 Projetos
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
            📜 Histórico
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
