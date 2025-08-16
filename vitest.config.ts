/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'src/generated/**', 'prisma/**'],
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    poolOptions: { threads: { singleThread: true } },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: './coverage',
      exclude: ['node_modules/', 'dist/', 'prisma/**', 'src/generated/prisma/**'],
    },
  },
});
