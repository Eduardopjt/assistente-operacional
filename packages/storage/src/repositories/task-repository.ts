import { Task, TaskStatus } from '@assistente/core';
import { generateId } from '@assistente/shared';
import { Database } from '../database';

export interface TaskRepository {
  create(task: Omit<Task, 'id' | 'created_at'>): Task;
  getById(id: string): Task | null;
  getByUser(userId: string): Task[];
  getByStatus(userId: string, status: TaskStatus): Task[];
  getByProject(projectId: string): Task[];
  update(task: Task): void;
  delete(id: string): void;
  markComplete(id: string): void;
}

export class TaskRepositoryImpl implements TaskRepository {
  constructor(private db: Database) {}

  create(data: Omit<Task, 'id' | 'created_at'>): Task {
    const task: Task = {
      id: generateId(),
      created_at: new Date(),
      ...data,
    };

    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, user_id, description, linked_project_id, status, created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.user_id,
      task.description,
      task.linked_project_id || null,
      task.status,
      task.created_at.getTime(),
      task.completed_at?.getTime() || null
    );

    return task;
  }

  getById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToTask(row) : null;
  }

  getByUser(userId: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    return rows.map((row) => this.mapRowToTask(row));
  }

  getByStatus(userId: string, status: TaskStatus): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND status = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId, status) as any[];
    return rows.map((row) => this.mapRowToTask(row));
  }

  getByProject(projectId: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE linked_project_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(projectId) as any[];
    return rows.map((row) => this.mapRowToTask(row));
  }

  update(task: Task): void {
    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET description = ?, linked_project_id = ?, status = ?, completed_at = ?
      WHERE id = ?
    `);

    stmt.run(
      task.description,
      task.linked_project_id || null,
      task.status,
      task.completed_at?.getTime() || null,
      task.id
    );
  }

  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
  }

  markComplete(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET status = 'done', completed_at = ?
      WHERE id = ?
    `);
    stmt.run(Date.now(), id);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      linked_project_id: row.linked_project_id || undefined,
      status: row.status,
      created_at: new Date(row.created_at),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }
}
