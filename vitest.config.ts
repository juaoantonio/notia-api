/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    poolOptions: { threads: { singleThread: true } },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
