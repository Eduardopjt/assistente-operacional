# Future Enhancements

## Desktop-Specific Improvements

### 1. Keyboard Shortcuts

**Priority**: Medium  
**Estimated Effort**: 4-6 hours

Implement global keyboard shortcuts for faster navigation:

```typescript
// apps/desktop/src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHORTCUTS = {
  'Ctrl+1': '/', // Home
  'Ctrl+2': '/checkin', // Check-in
  'Ctrl+3': '/dashboard', // Dashboard
  'Ctrl+4': '/finance', // Finance
  'Ctrl+5': '/projects', // Projects
  'Ctrl+6': '/history', // History
  'Ctrl+N': '/checkin', // New check-in
  'Ctrl+Shift+F': '/finance', // New finance entry
  'Ctrl+Shift+P': '/projects', // New project
  'Ctrl+,': '/settings', // Settings (future)
  'Ctrl+Q': null, // Quit (Tauri API)
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
      const route = SHORTCUTS[key];

      if (route !== undefined) {
        e.preventDefault();
        if (route === null) {
          // Quit application
          window.__TAURI__.process.exit(0);
        } else {
          navigate(route);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
```

**Usage in App.tsx**:

```typescript
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts(); // Register shortcuts
  // ... rest of app
}
```

**Benefits**:

- Faster navigation for power users
- No mouse required for common actions
- Industry-standard shortcuts (Ctrl+Number for tabs)

---

### 2. Window State Persistence

**Priority**: Medium  
**Estimated Effort**: 3-4 hours

Save and restore window size, position, and maximized state:

```typescript
// apps/desktop/src/services/window-state.ts
import { appWindow } from '@tauri-apps/api/window';
import { BaseDirectory, writeTextFile, readTextFile } from '@tauri-apps/api/fs';

interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  maximized: boolean;
}

const STATE_FILE = 'window-state.json';

export async function saveWindowState(): Promise<void> {
  const size = await appWindow.outerSize();
  const position = await appWindow.outerPosition();
  const maximized = await appWindow.isMaximized();

  const state: WindowState = {
    width: size.width,
    height: size.height,
    x: position.x,
    y: position.y,
    maximized,
  };

  await writeTextFile(STATE_FILE, JSON.stringify(state), {
    dir: BaseDirectory.AppData,
  });
}

export async function loadWindowState(): Promise<WindowState | null> {
  try {
    const content = await readTextFile(STATE_FILE, {
      dir: BaseDirectory.AppData,
    });
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function restoreWindowState(): Promise<void> {
  const state = await loadWindowState();
  if (!state) return;

  await appWindow.setSize({ width: state.width, height: state.height });
  await appWindow.setPosition({ x: state.x, y: state.y });

  if (state.maximized) {
    await appWindow.maximize();
  }
}
```

**Usage in App.tsx**:

```typescript
import { restoreWindowState, saveWindowState } from './services/window-state';

function App() {
  useEffect(() => {
    restoreWindowState();

    // Save on window changes
    const unlisten = appWindow.onResized(() => saveWindowState());
    const unlisten2 = appWindow.onMoved(() => saveWindowState());

    return () => {
      unlisten.then((fn) => fn());
      unlisten2.then((fn) => fn());
    };
  }, []);
}
```

**Benefits**:

- Remembers user's preferred window layout
- Smoother UX (no need to resize every time)
- Works across multiple monitors

---

### 3. System Tray Integration

**Priority**: Low  
**Estimated Effort**: 6-8 hours

Add system tray icon with quick actions:

```rust
// apps/desktop/src-tauri/src/main.rs
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let check_in = CustomMenuItem::new("checkin".to_string(), "Quick Check-in");
  let dashboard = CustomMenuItem::new("dashboard".to_string(), "Dashboard");
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");

  let tray_menu = SystemTrayMenu::new()
    .add_item(check_in)
    .add_item(dashboard)
    .add_native_item(tauri::SystemTrayMenuItem::Separator)
    .add_item(quit);

  let tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
    .system_tray(tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "checkin" => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
            window.eval("window.location.hash = '#/checkin'").unwrap();
          }
          "dashboard" => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
            window.eval("window.location.hash = '#/dashboard'").unwrap();
          }
          "quit" => {
            std::process::exit(0);
          }
          _ => {}
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

**Update tauri.conf.json**:

```json
{
  "tauri": {
    "systemTray": {
      "iconPath": "icons/tray-icon.png",
      "iconAsTemplate": true
    }
  }
}
```

**Benefits**:

- Quick access without opening full window
- Always available in system tray
- Common pattern for productivity apps

---

## Mobile-Specific Improvements

### 4. Push Notifications

**Priority**: High  
**Estimated Effort**: 8-12 hours

Local notifications for check-in reminders and deadlines:

```bash
cd apps/mobile
pnpm add expo-notifications
```

```typescript
// apps/mobile/services/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22C55E',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleCheckinReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Daily at 9 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check-in Diário',
      body: 'Como você está hoje? Faça seu check-in.',
      data: { screen: 'checkin' },
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

export async function scheduleProjectDeadline(projectId: string, title: string, deadline: Date) {
  // 24 hours before
  const trigger = new Date(deadline);
  trigger.setHours(trigger.getHours() - 24);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Prazo Próximo',
      body: `Projeto "${title}" vence amanhã!`,
      data: { screen: 'projects', projectId },
    },
    trigger,
  });
}
```

**Usage**:

```typescript
// apps/mobile/app/_layout.tsx
import { useEffect } from 'react';
import { requestPermissions, scheduleCheckinReminder } from '../services/notifications';

export default function RootLayout() {
  useEffect(() => {
    requestPermissions().then((granted) => {
      if (granted) {
        scheduleCheckinReminder();
      }
    });
  }, []);
}
```

**Benefits**:

- Increases daily check-in adherence
- Prevents missed project deadlines
- Local-only (no server required)

---

### 5. Biometric Authentication

**Priority**: Low  
**Estimated Effort**: 4-6 hours

Optional biometric lock for privacy:

```bash
cd apps/mobile
pnpm add expo-local-authentication
```

```typescript
// apps/mobile/services/auth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function authenticate(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autentique para continuar',
    fallbackLabel: 'Usar senha',
    cancelLabel: 'Cancelar',
  });
  return result.success;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem('biometric_enabled', enabled.toString());
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem('biometric_enabled');
  return value === 'true';
}
```

**Usage in \_layout.tsx**:

```typescript
export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const enabled = await isBiometricEnabled();
      if (enabled) {
        const success = await authenticate();
        if (!success) {
          // Show lock screen
          return;
        }
      }
      setAuthenticated(true);
    })();
  }, []);

  if (!authenticated) {
    return <LockScreen />;
  }

  return <Stack />;
}
```

**Benefits**:

- Privacy protection for sensitive financial data
- Fast unlock with Face ID/Touch ID/fingerprint
- Optional (user can disable)

---

## Cross-Platform Features

### 6. Decision Logging

**Priority**: High  
**Estimated Effort**: 6-8 hours

Currently missing from storage layer - track important decisions:

**Add to schema**:

```sql
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  context TEXT,              -- Why the decision was made
  outcome TEXT,              -- Expected outcome
  review_date TEXT,          -- When to review
  status TEXT NOT NULL,      -- 'pending' | 'active' | 'completed' | 'abandoned'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Repository**:

```typescript
// packages/storage/src/repositories/DecisionRepository.ts
export class DecisionRepository implements Repository<Decision> {
  // Standard CRUD...

  getByUser(userId: string): Decision[] {
    return this.db
      .prepare(
        `
      SELECT * FROM decisions
      WHERE user_id = ? AND status != 'abandoned'
      ORDER BY created_at DESC
    `
      )
      .all(userId)
      .map((row) => this.mapRow(row));
  }

  getPendingReviews(userId: string): Decision[] {
    const today = new Date().toISOString().split('T')[0];
    return this.db
      .prepare(
        `
      SELECT * FROM decisions
      WHERE user_id = ? AND review_date <= ? AND status = 'active'
      ORDER BY review_date ASC
    `
      )
      .all(userId, today)
      .map((row) => this.mapRow(row));
  }
}
```

**UI Screen** (History tab):

```typescript
// Add "Decisões" tab alongside Checkins/Alerts
const decisions = decisionRepo.getByUser(userId);

<Tab label="Decisões">
  {decisions.map(d => (
    <DecisionCard
      key={d.id}
      title={d.title}
      date={d.date}
      status={d.status}
      reviewDate={d.review_date}
      onReview={() => /* Navigate to review screen */}
    />
  ))}
</Tab>
```

**Benefits**:

- Tracks important life/business decisions
- Scheduled reviews to evaluate outcomes
- Provides context for future reference

---

### 7. Stalled Project Detection

**Priority**: Medium  
**Estimated Effort**: 3-4 hours

Automatic alerts for projects without updates:

```typescript
// packages/core/src/rules/project-rules.ts
export function detectStalledProjects(projects: Project[]): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  for (const project of projects) {
    if (project.status !== 'active') continue;

    const daysSinceUpdate = (now - project.updated_at) / (24 * 60 * 60 * 1000);

    if (daysSinceUpdate >= 3) {
      alerts.push({
        id: crypto.randomUUID(),
        user_id: project.user_id,
        type: 'project_stalled',
        severity: daysSinceUpdate >= 7 ? 'high' : 'medium',
        title: `Projeto sem atualização: ${project.title}`,
        message: `Projeto está ${Math.floor(daysSinceUpdate)} dias sem atualização. Revisar status?`,
        resolved: false,
        created_at: now,
      });
    }
  }

  return alerts;
}
```

**Integration in app-store.ts**:

```typescript
refreshDashboard() {
  // ... existing code ...

  const projects = projectRepo.getByUser(userId);
  const stalledAlerts = detectStalledProjects(projects);

  // Save new alerts
  stalledAlerts.forEach(alert => alertRepo.create(alert));
}
```

**Benefits**:

- Prevents projects from being forgotten
- Encourages regular progress updates
- Identifies bottlenecks early

---

### 8. Data Export/Import

**Priority**: Medium  
**Estimated Effort**: 6-8 hours

Backup and restore all user data:

```typescript
// packages/storage/src/services/backup.ts
export interface BackupData {
  version: string;
  timestamp: number;
  users: User[];
  checkins: Checkin[];
  financeEntries: FinanceEntry[];
  projects: Project[];
  alerts: Alert[];
  decisions?: Decision[];
}

export class BackupService {
  constructor(private db: Database) {}

  export(): BackupData {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      users: this.db.prepare('SELECT * FROM users').all(),
      checkins: this.db.prepare('SELECT * FROM checkins').all(),
      financeEntries: this.db.prepare('SELECT * FROM finance_entries').all(),
      projects: this.db.prepare('SELECT * FROM projects').all(),
      alerts: this.db.prepare('SELECT * FROM alerts').all(),
    };
  }

  import(data: BackupData): void {
    // Validate version compatibility
    if (data.version !== '1.0.0') {
      throw new Error('Incompatible backup version');
    }

    // Clear existing data
    this.db.prepare('DELETE FROM alerts').run();
    this.db.prepare('DELETE FROM projects').run();
    this.db.prepare('DELETE FROM finance_entries').run();
    this.db.prepare('DELETE FROM checkins').run();
    this.db.prepare('DELETE FROM users').run();

    // Insert backup data
    const insertUser = this.db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');
    data.users.forEach((u) => insertUser.run(u.id, u.name, u.email, u.created_at));

    // ... repeat for other tables
  }
}
```

**Desktop UI** (Settings screen):

```typescript
import { save, open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

async function handleExport() {
  const filePath = await save({
    defaultPath: `assistente-backup-${new Date().toISOString().split('T')[0]}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (filePath) {
    const backup = backupService.export();
    await writeTextFile(filePath, JSON.stringify(backup, null, 2));
    alert('Backup criado com sucesso!');
  }
}

async function handleImport() {
  const filePath = await open({
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (filePath) {
    const content = await readTextFile(filePath as string);
    const backup = JSON.parse(content);
    backupService.import(backup);
    alert('Backup restaurado! Reinicie o app.');
  }
}
```

**Mobile UI** (use expo-file-system + expo-sharing):

```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function handleExport() {
  const backup = backupService.export();
  const filename = `assistente-backup-${Date.now()}.json`;
  const fileUri = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2));
  await Sharing.shareAsync(fileUri);
}
```

**Benefits**:

- User control over their data
- Easy migration to new device
- Peace of mind (backup before major changes)

---

## Performance Optimizations

### 9. Virtual Scrolling (Mobile)

**Priority**: Low  
**Estimated Effort**: 4-6 hours

For large datasets (100+ finance entries, projects):

```bash
cd apps/mobile
pnpm add react-native-virtualized-view
```

```typescript
// apps/mobile/screens/FinanceScreen.tsx
import { VirtualizedList } from 'react-native';

function FinanceScreen() {
  const entries = financeRepo.getByUser(userId);

  return (
    <VirtualizedList
      data={entries}
      renderItem={({ item }) => <FinanceCard entry={item} />}
      keyExtractor={item => item.id}
      getItemCount={data => data.length}
      getItem={(data, index) => data[index]}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}
```

**Benefits**:

- Smooth scrolling with 1000+ items
- Reduced memory usage
- Better FPS on older devices

---

### 10. Query Indexing

**Priority**: Medium  
**Estimated Effort**: 2-3 hours

Add SQLite indexes for frequently queried columns:

```sql
-- packages/storage/src/schema/migrations/002_add_indexes.ts
CREATE INDEX idx_checkins_user_date ON checkins(user_id, date DESC);
CREATE INDEX idx_finance_user_date ON finance_entries(user_id, date DESC);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_alerts_user_resolved ON alerts(user_id, resolved);
```

**Benefits**:

- Faster dashboard queries (especially with large datasets)
- Better performance on lower-end devices
- Minimal storage overhead

---

## Testing Improvements

### 11. E2E Tests with Playwright (Desktop)

**Priority**: Medium  
**Estimated Effort**: 10-12 hours

```bash
cd apps/desktop
pnpm add -D @playwright/test
```

```typescript
// apps/desktop/e2e/checkin.spec.ts
import { test, expect } from '@playwright/test';

test('complete check-in flow', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to check-in
  await page.click('text=Check-in');

  // Select options
  await page.click('[data-testid="caixa-option"]');
  await page.click('[data-testid="energia-alta"]');
  await page.click('[data-testid="pressao-media"]');

  // Submit
  await page.click('button:has-text("Gerar Check-in")');

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('text=Estado Operacional')).toBeVisible();
});
```

**Benefits**:

- Catch regressions before release
- Verify critical flows work end-to-end
- Confidence in UI changes

---

## Implementation Priority

### Phase 1 (High Priority)

1. **Decision Logging** (CP7?) - Core feature gap
2. **Push Notifications (Mobile)** - Increases user engagement
3. **Stalled Project Detection** - Enhances rules engine

### Phase 2 (Medium Priority)

4. **Keyboard Shortcuts (Desktop)** - Power user feature
5. **Window State Persistence (Desktop)** - UX improvement
6. **Data Export/Import** - User control & safety
7. **Query Indexing** - Performance at scale

### Phase 3 (Low Priority)

8. **System Tray Integration (Desktop)** - Nice-to-have
9. **Biometric Auth (Mobile)** - Optional security
10. **Virtual Scrolling (Mobile)** - Only needed at scale
11. **E2E Tests** - Quality assurance

---

## Estimated Timeline

- **Phase 1**: 3-4 weeks (1 developer)
- **Phase 2**: 3-4 weeks (1 developer)
- **Phase 3**: 2-3 weeks (1 developer)

**Total**: ~8-11 weeks for all enhancements

---

**Last Updated**: February 2, 2026
