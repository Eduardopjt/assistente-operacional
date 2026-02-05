import { Card } from './Card'

interface StatCardProps {
  title: string
  value: string | number
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  color?: string
}

export function StatCard({ title, value, icon, trend, subtitle, color = '#3B82F6' }: StatCardProps) {
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }
  
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-nexo-muted'
  }
  
  return (
    <Card className="hover:border-nexo-accent/30 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-nexo-muted">{title}</span>
        {icon && <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white mb-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-nexo-muted">{subtitle}</p>}
        </div>
        
        {trend && (
          <span className={`text-2xl ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </Card>
  )
}
