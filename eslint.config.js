import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Security rule: the Anthropic API key lives only in the Supabase Edge Function.
// The front-end must never talk to Anthropic directly (docs/ARCHITECTURE.md).
// The pattern also matches '@anthropic-ai/sdk' itself.
const noAnthropicSdkInClient = {
  patterns: [
    {
      group: ['@anthropic-ai/*'],
      message: 'AI calls go through the Supabase Edge Function proxy, never from the client.',
    },
  ],
};

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
    rules: {
      'no-restricted-imports': ['error', noAnthropicSdkInClient],
    },
  },
  {
    files: ['*.config.ts', 'scripts/**/*.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  // Must stay last: turns off stylistic rules that conflict with Prettier.
  prettier,
);
