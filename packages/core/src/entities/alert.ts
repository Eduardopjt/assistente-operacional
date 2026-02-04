export type AlertType = 'finance' | 'project' | 'system' | 'overload';

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  message: string;
  date: Date;
  resolved: boolean;
}
