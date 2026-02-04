export type EntryType = 'entrada' | 'saida';

export interface FinancialEntry {
  id: string;
  user_id: string;
  type: EntryType;
  value: number; // in cents to avoid floating point issues
  category: string;
  date: Date;
  notes?: string;
}
