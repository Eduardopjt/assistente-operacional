-- Schema version: 1
-- Created: 2026-02-02
-- Description: Initial schema for Assistente Operacional

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL, -- Unix timestamp in milliseconds
  settings_theme TEXT DEFAULT 'dark',
  settings_biometric_enabled INTEGER DEFAULT 0,
  settings_notifications_enabled INTEGER DEFAULT 1
);

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date INTEGER NOT NULL, -- Unix timestamp (midnight)
  caixa_status TEXT NOT NULL CHECK(caixa_status IN ('tranquilo', 'atencao', 'critico')),
  energia TEXT NOT NULL CHECK(energia IN ('alta', 'media', 'baixa')),
  pressao TEXT NOT NULL CHECK(pressao IN ('leve', 'normal', 'alta')),
  estado_calculado TEXT CHECK(estado_calculado IN ('ATTACK', 'CAUTION', 'CRITICAL')),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON daily_checkins(date DESC);

-- Financial entries table
CREATE TABLE IF NOT EXISTS financial_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('entrada', 'saida')),
  value INTEGER NOT NULL, -- Stored in cents
  category TEXT NOT NULL,
  date INTEGER NOT NULL, -- Unix timestamp
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_finance_user_date ON financial_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_type ON financial_entries(user_id, type);
CREATE INDEX IF NOT EXISTS idx_finance_category ON financial_entries(user_id, category);

-- Projects table
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

-- Tasks table
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

-- Decisions table
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  date INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_date ON decisions(user_id, date DESC);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('finance', 'project', 'system', 'overload')),
  message TEXT NOT NULL,
  date INTEGER NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0, -- Boolean: 0 = false, 1 = true
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_resolved ON alerts(user_id, resolved, date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(user_id, type);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL,
  description TEXT
);

INSERT INTO schema_version (version, applied_at, description) 
VALUES (1, strftime('%s', 'now') * 1000, 'Initial schema');
