# 🚀 NEXO - CP2: Supabase Auth

## ✅ O QUE FOI IMPLEMENTADO

### Arquivos Criados:
- `src/lib/supabaseClient.ts` - Cliente Supabase configurado
- `src/lib/auth.ts` - Helpers de autenticação (signUp, signIn, signOut, getUser)
- `.env` - Arquivo de configuração (precisa preencher)
- `.env.example` - Template de exemplo

### Arquivos Atualizados:
- `src/pages/Login.tsx` - Autenticação real com Supabase (signup + login)
- `src/App.tsx` - ProtectedRoute com sessão Supabase
- `src/components/layout/AppShell.tsx` - Recebe user prop
- `src/components/layout/Topbar.tsx` - Logout com Supabase + mostra email
- `src/pages/Config.tsx` - Logout funcional + mostra email real

### Funcionalidades:
✅ Cadastro de novos usuários (sign up)
✅ Login com email/senha
✅ Sessão persistente (auto-login após refresh)
✅ Proteção de rotas (redirect para /login se não autenticado)
✅ Logout funcional
✅ Loading states
✅ Error handling

---

## 📋 INSTRUÇÕES PARA CONFIGURAR SUPABASE

### Passo 1: Criar Projeto
1. Acesse: https://supabase.com/dashboard
2. Clique em "New Project"
3. Escolha organização (ou crie uma)
4. Preencha:
   - **Name**: nexo-app
   - **Database Password**: [escolha senha forte]
   - **Region**: South America (ou mais próxima)
5. Clique "Create new project"
6. **Aguarde ~2 minutos** para provisionar

### Passo 2: Obter Credenciais
1. No painel do projeto, vá em **Settings** (ícone engrenagem no menu lateral)
2. Clique em **API**
3. Na seção "Project API keys", copie:
   - **Project URL** (ex: https://xyzabc123.supabase.co)
   - **anon public** key (chave longa que começa com "eyJ...")

### Passo 3: Configurar .env
1. Abra o arquivo `.env` em `apps/web/.env`
2. Cole suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://sua-url.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Salve o arquivo**

### Passo 4: Configurar Auth no Supabase
1. No painel Supabase, vá em **Authentication** > **Providers**
2. Verifique que "Email" está ENABLED
3. Em **Authentication** > **URL Configuration**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`

### Passo 5: Testar
```bash
# Certifique-se que o dev server está rodando
cd C:\src\assistente\apps\web
npm run dev

# Acesse: http://localhost:5173
```

#### Teste de Cadastro:
1. Acesse `/login`
2. Clique em "Não tem conta? Criar"
3. Digite email + senha (min 6 caracteres)
4. Clique "Criar Conta"
5. **Verifique email** (Supabase envia confirmação)
6. Clique no link de confirmação

#### Teste de Login:
1. Acesse `/login`
2. Digite email + senha
3. Clique "Entrar"
4. Deve redirecionar para `/` (Dashboard)
5. Veja seu email no topbar

#### Teste de Sessão:
1. Após login, **recarregue a página** (F5)
2. Deve permanecer logado (não volta para login)

#### Teste de Logout:
1. Clique "Sair" no topbar (ou vá em /config)
2. Deve redirecionar para `/login`
3. Tente acessar `/` → deve redirecionar de volta para login

---

## 🔧 TROUBLESHOOTING

### Erro: "Invalid API key"
- Verifique se copiou a chave **anon public** (não a service_role)
- Certifique-se que não há espaços extras no .env
- Reinicie o dev server após alterar .env

### Erro: "Email not confirmed"
- Verifique sua caixa de entrada (e spam)
- Ou desabilite confirmação: Authentication > Settings > Enable email confirmations = OFF

### Não recebe email de confirmação:
- Vá em Authentication > Email Templates
- Ou desabilite confirmação temporariamente (acima)

### "Supabase credentials not configured"
- Preencha o arquivo `.env` com URL e ANON_KEY
- Reinicie `npm run dev`

---

## 📊 STATUS

- ✅ **CP1**: Scaffold básico com rotas
- ✅ **CP2**: Supabase Auth completo
- ⏳ **CP3**: Database Schema + RLS (próximo)
- ⏳ **CP4**: Dashboard + Quick Capture
- ⏳ **CP5**: Finanças CRUD
- ⏳ **CP6**: Tarefas CRUD
- ⏳ **CP7**: Agenda CRUD
- ⏳ **CP8**: Mascote zone
- ⏳ **CP9**: Netlify deployment

---

## 🎯 PRÓXIMO PASSO: CP3

Após configurar Supabase e testar auth, vamos criar:
- Schema SQL (tabelas profiles, transactions, tasks, events)
- Row Level Security (RLS) policies
- Database helpers

**Aguardando confirmação de que CP2 está funcionando!**
