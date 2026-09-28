import { expect, test, waitForServiceWorkerControl } from './fixtures.ts';

test('is installable according to Chrome itself', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  const client = await page.context().newCDPSession(page);
  const { installabilityErrors } = await client.send('Page.getInstallabilityErrors');
  expect(installabilityErrors).toEqual([]);
});

test('declares a standalone French app with its icons', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).not.toBeNull();

  const manifest = (await (await request.get(href ?? '')).json()) as {
    lang: string;
    display: string;
    start_url: string;
    icons: { src: string; sizes: string; purpose?: string }[];
  };
  expect(manifest).toMatchObject({ lang: 'fr', display: 'standalone', start_url: '/' });
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(
    expect.arrayContaining(['192x192', '512x512']),
  );
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) {
    const response = await request.get(`/${icon.src}`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toBe('image/png');
  }
});

test('works offline once installed, including deep links', async ({ page, context }) => {
  await page.goto('/');
  await waitForServiceWorkerControl(page);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Anglais' })).toBeVisible();

  await page.goto('/reglages');
  await expect(page.getByRole('heading', { level: 1, name: 'Réglages' })).toBeVisible();

  // The local database works offline too.
  await page.getByRole('radio', { name: 'Sombre' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await context.setOffline(false);
});

test('asks for persistent storage and reports it', async ({ page }) => {
  await page.goto('/reglages');
  await expect(page.getByText(/^(Protégé|Non protégé)/)).toBeVisible();
});
