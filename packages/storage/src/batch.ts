import { Database } from './database';

/**
 * Batch Operations - Execute multiple DB operations efficiently
 */

export interface BatchOperation {
  sql: string;
  params: unknown[];
}

export class BatchExecutor {
  private operations: BatchOperation[] = [];

  constructor(private db: Database) {}

  /**
   * Add operation to batch
   */
  add(sql: string, params: unknown[] | unknown, ...rest: unknown[]): this {
    // Handle both array and rest params
    const finalParams = Array.isArray(params) && rest.length === 0 ? params : [params, ...rest];
    this.operations.push({ sql, params: finalParams });
    return this;
  }

  /**
   * Execute all operations in a transaction
   */
  execute(): { success: number; errors: Error[] } {
    const errors: Error[] = [];
    let success = 0;

    try {
      this.db.exec('BEGIN TRANSACTION');

      for (const op of this.operations) {
        try {
          const stmt = this.db.prepare(op.sql);
          stmt.run(...op.params);
          success++;
        } catch (err) {
          errors.push(err as Error);
        }
      }

      if (errors.length === 0) {
        this.db.exec('COMMIT');
      } else {
        this.db.exec('ROLLBACK');
        success = 0; // Reset on rollback
      }
    } catch (err) {
      this.db.exec('ROLLBACK');
      errors.push(err as Error);
      success = 0; // Reset on rollback
    } finally {
      this.operations = [];
    }

    return { success, errors };
  }

  /**
   * Clear pending operations
   */
  clear(): void {
    this.operations = [];
  }

  /**
   * Get count of pending operations
   */
  count(): number {
    return this.operations.length;
  }
}

/**
 * Bulk insert helper
 */
export function bulkInsert<T extends Record<string, any>>(
  db: Database,
  table: string,
  records: T[]
): { inserted: number; errors: Error[] } {
  if (records.length === 0) {
    return { inserted: 0, errors: [] };
  }

  const errors: Error[] = [];
  let inserted = 0;

  // Get columns from first record
  const columns = Object.keys(records[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

  try {
    db.exec('BEGIN TRANSACTION');
    const stmt = db.prepare(sql);

    for (const record of records) {
      try {
        const values = columns.map((col) => record[col]);
        stmt.run(...values);
        inserted++;
      } catch (err) {
        errors.push(err as Error);
      }
    }

    if (errors.length === 0) {
      db.exec('COMMIT');
    } else {
      db.exec('ROLLBACK');
      inserted = 0;
    }
  } catch (err) {
    db.exec('ROLLBACK');
    errors.push(err as Error);
    inserted = 0;
  }

  return { inserted, errors };
}

/**
 * Bulk update helper - automatically determines fields from first record
 */
export function bulkUpdate<T extends { id: string }>(
  db: Database,
  table: string,
  records: T[],
  updateFields?: (keyof T)[]
): { updated: number; errors: Error[] } {
  if (records.length === 0) {
    return { updated: 0, errors: [] };
  }

  const errors: Error[] = [];
  let updated = 0;

  // Auto-detect fields from first record if not provided
  const fields = updateFields || (Object.keys(records[0]).filter((k) => k !== 'id') as (keyof T)[]);

  const setClause = fields.map((field) => `${String(field)} = ?`).join(', ');
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

  try {
    db.exec('BEGIN TRANSACTION');
    const stmt = db.prepare(sql);

    for (const record of records) {
      try {
        const values: any[] = fields.map((field) => record[field]);
        values.push(record.id);
        const result = stmt.run(...values);
        updated += result.changes;
      } catch (err) {
        errors.push(err as Error);
      }
    }

    if (errors.length === 0) {
      db.exec('COMMIT');
    } else {
      db.exec('ROLLBACK');
      updated = 0;
    }
  } catch (err) {
    db.exec('ROLLBACK');
    errors.push(err as Error);
    updated = 0;
  }

  return { updated, errors };
}

/**
 * Bulk delete helper
 */
export function bulkDelete(
  db: Database,
  table: string,
  ids: string[]
): { deleted: number; errors: Error[] } {
  if (ids.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const errors: Error[] = [];
  let deleted = 0;

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `DELETE FROM ${table} WHERE id IN (${placeholders})`;

  try {
    db.exec('BEGIN TRANSACTION');
    const stmt = db.prepare(sql);
    const result = stmt.run(...ids);
    deleted = result.changes;
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    errors.push(err as Error);
    deleted = 0;
  }

  return { deleted, errors };
}
