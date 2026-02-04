/**
 * Zod schemas for runtime validation
 * Executive-grade data integrity
 */

import { z } from 'zod';

/**
 * DailyCheckin schema
 */
export const DailyCheckinSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  date: z.date(),
  caixa_status: z.enum(['tranquilo', 'atencao', 'critico']),
  energia: z.enum(['alta', 'media', 'baixa']),
  pressao: z.enum(['leve', 'normal', 'alta']),
  estado_calculado: z.enum(['ATTACK', 'CAUTION', 'CRITICAL']).optional(),
});

/**
 * FinancialEntry schema
 */
export const FinancialEntrySchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  type: z.enum(['entrada', 'saida']),
  value: z.number().positive('Value must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.date(),
  notes: z.string().optional(),
});

/**
 * Project schema
 */
export const ProjectSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  status: z.enum(['active', 'paused', 'done']),
  objective: z.string().min(1, 'Objective is required').max(500, 'Objective too long'),
  next_action: z.string().max(300, 'Next action too long').optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

/**
 * Alert schema
 */
export const AlertSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  type: z.enum(['finance', 'project', 'system', 'overload']),
  message: z.string().min(1, 'Alert message is required').max(500, 'Message too long'),
  date: z.date(),
  resolved: z.boolean(),
});

/**
 * Task schema
 */
export const TaskSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  description: z.string().min(1, 'Task description is required').max(300, 'Description too long'),
  linked_project_id: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']),
  created_at: z.date().optional(),
  completed_at: z.date().optional(),
});

/**
 * Decision schema
 */
export const DecisionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  context: z.string().min(1, 'Context is required').max(500, 'Context too long'),
  decision: z.string().min(1, 'Decision is required').max(500, 'Decision too long'),
  date: z.date(),
});

/**
 * Validation helpers
 */
export const validate = {
  checkin: (data: unknown) => DailyCheckinSchema.parse(data),
  finance: (data: unknown) => FinancialEntrySchema.parse(data),
  project: (data: unknown) => ProjectSchema.parse(data),
  alert: (data: unknown) => AlertSchema.parse(data),
  task: (data: unknown) => TaskSchema.parse(data),
  decision: (data: unknown) => DecisionSchema.parse(data),
};

/**
 * Safe validation (returns errors instead of throwing)
 */
export const validateSafe = {
  checkin: (data: unknown) => DailyCheckinSchema.safeParse(data),
  finance: (data: unknown) => FinancialEntrySchema.safeParse(data),
  project: (data: unknown) => ProjectSchema.safeParse(data),
  alert: (data: unknown) => AlertSchema.safeParse(data),
  task: (data: unknown) => TaskSchema.safeParse(data),
  decision: (data: unknown) => DecisionSchema.safeParse(data),
};
