import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        // The service worker only exists in production builds (e2e tests).
        'virtual:pwa-register/react': fileURLToPath(
          new URL('./src/test/pwa-register-stub.ts', import.meta.url),
        ),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: [
        'src/**/*.test.{ts,tsx}',
        'scripts/**/*.test.ts',
        'shared/**/*.test.ts',
        'supabase/**/*.test.ts',
      ],
      restoreMocks: true,
      // Screen tests load screens and notions on demand and go through several
      // steps: on a busy machine (CI), 5 s per test is too short.
      testTimeout: 20_000,
      // CSS is replaced by empty strings in tests, except the theme, whose
      // colour tokens are checked for contrast (src/ui/theme.test.ts).
      css: { include: [/src\/ui\/theme\.css/] },
    },
  }),
);
