export interface User {
  id: string;
  created_at: Date;
  settings: UserSettings;
}

export interface UserSettings {
  theme?: 'dark' | 'light';
  biometric_enabled?: boolean;
  notifications_enabled?: boolean;
}
