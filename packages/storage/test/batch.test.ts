import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Database } from '../src/database';
import { MockAdapter } from '../src/adapters/mock-adapter';
import { bulkInsert, bulkUpdate, bulkDelete, BatchExecutor } from '../src/batch';

describe('Batch Operations', () => {
  let db: Database;

  beforeEach(() => {
    const adapter = new MockAdapter();
    db = adapter.open(':memory:');

    // Create test table
    db.exec(`
      CREATE TABLE test_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL,
        updated_at INTEGER
      )
    `);
  });

  describe('bulkInsert', () => {
    it('should insert multiple records in a single transaction', () => {
      const records = [
        { id: '1', name: 'Item 1', value: 100, updated_at: null },
        { id: '2', name: 'Item 2', value: 200, updated_at: null },
        { id: '3', name: 'Item 3', value: 300, updated_at: null },
      ];

      const result = bulkInsert(db, 'test_items', records);

      expect(result.inserted).toBe(3);
      expect(result.errors).toHaveLength(0);

      const rows = db.prepare('SELECT * FROM test_items ORDER BY id').all();
      expect(rows).toHaveLength(3);
      expect(rows[0]).toMatchObject({ id: '1', name: 'Item 1', value: 100 });
    });

    it('should handle empty array', () => {
      const result = bulkInsert(db, 'test_items', []);
      expect(result.inserted).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should rollback on error and report failures', () => {
      const records = [
        { id: '1', name: 'Item 1', value: 100, updated_at: null },
        { id: '1', name: 'Duplicate', value: 200, updated_at: null }, // Duplicate ID
      ];

      const result = bulkInsert(db, 'test_items', records);

      expect(result.inserted).toBe(0); // All should fail due to transaction rollback
      expect(result.errors.length).toBeGreaterThan(0);

      const rows = db.prepare('SELECT * FROM test_items').all();
      expect(rows).toHaveLength(0); // Transaction rolled back
    });

    it('should handle various data types', () => {
      const records = [
        { id: 'a', name: 'String', value: 1, updated_at: 12345 },
        { id: 'b', name: 'Number', value: 99, updated_at: null },
      ];

      const result = bulkInsert(db, 'test_items', records);

      expect(result.inserted).toBe(2);

      const row = db.prepare('SELECT * FROM test_items WHERE id = ?').get('a') as any;
      expect(row.updated_at).toBe(12345);
    });
  });

  describe('bulkUpdate', () => {
    beforeEach(() => {
      // Insert test data
      db.prepare('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)').run(
        '1',
        'Item 1',
        100,
        1000
      );
      db.prepare('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)').run(
        '2',
        'Item 2',
        200,
        2000
      );
      db.prepare('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)').run(
        '3',
        'Item 3',
        300,
        3000
      );
    });

    it('should update multiple records in a single transaction', () => {
      const updates = [
        { id: '1', name: 'Updated 1', value: 101 },
        { id: '2', name: 'Updated 2', value: 202 },
      ];

      const result = bulkUpdate(db, 'test_items', updates);

      expect(result.updated).toBe(2);
      expect(result.errors).toHaveLength(0);

      const row1 = db.prepare('SELECT * FROM test_items WHERE id = ?').get('1') as any;
      expect(row1.name).toBe('Updated 1');
      expect(row1.value).toBe(101);

      const row2 = db.prepare('SELECT * FROM test_items WHERE id = ?').get('2') as any;
      expect(row2.name).toBe('Updated 2');
    });

    it('should handle partial field updates', () => {
      const updates = [
        { id: '1', value: 999 }, // Only update value
      ];

      const result = bulkUpdate(db, 'test_items', updates);

      expect(result.updated).toBe(1);

      const row = db.prepare('SELECT * FROM test_items WHERE id = ?').get('1') as any;
      expect(row.name).toBe('Item 1'); // Name unchanged
      expect(row.value).toBe(999); // Value updated
    });

    it('should not update non-existent records', () => {
      const updates = [{ id: 'nonexistent', name: 'Ghost' }];

      const result = bulkUpdate(db, 'test_items', updates);

      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const result = bulkUpdate(db, 'test_items', []);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('bulkDelete', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)').run(
        '1',
        'Item 1',
        100,
        null
      );
      db.prepare('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)').run(
        '2',
        'Item 2',
        200,
        null
      );
      db.prepare('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)').run(
        '3',
        'Item 3',
        300,
        null
      );
    });

    it('should delete multiple records in a single transaction', () => {
      const result = bulkDelete(db, 'test_items', ['1', '2']);

      expect(result.deleted).toBe(2);
      expect(result.errors).toHaveLength(0);

      const rows = db.prepare('SELECT * FROM test_items').all();
      expect(rows).toHaveLength(1);
      expect((rows[0] as any).id).toBe('3');
    });

    it('should handle non-existent IDs gracefully', () => {
      const result = bulkDelete(db, 'test_items', ['1', 'nonexistent', '2']);

      expect(result.deleted).toBe(2); // Only 2 existed
      expect(result.errors).toHaveLength(0);

      const rows = db.prepare('SELECT * FROM test_items').all();
      expect(rows).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const result = bulkDelete(db, 'test_items', []);
      expect(result.deleted).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('BatchExecutor', () => {
    it('should queue operations and execute in transaction', () => {
      const executor = new BatchExecutor(db);

      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '1',
        'Item 1',
        100,
        null,
      ]);
      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '2',
        'Item 2',
        200,
        null,
      ]);

      expect(executor.count()).toBe(2);

      const result = executor.execute();

      expect(result.success).toBe(2);
      expect(result.errors).toHaveLength(0);

      const rows = db.prepare('SELECT * FROM test_items').all();
      expect(rows).toHaveLength(2);
    });

    it('should rollback all operations on error', () => {
      const executor = new BatchExecutor(db);

      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '1',
        'Item 1',
        100,
        null,
      ]);
      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '1',
        'Duplicate',
        200,
        null,
      ]); // Duplicate

      const result = executor.execute();

      expect(result.success).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);

      const rows = db.prepare('SELECT * FROM test_items').all();
      expect(rows).toHaveLength(0); // All rolled back
    });

    it('should clear queue after execution', () => {
      const executor = new BatchExecutor(db);

      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '1',
        'Item 1',
        100,
        null,
      ]);
      executor.execute();

      expect(executor.count()).toBe(0);
    });

    it('should allow reuse after clear', () => {
      const executor = new BatchExecutor(db);

      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '1',
        'Item 1',
        100,
        null,
      ]);
      executor.execute();

      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '2',
        'Item 2',
        200,
        null,
      ]);
      const result = executor.execute();

      expect(result.success).toBe(1);

      const rows = db.prepare('SELECT * FROM test_items').all();
      expect(rows).toHaveLength(2);
    });

    it('should manually clear queue', () => {
      const executor = new BatchExecutor(db);

      executor.add('INSERT INTO test_items (id, name, value, updated_at) VALUES (?, ?, ?, ?)', [
        '1',
        'Item 1',
        100,
        null,
      ]);
      executor.clear();

      expect(executor.count()).toBe(0);

      const result = executor.execute();
      expect(result.success).toBe(0);
    });
  });
});
