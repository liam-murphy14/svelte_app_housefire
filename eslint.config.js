import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

const sourceFiles = ['**/*.{js,cjs,mjs,ts,cts,mts,svelte}'];

export default [
  {
    ignores: [
      '**/.DS_Store',
      '**/.direnv/**',
      '**/.svelte-kit/**',
      '**/.vercel/**',
      '**/build/**',
      '**/node_modules/**',
      '**/package/**',
      '**/.env*',
      '**/*.local',
      'package-lock.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  ...svelte.configs['flat/recommended'],
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2017,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  prettierConfig,
];
