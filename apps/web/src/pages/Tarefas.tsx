import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Tarefas() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Gerenciador de Tarefas</h1>
          <p className="text-nexo-muted">Organize e priorize suas atividades</p>
        </div>
        <Button variant="primary">+ Nova Tarefa</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Pendentes</p>
            <p className="text-4xl font-bold text-yellow-400">3</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Em Progresso</p>
            <p className="text-4xl font-bold text-blue-400">2</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Concluídas</p>
            <p className="text-4xl font-bold text-green-400">12</p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-white mb-2">Sistema de Tarefas</h3>
          <p className="text-nexo-muted mb-6">Listas, prioridades e organização avançada no CP6</p>
          <div className="flex justify-center gap-3">
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP6</p>
              <p className="text-sm text-white font-medium">Criar & Editar</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP6</p>
              <p className="text-sm text-white font-medium">Prioridades</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP6</p>
              <p className="text-sm text-white font-medium">Status</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
