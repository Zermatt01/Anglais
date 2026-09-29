import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
// Layer dependency rules, including the ban on the Anthropic SDK in the client
// (the API key lives only in the Supabase Edge Function).
import { layerConfigs } from './eslint.layers.ts';

export default defineConfig(
  globalIgnores(['dist', 'dev-dist', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Plain JS files (only this config for now) are not part of a TS project.
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(),
      jsxA11y.configs.recommended,
    ],
    languageOptions: { globals: globals.browser },
  },
  ...layerConfigs,
  {
    files: [
      '*.config.ts',
      'eslint.layers.ts',
      'scripts/**/*.ts',
      'e2e/**/*.ts',
      'shared/**/*.ts',
      'supabase/**/*.ts',
    ],
    languageOptions: { globals: globals.node },
  },
  // Must stay last: turns off stylistic rules that conflict with Prettier.
  prettier,
);
