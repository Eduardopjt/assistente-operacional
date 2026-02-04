/**
 * Application constants
 */

export const APP_NAME = 'Assistente Operacional';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  USER_ID: 'user_id',
  LAST_CHECKIN: 'last_checkin',
  THEME: 'theme',
} as const;

export const CATEGORIES = {
  FINANCE: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Outros',
    'Salário',
    'Freelance',
    'Investimentos',
  ],
} as const;

export const LIMITS = {
  MAX_ACTIVE_PROJECTS: 5,
  MAX_DAILY_TASKS: 10,
  FINANCE_LOOKBACK_DAYS: 30,
} as const;
