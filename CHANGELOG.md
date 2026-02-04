# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Decision logging feature (schema exists, UI pending)
- Push notifications for mobile
- Keyboard shortcuts for desktop
- Window state persistence
- Stalled project detection alerts
- Data export/import functionality

---

## [1.0.0] - 2026-02-02

### Initial Release 🎉

#### Added

**Core Features**

- Offline-first architecture with local SQLite storage
- Intelligent rules engine for operational decision-making
- Cross-platform support (Windows, macOS, Linux, Android, iOS)
- Daily check-in system (Caixa/Energia/Pressão tracking)
- Financial management (income/expense tracking with categories)
- Project management with status tracking
- Alert system with contextual notifications
- Actionable guidance based on operational state

**Desktop App (Tauri)**

- React 18 + TypeScript + Vite frontend
- Rust backend with Tauri 1.5
- Real SQLite storage via better-sqlite3
- 6 main screens: Home, Check-in, Dashboard, Finance, Projects, History
- Sidebar navigation with dark theme
- Grid layouts optimized for desktop
- Window size: 1280×800 (min: 1024×600)

**Mobile App (Expo)**

- React Native with Expo ~50.0
- File-based routing (Expo Router)
- 6 main screens matching desktop functionality
- Touch-optimized UI with dark theme
- Gradient accents and smooth animations
- Mock storage for development

**Shared Packages**

- `@assistente/core`: Domain entities + rules engine (11 tests passing)
- `@assistente/storage`: SQLite abstraction + 7 repositories
- `@assistente/ui`: Component library (placeholder)
- `@assistente/config`: Shared ESLint/TypeScript configs
- `@assistente/shared`: Utility functions

**Rules Engine**

- `computeState()`: Calculates CRITICAL/ATTACK/CAUTION state
- `generateAlerts()`: Context-aware alert generation
- `computeActionMother()`: Prioritizes most important action
- `computeGuidance()`: Provides DO/HOLD/CUT advice

**Storage Layer**

- SQLite schema v1 with 7 tables
- Migration system with version tracking
- 2 adapters: BetterSqlite (desktop) + ExpoSqlite (mobile)
- 7 repositories with type-safe interfaces
- Foreign key constraints and indexes

**Developer Experience**

- pnpm monorepo with workspaces
- Strict TypeScript configuration
- ESLint + Prettier code formatting
- Jest test framework
- Comprehensive documentation (2,500+ lines)

**Documentation**

- README.md: Complete project overview
- ASSETS_GUIDE.md: Icon generation instructions
- STORE_SUBMISSION_GUIDE.md: Step-by-step for 3 app stores
- BUILD_SCRIPTS_GUIDE.md: All build/dev commands
- FUTURE_ENHANCEMENTS.md: 11 proposed features
- PROJECT_COMPLETE.md: Completion summary

**Build Configuration**

- EAS config for mobile builds (3 profiles)
- Tauri bundle config for desktop
- App permissions configured
- Store metadata ready
- Bundle identifiers: com.assistente.operacional

#### Technical Details

- **Languages**: TypeScript 5.3.3, Rust 1.75+
- **Frameworks**: React 18.2.0, Tauri 1.5, Expo ~50.0
- **State Management**: Zustand 4.4.7
- **Database**: SQLite via better-sqlite3 9.2.2 / expo-sqlite ~13.0
- **Testing**: Jest 29.7.0
- **Tooling**: pnpm 8.x, Vite 5, esbuild

#### Known Limitations

- Icons are placeholders (requires replacement before store submission)
- No cloud sync (by design for privacy)
- Dark theme only
- Single-user model
- No real-time collaboration
- Storage integration tests require better-sqlite3 rebuild

---

## Version History

### Version Numbering

- **Major**: Breaking changes or major feature additions
- **Minor**: New features, backwards-compatible
- **Patch**: Bug fixes, minor improvements

### Upcoming Versions

- **1.1.0**: Decision logging + keyboard shortcuts
- **1.2.0**: Push notifications + biometric auth
- **2.0.0**: Optional cloud sync (self-hosted)

---

[Unreleased]: https://github.com/assistente/assistente/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/assistente/assistente/releases/tag/v1.0.0
