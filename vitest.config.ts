import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
      restoreMocks: true,
      // CSS is replaced by empty strings in tests, except the theme, whose
      // colour tokens are checked for contrast (src/ui/theme.test.ts).
      css: { include: [/src\/ui\/theme\.css/] },
    },
  }),
);
