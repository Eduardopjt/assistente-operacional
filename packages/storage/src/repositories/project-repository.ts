import { Project, ProjectStatus } from '@assistente/core';
import { generateId } from '@assistente/shared';
import { Database } from '../database';

export interface ProjectRepository {
  create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project;
  getById(id: string): Project | null;
  getByUser(userId: string): Project[];
  getByStatus(userId: string, status: ProjectStatus): Project[];
  update(project: Project): void;
  delete(id: string): void;
  getStalled(userId: string, daysInactive: number): Project[];
}

export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(private db: Database) {}

  create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const now = new Date();
    const project: Project = {
      id: generateId(),
      created_at: now,
      updated_at: now,
      ...data,
    };

    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, user_id, name, status, objective, next_action, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      project.id,
      project.user_id,
      project.name,
      project.status,
      project.objective,
      project.next_action || null,
      project.created_at.getTime(),
      project.updated_at.getTime()
    );

    return project;
  }

  getById(id: string): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToProject(row) : null;
  }

  getByUser(userId: string): Project[] {
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    return rows.map((row) => this.mapRowToProject(row));
  }

  getByStatus(userId: string, status: ProjectStatus): Project[] {
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? AND status = ?
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(userId, status) as any[];
    return rows.map((row) => this.mapRowToProject(row));
  }

  update(project: Project): void {
    const stmt = this.db.prepare(`
      UPDATE projects 
      SET name = ?, status = ?, objective = ?, next_action = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      project.name,
      project.status,
      project.objective,
      project.next_action || null,
      Date.now(),
      project.id
    );
  }

  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
  }

  getStalled(userId: string, daysInactive: number): Project[] {
    const cutoff = Date.now() - daysInactive * 24 * 60 * 60 * 1000;
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
        AND status = 'active' 
        AND updated_at < ?
      ORDER BY updated_at ASC
    `);
    const rows = stmt.all(userId, cutoff) as any[];
    return rows.map((row) => this.mapRowToProject(row));
  }

  private mapRowToProject(row: any): Project {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      status: row.status,
      objective: row.objective,
      next_action: row.next_action || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
