# Deploy do Assistente Operacional

## 🌐 Opções de Hospedagem

### **1. Vercel (Recomendado - Gratuito)**

**Vantagens:**

- ✅ Gratuito para projetos pessoais
- ✅ Deploy automático a cada commit
- ✅ SSL/HTTPS gratuito
- ✅ CDN global (rápido no mundo todo)
- ✅ Domínio gratuito (.vercel.app)

**Como fazer:**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Deploy (na pasta apps/mobile)
cd apps/mobile
vercel

# Produção
vercel --prod
```

**Ou via GitHub:**

1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure:
   - Framework: Other
   - Build Command: `cd apps/mobile && pnpm build:web`
   - Output Directory: `apps/mobile/dist`
4. Deploy automático a cada push!

---

### **2. Netlify (Alternativa Gratuita)**

**Vantagens:**

- ✅ Gratuito
- ✅ Deploy automático
- ✅ SSL gratuito
- ✅ Fácil configuração

**Como fazer:**

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Fazer login
netlify login

# 3. Deploy
cd apps/mobile
netlify deploy

# Produção
netlify deploy --prod
```

**Ou via GitHub:**

1. Acesse [netlify.com](https://netlify.com)
2. Conecte seu repositório
3. Configure:
   - Build command: `cd apps/mobile && pnpm build:web`
   - Publish directory: `apps/mobile/dist`

---

### **3. Railway/Render (Para Monorepo)**

Se quiser hospedar desktop + mobile juntos:

- [Railway.app](https://railway.app) - $5/mês
- [Render.com](https://render.com) - Gratuito com limitações

---

## 💰 Cobrança de Mensalidade

Para cobrar dos usuários, você precisa integrar:

### **Opção 1: Stripe (Mais Popular)**

```bash
cd apps/mobile
pnpm add @stripe/stripe-react-native stripe

# Para web
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

**Planos de preço:**

- Stripe cobra 2.9% + R$ 0.39 por transação
- Sem mensalidade fixa

### **Opção 2: Mercado Pago (Brasil)**

```bash
pnpm add mercadopago
```

**Planos:**

- 4.99% + R$ 0.39 por transação
- Integração simples para Brasil

### **Opção 3: PagSeguro**

- Taxas similares ao Mercado Pago
- Boa integração nacional

---

## 🏗️ Arquitetura Recomendada para Produção

```
┌─────────────────┐
│   Frontend Web  │  ← Vercel/Netlify (Gratuito)
│   (apps/mobile) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │  ← Railway/Render ($5-7/mês)
│   (Node.js)     │  ← Autenticação, Pagamentos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  ← Supabase (Gratuito até 500MB)
│   (PostgreSQL)  │  ← ou PlanetScale, Neon
└─────────────────┘
```

---

## 📱 App Nativo (iOS/Android) - Opcional

Para apps nativos nas lojas:

### **App Store (iOS)**

- **Custo:** $99/ano (Apple Developer)
- **Processo:**
  1. Build com EAS: `eas build --platform ios`
  2. Enviar para App Store Connect
  3. Aprovação Apple (7-14 dias)

### **Google Play (Android)**

- **Custo:** $25 taxa única
- **Processo:**
  1. Build com EAS: `eas build --platform android`
  2. Upload para Google Play Console
  3. Aprovação (1-3 dias)

**In-App Purchases:**

- Apple/Google cobram **30% de comissão** em assinaturas
- Alternativa: Oferecer assinatura via web (sem comissão)

---

## 🚀 Deploy Rápido (5 minutos)

**Para começar AGORA:**

```bash
# 1. Build para web
cd apps/mobile
pnpm build:web

# 2. Deploy na Vercel
npx vercel --prod

# Pronto! URL: https://seu-app.vercel.app
```

---

## 💡 Modelo de Negócio Sugerido

### **Plano Freemium:**

- **Grátis:**
  - 3 check-ins por dia
  - 5 projetos
  - Histórico 30 dias
- **Pro - R$ 9,90/mês:**
  - Check-ins ilimitados
  - Projetos ilimitados
  - Histórico completo
  - Sugestões com IA
  - Dashboard avançado
- **Team - R$ 29,90/mês:**
  - Tudo do Pro
  - 5 usuários
  - Relatórios exportáveis
  - Suporte prioritário

---

## 🔐 Autenticação para Cobrar

Você vai precisar adicionar auth:

### **Supabase Auth (Recomendado - Gratuito)**

```bash
pnpm add @supabase/supabase-js
```

**Recursos:**

- Login com email/senha
- Login com Google/GitHub
- Sessões seguras
- Gratuito até 50k usuários

### **Clerk (Mais Simples)**

- Interface pronta
- $25/mês para 10k usuários
- Integração fácil

---

## 📊 Monitoramento

Para produção, adicione:

- **Sentry** - Logs de erro (gratuito até 5k eventos/mês)
- **Vercel Analytics** - Métricas de acesso (gratuito)
- **PostHog** - Analytics de produto (self-hosted grátis)

---

## ✅ Checklist para Lançar

- [ ] Build web funcional (`pnpm build:web`)
- [ ] Deploy em Vercel/Netlify
- [ ] Domínio customizado (opcional - R$ 40/ano)
- [ ] SSL/HTTPS configurado
- [ ] Autenticação implementada
- [ ] Sistema de pagamento integrado
- [ ] Termos de uso + Política de privacidade
- [ ] Logs de erro configurados
- [ ] Backup do banco de dados

---

## 💰 Custos Estimados (Mensal)

**Começando (Gratuito):**

- Vercel: R$ 0
- Supabase: R$ 0
- Total: **R$ 0/mês**

**Crescendo (Até 100 usuários):**

- Vercel Pro: R$ 100
- Supabase: R$ 0
- Stripe: ~2.9% das vendas
- Total: **~R$ 100/mês** + % vendas

**Produção (1000+ usuários):**

- Vercel: R$ 100
- Supabase Pro: R$ 125
- CDN/Storage: R$ 50
- Monitoring: R$ 50
- Total: **~R$ 325/mês** + % vendas

---

## 🎯 Próximos Passos

1. **Agora:** Deploy web gratuito na Vercel
2. **Semana 1:** Adicionar Supabase auth
3. **Semana 2:** Integrar Stripe para pagamentos
4. **Semana 3:** Landing page para marketing
5. **Semana 4:** Lançar versão beta

**Quer que eu configure algum desses agora?**
