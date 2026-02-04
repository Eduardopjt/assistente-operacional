import { FinancialEntry } from '@assistente/core';
import { generateId, daysAgo } from '@assistente/shared';
import { Database } from '../database';

export interface FinanceRepository {
  create(entry: Omit<FinancialEntry, 'id'>): FinancialEntry;
  getById(id: string): FinancialEntry | null;
  getByUser(userId: string, limit?: number): FinancialEntry[];
  getByDateRange(userId: string, startDate: Date, endDate: Date): FinancialEntry[];
  getRecent(userId: string, days: number): FinancialEntry[];
  getByType(userId: string, type: 'entrada' | 'saida'): FinancialEntry[];
  delete(id: string): void;
}

export class FinanceRepositoryImpl implements FinanceRepository {
  constructor(private db: Database) {}

  create(data: Omit<FinancialEntry, 'id'>): FinancialEntry {
    const entry: FinancialEntry = {
      id: generateId(),
      ...data,
    };

    const stmt = this.db.prepare(`
      INSERT INTO financial_entries (
        id, user_id, type, value, category, date, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      entry.id,
      entry.user_id,
      entry.type,
      entry.value,
      entry.category,
      entry.date.getTime(),
      entry.notes || null,
      Date.now()
    );

    return entry;
  }

  getById(id: string): FinancialEntry | null {
    const stmt = this.db.prepare('SELECT * FROM financial_entries WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToEntry(row) : null;
  }

  getByUser(userId: string, limit?: number): FinancialEntry[] {
    const sql = `
      SELECT * FROM financial_entries 
      WHERE user_id = ? 
      ORDER BY date DESC
      ${limit ? 'LIMIT ?' : ''}
    `;
    const stmt = this.db.prepare(sql);
    const rows = limit ? stmt.all(userId, limit) : stmt.all(userId);
    return (rows as any[]).map((row) => this.mapRowToEntry(row));
  }

  getByDateRange(userId: string, startDate: Date, endDate: Date): FinancialEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM financial_entries 
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date DESC
    `);
    const rows = stmt.all(userId, startDate.getTime(), endDate.getTime()) as any[];
    return rows.map((row) => this.mapRowToEntry(row));
  }

  getRecent(userId: string, days: number): FinancialEntry[] {
    const cutoff = daysAgo(days);
    return this.getByDateRange(userId, cutoff, new Date());
  }

  getByType(userId: string, type: 'entrada' | 'saida'): FinancialEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM financial_entries 
      WHERE user_id = ? AND type = ?
      ORDER BY date DESC
    `);
    const rows = stmt.all(userId, type) as any[];
    return rows.map((row) => this.mapRowToEntry(row));
  }

  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM financial_entries WHERE id = ?');
    stmt.run(id);
  }

  private mapRowToEntry(row: any): FinancialEntry {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      value: row.value,
      category: row.category,
      date: new Date(row.date),
      notes: row.notes || undefined,
    };
  }
}
