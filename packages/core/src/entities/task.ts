export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  user_id: string;
  description: string;
  linked_project_id?: string;
  status: TaskStatus;
  created_at: Date;
  completed_at?: Date;
}
