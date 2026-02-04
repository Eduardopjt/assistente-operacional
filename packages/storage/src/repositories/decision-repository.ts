import { Decision } from '@assistente/core';
import { generateId } from '@assistente/shared';
import { Database } from '../database';

export interface DecisionRepository {
  create(decision: Omit<Decision, 'id'>): Decision;
  getById(id: string): Decision | null;
  getByUser(userId: string, limit?: number): Decision[];
  delete(id: string): void;
}

export class DecisionRepositoryImpl implements DecisionRepository {
  constructor(private db: Database) {}

  create(data: Omit<Decision, 'id'>): Decision {
    const decision: Decision = {
      id: generateId(),
      ...data,
    };

    const stmt = this.db.prepare(`
      INSERT INTO decisions (id, user_id, context, decision, date)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      decision.id,
      decision.user_id,
      decision.context,
      decision.decision,
      decision.date.getTime()
    );

    return decision;
  }

  getById(id: string): Decision | null {
    const stmt = this.db.prepare('SELECT * FROM decisions WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToDecision(row) : null;
  }

  getByUser(userId: string, limit?: number): Decision[] {
    const sql = `
      SELECT * FROM decisions 
      WHERE user_id = ? 
      ORDER BY date DESC
      ${limit ? 'LIMIT ?' : ''}
    `;
    const stmt = this.db.prepare(sql);
    const rows = limit ? stmt.all(userId, limit) : stmt.all(userId);
    return (rows as any[]).map((row) => this.mapRowToDecision(row));
  }

  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM decisions WHERE id = ?');
    stmt.run(id);
  }

  private mapRowToDecision(row: any): Decision {
    return {
      id: row.id,
      user_id: row.user_id,
      context: row.context,
      decision: row.decision,
      date: new Date(row.date),
    };
  }
}
