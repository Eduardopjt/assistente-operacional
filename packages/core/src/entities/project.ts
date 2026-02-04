export type ProjectStatus = 'active' | 'paused' | 'done';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
  objective: string;
  next_action?: string;
  created_at: Date;
  updated_at: Date;
}
