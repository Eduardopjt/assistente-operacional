/**
 * Platform adapter types
 * Allows different SQLite implementations per platform
 */

import { Database } from '../database';

export interface DatabaseAdapter {
  /**
   * Open or create a database at the given path
   */
  open(path: string): Database;
}
