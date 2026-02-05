import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Financas from './pages/Financas'
import Agenda from './pages/Agenda'
import Tarefas from './pages/Tarefas'
import Mascote from './pages/Mascote'
import Config from './pages/Config'
import AppShell from './components/layout/AppShell'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppShell><Dashboard /></AppShell>} />
        <Route path="/financas" element={<AppShell><Financas /></AppShell>} />
        <Route path="/agenda" element={<AppShell><Agenda /></AppShell>} />
        <Route path="/tarefas" element={<AppShell><Tarefas /></AppShell>} />
        <Route path="/mascote" element={<AppShell><Mascote /></AppShell>} />
        <Route path="/config" element={<AppShell><Config /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
