# Store Submission Guide

## Overview
Complete guide to submitting Assistente Operacional to app stores:
- Apple App Store (iOS)
- Google Play Store (Android)
- Microsoft Store (Windows Desktop)

---

## 🍎 Apple App Store (iOS)

### Prerequisites
1. **Apple Developer Account** ($99/year)
   - Enroll at https://developer.apple.com/programs/
2. **Xcode** on macOS (for final testing)
3. **App Store Connect Access**
4. **Production Build** from EAS

### Step 1: Create App in App Store Connect
1. Log in to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Assistente Operacional
   - **Primary Language**: Portuguese (Brazil)
   - **Bundle ID**: `com.assistente.operacional`
   - **SKU**: `assistente-operacional-ios`
   - **User Access**: Full Access

### Step 2: App Information
**Category**: Productivity
**Subcategory**: Finance

**Privacy Policy URL**: (Required - create one)
**Support URL**: (Required - your support page)

**App Previews and Screenshots** (Required for all device sizes):
- iPhone 6.5" Display (1242 × 2688 or 1284 × 2778)
- iPhone 5.5" Display (1242 × 2208)
- iPad Pro (2048 × 2732)

Capture screenshots of:
1. Home/Dashboard with state badge
2. Daily Check-in screen
3. Finance summary
4. Projects list
5. Alerts view

### Step 3: Build and Submit with EAS
```bash
cd apps/mobile

# First time: Configure EAS
eas login
eas build:configure

# Update eas.json with your Apple credentials
# - appleId: Your Apple ID email
# - ascAppId: From App Store Connect
# - appleTeamId: From developer.apple.com

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

### Step 4: App Review Information
**Demo Account**: Create a test user with sample data
- Email: demo@assistente.local
- Password: (Provide to Apple reviewers)

**Notes for Reviewers**:
```
Assistente Operacional is an offline-first personal management system.

Test Flow:
1. Open app → Tap "Começar o dia"
2. Complete daily check-in (select any options)
3. View dashboard showing operational state
4. Tap "Finanças" → Add sample entry
5. Tap "Projetos" → Create sample project
6. Tap "Histórico" → View check-in history

All data is stored locally using SQLite. No backend connection required.
```

### Step 5: Pricing and Availability
- **Price**: Free (or set your price)
- **Availability**: All territories or select specific countries

### Step 6: Submit for Review
- Check all required fields are complete
- Click "Submit for Review"
- Wait 1-3 days for Apple review
- Address any feedback if rejected

---

## 🤖 Google Play Store (Android)

### Prerequisites
1. **Google Play Console Account** ($25 one-time)
   - Register at https://play.google.com/console/signup
2. **Service Account JSON** (for automated submission)
3. **Production Build** from EAS

### Step 1: Create App in Play Console
1. Log in to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - **App name**: Assistente Operacional
   - **Default language**: Portuguese (Brazil)
   - **App or Game**: App
   - **Free or Paid**: Free
   - Accept declarations

### Step 2: Store Listing
**Short description** (80 chars):
```
Sistema de gestão pessoal offline com decisões operacionais inteligentes
```

**Full description** (4000 chars):
```
🚀 Assistente Operacional

Tome decisões melhores com seu assistente pessoal offline-first.

RECURSOS PRINCIPAIS:
✅ Check-in Diário - Avalie seu estado (caixa, energia, pressão)
📊 Dashboard Inteligente - Modo ATTACK, CAUTION ou CRITICAL
💰 Gestão Financeira - Entradas, saídas, previsão de caixa
📁 Projetos - Gerencie objetivos e próximas ações
⚠️ Alertas Automáticos - Avisos sobre gastos, projetos travados
🧭 Orientação Diária - DO, HOLD ou CUT baseado no seu estado

PRIVACIDADE TOTAL:
• 100% offline - todos os dados ficam no seu dispositivo
• Sem conta, sem login, sem rastreamento
• SQLite local para persistência segura

REGRAS INTELIGENTES:
• Estado CRÍTICO → Foco em resolver urgências
• Estado ATTACK → Avançar projetos estratégicos
• Estado CAUTION → Manter ritmo e organização

Ideal para profissionais autônomos, empreendedores e qualquer pessoa que quer tomar decisões operacionais melhores baseadas em dados reais.
```

**App category**: Productivity
**Tags**: gestão, produtividade, finanças, projetos

**Contact details**:
- Email: (Your support email)
- Website: (Optional)

**Screenshots** (Required - min 2, max 8):
- Phone: 1080 × 1920 or higher
- Capture same screens as iOS

**Feature Graphic** (Required):
- 1024 × 500 PNG
- Design: App logo + tagline "Decisões Operacionais Inteligentes"

### Step 3: Content Rating
Complete questionnaire → Should receive "Everyone" or "PEGI 3" rating

### Step 4: App Content
- **Privacy Policy URL**: (Required)
- **Target audience**: Adults
- **App access**: No special access needed
- **Ads**: No ads
- **In-app purchases**: None (unless you add premium)

### Step 5: Build and Submit with EAS
```bash
cd apps/mobile

# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

Or manually upload APK/AAB:
1. In Play Console → Production → Create new release
2. Upload APK/AAB from EAS build
3. Add release notes
4. Review → Start rollout to production

### Step 6: Rollout
- Start with internal testing (optional)
- Promote to closed testing (optional)
- Promote to production
- Review usually takes a few hours

---

## 🪟 Microsoft Store (Windows Desktop)

### Prerequisites
1. **Microsoft Partner Center Account** ($19/year for individual, $99 for company)
   - Register at https://partner.microsoft.com/dashboard
2. **Windows App Certification Kit** (for testing)
3. **Tauri Production Build**

### Step 1: Create App in Partner Center
1. Log in to Partner Center
2. Apps and games → New product → MSIX or PWA app
3. **Name**: Assistente Operacional
4. Reserve the name

### Step 2: App Identity
Note down from Partner Center:
- **Package/Identity/Name**: From manifest
- **Package/Identity/Publisher**: Your publisher ID

Update `apps/desktop/src-tauri/tauri.conf.json`:
```json
"identifier": "com.assistente.operacional"
```

### Step 3: Build for Windows
```bash
cd apps/desktop

# Install dependencies
pnpm install

# Build production bundle
pnpm tauri build

# Output: src-tauri/target/release/bundle/msi/Assistente Operacional_1.0.0_x64_en-US.msi
```

### Step 4: App Submission
**Age rating**: 3+
**Category**: Productivity

**Description** (10,000 chars max - use similar to Google Play):
```
🚀 Assistente Operacional - Sistema de Gestão Pessoal Offline

[Same description as Android, translated/adapted]
```

**Screenshots** (Required - min 1, max 10):
- Recommended: 1920 × 1080 or 2560 × 1440
- Capture: Dashboard, Check-in, Finance, Projects

**Features**:
- Works offline
- Local data storage
- No account required
- Automatic decision engine

### Step 5: Packages
1. Upload `.msi` or `.msix` package from Tauri build
2. Wait for validation (automated checks)
3. Address any certification failures

### Step 6: Pricing and Availability
- **Pricing**: Free (or set price)
- **Markets**: Worldwide or select specific

### Step 7: Submit
- Review all sections for completeness
- Click "Submit to the Store"
- Certification takes 1-3 business days

---

## 📋 Pre-Submission Checklist

### All Platforms
- [ ] Replace placeholder icons with proper app icon
- [ ] Create and test splash screen (mobile)
- [ ] Write Privacy Policy (host publicly)
- [ ] Write Terms of Service (optional but recommended)
- [ ] Create support email/website
- [ ] Capture all required screenshots
- [ ] Test app thoroughly on physical devices
- [ ] Prepare demo account credentials (if needed)
- [ ] Version number is 1.0.0
- [ ] All placeholder values replaced in configs

### iOS Specific
- [ ] Update `eas.json` with Apple credentials
- [ ] Test on real iOS device
- [ ] Prepare App Preview video (optional but recommended)
- [ ] Export compliance documentation (if using encryption)

### Android Specific
- [ ] Generate service account JSON for automated submission
- [ ] Create feature graphic (1024 × 500)
- [ ] Test on multiple Android devices (different screen sizes)
- [ ] Complete content rating questionnaire

### Windows Specific
- [ ] Test MSI installer on clean Windows machine
- [ ] Run Windows App Certification Kit
- [ ] Code sign certificate (optional but recommended)
- [ ] Test auto-update mechanism (if implemented)

---

## 🚀 Post-Launch

### Monitoring
- **iOS**: App Store Connect → Analytics
- **Android**: Play Console → Statistics
- **Windows**: Partner Center → Analytics

### Updates
**Versioning scheme**: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

**Update flow**:
1. Increment version in:
   - `apps/mobile/app.json` (version + iOS buildNumber + Android versionCode)
   - `apps/desktop/src-tauri/tauri.conf.json` (version)
2. Build with EAS/Tauri
3. Submit to stores
4. Add release notes explaining changes

### User Feedback
- Respond to reviews promptly
- Track crash reports (consider Sentry integration)
- Maintain changelog in repository

---

## 🆘 Common Issues

**iOS Rejection Reasons**:
- Missing Privacy Policy → Add before submission
- Incomplete metadata → Fill all required fields
- Crashes on launch → Test on real devices first
- Guideline violations → Review App Store Guidelines

**Android Rejection Reasons**:
- Missing screenshots → Upload all required sizes
- Content rating incomplete → Complete questionnaire
- Target API too old → Update Expo SDK

**Windows Certification Failures**:
- Missing dependencies → Include all DLLs
- Crashes → Run WACK before submission
- Security issues → Code sign with valid certificate

---

## 📚 Resources

**Documentation**:
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Tauri Building](https://tauri.app/v1/guides/building/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Microsoft Store Policies](https://docs.microsoft.com/en-us/windows/uwp/publish/store-policies)

**Tools**:
- [App Store Screenshot Maker](https://shotbot.io/)
- [Google Play Screenshot Generator](https://www.appstorescreenshots.com/)
- [Privacy Policy Generator](https://www.freeprivacypolicy.com/)

---

**Last Updated**: February 2, 2026
**Version**: 1.0.0
