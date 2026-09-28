import { readFile } from 'node:fs/promises';
import { expect, test } from './fixtures.ts';

test('keeps the chosen theme after a reload', async ({ page }) => {
  await page.goto('/reglages');
  await page.getByRole('radio', { name: 'Sombre' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.getByRole('radio', { name: 'Sombre' })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('restores typed text after a reload, then saves it (UI-03)', async ({ page }) => {
  await page.goto('/reglages');
  const remarks = page.getByRole('textbox', { name: 'Remarques libres' });
  await remarks.fill('Stage en finance de marché');
  await expect(page.getByText('Brouillon enregistré sur ce téléphone.')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Brouillon restauré')).toBeVisible();
  await expect(remarks).toHaveValue('Stage en finance de marché');

  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Profil enregistré.')).toBeVisible();
  await page.reload();
  await expect(remarks).toHaveValue('Stage en finance de marché');
  await expect(page.getByText('Brouillon restauré')).toHaveCount(0);
});

test('exports the data and imports them on another device', async ({ page, browser }) => {
  await page.goto('/reglages');
  await page.getByRole('radio', { name: 'Américain' }).check();
  await expect(page.getByRole('radio', { name: 'Américain' })).toBeChecked();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter mes données' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^anglais-export-\d{4}-\d{2}-\d{2}\.json$/);
  const file = await download.path();
  const envelope = JSON.parse(await readFile(file, 'utf8')) as {
    app: string;
    tables: { settings: { englishVariant: string }[] };
  };
  expect(envelope.app).toBe('anglais');
  expect(envelope.tables.settings[0]?.englishVariant).toBe('en-US');

  // A fresh browser context plays the role of another device.
  const otherDevice = await browser.newContext({ ...devicesOf(page) });
  const other = await otherDevice.newPage();
  await other.goto('/reglages');
  await expect(other.getByRole('radio', { name: 'Britannique' })).toBeChecked();
  await other.getByLabel('Fichier à importer').setInputFiles(file);
  await expect(other.getByText('Aperçu de l’import')).toBeVisible();
  await other.getByRole('button', { name: 'Importer', exact: true }).click();
  await expect(other.getByText('Import terminé')).toBeVisible();
  await expect(other.getByRole('radio', { name: 'Américain' })).toBeChecked();
  await otherDevice.close();
});

/** Viewport options of the current page, so the second context emulates the same phone. */
function devicesOf(page: import('@playwright/test').Page) {
  const viewport = page.viewportSize();
  return viewport === null ? {} : { viewport, isMobile: true, hasTouch: true };
}
