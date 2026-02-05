import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Mascote() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Mascote & Personalização</h1>
        <p className="text-nexo-muted">Seu assistente virtual inteligente</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <div className="text-center py-12">
            <div className="w-40 h-40 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-8xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Foco Total!</h3>
            <p className="text-nexo-muted mb-4">Nível 12 • 2.847 XP</p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex-1 max-w-xs bg-nexo-bg h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full" style={{ width: '72%' }} />
              </div>
              <span className="text-sm text-nexo-muted font-bold">72%</span>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button variant="primary">Interagir</Button>
              <Button variant="secondary">Personalizar</Button>
            </div>
          </div>
        </Card>
        
        <Card className="col-span-1">
          <h3 className="text-xl font-bold text-white mb-4">Status do Sistema</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-nexo-muted">Energia</span>
                <span className="text-sm text-white font-medium">72%</span>
              </div>
              <div className="bg-nexo-bg h-2 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full" style={{ width: '72%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-nexo-muted">Humor</span>
                <span className="text-sm text-white font-medium">85%</span>
              </div>
              <div className="bg-nexo-bg h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-nexo-muted">Produtividade</span>
                <span className="text-sm text-white font-medium">60%</span>
              </div>
              <div className="bg-nexo-bg h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-white mb-2">Conquistas & Gamificação</h3>
          <p className="text-nexo-muted mb-6">Sistema completo de recompensas no CP8</p>
          <div className="flex justify-center gap-3">
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP8</p>
              <p className="text-sm text-white font-medium">Conquistas</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP8</p>
              <p className="text-sm text-white font-medium">Interação</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP8</p>
              <p className="text-sm text-white font-medium">Customização</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
