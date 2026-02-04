# Build and Development Scripts Guide

## Mobile (Expo/React Native)

### Development

```bash
cd apps/mobile

# Start Metro bundler
pnpm start

# Run on iOS simulator (macOS only)
pnpm ios

# Run on Android emulator
pnpm android

# Run on web
pnpm web

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Production Builds with EAS

**First Time Setup**:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
cd apps/mobile
eas build:configure
```

**Build Commands**:

```bash
# iOS build (requires Apple Developer account)
eas build --platform ios --profile production

# Android build
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production

# Preview/internal build (faster, for testing)
eas build --platform android --profile preview
```

**Submit to Stores**:

```bash
# Submit iOS to App Store
eas submit --platform ios --profile production

# Submit Android to Play Store
eas submit --platform android --profile production
```

---

## Desktop (Tauri)

### Development

```bash
cd apps/desktop

# Start dev server (Vite + Tauri)
pnpm tauri:dev

# Just Vite (for web preview)
pnpm dev

# Type check
pnpm typecheck

# Build frontend only
pnpm build
```

### Production Builds

**Windows**:

```bash
cd apps/desktop
pnpm tauri build

# Output:
# src-tauri/target/release/bundle/msi/Assistente Operacional_1.0.0_x64_en-US.msi
# src-tauri/target/release/Assistente Operacional.exe
```

**macOS** (on macOS only):

```bash
cd apps/desktop
pnpm tauri build

# Output:
# src-tauri/target/release/bundle/dmg/Assistente Operacional_1.0.0_x64.dmg
# src-tauri/target/release/bundle/macos/Assistente Operacional.app
```

**Linux**:

```bash
cd apps/desktop
pnpm tauri build

# Output:
# src-tauri/target/release/bundle/deb/assistente-operacional_1.0.0_amd64.deb
# src-tauri/target/release/bundle/appimage/assistente-operacional_1.0.0_amd64.AppImage
```

---

## Root Level Commands

### Development

```bash
# Start mobile dev
pnpm dev:mobile

# Start desktop dev
pnpm dev:desktop

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format all code
pnpm format
```

### Package-Specific Commands

```bash
# Run command in specific package
pnpm --filter @assistente/core test
pnpm --filter @assistente/storage test
pnpm --filter mobile start
pnpm --filter desktop tauri:dev
```

---

## Testing

### Unit Tests (Jest)

```bash
# Core package tests
cd packages/core
pnpm test

# Storage package tests
cd packages/storage
pnpm test

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

### E2E Tests (Future)

```bash
# Detox for mobile (not yet set up)
cd apps/mobile
pnpm e2e:ios
pnpm e2e:android

# Playwright for desktop (not yet set up)
cd apps/desktop
pnpm e2e
```

---

## CI/CD

### GitHub Actions Example

```yaml
name: Build and Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm lint

  build-mobile:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform android --profile preview --non-interactive

  build-desktop:
    runs-on: windows-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm --filter desktop tauri build
      - uses: actions/upload-artifact@v3
        with:
          name: desktop-build
          path: apps/desktop/src-tauri/target/release/bundle/
```

---

## Troubleshooting

### Mobile Issues

**Metro bundler cache issues**:

```bash
cd apps/mobile
pnpm start -- --reset-cache
```

**iOS build fails**:

```bash
cd apps/mobile/ios
pod install
cd ..
pnpm ios
```

**Android build fails**:

```bash
cd apps/mobile/android
./gradlew clean
cd ..
pnpm android
```

### Desktop Issues

**Rust not found**:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**better-sqlite3 native binding issues**:

```bash
cd packages/storage
pnpm rebuild better-sqlite3
```

**Vite port already in use**:

```bash
# Change port in vite.config.ts
server: { port: 5174 }
```

---

## Performance Optimization

### Mobile Bundle Size

```bash
cd apps/mobile

# Analyze bundle
npx expo export --platform ios --analyzer

# Check installed packages size
npx expo install --check
```

### Desktop Binary Size

```bash
cd apps/desktop

# Build with smaller binary (slower build)
pnpm tauri build -- --target x86_64-pc-windows-msvc --release --features smaller-binary

# Check binary size
du -h src-tauri/target/release/Assistente\ Operacional.exe
```

---

## Version Management

### Bump Version

```bash
# Update version in:
# 1. apps/mobile/app.json (version + buildNumber/versionCode)
# 2. apps/desktop/src-tauri/tauri.conf.json (version)
# 3. Root package.json (optional)

# Then commit
git add .
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main --tags
```

---

## Clean Rebuild

### Full Clean

```bash
# Remove all node_modules and build artifacts
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf apps/mobile/.expo apps/mobile/ios/Pods
rm -rf apps/desktop/dist apps/desktop/src-tauri/target
pnpm install
```

### Selective Clean

```bash
# Clean mobile only
cd apps/mobile
rm -rf node_modules .expo ios/Pods android/.gradle
pnpm install

# Clean desktop only
cd apps/desktop
rm -rf node_modules dist src-tauri/target
pnpm install
```

---

**Last Updated**: February 2, 2026
