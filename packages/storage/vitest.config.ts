import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@assistente/core': path.resolve(__dirname, '../core/src'),
      '@assistente/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
