import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Financas() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Central de Finanças</h1>
          <p className="text-nexo-muted">Evolução do patrimônio e controle detalhado</p>
        </div>
        <Button variant="primary">+ Nova Transação</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Saldo Total</p>
            <p className="text-4xl font-bold text-green-400">R$ 4.250,00</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Receitas (Mês)</p>
            <p className="text-4xl font-bold text-blue-400">R$ 5.800,00</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-nexo-muted mb-2">Despesas (Mês)</p>
            <p className="text-4xl font-bold text-red-400">R$ 1.550,00</p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">Evolução do Patrimônio</h3>
          <p className="text-nexo-muted mb-6">Gráficos e análises detalhadas virão no CP5</p>
          <div className="flex justify-center gap-3">
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP5</p>
              <p className="text-sm text-white font-medium">Receitas & Despesas</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP5</p>
              <p className="text-sm text-white font-medium">Categorias</p>
            </div>
            <div className="px-4 py-2 bg-nexo-elevated rounded-lg">
              <p className="text-xs text-nexo-muted">CP5</p>
              <p className="text-sm text-white font-medium">Relatórios</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
