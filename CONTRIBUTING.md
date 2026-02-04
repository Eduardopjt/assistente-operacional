# Contributing to Assistente Operacional

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Personal attacks or political discussions
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust (for desktop development)
- Git

### Setup

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/assistente.git
   cd assistente
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/assistente/assistente.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Verify setup**
   ```bash
   pnpm test
   pnpm typecheck
   ```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

**Branch naming conventions**:

- `feature/` - New features (e.g., `feature/decision-logging`)
- `fix/` - Bug fixes (e.g., `fix/checkin-date-bug`)
- `docs/` - Documentation only (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/storage-layer`)
- `test/` - Test additions/fixes (e.g., `test/add-rules-coverage`)

### 2. Make Changes

```bash
# Work on your changes
# Run tests frequently
pnpm test

# Check types
pnpm typecheck

# Format code
pnpm format
```

### 3. Commit Changes

See [Commit Guidelines](#commit-guidelines) below.

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
# Go to GitHub and create Pull Request
```

---

## Coding Standards

### TypeScript

- **Strict mode**: All code must pass `strict: true` checks
- **No `any`**: Use proper types or `unknown` with type guards
- **Explicit return types**: For public functions/methods
- **Naming conventions**:
  - `PascalCase` for types, interfaces, classes
  - `camelCase` for variables, functions
  - `UPPER_CASE` for constants

**Example**:

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User | null {
  // ...
}

const MAX_RETRIES = 3;

// Bad
function getUser(id) {
  // Missing types
  return id; // any
}
```

### React

- **Functional components**: Use hooks, avoid class components
- **Props interfaces**: Always define prop types
- **Component files**: One component per file (except small utility components)

**Example**:

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### File Organization

```
packages/core/src/
├── entities/       # Domain models
├── rules/          # Business logic
├── types/          # Shared types
└── __tests__/      # Tests

packages/storage/src/
├── adapters/       # Database adapters
├── repositories/   # Data access layer
├── schema/         # SQL migrations
└── __tests__/      # Tests

apps/mobile/
├── app/            # Screens (file-based routing)
├── components/     # Reusable components
├── store/          # State management
└── services/       # Business logic

apps/desktop/src/
├── screens/        # Page components
├── components/     # Reusable components
├── services/       # Business logic
└── store/          # State management
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance (deps, build, etc.)

**Scopes** (optional):

- `core`: Core package
- `storage`: Storage package
- `mobile`: Mobile app
- `desktop`: Desktop app
- `ui`: UI components
- `*`: Multiple scopes

**Examples**:

```bash
feat(core): add decision logging entity

Add Decision entity with status tracking and review dates.
Includes repository interface and migration.

Closes #123

---

fix(mobile): correct check-in date timezone issue

Previous implementation used local time, causing date mismatches
for users in different timezones. Now uses UTC consistently.

Fixes #456

---

docs(readme): update installation instructions

Add prerequisites section and troubleshooting steps for
common setup issues.
```

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm format
   ```

3. **Update documentation** if needed
   - Update README.md if adding features
   - Add JSDoc comments for new functions
   - Update CHANGELOG.md

### PR Template

When creating a PR, include:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Type check passes
- [ ] Manually tested on desktop
- [ ] Manually tested on mobile

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests for new features

## Related Issues

Closes #123
```

### Review Process

- PRs require at least 1 approval
- CI must pass (type check + tests)
- Address all review comments
- Maintainers may request changes

---

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @assistente/core test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

### Writing Tests

**Unit Tests** (packages/core, packages/storage):

```typescript
// packages/core/src/rules/__tests__/engine.test.ts
describe('computeState', () => {
  it('should return CRITICAL when caixa is critico', () => {
    const checkin = createCheckin({ caixa_status: 'critico' });
    const result = computeState(checkin);
    expect(result).toBe('CRITICAL');
  });
});
```

**Test Coverage Goals**:

- Core logic: 80%+
- Repositories: 70%+
- UI components: 50%+

---

## Documentation

### Code Comments

- **JSDoc** for public APIs
- Inline comments for complex logic only
- Explain "why", not "what"

**Example**:

```typescript
/**
 * Computes operational state from daily check-in data.
 *
 * @param checkin - Daily check-in with caixa, energia, pressão
 * @returns Operational state (CRITICAL, ATTACK, or CAUTION)
 *
 * @remarks
 * CRITICAL: Requires immediate action (financial or energy issues)
 * ATTACK: Optimal conditions for high-impact work
 * CAUTION: Proceed carefully with reduced capacity
 */
export function computeState(checkin: DailyCheckin): EstadoCalculado {
  // Implementation prioritizes financial safety over productivity
  if (checkin.caixa_status === 'critico') {
    return 'CRITICAL';
  }
  // ...
}
```

### Documentation Updates

When adding features:

1. Update relevant section in README.md
2. Add entry to CHANGELOG.md
3. Update API docs if needed
4. Add examples to guides

---

## Development Tips

### Debugging

**Desktop**:

```bash
cd apps/desktop
pnpm tauri:dev
# Open DevTools: Right-click → Inspect
```

**Mobile**:

```bash
cd apps/mobile
pnpm start
# Press 'j' to open debugger
```

### Monorepo Commands

```bash
# Run command in specific package
pnpm --filter @assistente/core <command>

# Run command in all packages
pnpm -r <command>

# Add dependency to specific package
pnpm --filter mobile add react-native-svg
```

### Performance Tips

- Use `useMemo` for expensive computations
- Implement virtual scrolling for large lists
- Optimize SQLite queries with indexes
- Profile with React DevTools

---

## Questions?

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Email**: suporte@assistente.app (future)

---

Thank you for contributing! 🎉
