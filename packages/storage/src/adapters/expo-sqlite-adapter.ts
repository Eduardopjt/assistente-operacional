/**
 * expo-sqlite adapter for mobile (React Native + Expo)
 * Asynchronous SQLite interface wrapped to appear synchronous for repository pattern
 *
 * Note: This is a simplified synchronous wrapper. For production, consider:
 * - Making repositories async
 * - Or using a worker thread to maintain sync interface
 */

import type { Database } from '../database';
import type { DatabaseAdapter } from './types';

// Types for expo-sqlite (to avoid importing it in non-mobile environments)
interface WebSQLDatabase {
  transaction(callback: (tx: unknown) => void): void;
}

// Note: expo-sqlite is async, but our repository pattern expects sync
// This is a limitation that should be addressed in production
// For now, we'll create a placeholder that throws a helpful error

interface Statement {
  run(...params: unknown[]): { lastInsertRowid: number; changes: number };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  finalize(): void;
}

class ExpoSqliteStatement implements Statement {
  constructor(
    private db: WebSQLDatabase,
    private sql: string
  ) {}

  run(..._params: unknown[]): { lastInsertRowid: number; changes: number } {
    throw new Error(
      'Synchronous operations not supported with expo-sqlite. ' +
        'Repositories should be made async for mobile.'
    );
  }

  get(..._params: unknown[]): unknown {
    throw new Error(
      'Synchronous operations not supported with expo-sqlite. ' +
        'Repositories should be made async for mobile.'
    );
  }

  all(..._params: unknown[]): unknown[] {
    throw new Error(
      'Synchronous operations not supported with expo-sqlite. ' +
        'Repositories should be made async for mobile.'
    );
  }

  finalize(): void {
    // No-op
  }
}

interface DatabaseImpl {
  prepare(sql: string): Statement;
  exec(sql: string): void;
  close(): void;
}

class ExpoSqliteDatabase implements DatabaseImpl {
  constructor(private db: WebSQLDatabase) {}

  exec(_sql: string): void {
    throw new Error(
      'Synchronous exec not supported with expo-sqlite. ' +
        'Use async operations or migrate to op-sqlite for sync support.'
    );
  }

  prepare(sql: string): Statement {
    return new ExpoSqliteStatement(this.db, sql);
  }

  close(): void {
    // expo-sqlite doesn't expose close method
  }
}

export class ExpoSqliteAdapter implements DatabaseAdapter {
  open(path: string): Database {
    // Dynamic import to avoid loading expo-sqlite in non-mobile environments
    throw new Error(
      'ExpoSqliteAdapter can only be used in React Native/Expo environment. ' +
        'Use BetterSqliteAdapter for desktop or MockAdapter for browser.'
    );
  }
}

/**
 * RECOMMENDATION FOR CP4 (Mobile Implementation):
 *
 * Either:
 * 1. Make all repositories async (better approach)
 * 2. Use @op-engineering/op-sqlite instead (synchronous on mobile)
 * 3. Create async wrappers around repositories
 *
 * For now, this adapter exists to satisfy type requirements.
 * We'll use better-sqlite3 for desktop and address mobile in CP4.
 */
