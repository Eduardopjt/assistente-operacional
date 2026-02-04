import { User } from '@assistente/core';
import { generateId } from '@assistente/shared';
import { Database } from '../database';

export interface UserRepository {
  create(user: Omit<User, 'id' | 'created_at'>): User;
  getById(id: string): User | null;
  update(user: User): void;
  getAll(): User[];
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private db: Database) {}

  create(userData: Omit<User, 'id' | 'created_at'>): User {
    const user: User = {
      id: generateId(),
      created_at: new Date(),
      settings: userData.settings || {},
    };

    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, created_at, settings_theme, 
        settings_biometric_enabled, settings_notifications_enabled
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.created_at.getTime(),
      user.settings.theme || 'dark',
      user.settings.biometric_enabled ? 1 : 0,
      user.settings.notifications_enabled ? 1 : 0
    );

    return user;
  }

  getById(id: string): User | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRowToUser(row);
  }

  update(user: User): void {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET settings_theme = ?,
          settings_biometric_enabled = ?,
          settings_notifications_enabled = ?
      WHERE id = ?
    `);

    stmt.run(
      user.settings.theme || 'dark',
      user.settings.biometric_enabled ? 1 : 0,
      user.settings.notifications_enabled ? 1 : 0,
      user.id
    );
  }

  getAll(): User[] {
    const stmt = this.db.prepare('SELECT * FROM users');
    const rows = stmt.all() as any[];
    return rows.map((row) => this.mapRowToUser(row));
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      created_at: new Date(row.created_at),
      settings: {
        theme: row.settings_theme,
        biometric_enabled: row.settings_biometric_enabled === 1,
        notifications_enabled: row.settings_notifications_enabled === 1,
      },
    };
  }
}
