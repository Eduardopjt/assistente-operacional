// Domain entities
export * from './entities/user';
export * from './entities/daily-checkin';
export * from './entities/financial-entry';
export * from './entities/project';
export * from './entities/task';
export * from './entities/decision';
export * from './entities/alert';

// Rules engine (original)
export * from './rules/engine';
export * from './rules/types';

// Automations (intelligent systems)
export * from './automations';

// Advanced engine (new ML-like features)
export {
  computeAdvancedInsights,
  computeAdvancedFinanceSummary,
  generateAdvancedAlerts,
  computeAdvancedActionMother,
  computeAdvancedGuidance,
  calculateHealthScore,
} from './rules/engine-advanced';
export type { EnhancedFinanceSummary, OperationalInsights } from './analytics/insights';

// Analytics and insights
export * from './analytics';
export type {
  EnhancedFinanceSummary as AdvancedFinanceSummary,
  OperationalInsights as AdvancedInsights,
} from './analytics/insights';

// Validation (zod schemas)
export * from './validation';

// Use cases (future)
