import { DailyCheckin } from '@assistente/core';
import { generateId, startOfDay, daysAgo } from '@assistente/shared';
import { Database } from '../database';

export interface CheckinRepository {
  create(checkin: Omit<DailyCheckin, 'id'>): DailyCheckin;
  getById(id: string): DailyCheckin | null;
  getByDate(userId: string, date: Date): DailyCheckin | null;
  getLatest(userId: string): DailyCheckin | null;
  getRecent(userId: string, days: number): DailyCheckin[];
  update(checkin: DailyCheckin): void;
}

export class CheckinRepositoryImpl implements CheckinRepository {
  constructor(private db: Database) {}

  create(data: Omit<DailyCheckin, 'id'>): DailyCheckin {
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

    return checkin;
  }

  getById(id: string): DailyCheckin | null {
    const stmt = this.db.prepare('SELECT * FROM daily_checkins WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToCheckin(row) : null;
  }

  getByDate(userId: string, date: Date): DailyCheckin | null {
    const dayStart = startOfDay(date).getTime();
    const stmt = this.db.prepare(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? AND date = ?
    `);
    const row = stmt.get(userId, dayStart) as any;
    return row ? this.mapRowToCheckin(row) : null;
  }

  getLatest(userId: string): DailyCheckin | null {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 1
    `);
    const row = stmt.get(userId) as any;
    return row ? this.mapRowToCheckin(row) : null;
  }

  getRecent(userId: string, days: number): DailyCheckin[] {
    const cutoff = daysAgo(days).getTime();
    const stmt = this.db.prepare(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? AND date >= ?
      ORDER BY date DESC
    `);
    const rows = stmt.all(userId, cutoff) as any[];
    return rows.map((row) => this.mapRowToCheckin(row));
  }

  update(checkin: DailyCheckin): void {
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
