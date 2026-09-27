import { defineConfig, devices } from '@playwright/test';

// Dedicated port, distinct from the default `vite preview` port (4173), so a
// preview left running by hand is never mistaken for the build under test.
const PORT = 4193;
const isCI = Boolean(process.env.CI);

/**
 * End-to-end tests run against the production build (`vite preview`), because
 * the service worker and PWA behaviour only exist in production builds.
 * The server is always rebuilt and started by Playwright (never reused), and
 * `--strictPort` makes a busy port fail loudly instead of testing something else.
 * No retries: a flaky test must be fixed, not masked.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${String(PORT)} --strictPort`,
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
