declare module 'expo-status-bar' {
  import { ComponentType } from 'react';
  
  export interface StatusBarProps {
    style?: 'auto' | 'inverted' | 'light' | 'dark';
    animated?: boolean;
    hidden?: boolean;
    translucent?: boolean;
    backgroundColor?: string;
  }
  
  export const StatusBar: ComponentType<StatusBarProps>;
}

declare module 'expo-router' {
  export function useRouter(): {
    push: (path: string) => void;
    replace: (path: string) => void;
    back: () => void;
    canGoBack: () => boolean;
  };
  
  export function usePathname(): string;
  export function useSearchParams(): Record<string, string>;
  
  export const Stack: any;
  export const Tabs: any;
  export const Drawer: any;
  export const Slot: any;
  export const Link: any;
}

declare module 'expo-sqlite' {
  export interface Database {
    transaction(callback: (tx: Transaction) => void, error?: (error: Error) => void, success?: () => void): void;
    exec(queries: { sql: string; args: any[] }[], readOnly: boolean, callback: (error: Error | null, result: any) => void): void;
  }
  
  export interface Transaction {
    executeSql(
      sqlStatement: string,
      arguments?: any[],
      callback?: (transaction: Transaction, resultSet: ResultSet) => void,
      errorCallback?: (transaction: Transaction, error: Error) => boolean
    ): void;
  }
  
  export interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
      _array: any[];
    };
  }
  
  export function openDatabase(
    name: string,
    version?: string,
    description?: string,
    size?: number,
    callback?: (db: Database) => void
  ): Database;
}
