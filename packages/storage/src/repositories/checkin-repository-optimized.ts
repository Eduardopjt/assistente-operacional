import { DailyCheckin } from '@assistente/core';
import { generateId, startOfDay, daysAgo } from '@assistente/shared';
import { Database } from '../database';
import { QueryCache, generateCacheKey } from '../cache';
import { PerformanceMonitor } from '../performance';
import { bulkInsert } from '../batch';

export interface CheckinRepository {
  create(checkin: Omit<DailyCheckin, 'id'>): DailyCheckin;
  createMany(checkins: Omit<DailyCheckin, 'id'>[]): { inserted: number; errors: Error[] };
  getById(id: string): DailyCheckin | null;
  getByDate(userId: string, date: Date): DailyCheckin | null;
  getLatest(userId: string): DailyCheckin | null;
  getRecent(userId: string, days: number): DailyCheckin[];
  update(checkin: DailyCheckin): void;
  invalidateCache(): void;
}

export class OptimizedCheckinRepository implements CheckinRepository {
  private cache: QueryCache;
  private monitor: PerformanceMonitor;

  constructor(
    private db: Database,
    options: { enableCache?: boolean; enableMonitoring?: boolean } = {}
  ) {
    this.cache = new QueryCache(50, 10); // 50 entries, 10 min TTL
    this.monitor = new PerformanceMonitor(options.enableMonitoring ?? true);
  }

  create(data: Omit<DailyCheckin, 'id'>): DailyCheckin {
    const end = this.monitor.start('checkin.create');
    
    const checkin: DailyCheckin = {
      id: generateId(),
      ...data,
    };

    const stmt = this.db.prepare(`
      INSERT INTO daily_checkins (
        id, user_id, date, caixa_status, energia, pressao, 
        estado_calculado, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      checkin.id,
      checkin.user_id,
      startOfDay(checkin.date).getTime(),
      checkin.caixa_status,
      checkin.energia,
      checkin.pressao,
      checkin.estado_calculado || null,
      Date.now()
    );

    this.cache.invalidate(`checkin:user:${checkin.user_id}`);
    end();
    return checkin;
  }

  createMany(checkins: Omit<DailyCheckin, 'id'>[]): { inserted: number; errors: Error[] } {
    const end = this.monitor.start('checkin.createMany');
    
    const now = Date.now();
    const records = checkins.map((checkin) => ({
      id: generateId(),
      user_id: checkin.user_id,
      date: startOfDay(checkin.date).getTime(),
      caixa_status: checkin.caixa_status,
      energia: checkin.energia,
      pressao: checkin.pressao,
      estado_calculado: checkin.estado_calculado || null,
      created_at: now,
    }));

    const result = bulkInsert(this.db, 'daily_checkins', records);
    
    const userIds = new Set(checkins.map((c) => c.user_id));
    userIds.forEach((userId) => {
      this.cache.invalidate(`checkin:user:${userId}`);
    });

    end();
    return result;
  }

  getById(id: string): DailyCheckin | null {
    const cacheKey = `checkin:id:${id}`;
    const cached = this.cache.get<DailyCheckin>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('checkin.getById');
    const stmt = this.db.prepare('SELECT * FROM daily_checkins WHERE id = ?');
    const row = stmt.get(id) as any;
    const checkin = row ? this.mapRowToCheckin(row) : null;
    
    if (checkin) {
      this.cache.set(cacheKey, checkin);
    }
    
    end();
    return checkin;
  }

  getByDate(userId: string, date: Date): DailyCheckin | null {
    const dayStart = startOfDay(date).getTime();
    const cacheKey = generateCacheKey('checkin:date', [userId, dayStart]);
    const cached = this.cache.get<DailyCheckin>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('checkin.getByDate');
    const stmt = this.db.prepare(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? AND date = ?
    `);
    const row = stmt.get(userId, dayStart) as any;
    const checkin = row ? this.mapRowToCheckin(row) : null;
    
    if (checkin) {
      this.cache.set(cacheKey, checkin);
    }
    
    end();
    return checkin;
  }

  getLatest(userId: string): DailyCheckin | null {
    const cacheKey = `checkin:latest:${userId}`;
    const cached = this.cache.get<DailyCheckin>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('checkin.getLatest');
    const stmt = this.db.prepare(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 1
    `);
    const row = stmt.get(userId) as any;
    const checkin = row ? this.mapRowToCheckin(row) : null;
    
    if (checkin) {
      this.cache.set(cacheKey, checkin);
    }
    
    end();
    return checkin;
  }

  getRecent(userId: string, days: number): DailyCheckin[] {
    const cacheKey = generateCacheKey('checkin:recent', [userId, days]);
    const cached = this.cache.get<DailyCheckin[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('checkin.getRecent');
    const cutoff = daysAgo(days).getTime();
    const stmt = this.db.prepare(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? AND date >= ?
      ORDER BY date DESC
    `);
    const rows = stmt.all(userId, cutoff) as any[];
    const checkins = rows.map((row) => this.mapRowToCheckin(row));
    
    this.cache.set(cacheKey, checkins);
    end();
    return checkins;
  }

  update(checkin: DailyCheckin): void {
    const end = this.monitor.start('checkin.update');
    
    const stmt = this.db.prepare(`
      UPDATE daily_checkins 
      SET caixa_status = ?, energia = ?, pressao = ?, estado_calculado = ?
      WHERE id = ?
    `);

    stmt.run(
      checkin.caixa_status,
      checkin.energia,
      checkin.pressao,
      checkin.estado_calculado || null,
      checkin.id
    );

    this.cache.invalidate(`checkin:user:${checkin.user_id}`);
    this.cache.invalidate(`checkin:id:${checkin.id}`);
    end();
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  getPerformanceStats() {
    return {
      monitor: this.monitor.getSummary(),
      slowQueries: this.monitor.getSlowestQueries(5),
      cache: this.cache.stats(),
    };
  }

  private mapRowToCheckin(row: any): DailyCheckin {
    return {
      id: row.id,
      user_id: row.user_id,
      date: new Date(row.date),
      caixa_status: row.caixa_status,
      energia: row.energia,
      pressao: row.pressao,
      estado_calculado: row.estado_calculado || undefined,
    };
  }
}
