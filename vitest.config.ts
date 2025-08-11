import {defineConfig} from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    globals: true,
    setupFiles: ['vitest.setup.ts'],
    restoreMocks: true,
    // Default thread pool is fine when each worker uses its own DB file
    pool: 'threads',
  },
});
