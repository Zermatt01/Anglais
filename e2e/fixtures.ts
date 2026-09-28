import { test as base, expect } from '@playwright/test';

/**
 * Every test fails if the page logs an error or throws: this catches, among
 * others, Content-Security-Policy violations, since `vite preview` sends the
 * production headers of vercel.json.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      await use(errors);
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Waits until a service worker controls the page (a reload is needed the first time). */
export async function waitForServiceWorkerControl(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
}
