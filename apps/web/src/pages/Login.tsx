import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login for CP1 demo
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-nexo-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-nexo-accent to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">⚡</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">NEXO</h1>
          <p className="text-nexo-muted text-lg">Tudo conectado. Você no controle.</p>
        </div>
        
        <div className="bg-nexo-surface border border-nexo-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            
            <Button type="submit" variant="primary" className="w-full">
              Entrar no Command Center →
            </Button>
          </form>
          
          <p className="text-center text-nexo-muted text-xs mt-6">
            ✅ CP1: Executive Interface
          </p>
        </div>
      </div>
    </div>
  )
}
