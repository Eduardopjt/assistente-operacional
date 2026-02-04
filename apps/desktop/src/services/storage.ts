import { BetterSqliteAdapter, MockAdapter, MigrationManager } from '@assistente/storage';
import {
  UserRepositoryImpl,
  CheckinRepositoryImpl,
  FinanceRepositoryImpl,
  ProjectRepositoryImpl,
  TaskRepositoryImpl,
  DecisionRepositoryImpl,
  AlertRepositoryImpl,
} from '@assistente/storage';
import { Database } from '@assistente/storage';

let db: Database | null = null;

// Repositories
export let userRepo: UserRepositoryImpl;
export let checkinRepo: CheckinRepositoryImpl;
export let financeRepo: FinanceRepositoryImpl;
export let projectRepo: ProjectRepositoryImpl;
export let taskRepo: TaskRepositoryImpl;
export let decisionRepo: DecisionRepositoryImpl;
export let alertRepo: AlertRepositoryImpl;

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI_IPC__' in window;

export async function initStorage() {
  try {
    let dbPath: string;
    let adapter;

    if (isTauri) {
      // Get app data directory from Tauri
      const { appDataDir } = await import('@tauri-apps/api/path');
      const { createDir } = await import('@tauri-apps/api/fs');
      const appDir = await appDataDir();
      dbPath = `${appDir}assistente.db`;

      // Ensure directory exists
      try {
        await createDir(appDir, { recursive: true });
      } catch (err) {
        // Directory may already exist
      }

      adapter = new BetterSqliteAdapter();
    } else {
      // In browser mode, use mock database
      dbPath = ':memory:';
      adapter = new MockAdapter();
      console.log('🌐 Running in browser mode with mock database');
    }

    // Create database using adapter
    db = adapter.open(dbPath);

    // Run migrations
    const migrationManager = new MigrationManager(db);
    migrationManager.migrate();

    // Initialize repositories
    userRepo = new UserRepositoryImpl(db);
    checkinRepo = new CheckinRepositoryImpl(db);
    financeRepo = new FinanceRepositoryImpl(db);
    projectRepo = new ProjectRepositoryImpl(db);
    taskRepo = new TaskRepositoryImpl(db);
    decisionRepo = new DecisionRepositoryImpl(db);
    alertRepo = new AlertRepositoryImpl(db);

    console.log('✅ Storage initialized at:', dbPath);
  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
    throw error;
  }
}

export function closeStorage() {
  if (db) {
    db.close();
    db = null;
  }
}
