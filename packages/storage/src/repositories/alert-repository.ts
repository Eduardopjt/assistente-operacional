import { Alert } from '@assistente/core';
import { generateId } from '@assistente/shared';
import { Database } from '../database';

export interface AlertRepository {
  create(alert: Omit<Alert, 'id'>): Alert;
  getById(id: string): Alert | null;
  getByUser(userId: string, includeResolved?: boolean): Alert[];
  getUnresolved(userId: string): Alert[];
  resolve(id: string): void;
  delete(id: string): void;
}

export class AlertRepositoryImpl implements AlertRepository {
  constructor(private db: Database) {}

  create(data: Omit<Alert, 'id'>): Alert {
    const alert: Alert = {
      id: generateId(),
      ...data,
    };

    const stmt = this.db.prepare(`
      INSERT INTO alerts (id, user_id, type, message, date, resolved)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      alert.id,
      alert.user_id,
      alert.type,
      alert.message,
      alert.date.getTime(),
      alert.resolved ? 1 : 0
    );

    return alert;
  }

  getById(id: string): Alert | null {
    const stmt = this.db.prepare('SELECT * FROM alerts WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToAlert(row) : null;
  }

  getByUser(userId: string, includeResolved = false): Alert[] {
    const sql = includeResolved
      ? 'SELECT * FROM alerts WHERE user_id = ? ORDER BY date DESC'
      : 'SELECT * FROM alerts WHERE user_id = ? AND resolved = 0 ORDER BY date DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(userId) as any[];
    return rows.map((row) => this.mapRowToAlert(row));
  }

  getUnresolved(userId: string): Alert[] {
    return this.getByUser(userId, false);
  }

  resolve(id: string): void {
    const stmt = this.db.prepare('UPDATE alerts SET resolved = 1 WHERE id = ?');
    stmt.run(id);
  }

  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM alerts WHERE id = ?');
    stmt.run(id);
  }

  private mapRowToAlert(row: any): Alert {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      message: row.message,
      date: new Date(row.date),
      resolved: row.resolved === 1,
    };
  }
}
