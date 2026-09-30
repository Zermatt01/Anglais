import { expect, test, waitForServiceWorkerControl } from './fixtures.ts';

/** First recognition exercise of the present continuous (src/content). */
const FIRST_CHOICE = {
  answer: 'is giving',
  reason: 'Action en cours au moment où l’on parle',
};

test('reads a lesson, passes to recognition and answers an exercise', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Parcours', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Parcours' })).toBeVisible();

  await page.getByRole('link', { name: 'Présent continu', exact: true }).click();
  await page.getByRole('link', { name: 'Lire la leçon' }).click();
  await expect(page.getByRole('img', { name: /Frise/ })).toBeVisible();
  await expect(
    page.getByText('Pour aller plus loin : livre rouge, unités 3 et 4 ; livre bleu, unité 1'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'J’ai compris, je passe à la reconnaissance' }).click();
  await expect(page.getByRole('region', { name: 'Étape : Reconnaître' })).toBeVisible();
  await page.getByRole('radio', { name: FIRST_CHOICE.answer }).check();
  await page.getByRole('radio', { name: FIRST_CHOICE.reason }).check();
  await page.getByRole('button', { name: 'Vérifier' }).click();
  await expect(page.getByText('Juste !')).toBeVisible();

  // The progress survives a reload: it is stored on the device.
  await page.goto('/parcours/tense-present-continuous');
  await expect(page.getByText('Étape 2 sur 5 : Reconnaître')).toBeVisible();
  await expect(page.getByText(/Score : 1 sur 1 réponse/)).toBeVisible();
});

test('opens the path and a lesson offline', async ({ page, context }) => {
  await page.goto('/');
  await waitForServiceWorkerControl(page);
  await context.setOffline(true);

  await page.goto('/parcours/tense-past-simple/lecon');
  await expect(page.getByRole('heading', { level: 1, name: /Prétérit/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Exemples' })).toBeVisible();
  await context.setOffline(false);
});

test('takes the placement test of the tenses track', async ({ page }) => {
  await page.goto('/parcours/positionnement/temps-verbaux');
  await page.getByRole('button', { name: 'Commencer le test' }).click();
  await expect(page.getByText('Question 1 sur 4')).toBeVisible();
  // A wrong answer on the first question: the notion stays to be started.
  await page.getByRole('radio', { name: 'having', exact: true }).check();
  for (let question = 0; question < 4; question += 1) {
    if (question > 0) await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Valider' }).click();
  }
  await expect(page.getByText('Notion à travailler')).toBeVisible();
  await page.getByRole('button', { name: 'M’arrêter ici' }).click();
  await expect(page.getByText('Test terminé')).toBeVisible();
});
