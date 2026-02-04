import { Project, ProjectStatus } from '@assistente/core';
import { generateId } from '@assistente/shared';
import { Database } from '../database';
import { QueryCache, generateCacheKey } from '../cache';
import { PerformanceMonitor } from '../performance';
import { bulkInsert, bulkDelete } from '../batch';

export interface ProjectRepository {
  create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project;
  createMany(projects: Omit<Project, 'id' | 'created_at' | 'updated_at'>[]): {
    inserted: number;
    errors: Error[];
  };
  getById(id: string): Project | null;
  getByUser(userId: string): Project[];
  getByStatus(userId: string, status: ProjectStatus): Project[];
  update(project: Project): void;
  delete(id: string): void;
  deleteMany(ids: string[]): { deleted: number; errors: Error[] };
  getStalled(userId: string, daysInactive: number): Project[];
  invalidateCache(): void;
}

export class OptimizedProjectRepository implements ProjectRepository {
  private cache: QueryCache;
  private monitor: PerformanceMonitor;

  constructor(
    private db: Database,
    options: { enableCache?: boolean; enableMonitoring?: boolean } = {}
  ) {
    this.cache = new QueryCache(50, 5); // 50 entries, 5 min TTL
    this.monitor = new PerformanceMonitor(options.enableMonitoring ?? true);
  }

  create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const end = this.monitor.start('project.create');

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

    this.cache.invalidate(`project:user:${project.user_id}`);
    end();
    return project;
  }

  createMany(projects: Omit<Project, 'id' | 'created_at' | 'updated_at'>[]): {
    inserted: number;
    errors: Error[];
  } {
    const end = this.monitor.start('project.createMany');

    const now = Date.now();
    const records = projects.map((project) => ({
      id: generateId(),
      user_id: project.user_id,
      name: project.name,
      status: project.status,
      objective: project.objective,
      next_action: project.next_action || null,
      created_at: now,
      updated_at: now,
    }));

    const result = bulkInsert(this.db, 'projects', records);

    const userIds = new Set(projects.map((p) => p.user_id));
    userIds.forEach((userId) => {
      this.cache.invalidate(`project:user:${userId}`);
    });

    end();
    return result;
  }

  getById(id: string): Project | null {
    const cacheKey = `project:id:${id}`;
    const cached = this.cache.get<Project>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('project.getById');
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id) as any;
    const project = row ? this.mapRowToProject(row) : null;

    if (project) {
      this.cache.set(cacheKey, project);
    }

    end();
    return project;
  }

  getByUser(userId: string): Project[] {
    const cacheKey = `project:user:${userId}`;
    const cached = this.cache.get<Project[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('project.getByUser');
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    const projects = rows.map((row) => this.mapRowToProject(row));

    this.cache.set(cacheKey, projects);
    end();
    return projects;
  }

  getByStatus(userId: string, status: ProjectStatus): Project[] {
    const cacheKey = generateCacheKey('project:status', [userId, status]);
    const cached = this.cache.get<Project[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('project.getByStatus');
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? AND status = ?
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(userId, status) as any[];
    const projects = rows.map((row) => this.mapRowToProject(row));

    this.cache.set(cacheKey, projects);
    end();
    return projects;
  }

  update(project: Project): void {
    const end = this.monitor.start('project.update');

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

    this.cache.invalidate(`project:user:${project.user_id}`);
    this.cache.invalidate(`project:id:${project.id}`);
    end();
  }

  delete(id: string): void {
    const end = this.monitor.start('project.delete');

    const project = this.getById(id);
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);

    if (project) {
      this.cache.invalidate(`project:user:${project.user_id}`);
      this.cache.invalidate(`project:id:${id}`);
    }

    end();
  }

  deleteMany(ids: string[]): { deleted: number; errors: Error[] } {
    const end = this.monitor.start('project.deleteMany');
    const result = bulkDelete(this.db, 'projects', ids);
    this.cache.clear();
    end();
    return result;
  }

  getStalled(userId: string, daysInactive: number): Project[] {
    const cacheKey = generateCacheKey('project:stalled', [userId, daysInactive]);
    const cached = this.cache.get<Project[]>(cacheKey);
    if (cached) return cached;

    const end = this.monitor.start('project.getStalled');
    const cutoff = Date.now() - daysInactive * 24 * 60 * 60 * 1000;
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
        AND status = 'active' 
        AND updated_at < ?
      ORDER BY updated_at ASC
    `);
    const rows = stmt.all(userId, cutoff) as any[];
    const projects = rows.map((row) => this.mapRowToProject(row));

    this.cache.set(cacheKey, projects);
    end();
    return projects;
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
