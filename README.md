# Assistente Operacional

**Sistema de gestão pessoal offline-first com decisões operacionais inteligentes**

Um aplicativo multiplataforma (Windows, macOS, Linux, Android, iOS) que ajuda você a gerenciar suas finanças, projetos e estado operacional com orientação baseada em regras.

---

## 🎯 Características Principais

### ✅ Multiplataforma
- **Desktop**: Windows, macOS, Linux (via Tauri)
- **Mobile**: Android, iOS (via Expo/React Native)

### 🔒 Offline-First
- Todos os dados armazenados localmente via SQLite
- Funciona completamente sem conexão à internet
- Zero dependência de servidores externos

### 🧠 Decisões Inteligentes
- **Motor de Regras**: Avalia seu estado operacional em tempo real
- **Alertas Contextuais**: Notificações baseadas em finanças, energia e pressão
- **Orientação Acionável**: Sugestões práticas com próximos passos

### 📊 Gestão Completa
- **Check-in Diário**: Rastreie sua energia, pressão e contexto (Caixa/Não-Caixa)
- **Finanças**: Controle entradas e saídas com categorização automática
- **Projetos**: Gerencie projetos com status, prioridades e ações
- **Histórico**: Visualize tendências e padrões ao longo do tempo

---

## 🛠️ Stack Tecnológico

### Desktop (Tauri)
- **Frontend**: React 18 + TypeScript + Vite 5
- **Backend**: Rust (Tauri 1.5)
- **Storage**: SQLite via better-sqlite3
- **Routing**: React Router DOM 6
- **State**: Zustand 4

### Mobile (React Native)
- **Framework**: Expo ~50.0
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **State**: Zustand 4
- **Storage**: SQLite via expo-sqlite

### Shared Packages
- **@assistente/core**: Entidades, tipos e motor de regras
- **@assistente/storage**: Camada de abstração SQLite + repositórios
- **@assistente/ui**: Componentes compartilhados (futuro)
- **@assistente/config**: Configurações compartilhadas

---

## 📦 Estrutura do Monorepo

```
assistente/
├── apps/
│   ├── desktop/           # Aplicativo Tauri (Windows/macOS/Linux)
│   │   ├── src/           # Frontend React
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── store/
│   │   └── src-tauri/     # Backend Rust
│   │       ├── src/
│   │       ├── icons/
│   │       └── tauri.conf.json
│   └── mobile/            # Aplicativo Expo (Android/iOS)
│       ├── app/           # File-based routing
│       ├── components/
│       ├── store/
│       └── app.json
├── packages/
│   ├── core/              # Lógica de negócio + regras
│   │   ├── src/
│   │   │   ├── entities/ # Modelos de dados
│   │   │   ├── types/    # TypeScript types
│   │   │   └── rules/    # Motor de decisões
│   │   └── __tests__/
│   ├── storage/           # Camada SQLite + repositórios
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── adapters/
│   │   │   └── repositories/
│   │   └── __tests__/
│   ├── ui/                # Componentes compartilhados (futuro)
│   └── config/            # ESLint, TypeScript configs
├── ASSETS_GUIDE.md        # Guia de geração de ícones
├── STORE_SUBMISSION_GUIDE.md  # Guia de submissão às lojas
└── BUILD_SCRIPTS_GUIDE.md     # Comandos de build/dev
```

---

## 🚀 Quick Start

### Pré-requisitos

#### Para Desktop:
- **Node.js** 18+ e **pnpm** 8+
- **Rust** (via [rustup](https://rustup.rs/))
- **Sistema operacional específico**:
  - **Windows**: Visual Studio Build Tools, WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: libwebkit2gtk, libgtk-3, etc.

#### Para Mobile:
- **Node.js** 18+ e **pnpm** 8+
- **Expo CLI**: `npm install -g eas-cli`
- **Para iOS**: macOS com Xcode (simulador local) ou conta Expo (EAS build na nuvem)
- **Para Android**: Android Studio (emulador local) ou conta Expo (EAS build na nuvem)

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd assistente

# 2. Instale todas as dependências
pnpm install

# 3. Execute testes para validar instalação
pnpm test

# Deve exibir:
# ✓ @assistente/core: 14/14 tests passing
# ✓ @assistente/storage: 15/15 tests passing
```

### Desenvolvimento

```bash
# Desktop (abre janela Tauri com hot-reload)
pnpm dev:desktop

# Mobile (abre Metro bundler)
pnpm dev:mobile

# Depois execute no dispositivo/simulador
cd apps/mobile
pnpm ios      # iOS simulator (macOS)
pnpm android  # Android emulator
pnpm web      # Browser (para debug rápido)
```

---

## 📱 Builds de Produção

### Desktop

```bash
cd apps/desktop
pnpm tauri build

# Saída:
# Windows: src-tauri/target/release/bundle/msi/*.msi
# macOS:   src-tauri/target/release/bundle/dmg/*.dmg
# Linux:   src-tauri/target/release/bundle/deb/*.deb
```

### Mobile

**Primeiro configure EAS**:
```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas build:configure
```

**Builds**:
```bash
# Android (APK para teste ou AAB para Play Store)
eas build --platform android --profile production

# iOS (requer conta Apple Developer)
eas build --platform ios --profile production

# Ambos
eas build --platform all --profile production
```

**Veja o [BUILD_SCRIPTS_GUIDE.md](BUILD_SCRIPTS_GUIDE.md) para comandos completos.**

---

## 🎨 Assets (Ícones, Splash Screens)

Atualmente os ícones são **placeholders**. Para gerar assets reais:

1. Crie um ícone base 1024×1024px (PNG, sem transparência nas bordas)
2. Siga o [ASSETS_GUIDE.md](ASSETS_GUIDE.md) para gerar todos os tamanhos

**Ferramentas Recomendadas**:
- **Mobile**: [icon.kitchen](https://icon.kitchen/)
- **Desktop**: `@tauri-apps/cli icon` (CLI)
- **Favicon**: [realfavicongenerator.net](https://realfavicongenerator.net/)

---

## 🏪 Submissão às Lojas

### Apple App Store
1. Conta Apple Developer ($99/ano)
2. Configurar App Store Connect
3. `eas submit --platform ios --profile production`

### Google Play Store
1. Conta Google Play Console ($25 único)
2. Criar aplicativo + listing
3. `eas submit --platform android --profile production`

### Microsoft Store
1. Conta Microsoft Partner Center ($19-99/ano)
2. Upload do MSI/MSIX
3. Certificação

**Veja o [STORE_SUBMISSION_GUIDE.md](STORE_SUBMISSION_GUIDE.md) para passos detalhados.**

---

## 🧪 Testes

### Unit Tests (Jest)
```bash
# Todos os testes
pnpm test

# Apenas core
pnpm --filter @assistente/core test

# Apenas storage
pnpm --filter @assistente/storage test

# Com coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

### Type Check
```bash
# Todos os pacotes
pnpm typecheck

# Apenas desktop
pnpm --filter desktop typecheck
```

---

## 📊 Motor de Regras

O sistema de decisões inteligentes é baseado em 3 pilares:

### 1. Estado Operacional
Calculado a partir do check-in diário:
- **Verde**: Energia alta + pressão controlada + caixa OK
- **Amarelo**: Algum indicador moderado
- **Vermelho**: Energia baixa ou pressão muito alta ou caixa crítico

### 2. Alertas Contextuais
Gerados automaticamente com base em:
- Finanças (gastos altos, saldo baixo, categorias problemáticas)
- Projetos (prazos próximos, projetos travados)
- Check-ins (fadiga acumulada, pressão persistente)

### 3. Orientação Acionável
Sugestões práticas como:
- "Priorize tarefas de alto impacto e delegue o resto"
- "Revise gastos da categoria 'Alimentação' (R$ 450 esta semana)"
- "Projeto X está 3 dias sem atualização - revisar status?"

**Veja os testes em `packages/core/__tests__/` para exemplos.**

---

## 🗂️ Arquitetura de Dados

### SQLite Schema (v1)

```sql
-- Usuários
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL
);

-- Check-ins diários
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  caixa TEXT NOT NULL,        -- 'Caixa' | 'Não-Caixa'
  energia TEXT NOT NULL,       -- 'Alta' | 'Media' | 'Baixa'
  pressao TEXT NOT NULL,       -- 'Baixa' | 'Media' | 'Alta'
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Entradas financeiras
CREATE TABLE finance_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,          -- 'receita' | 'despesa'
  category TEXT NOT NULL,      -- 'Alimentação', 'Transporte', etc.
  value INTEGER NOT NULL,      -- Em centavos
  description TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Projetos
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,        -- 'planning' | 'active' | 'stalled' | 'completed'
  priority TEXT NOT NULL,      -- 'low' | 'medium' | 'high' | 'urgent'
  deadline TEXT,
  next_action TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Alertas
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,          -- 'finance_high_spending' | 'project_deadline' | etc.
  severity TEXT NOT NULL,      -- 'low' | 'medium' | 'high'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved INTEGER DEFAULT 0,  -- Boolean
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Repositórios

Todos implementam padrão Repository com tipo genérico `Repository<T>`:

- `UserRepository`: CRUD de usuários
- `CheckinRepository`: CRUD de check-ins + `getRecent(userId, limit)`
- `FinanceEntryRepository`: CRUD de entradas + `getByUser(userId)`, `getByDateRange(...)`
- `ProjectRepository`: CRUD de projetos + `getByUser(userId)`, `getByStatus(...)`
- `AlertRepository`: CRUD de alertas + `getUnresolved(userId)`, `markResolved(id)`

**Veja `packages/storage/src/repositories/` para implementações.**

---

## 🔧 Scripts Disponíveis

### Root
- `pnpm dev:mobile` - Inicia Metro bundler (mobile)
- `pnpm dev:desktop` - Inicia Vite + Tauri (desktop)
- `pnpm test` - Roda todos os testes
- `pnpm typecheck` - Valida tipos em todos os pacotes
- `pnpm lint` - ESLint em todos os pacotes
- `pnpm format` - Prettier em todos os arquivos

### Mobile (`apps/mobile/`)
- `pnpm start` - Metro bundler
- `pnpm ios` - Roda no simulador iOS
- `pnpm android` - Roda no emulador Android
- `pnpm web` - Roda no navegador

### Desktop (`apps/desktop/`)
- `pnpm tauri:dev` - Dev mode com Tauri
- `pnpm tauri build` - Build de produção
- `pnpm dev` - Apenas Vite (sem Tauri)
- `pnpm build` - Apenas build do frontend

### Pacotes (`packages/*/`)
- `pnpm test` - Testes unitários
- `pnpm build` - Build do pacote

---

## 🐛 Troubleshooting

### Desktop não inicia
```bash
# Reinstale dependências nativas
cd packages/storage
pnpm rebuild better-sqlite3

# Verifique Rust
rustc --version
# Se não instalado: https://rustup.rs/
```

### Mobile com erro de cache
```bash
cd apps/mobile
pnpm start -- --reset-cache
rm -rf .expo node_modules
pnpm install
```

### Testes falhando
```bash
# Limpe tudo
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
pnpm test
```

### Build de produção falha
```bash
# Desktop: Verifique se ícones existem
ls apps/desktop/src-tauri/icons/

# Mobile: Verifique EAS setup
cd apps/mobile
eas whoami
eas build:configure
```

---

## 📈 Roadmap (Futuro)

### Funcionalidades Planejadas
- [ ] **Decisões**: Registro de decisões importantes com contexto
- [ ] **Notificações**: Alertas push para deadlines e check-ins
- [ ] **Sincronização**: Sync opcional via servidor próprio (self-hosted)
- [ ] **Exportação**: Backup completo em JSON/CSV
- [ ] **Gráficos**: Visualizações de tendências (Chart.js ou similar)
- [ ] **Temas**: Light mode (atualmente apenas dark)
- [ ] **Atalhos de Teclado**: Navegação rápida no desktop
- [ ] **Window State**: Persistir posição/tamanho da janela
- [ ] **Detecção de Projetos Travados**: Alerta automático para projetos sem atualização

### Melhorias Técnicas
- [ ] **E2E Tests**: Detox (mobile) + Playwright (desktop)
- [ ] **CI/CD**: GitHub Actions para builds automáticos
- [ ] **Storybook**: Documentação de componentes
- [ ] **Sentry**: Error tracking em produção
- [ ] **Analytics**: Opcional, opt-in, local-first

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie um branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para o branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Guidelines
- Execute `pnpm typecheck` e `pnpm test` antes de commitar
- Mantenha cobertura de testes > 80%
- Siga os padrões de código existentes (Prettier + ESLint)
- Documente novas funcionalidades no README

---

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/assistente/issues)
- **Documentação**: Veja os arquivos `*_GUIDE.md` no root
- **Email**: suporte@assistente.app (futuro)

---

## 🙏 Agradecimentos

Construído com:
- [Tauri](https://tauri.app/) - Desktop framework
- [Expo](https://expo.dev/) - Mobile framework
- [React](https://react.dev/) - UI library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite driver

---

**Desenvolvido com ❤️ para ajudar você a operar melhor.**

**Versão**: 1.0.0  
**Última Atualização**: Fevereiro 2, 2026
- [ ] CP5: Desktop app implementation
- [ ] CP6: Store-ready builds
