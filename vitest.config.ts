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
      // CSS is replaced by empty strings in tests, except the theme, whose
      // colour tokens are checked for contrast (src/ui/theme.test.ts).
      css: { include: [/src\/ui\/theme\.css/] },
    },
  }),
);
