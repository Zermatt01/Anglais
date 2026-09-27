import { expect, test } from '@playwright/test';

test('app shell loads in French on a mobile viewport', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto('/');

  await expect(page).toHaveTitle('Anglais');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1, name: 'Anglais' })).toBeVisible();

  const viewportWidth = page.viewportSize()?.width ?? Number.POSITIVE_INFINITY;
  expect(viewportWidth).toBeLessThan(500);
  expect(pageErrors).toEqual([]);
});
