import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'apps/web/src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: ['apps/web/src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.test.*', '**/node_modules/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
      '@sharesteak/types': path.resolve(__dirname, 'packages/types/src'),
      '@sharesteak/api-client': path.resolve(__dirname, 'packages/api-client/src'),
    },
  },
});
