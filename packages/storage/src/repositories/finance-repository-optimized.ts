import { FinancialEntry } from '@assistente/core';
import { generateId, daysAgo } from '@assistente/shared';
import { Database } from '../database';
import { QueryCache, generateCacheKey } from '../cache';
import { PerformanceMonitor, withMonitoring } from '../performance';
import { bulkInsert, bulkDelete } from '../batch';

export interface FinanceRepository {
  create(entry: Omit<FinancialEntry, 'id'>): FinancialEntry;
  createMany(entries: Omit<FinancialEntry, 'id'>[]): { inserted: number; errors: Error[] };
  getById(id: string): FinancialEntry | null;
  getByUser(userId: string, limit?: number): FinancialEntry[];
  getByDateRange(userId: string, startDate: Date, endDate: Date): FinancialEntry[];
  getRecent(userId: string, days: number): FinancialEntry[];
  getByType(userId: string, type: 'entrada' | 'saida'): FinancialEntry[];
  delete(id: string): void;
  deleteMany(ids: string[]): { deleted: number; errors: Error[] };
  getSummary(
    userId: string,
    days: number
  ): {
    totalEntradas: number;
    totalSaidas: number;
    balance: number;
    count: number;
  };
  invalidateCache(): void;
}

export class OptimizedFinanceRepository implements FinanceRepository {
  private cache: QueryCache;
  private monitor: PerformanceMonitor;

  constructor(
    private db: Database,
    options: { enableCache?: boolean; enableMonitoring?: boolean } = {}
  ) {
    this.cache = new QueryCache(100, 5); // 100 entries, 5 min TTL
    this.monitor = new PerformanceMonitor(options.enableMonitoring ?? true);
  }

  create(data: Omit<FinancialEntry, 'id'>): FinancialEntry {
    const end = this.monitor.start('finance.create');

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

    // Invalidate user's cache
    this.cache.invalidate(`finance:user:${entry.user_id}`);

    end();
    return entry;
  }

  createMany(entries: Omit<FinancialEntry, 'id'>[]): { inserted: number; errors: Error[] } {
    const end = this.monitor.start('finance.createMany');

    const records = entries.map((entry) => ({
      id: generateId(),
      user_id: entry.user_id,
      type: entry.type,
      value: entry.value,
      category: entry.category,
      date: entry.date.getTime(),
      notes: entry.notes || null,
      created_at: Date.now(),
    }));

    const result = bulkInsert(this.db, 'financial_entries', records);

    // Invalidate cache for all affected users
    const userIds = new Set(entries.map((e) => e.user_id));
    userIds.forEach((userId) => {
      this.cache.invalidate(`finance:user:${userId}`);
    });

    end();
    return result;
  }

  getById(id: string): FinancialEntry | null {
    const cacheKey = `finance:id:${id}`;
    const cached = this.cache.get<FinancialEntry>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('finance.getById');
    const stmt = this.db.prepare('SELECT * FROM financial_entries WHERE id = ?');
    const row = stmt.get(id) as any;
    const entry = row ? this.mapRowToEntry(row) : null;

    if (entry) {
      this.cache.set(cacheKey, entry);
    }

    end();
    return entry;
  }

  getByUser(userId: string, limit?: number): FinancialEntry[] {
    const cacheKey = generateCacheKey('finance:user', [userId, limit || 'all']);
    const cached = this.cache.get<FinancialEntry[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('finance.getByUser');
    const sql = `
      SELECT * FROM financial_entries 
      WHERE user_id = ? 
      ORDER BY date DESC
      ${limit ? 'LIMIT ?' : ''}
    `;
    const stmt = this.db.prepare(sql);
    const rows = limit ? stmt.all(userId, limit) : stmt.all(userId);
    const entries = (rows as any[]).map((row) => this.mapRowToEntry(row));

    this.cache.set(cacheKey, entries);
    end();
    return entries;
  }

  getByDateRange(userId: string, startDate: Date, endDate: Date): FinancialEntry[] {
    const cacheKey = generateCacheKey('finance:dateRange', [
      userId,
      startDate.getTime(),
      endDate.getTime(),
    ]);
    const cached = this.cache.get<FinancialEntry[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('finance.getByDateRange');
    const stmt = this.db.prepare(`
      SELECT * FROM financial_entries 
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date DESC
    `);
    const rows = stmt.all(userId, startDate.getTime(), endDate.getTime()) as any[];
    const entries = rows.map((row) => this.mapRowToEntry(row));

    this.cache.set(cacheKey, entries);
    end();
    return entries;
  }

  getRecent(userId: string, days: number): FinancialEntry[] {
    const cutoff = daysAgo(days);
    return this.getByDateRange(userId, cutoff, new Date());
  }

  getByType(userId: string, type: 'entrada' | 'saida'): FinancialEntry[] {
    const cacheKey = generateCacheKey('finance:type', [userId, type]);
    const cached = this.cache.get<FinancialEntry[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('finance.getByType');
    const stmt = this.db.prepare(`
      SELECT * FROM financial_entries 
      WHERE user_id = ? AND type = ?
      ORDER BY date DESC
    `);
    const rows = stmt.all(userId, type) as any[];
    const entries = rows.map((row) => this.mapRowToEntry(row));

    this.cache.set(cacheKey, entries);
    end();
    return entries;
  }

  getSummary(
    userId: string,
    days: number
  ): {
    totalEntradas: number;
    totalSaidas: number;
    balance: number;
    count: number;
  } {
    const cacheKey = generateCacheKey('finance:summary', [userId, days]);
    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('finance.getSummary');
    const cutoff = daysAgo(days);

    const stmt = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'entrada' THEN value ELSE 0 END) as total_entradas,
        SUM(CASE WHEN type = 'saida' THEN value ELSE 0 END) as total_saidas,
        COUNT(*) as count
      FROM financial_entries
      WHERE user_id = ? AND date >= ?
    `);

    const row = stmt.get(userId, cutoff.getTime()) as any;

    const summary = {
      totalEntradas: row.total_entradas || 0,
      totalSaidas: row.total_saidas || 0,
      balance: (row.total_entradas || 0) - (row.total_saidas || 0),
      count: row.count || 0,
    };

    this.cache.set(cacheKey, summary);
    end();
    return summary;
  }

  delete(id: string): void {
    const end = this.monitor.start('finance.delete');

    // Get entry to invalidate user cache
    const entry = this.getById(id);

    const stmt = this.db.prepare('DELETE FROM financial_entries WHERE id = ?');
    stmt.run(id);

    if (entry) {
      this.cache.invalidate(`finance:user:${entry.user_id}`);
      this.cache.invalidate(`finance:id:${id}`);
    }

    end();
  }

  deleteMany(ids: string[]): { deleted: number; errors: Error[] } {
    const end = this.monitor.start('finance.deleteMany');
    const result = bulkDelete(this.db, 'financial_entries', ids);

    // Invalidate all cache (we don't know which users were affected)
    this.cache.clear();

    end();
    return result;
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return {
      monitor: this.monitor.getSummary(),
      slowQueries: this.monitor.getSlowestQueries(5),
      cache: this.cache.stats(),
    };
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
