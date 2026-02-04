# CP1 — Setup Instructions

## Prerequisites

### Required

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 (Install: `npm install -g pnpm`)

### For Mobile Development

- **Expo CLI**: `npm install -g expo-cli`
- **iOS**: Xcode (macOS only)
- **Android**: Android Studio + Android SDK

### For Desktop Development

- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Platform-specific requirements**:
  - **Windows**: Microsoft C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

---

## Installation

```bash
# Clone the repository (if not already in it)
cd c:\src\assistente

# Install all dependencies
pnpm install
```

This will install dependencies for all packages and apps in the monorepo.

---

## Running the Apps

### Mobile App (Expo)

```bash
# Start development server
pnpm dev:mobile

# Or directly in apps/mobile
cd apps/mobile
pnpm dev

# Then:
# - Scan QR code with Expo Go app (iOS/Android)
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator (macOS only)
# - Press 'w' for web
```

### Desktop App (Tauri)

```bash
# Development mode (hot reload)
pnpm dev:desktop

# Or directly in apps/desktop
cd apps/desktop
pnpm tauri:dev

# Build for production
pnpm tauri:build
```

**Note**: First run will take longer as Rust dependencies compile.

---

## Development Workflow

### Build Packages

```bash
# Build all packages
pnpm -r --filter "./packages/**" build

# Build specific package
pnpm --filter @assistente/core build
```

### Run Tests

```bash
# Run all tests
pnpm test

# Test core package (rules engine)
pnpm --filter @assistente/core test
```

### Type Checking

```bash
# Check all packages
pnpm typecheck

# Or specific app
pnpm --filter mobile typecheck
```

### Linting & Formatting

```bash
# Lint all code
pnpm lint

# Format all code
pnpm format
```

---

## Project Structure

```
assistente/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # Expo Router screens
│   │   └── package.json
│   └── desktop/         # Tauri desktop app
│       ├── src/         # React web UI
│       ├── src-tauri/   # Rust backend
│       └── package.json
├── packages/
│   ├── core/            # Domain entities, rules engine
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   └── rules/
│   │   └── package.json
│   ├── ui/              # Shared UI components, tokens
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── tokens.ts
│   │   └── package.json
│   ├── storage/         # SQLite repositories (CP3)
│   ├── shared/          # Utils, constants
│   └── ...
├── pnpm-workspace.yaml  # Monorepo config
├── package.json         # Root scripts
└── README.md
```

---

## Troubleshooting

### pnpm install fails

```bash
# Clear cache and retry
pnpm store prune
rm -rf node_modules
pnpm install
```

### Mobile app won't start

```bash
# Clear Expo cache
cd apps/mobile
npx expo start -c
```

### Desktop build fails

```bash
# Update Rust toolchain
rustup update

# Clear Tauri cache
cd apps/desktop/src-tauri
cargo clean
```

### TypeScript errors in IDE

```bash
# Rebuild packages
pnpm -r --filter "./packages/**" build

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## Next Steps

- **CP2**: Implement full rules engine + unit tests
- **CP3**: SQLite storage layer + migrations
- **CP4**: Mobile UI implementation (all screens)
- **CP5**: Desktop UI implementation
- **CP6**: Store builds (iOS, Android, Windows)

---

## VS Code Recommended Extensions

- ESLint
- Prettier
- React Native Tools
- Tauri
- rust-analyzer
