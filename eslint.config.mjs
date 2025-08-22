import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['tests/**/*', '**/*.test.ts', '**/*.test.tsx'],
    ...vitest.configs.recommended,
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: [
      '**/*config.{js,cjs,mjs,ts}',
      'postcss.config.*',
      'tailwind.config.*',
      'next.config.*',
      'vitest.config.*'
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'public/**', 'next-env.d.ts'],
  },
];
