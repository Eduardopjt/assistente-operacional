import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Agenda() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Agenda & Fluxo de Performance</h1>
          <p className="text-nexo-muted">Compromissos e organização temporal</p>
        </div>
        <Button variant="primary">+ Novo Evento</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Hoje</p>
            <p className="text-4xl font-bold text-white">2</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Esta Semana</p>
            <p className="text-4xl font-bold text-white">5</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Este Mês</p>
            <p className="text-4xl font-bold text-white">18</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Próximos</p>
            <p className="text-4xl font-bold text-white">34</p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-white mb-2">Calendário Inteligente</h3>
          <p className="text-nexo-muted mb-6">Visualização completa e gestão de eventos no CP7</p>
          <div className="flex justify-center gap-3">
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP7</p>
              <p className="text-sm text-white font-medium">Criar Eventos</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP7</p>
              <p className="text-sm text-white font-medium">Calendário</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP7</p>
              <p className="text-sm text-white font-medium">Notificações</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
