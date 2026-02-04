# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure (Recommended)

1. **DO NOT** open a public GitHub issue
2. Email: security@assistente.app (or create a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 7-14 days
  - Medium: 30 days
  - Low: 90 days

### What to Expect

1. We'll acknowledge receipt of your report
2. We'll investigate and validate the issue
3. We'll develop and test a fix
4. We'll release a security patch
5. We'll publicly disclose after fix is deployed

### Bug Bounty

Currently, we don't have a formal bug bounty program. However, we deeply appreciate security researchers and will:

- Credit you in release notes (if desired)
- Provide recognition in our Hall of Fame
- Consider rewards for critical findings

---

## Security Best Practices

### For Users

**Data Protection**:

- All data is stored locally (offline-first)
- No network connections by default
- Consider enabling device encryption

**Mobile**:

- Enable biometric lock (optional feature)
- Use strong device passcode
- Keep app updated

**Desktop**:

- Use OS-level disk encryption (BitLocker/FileVault)
- Keep Rust/Node.js updated for security patches
- Run from trusted sources only

### For Developers

**Dependencies**:

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update --latest
```

**Code Signing**:

- Desktop: Sign binaries with valid certificates
- Mobile: Use proper provisioning profiles

**Environment Variables**:

- Never commit `.env` files
- Use secrets management for CI/CD
- Rotate API keys regularly

---

## Known Security Considerations

### Current Implementation

✅ **What We Do**:

- Local-only data storage (no network calls)
- No external analytics or tracking
- No sensitive data in logs
- SQLite with prepared statements (SQL injection protection)
- Type-safe codebase (TypeScript strict mode)

⚠️ **What We Don't Do (Yet)**:

- Database encryption (SQLite is plain text)
- Code obfuscation
- Certificate pinning
- Tamper detection

### Recommended Hardening (Future)

1. **Database Encryption**:

   ```bash
   # Desktop: Use SQLCipher instead of better-sqlite3
   pnpm add @journeyapps/sqlcipher

   # Mobile: Enable encryption in expo-sqlite
   ```

2. **Secure Storage for Secrets**:

   ```typescript
   // Mobile: Use expo-secure-store
   import * as SecureStore from 'expo-secure-store';

   // Desktop: Use keytar or OS keychain
   ```

3. **Certificate Pinning** (if adding network features):
   ```typescript
   // Prevent man-in-the-middle attacks
   ```

---

## Vulnerability History

### 1.0.0 (2026-02-02)

No known vulnerabilities at release.

---

## Security Contacts

- **Email**: security@assistente.app
- **GitHub**: Create a private security advisory
- **Response Time**: Within 48 hours

---

## Responsible Disclosure

We follow coordinated vulnerability disclosure:

1. Researcher reports issue privately
2. We confirm and develop fix
3. Researcher gets credit (if desired)
4. Public disclosure after patch

Thank you for helping keep Assistente Operacional secure! 🔒
