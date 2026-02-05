import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Config() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-nexo-muted">Personalize sua experiência no NEXO</p>
      </div>
      
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">Conta & Perfil</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nexo-muted mb-2">Nome de Usuário</label>
            <p className="text-white font-medium">Executivo</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexo-muted mb-2">Email</label>
            <p className="text-white font-medium">executivo@nexo.app</p>
          </div>
          <div className="pt-4 border-t border-nexo-border">
            <Button variant="secondary">Editar Perfil</Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">Preferências</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-nexo-border">
            <div>
              <p className="text-white font-medium">Tema Escuro</p>
              <p className="text-sm text-nexo-muted">Modo executivo premium</p>
            </div>
            <div className="w-12 h-6 bg-nexo-accent rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-nexo-border">
            <div>
              <p className="text-white font-medium">Notificações</p>
              <p className="text-sm text-nexo-muted">Alertas e lembretes</p>
            </div>
            <div className="w-12 h-6 bg-nexo-accent rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-white font-medium">Mascote Ativo</p>
              <p className="text-sm text-nexo-muted">Interações e sugestões</p>
            </div>
            <div className="w-12 h-6 bg-nexo-accent rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">Sistema</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-nexo-muted">Versão</span>
            <span className="text-white font-medium">CP1 - v0.1.0</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-nexo-muted">Build</span>
            <span className="text-white font-medium">Executive Interface</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
