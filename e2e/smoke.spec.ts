import { expect, test } from './fixtures.ts';

test('app shell loads in French on a mobile viewport', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Anglais');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1, name: 'Anglais' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();

  const viewportWidth = page.viewportSize()?.width ?? Number.POSITIVE_INFINITY;
  expect(viewportWidth).toBeLessThan(500);
});

test('responses carry the production security headers', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("script-src 'self'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('no-referrer');
});

test('navigates with the bottom bar and the back button', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Réglages', exact: true }).click();
  await expect(page).toHaveURL(/\/reglages$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Réglages' })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Anglais' })).toBeVisible();
});

test('opens a deep link directly', async ({ page }) => {
  await page.goto('/reglages');
  await expect(page.getByRole('heading', { level: 1, name: 'Réglages' })).toBeVisible();
});
