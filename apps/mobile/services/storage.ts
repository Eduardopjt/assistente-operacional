/**
 * Mock storage service for mobile (CP4)
 * In production, this would use expo-sqlite with async operations
 * For now, using in-memory storage to complete UI implementation
 */

import {
  User,
  DailyCheckin,
  FinancialEntry,
  Project,
  Task,
  Decision,
  Alert,
} from '@assistente/core';
import { generateId } from '@assistente/shared';

class MockStorageService {
  private user: User | null = null;
  private checkins: DailyCheckin[] = [];
  private finance: FinancialEntry[] = [];
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private decisions: Decision[] = [];
  private alerts: Alert[] = [];

  // User
  async getUser(): Promise<User | null> {
    return this.user;
  }

  async createUser(settings: User['settings']): Promise<User> {
    this.user = {
      id: generateId(),
      created_at: new Date(),
      settings,
    };
    return this.user;
  }

  async updateUser(user: User): Promise<void> {
    this.user = user;
  }

  // Check-ins
  async getTodayCheckin(userId: string): Promise<DailyCheckin | null> {
    const today = new Date().toDateString();
    return (
      this.checkins.find((c) => c.user_id === userId && c.date.toDateString() === today) || null
    );
  }

  async createCheckin(checkin: Omit<DailyCheckin, 'id'>): Promise<DailyCheckin> {
    const newCheckin: DailyCheckin = { id: generateId(), ...checkin };
    this.checkins.unshift(newCheckin);
    return newCheckin;
  }

  async getRecentCheckins(userId: string, days: number): Promise<DailyCheckin[]> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.checkins
      .filter((c) => c.user_id === userId && c.date.getTime() >= cutoff)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Finance
  async createFinanceEntry(entry: Omit<FinancialEntry, 'id'>): Promise<FinancialEntry> {
    const newEntry: FinancialEntry = { id: generateId(), ...entry };
    this.finance.unshift(newEntry);
    return newEntry;
  }

  async getRecentFinance(userId: string, days: number): Promise<FinancialEntry[]> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.finance
      .filter((e) => e.user_id === userId && e.date.getTime() >= cutoff)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async deleteFinanceEntry(id: string): Promise<void> {
    this.finance = this.finance.filter((e) => e.id !== id);
  }

  // Projects
  async createProject(
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> {
    const now = new Date();
    const newProject: Project = {
      id: generateId(),
      created_at: now,
      updated_at: now,
      ...project,
    };
    this.projects.push(newProject);
    return newProject;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.projects
      .filter((p) => p.user_id === userId)
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
  }

  async updateProject(project: Project): Promise<void> {
    const index = this.projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = { ...project, updated_at: new Date() };
    }
  }

  // Alias for automations
  async getProjects(userId: string): Promise<Project[]> {
    return this.getProjectsByUser(userId);
  }

  // Tasks
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const newTask: Task = {
      id: generateId(),
      created_at: new Date(),
      ...task,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.tasks
      .filter((t) => t.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateTask(task: Task): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      this.tasks[index] = task;
    }
  }

  // Decisions
  async createDecision(decision: Omit<Decision, 'id'>): Promise<Decision> {
    const newDecision: Decision = { id: generateId(), ...decision };
    this.decisions.unshift(newDecision);
    return newDecision;
  }

  async getRecentDecisions(userId: string, limit: number): Promise<Decision[]> {
    return this.decisions.filter((d) => d.user_id === userId).slice(0, limit);
  }

  // Alias for automations
  async getDecisions(userId: string): Promise<Decision[]> {
    return this.decisions.filter((d) => d.user_id === userId);
  }

  // Alerts
  async createAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const newAlert: Alert = { id: generateId(), ...alert };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  async getUnresolvedAlerts(userId: string): Promise<Alert[]> {
    return this.alerts.filter((a) => a.user_id === userId && !a.resolved);
  }

  async resolveAlert(id: string): Promise<void> {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.resolved = true;
    }
  }
}

export const storage = new MockStorageService();
