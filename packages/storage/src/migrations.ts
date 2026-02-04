import { Database } from './database';

export interface Migration {
  version: number;
  description: string;
  sql: string;
}

export class MigrationManager {
  constructor(private db: Database) {}

  /**
   * Get current schema version from database
   */
  getCurrentVersion(): number {
    try {
      const result = this.db
        .prepare('SELECT MAX(version) as version FROM schema_version')
        .get() as { version: number | null };
      return result?.version || 0;
    } catch {
      // Table doesn't exist yet
      return 0;
    }
  }

  /**
   * Run all pending migrations
   */
  migrate(migrationsPath?: string): void {
    const currentVersion = this.getCurrentVersion();
    const migrations = this.loadMigrations(migrationsPath);

    const pending = migrations.filter((m) => m.version > currentVersion);

    if (pending.length === 0) {
      console.log('✅ Database is up to date (version', currentVersion, ')');
      return;
    }

    console.log(`Running ${pending.length} migration(s)...`);

    for (const migration of pending) {
      console.log(`  Applying migration ${migration.version}: ${migration.description}`);
      this.applyMigration(migration);
    }

    console.log('✅ Migrations complete');
  }

  /**
   * Apply a single migration
   */
  private applyMigration(migration: Migration): void {
    try {
      this.db.exec(migration.sql);
      console.log(`  ✅ Migration ${migration.version} applied`);
    } catch (error) {
      console.error(`  ❌ Migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  /**
   * Load migration files from disk (Node.js environments)
   * For bundled apps, migrations should be embedded
   */
  private loadMigrations(migrationsPath?: string): Migration[] {
    if (!migrationsPath) {
      // Return embedded migrations
      return this.getEmbeddedMigrations();
    }

    // Load from filesystem (development)
    try {
      const files: string[] = [];

      return files.map((file: string) => {
        const match = file.match(/^(\d+)_(.+)\.sql$/);
        if (!match) throw new Error(`Invalid migration filename: ${file}`);

        const version = parseInt(match[1], 10);
        const description = match[2].replace(/_/g, ' ');
        const sql = '';

        return { version, description, sql };
      });
    } catch (error) {
      console.warn('Could not load migrations from filesystem, using embedded');
      return this.getEmbeddedMigrations();
    }
  }

  /**
   * Embedded migrations for production builds
   */
  private getEmbeddedMigrations(): Migration[] {
    return [
      {
        version: 1,
        description: 'Initial schema',
        sql: `
-- Schema version: 1
-- Created: 2026-02-02

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  settings_theme TEXT DEFAULT 'dark',
  settings_biometric_enabled INTEGER DEFAULT 0,
  settings_notifications_enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS daily_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date INTEGER NOT NULL,
  caixa_status TEXT NOT NULL CHECK(caixa_status IN ('tranquilo', 'atencao', 'critico')),
  energia TEXT NOT NULL CHECK(energia IN ('alta', 'media', 'baixa')),
  pressao TEXT NOT NULL CHECK(pressao IN ('leve', 'normal', 'alta')),
  estado_calculado TEXT CHECK(estado_calculado IN ('ATTACK', 'CAUTION', 'CRITICAL')),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON daily_checkins(date DESC);

CREATE TABLE IF NOT EXISTS financial_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('entrada', 'saida')),
  value INTEGER NOT NULL,
  category TEXT NOT NULL,
  date INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_finance_user_date ON financial_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_type ON financial_entries(user_id, type);
CREATE INDEX IF NOT EXISTS idx_finance_category ON financial_entries(user_id, category);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'paused', 'done')),
  objective TEXT NOT NULL,
  next_action TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  linked_project_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('todo', 'doing', 'done')),
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(linked_project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  date INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_date ON decisions(user_id, date DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('finance', 'project', 'system', 'overload')),
  message TEXT NOT NULL,
  date INTEGER NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_resolved ON alerts(user_id, resolved, date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(user_id, type);

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL,
  description TEXT
);

INSERT INTO schema_version (version, applied_at, description) 
VALUES (1, strftime('%s', 'now') * 1000, 'Initial schema');
        `,
      },
      {
        version: 2,
        description: 'Performance optimization indexes',
        sql: `
-- Schema version: 2
-- Created: 2026-02-02
-- Description: Add composite indexes for optimized repository queries

-- Optimize financial_entries for date range queries with type filtering
CREATE INDEX IF NOT EXISTS idx_finance_user_date_type ON financial_entries(user_id, date DESC, type);

-- Optimize projects for stalled project detection (active status + old updated_at)
CREATE INDEX IF NOT EXISTS idx_projects_stalled ON projects(user_id, status, updated_at ASC);

-- Optimize daily_checkins for recent queries with estado_calculado filtering
CREATE INDEX IF NOT EXISTS idx_checkins_user_date_estado ON daily_checkins(user_id, date DESC, estado_calculado);

-- Optimize tasks for project-based queries with status
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(linked_project_id, status);

-- Optimize alerts for unresolved alerts by type
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved_type ON alerts(user_id, resolved, type, date DESC);

INSERT INTO schema_version (version, applied_at, description) 
VALUES (2, strftime('%s', 'now') * 1000, 'Performance optimization indexes');
        `,
      },
    ];
  }
}
