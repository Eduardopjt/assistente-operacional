/**
 * better-sqlite3 adapter for desktop (Tauri, Electron, Node.js)
 * Synchronous SQLite interface
 */

import type { Database } from '../database';
import type { DatabaseAdapter } from './types';

export class BetterSqliteAdapter implements DatabaseAdapter {
  open(path: string): Database {
    // Dynamic import to prevent loading in browser environment
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const BetterSqlite3 = require('better-sqlite3');
      const db = new BetterSqlite3(path);

      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      return db;
    } catch (error) {
      throw new Error(
        'BetterSqliteAdapter requires better-sqlite3 and Node.js/Tauri. ' +
          'Use MockAdapter for browser development. Error: ' +
          error
      );
    }
  }
}
