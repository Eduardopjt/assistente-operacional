import type { DatabaseAdapter } from './types';

// Local types for mock implementation
interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

interface Statement {
  run(...params: unknown[]): RunResult;
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  finalize(): void;
}

interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): void;
  close(): void;
}

/**
 * Mock adapter for browser development and testing
 * Uses in-memory Map to simulate SQLite tables
 */
class MockStatement implements Statement {
  constructor(private sql: string, private db: MockDatabase) {}

  run(...params: unknown[]): RunResult {
    console.log('[MockDB] RUN:', this.sql, params);
    const sql = this.sql.toUpperCase();
    let changes = 0;
    
    // Handle INSERT
    if (sql.includes('INSERT INTO')) {
      const tableMatch = this.sql.match(/INSERT INTO (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.db.getTable(tableName);
        const row: any = {};
        
        // Extract column names
        const colMatch = this.sql.match(/\(([\w,\s]+)\)/i);
        if (colMatch) {
          const columns = colMatch[1].split(',').map(c => c.trim());
          columns.forEach((col, i) => {
            row[col] = params[i];
          });
        }
        
        // Check for duplicate ID (PRIMARY KEY constraint)
        if (row.id && table.has(row.id)) {
          throw new Error(`UNIQUE constraint failed: ${tableName}.id`);
        }
        
        table.set(row.id || String(Date.now()), row);
        changes = 1;
      }
    }
    
    // Handle UPDATE
    if (sql.includes('UPDATE')) {
      const tableMatch = this.sql.match(/UPDATE (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.db.getTable(tableName);
        
        // Simple WHERE id = ? support
        const idMatch = this.sql.match(/WHERE id = \?/i);
        if (idMatch) {
          const id = String(params[params.length - 1]);
          const existing = table.get(id);
          if (existing) {
            // Update fields based on SET clause
            const setMatch = this.sql.match(/SET (.+?) WHERE/i);
            if (setMatch) {
              const setPairs = setMatch[1].split(',');
              setPairs.forEach((pair, i) => {
                const field = pair.split('=')[0].trim();
                existing[field] = params[i];
              });
            }
            changes = 1;
          }
        }
      }
    }
    
    // Handle DELETE
    if (sql.includes('DELETE FROM')) {
      const tableMatch = this.sql.match(/DELETE FROM (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.db.getTable(tableName);
        
        // WHERE id IN (?, ?) support
        if (sql.includes('WHERE ID IN')) {
          params.forEach(id => {
            const key = String(id);
            if (table.has(key)) {
              table.delete(key);
              changes++;
            }
          });
        } else {
          // Single id
          const id = String(params[0]);
          if (table.has(id)) {
            table.delete(id);
            changes = 1;
          }
        }
      }
    }
    
    return { changes, lastInsertRowid: Date.now() };
  }

  get(...params: unknown[]): unknown {
    console.log('[MockDB] GET:', this.sql, params);
    const sql = this.sql.toUpperCase();
    
    if (sql.includes('SELECT')) {
      const tableMatch = this.sql.match(/FROM (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.db.getTable(tableName);
        
        // WHERE id = ? support
        if (sql.includes('WHERE ID = ?')) {
          return table.get(String(params[0])) || null;
        }
        
        // Return first row
        return Array.from(table.values())[0] || null;
      }
    }
    
    return null;
  }

  all(...params: unknown[]): unknown[] {
    console.log('[MockDB] ALL:', this.sql, params);
    const sql = this.sql.toUpperCase();
    
    if (sql.includes('SELECT')) {
      const tableMatch = this.sql.match(/FROM (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.db.getTable(tableName);
        return Array.from(table.values());
      }
    }
    
    return [];
  }

  finalize(): void {
    // No-op
  }
}

class MockDatabase {
  private tables = new Map<string, Map<string, any>>();
  private inTransaction = false;
  private transactionBackup: Map<string, Map<string, any>> | null = null;

  constructor(private path: string) {
    console.log('[MockDB] Created database at:', path);
  }

  getTable(name: string): Map<string, any> {
    if (!this.tables.has(name)) {
      this.tables.set(name, new Map());
    }
    return this.tables.get(name)!;
  }

  prepare(sql: string): Statement {
    return new MockStatement(sql, this);
  }

  exec(sql: string): void {
    console.log('[MockDB] EXEC:', sql.substring(0, 100) + '...');
    const upper = sql.toUpperCase();
    
    if (upper.includes('BEGIN TRANSACTION')) {
      this.inTransaction = true;
      // Backup all tables
      this.transactionBackup = new Map();
      for (const [name, table] of this.tables) {
        this.transactionBackup.set(name, new Map(table));
      }
    }
    
    if (upper.includes('COMMIT')) {
      this.inTransaction = false;
      this.transactionBackup = null;
    }
    
    if (upper.includes('ROLLBACK')) {
      if (this.transactionBackup) {
        // Restore from backup
        this.tables = this.transactionBackup;
      }
      this.inTransaction = false;
      this.transactionBackup = null;
    }
  }

  close(): void {
    console.log('[MockDB] Closed database');
  }
}

export class MockAdapter implements DatabaseAdapter {
  open(path: string) {
    return new MockDatabase(path);
  }
}
