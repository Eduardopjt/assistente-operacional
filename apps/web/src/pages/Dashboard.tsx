import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { TextArea } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { useState } from 'react'

export default function Dashboard() {
  const [quickCapture, setQuickCapture] = useState('')
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-nexo-muted">Visão executiva do seu dia</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Finanças"
          value="R$ 4.250,00"
          icon="💰"
          trend="up"
          subtitle="Saldo total"
          color="#10B981"
        />
        
        <StatCard
          title="Tarefas"
          value="3"
          icon="✓"
          subtitle="Pendentes hoje"
          color="#F59E0B"
        />
        
        <StatCard
          title="Eventos"
          value="5"
          icon="📅"
          subtitle="Próximos 7 dias"
          color="#3B82F6"
        />
        
        <StatCard
          title="Mascote"
          value="72%"
          icon="🤖"
          subtitle="Energia atual"
          color="#8B5CF6"
        />
      </div>
      
      {/* Quick Capture */}
      <Card elevated>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Captura Rápida</CardTitle>
              <p className="text-sm text-nexo-muted mt-1">Anote algo rapidamente</p>
            </div>
            <span className="text-3xl">⚡</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <TextArea
            value={quickCapture}
            onChange={(e) => setQuickCapture(e.target.value)}
            rows={4}
            placeholder="Digite algo rápido aqui... finanças, tarefas, ideias..."
          />
          
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1">
              💰 Salvar como Finança
            </Button>
            <Button variant="secondary" className="flex-1">
              ✓ Salvar como Tarefa
            </Button>
            <Button variant="secondary">
              🎤
            </Button>
            <Button variant="secondary">
              📷
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Finanças</span>
              <span className="text-green-400 text-2xl">📈</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-nexo-border">
                <div>
                  <p className="text-white font-medium">Receitas</p>
                  <p className="text-xs text-nexo-muted">Este mês</p>
                </div>
                <span className="text-green-400 font-bold">+R$ 5.800,00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-nexo-border">
                <div>
                  <p className="text-white font-medium">Despesas</p>
                  <p className="text-xs text-nexo-muted">Este mês</p>
                </div>
                <span className="text-red-400 font-bold">-R$ 1.550,00</span>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="w-full">Ver detalhes →</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tarefas</span>
              <span className="text-2xl">📋</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-nexo-elevated rounded-lg">
                <input type="checkbox" className="w-5 h-5 rounded border-nexo-border" />
                <div className="flex-1">
                  <p className="text-white font-medium">Revisar relatório mensal</p>
                  <p className="text-xs text-nexo-muted">Prioridade alta</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-nexo-elevated rounded-lg opacity-60">
                <input type="checkbox" checked readOnly className="w-5 h-5 rounded border-nexo-border" />
                <div className="flex-1">
                  <p className="text-white font-medium line-through">Preparar apresentação</p>
                  <p className="text-xs text-nexo-muted">Completa</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-nexo-elevated rounded-lg">
                <input type="checkbox" className="w-5 h-5 rounded border-nexo-border" />
                <div className="flex-1">
                  <p className="text-white font-medium">Agendar reunião de equipe</p>
                  <p className="text-xs text-nexo-muted">Prioridade média</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="w-full">Ver todas →</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Agenda Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Próximos Eventos</span>
              <span className="text-2xl">🗓️</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-4 p-3 bg-nexo-elevated rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">05</p>
                  <p className="text-xs text-nexo-muted">FEV</p>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Review semanal</p>
                  <p className="text-xs text-nexo-muted">14:00 - 15:30</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 bg-nexo-elevated rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">07</p>
                  <p className="text-xs text-nexo-muted">FEV</p>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Fechamento mensal</p>
                  <p className="text-xs text-nexo-muted">10:00 - 12:00</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="ghost" className="w-full">Ver agenda →</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mascot Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status do Mascote</span>
              <span className="text-2xl">🤖</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-6xl">🤖</span>
              </div>
              <p className="text-white font-semibold mb-2">Foco Total!</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex-1 bg-nexo-bg h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full" style={{ width: '72%' }} />
                </div>
                <span className="text-sm text-nexo-muted">72%</span>
              </div>
              <Button variant="secondary" className="w-full">Interagir com mascote</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
