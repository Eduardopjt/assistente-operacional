/**
 * Database interface - abstraction over SQLite implementations
 * Platform-specific implementations:
 * - Mobile: expo-sqlite
 * - Desktop: better-sqlite3 or tauri-plugin-sqlite
 */

export interface Database {
  exec(sql: string): void;
  prepare(sql: string): Statement;
  close(): void;
}

export interface Statement {
  run(...params: unknown[]): { lastInsertRowid: number; changes: number };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  finalize(): void;
}

export interface DatabaseAdapter {
  open(path: string): Database;
}

// Placeholder - actual implementation per platform in CP3
export const createDatabase = (adapter: DatabaseAdapter, path: string): Database => {
  return adapter.open(path);
};
