import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
  const links = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/financas', label: 'Finanças', icon: '💰' },
    { path: '/tarefas', label: 'Tarefas', icon: '✓' },
    { path: '/agenda', label: 'Agenda', icon: '📅' },
    { path: '/mascote', label: 'Mascote', icon: '🤖' },
    { path: '/config', label: 'Configurações', icon: '⚙️' },
  ]
  
  return (
    <div className="w-64 bg-nexo-surface border-r border-nexo-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-nexo-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-nexo-accent to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">NEXO</h1>
            <p className="text-[10px] text-nexo-muted uppercase tracking-wider">Command Center</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-nexo-accent text-white shadow-lg shadow-nexo-accent/20'
                  : 'text-nexo-muted hover:bg-nexo-elevated hover:text-white'
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? '' : 'grayscale'}`}>
                {link.icon}
              </span>
              <span className="font-medium text-sm">{link.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-nexo-border">
        <div className="text-xs text-nexo-muted text-center">
          <p className="font-semibold text-white mb-1">CP1 Complete ✅</p>
          <p>Executive Interface</p>
        </div>
      </div>
    </div>
  )
}
