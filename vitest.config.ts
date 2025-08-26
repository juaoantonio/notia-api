/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['dist', 'node_modules'],
    hookTimeout: 30000,
    testTimeout: 30000,
    retry: 0,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      all: false,
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/types.d.ts', 'src/**/migrations/**', 'src/**/seed/**'],
    },
  },
});
