import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: process.env.TAURI_DEBUG !== 'true' ? 'esbuild' : false,
    sourcemap: process.env.TAURI_DEBUG === 'true',
  },
  define: {
    __TAURI__: false,
  },
  optimizeDeps: {
    exclude: ['expo-sqlite', 'react-native', 'better-sqlite3'],
  },
});
