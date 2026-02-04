/**
 * Storage layer - SQLite repositories and migrations
 * Offline-first, platform-agnostic SQLite persistence
 */

export * from './database';
export * from './migrations';
export * from './cache';
export * from './batch';
export * from './performance';

// Database adapters
export { BetterSqliteAdapter } from './adapters/better-sqlite-adapter';
export { ExpoSqliteAdapter } from './adapters/expo-sqlite-adapter';
export { MockAdapter } from './adapters/mock-adapter';

// Standard repositories
export * from './repositories/user-repository';
export * from './repositories/checkin-repository';
export * from './repositories/finance-repository';
export * from './repositories/project-repository';
export * from './repositories/task-repository';
export * from './repositories/decision-repository';
export * from './repositories/alert-repository';

// Optimized repositories (with cache + performance monitoring)
export { OptimizedCheckinRepository } from './repositories/checkin-repository-optimized';
export { OptimizedFinanceRepository } from './repositories/finance-repository-optimized';
export { OptimizedProjectRepository } from './repositories/project-repository-optimized';
