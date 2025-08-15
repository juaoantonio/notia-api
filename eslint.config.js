// eslint.config.js
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  // Ignorar gerados
  {
    ignores: [
      'dist',
      'node_modules',
      '.pnpm',
      'coverage',
      'prisma/client',
      // Arquivos gerados (ex.: Prisma runtime)
      'src/generated',
      'src/generated/**',
    ],
  },

  // Regras base para JS (limitadas a .js/.mjs/.cjs)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // TS recomendado (rápido, sem type-checking) — aplica a todos .ts/.mts/.cts
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      ...(c.languageOptions ?? {}),
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  })),

  // TS com tipos (type-aware) — só em src/** e com project configurado
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['src/**/*.{ts,mts,cts}'],
    languageOptions: {
      ...(c.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        ...(c.languageOptions?.parserOptions ?? {}),
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url),
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  })),

  // Ajustes finos de regras TS (ex.: imports consistentes)
  {
    files: ['**/*.{ts,mts,cts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/require-await': 'off',
    },
  },

  // Desativa conflitos com Prettier
  prettier,
]);
