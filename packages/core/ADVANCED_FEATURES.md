# Core Engine - Advanced Features

## Overview

O **Core Engine Advanced** é uma evolução do engine original com capacidades preditivas e analíticas avançadas, aproximando-se de um sistema com Machine Learning sem a necessidade de treinar modelos.

## Novas Funcionalidades

### 1. Health Score (0-100)

Score de saúde operacional calculado com base em 3 pilares:

- **Saúde Financeira (50%)**: Balance, spending ratio, forecast days
- **Saúde Energética (30%)**: Nível de energia atual
- **Saúde de Projetos (20%)**: Projetos ativos vs parados

```typescript
import { calculateHealthScore } from '@assistente/core';

const score = calculateHealthScore(
  enhancedFinanceSummary,
  currentCheckin,
  { active_count: 3, stalled_count: 1 }
);
// score: 0-100
```

### 2. Análise Preditiva de Gastos

- **EMA (Exponential Moving Average)**: Média ponderada que dá mais peso aos valores recentes
- **Detecção de Anomalias**: Identifica gastos fora do padrão usando desvio padrão
- **Forecast 30/60/90 dias**: Projeção de gastos futuros com min/avg/max

```typescript
import { computeAdvancedFinanceSummary } from '@assistente/core';

const summary = computeAdvancedFinanceSummary(entries, 30);
console.log(summary.health_score); // 0-100
console.log(summary.spending_trend); // 'increasing' | 'stable' | 'decreasing'
console.log(summary.forecast_30d); // Projected spending in 30 days
console.log(summary.anomaly_detected); // true if unusual pattern
console.log(summary.recommended_action); // Contextual recommendation
```

### 3. Padrões de Energia

Análise de padrões semanais para identificar:

- Melhor dia da semana para produtividade
- Pior dia da semana
- Streak atual de energia consistente
- Correlação entre humor e produtividade

```typescript
import { PatternDetector } from '@assistente/core';

const patterns = PatternDetector.analyzeWeeklyPatterns(checkins);
// { bestDay: 'Monday', worstDay: 'Friday', avgEnergyByDay: {...} }

const correlation = PatternDetector.correlateMoodAndProductivity(
  checkins,
  taskCompletions
);
// -1 to 1 (Pearson correlation)
```

### 4. Priorização Inteligente de Projetos

Scoring automático de projetos baseado em:

- Impacto financeiro (40%)
- Urgência do deadline (30%)
- Energia requerida vs disponível (20%)
- Status do projeto (10%)

```typescript
import { ProjectAnalytics } from '@assistente/core';

const score = ProjectAnalytics.calculatePriorityScore(project, {
  financialImpact: 8, // 0-10
  energyRequired: 5, // 0-10
  deadline: new Date('2024-12-31'),
});
// score: 0-100
```

### 5. Insights Operacionais Completos

Função principal que combina todas as análises:

```typescript
import { computeAdvancedInsights } from '@assistente/core';

const insights = computeAdvancedInsights(
  currentCheckin,
  last30Checkins,
  financialEntries,
  projects,
  taskCompletions
);

console.log(insights.current_state); // 'CRITICAL' | 'CAUTION' | 'ATTACK'
console.log(insights.health_score); // Overall 0-100
console.log(insights.finance.health_score); // Finance-specific 0-100
console.log(insights.energy_pattern.current_streak); // Days
console.log(insights.productivity_correlation); // -1 to 1
console.log(insights.top_priority_project); // String | undefined
console.log(insights.recommended_actions); // String[]
console.log(insights.warnings); // String[]
```

### 6. Action-Mother Inteligente

Recomendação contextual da ação mais importante do dia:

```typescript
import { computeAdvancedActionMother } from '@assistente/core';

const action = computeAdvancedActionMother(insights);
// "🔴 URGENTE: Gerar entrada imediata ou cortar despesa crítica hoje"
// "🟢 EXECUTAR: Avançar \"Projeto X\" - momento ideal para progresso"
// "🟡 Preservar energia: Tarefas administrativas e organização hoje"
```

### 7. Alertas Avançados

Geração de alertas com base em insights:

```typescript
import { generateAdvancedAlerts } from '@assistente/core';

const alerts = generateAdvancedAlerts(insights, userId);
// Alerts include:
// - Health score warnings
// - Spending anomalies
// - Trend warnings
// - Energy warnings
// - Project staleness
```

## Algoritmos Implementados

### Exponential Moving Average (EMA)

```
EMA = Price(t) × k + EMA(t-1) × (1 - k)
k = 2 / (N + 1)
```

Usado para prever gastos futuros dando mais peso a dados recentes.

### Anomaly Detection

```
Anomaly if: |value - mean| > threshold × stdDev
```

Detecta gastos incomuns usando distribuição normal.

### Pearson Correlation

```
r = (n∑xy - ∑x∑y) / sqrt[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]
```

Mede relação entre energia/humor e produtividade.

### Health Score Calculation

```
score = 100
score -= (100 - financeScore) × 0.5  // 50% weight
score -= energyPenalty × 0.3         // 30% weight
score -= projectPenalty              // 20% weight
return clamp(score, 0, 100)
```

## Comparação: Engine Original vs Advanced

| Feature | Original | Advanced |
|---------|----------|----------|
| State Calculation | ✅ | ✅ |
| Basic Alerts | ✅ | ✅ |
| Action-Mother | ✅ | ✅ Enhanced |
| Health Score | ❌ | ✅ 0-100 |
| Spending Prediction | ❌ | ✅ EMA + Forecast |
| Anomaly Detection | ❌ | ✅ Statistical |
| Energy Patterns | ❌ | ✅ Weekly Analysis |
| Productivity Correlation | ❌ | ✅ Pearson |
| Project Prioritization | ❌ | ✅ Multi-factor |
| Spending Trend | ❌ | ✅ 3-state |

## Exemplos de Uso

### Dashboard com Health Score

```typescript
const insights = computeAdvancedInsights(
  checkin,
  recentCheckins,
  entries,
  projects,
  tasks
);

return (
  <div className="dashboard">
    <HealthMeter score={insights.health_score} />
    <ActionCard>{computeAdvancedActionMother(insights)}</ActionCard>
    <TrendChart trend={insights.finance.spending_trend} />
    <AlertsList>{generateAdvancedAlerts(insights, userId)}</AlertsList>
  </div>
);
```

### Notificações Inteligentes

```typescript
const insights = computeAdvancedInsights(...);

if (insights.health_score < 30) {
  sendPushNotification({
    title: '⚠️ Saúde Crítica',
    body: insights.recommended_actions[0],
    priority: 'high'
  });
}

if (insights.finance.anomaly_detected) {
  sendPushNotification({
    title: '🔍 Gasto Incomum',
    body: 'Padrão diferente detectado nos seus gastos',
    priority: 'normal'
  });
}
```

### Coaching Adaptativo

```typescript
const insights = computeAdvancedInsights(...);
const guidance = computeAdvancedGuidance(insights);

if (insights.energy_pattern.current_streak > 5) {
  console.log('🔥 Você está em uma sequência de alta energia!');
  console.log('Momento ideal para projetos complexos.');
}

if (insights.productivity_correlation > 0.7) {
  console.log('💡 Sua produtividade está fortemente ligada à energia.');
  console.log(`Melhor dia: ${insights.energy_pattern.best_day}`);
}
```

## Testes

O pacote core possui **82 testes** cobrindo:

- ✅ 11 testes do engine original
- ✅ 38 testes dos analytics (EMA, anomalias, patterns, projetos)
- ✅ 33 testes do engine advanced (insights, health score, guidance)

Executar testes:

```bash
pnpm --filter @assistente/core test
```

## Performance

- **computeAdvancedInsights**: ~5-10ms para 30 dias de dados
- **FinanceAnalytics.calculateEMA**: ~1ms para 90 valores
- **PatternDetector.analyzeWeeklyPatterns**: ~2ms para 30 check-ins
- **ProjectAnalytics.calculatePriorityScore**: <1ms por projeto

## Roadmap

### Próximas Melhorias

1. **Seasonal Patterns**: Detectar padrões mensais e trimestrais
2. **Goal Tracking**: Integração com metas financeiras e de projetos
3. **Habit Formation**: Análise de formação de hábitos (21/66/90 dias)
4. **Budget Optimization**: Sugestões de redistribuição de orçamento
5. **Project Dependencies**: Análise de dependências entre projetos
6. **Time Series Forecasting**: ARIMA ou Prophet para previsões
7. **Clustering**: Agrupar gastos similares automaticamente
8. **Sentiment Analysis**: Análise de sentimento em notas/descrições

## Migração do Engine Original

O engine original ainda está disponível e funcional. Para migrar:

```typescript
// Antes
import { computeState, generateAlerts } from '@assistente/core';

// Depois (com advanced features)
import { 
  computeAdvancedInsights,
  generateAdvancedAlerts,
  computeAdvancedActionMother 
} from '@assistente/core';

const insights = computeAdvancedInsights(...);
const alerts = generateAdvancedAlerts(insights, userId);
const action = computeAdvancedActionMother(insights);
```

## Licença

MIT
