# Store-Ready Build Notes (CP6)

This document outlines the steps to prepare and publish the app to app stores.

## Mobile — React Native + Expo

### iOS (Apple App Store)

**Prerequisites:**

- Apple Developer Account ($99/year)
- macOS with Xcode installed
- Certificates and provisioning profiles set up

**Build Steps:**

```bash
cd apps/mobile

# 1. Configure app.json with proper bundle ID and version
# 2. Build for iOS
eas build --platform ios

# 3. Submit to App Store
eas submit --platform ios
```

**Checklist:**

- [ ] App icons (1024x1024 PNG for App Store)
- [ ] Screenshots (required sizes for all devices)
- [ ] Privacy policy URL
- [ ] App description and keywords
- [ ] In-app purchases configured (if any)
- [ ] TestFlight beta testing complete

### Android (Google Play)

**Prerequisites:**

- Google Play Developer Account ($25 one-time)
- Keystore for signing

**Build Steps:**

```bash
cd apps/mobile

# 1. Build AAB for Play Store
eas build --platform android

# 2. Submit to Google Play
eas submit --platform android
```

**Checklist:**

- [ ] App icons and feature graphic
- [ ] Screenshots (phone, tablet, 7-inch, 10-inch)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire complete
- [ ] Store listing complete
- [ ] Closed/open testing track configured

---

## Desktop — Tauri

### Windows (Microsoft Store)

**Prerequisites:**

- Microsoft Partner Center account (free)
- App identity reserved in Partner Center

**Build Steps:**

```bash
cd apps/desktop

# 1. Build Windows installer
pnpm tauri:build --target x86_64-pc-windows-msvc

# Output: src-tauri/target/release/bundle/msi/

# 2. Package for Microsoft Store
# Use Windows App Certification Kit to validate
# Submit via Partner Center
```

**Checklist:**

- [ ] App manifest with proper capabilities
- [ ] Age rating and content declarations
- [ ] Store assets (icons, screenshots, hero image)
- [ ] Privacy policy
- [ ] Passed WACK (Windows App Certification Kit)

### macOS (Not required per spec, but possible)

**Prerequisites:**

- Apple Developer Account
- Code signing certificate

**Build Steps:**

```bash
cd apps/desktop

# Build DMG
pnpm tauri:build --target aarch64-apple-darwin
pnpm tauri:build --target x86_64-apple-darwin

# Notarize for Gatekeeper
xcrun notarytool submit ...
```

---

## Pre-Submission Checklist (All Platforms)

### Legal & Privacy

- [ ] Privacy policy hosted and linked
- [ ] Terms of service (if needed)
- [ ] Data collection disclosure
- [ ] GDPR/LGPD compliance if collecting user data

### Content

- [ ] App icons in all required sizes
- [ ] Screenshots for all device types
- [ ] App description (short & full)
- [ ] Keywords/tags optimized
- [ ] Release notes

### Technical

- [ ] All features functional offline
- [ ] No hardcoded API keys or secrets
- [ ] Crash reporting implemented (if desired)
- [ ] Analytics configured (if desired)
- [ ] Update mechanism tested
- [ ] Performance profiling complete

### Testing

- [ ] Tested on minimum supported OS versions
- [ ] Tested on various screen sizes
- [ ] Accessibility features verified
- [ ] Edge cases handled (no network, low storage, etc.)

---

## Versioning Strategy

Follow semantic versioning: `MAJOR.MINOR.PATCH`

**Example:**

- `1.0.0` — Initial release (CP6)
- `1.0.1` — Bug fix
- `1.1.0` — New feature (e.g., sync capability)
- `2.0.0` — Breaking change (e.g., new storage format)

Update in:

- `package.json` (root and apps)
- `apps/mobile/app.json` → `expo.version`
- `apps/desktop/src-tauri/tauri.conf.json` → `package.version`
- `apps/desktop/src-tauri/Cargo.toml` → `version`

---

## Distribution Strategy

### Phased Rollout (Recommended)

1. **Alpha**: Internal testing (5-10 users)
2. **Beta**: Closed testing (50-100 users via TestFlight/Play Testing)
3. **Staged Rollout**: 10% → 50% → 100% over 1-2 weeks
4. **Full Release**: Monitor crash reports and reviews

### Support Plan

- Monitor store reviews daily (first 2 weeks)
- Prepare hotfix pipeline (critical bugs in <24h)
- Plan for v1.1 features based on feedback

---

## Cost Summary

- **Apple Developer**: $99/year (iOS + macOS)
- **Google Play**: $25 one-time (Android)
- **Microsoft Partner**: Free (Windows)

**Total first year**: ~$124 + time investment

---

## Future-Ready Architecture Notes

The current architecture is designed to support:

- **OAuth/SSO**: Auth logic isolated, ready to swap PIN for OAuth
- **Cloud Sync**: `user_id` in all entities, ready for multi-device sync
- **API Layer**: Core business logic independent from UI/storage
- **Analytics/Monitoring**: Easy to add telemetry without touching domain logic

No refactoring needed for store launch. 🚀
