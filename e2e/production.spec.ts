import { expect, test, waitForServiceWorkerControl } from './fixtures.ts';
import { mockSupabase, signIn } from './supabase-mock.ts';

const TEXT = 'I am agree with the plan.';

/** What the fake model answers to `correct-production` (the shape of shared/ai/tasks.ts). */
function correctionOutput() {
  return {
    intentFr: 'Je suis d’accord avec le plan.',
    errors: [
      {
        segment: 'am agree',
        start: 2,
        category: 'calques_du_francais',
        notionId: null,
        severity: 'medium',
        confidence: 'high',
        hintFr: 'En anglais, « être d’accord » se dit avec un seul verbe.',
        correction: 'agree',
        ruleFr: '« Être d’accord » se dit _to agree_.',
      },
    ],
    unnatural: [],
    sentences: [
      {
        original: TEXT,
        corrected: 'I agree with the plan.',
        meaningFr: 'Je suis d’accord avec le plan.',
      },
    ],
    correctedText: 'I agree with the plan.',
    naturalVersion: 'I agree with the plan.',
    targetNotionUses: null,
    expressionOfTheDay: null,
    evaluation: { accuracy: 3, naturalness: 3, complexity: 1, level: 'A2', commentFr: 'Bien.' },
  };
}

test.describe('correction and review', () => {
  // The fake server answers on the page's own origin; the service worker is not needed.
  test.use({ serviceWorkers: 'block' });

  test('corrects a journal entry in two steps, then reviews its card', async ({ page }) => {
    const mock = await mockSupabase(page, {
      ai: (body) => {
        const { requestId } = body as { requestId: string };
        return {
          ok: true,
          requestId,
          task: 'correct-production',
          model: 'claude-sonnet-5',
          promptVersion: 'correct-production@2',
          costUsd: 0.012,
          output: correctionOutput(),
        };
      },
    });
    await signIn(page);
    await page.goto('/journal');
    await page.getByRole('textbox', { name: 'Ton texte, en anglais' }).fill(TEXT);
    // Nothing is sent before the learner asks (COST-01).
    expect(mock.aiCalls).toEqual([]);
    await page.getByRole('button', { name: 'Corriger mon texte' }).click();

    await expect(
      page.getByText('Un passage est à revoir. Essaie de le corriger toi-même.'),
    ).toBeVisible();
    // The client sends a task and its input, never a prompt (D-017).
    expect(mock.aiCalls).toEqual([
      expect.objectContaining({
        task: 'correct-production',
        input: expect.objectContaining({ module: 'journal', text: TEXT }),
      }),
    ]);
    expect(mock.aiCalls[0]).not.toHaveProperty('system');
    await page.getByRole('textbox', { name: 'Ta correction du passage 1' }).fill('agree');
    await page.getByRole('button', { name: 'Vérifier mes corrections' }).click();
    await expect(page.getByText('Bien vu : c’est la correction.')).toBeVisible();
    await expect(page.getByText('Carte ajoutée à tes Reprises.')).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Reprises' })
      .click();
    await expect(page.getByText('Je suis d’accord avec le plan.')).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Ta réponse, en anglais' })
      .fill('I agree with the plan');
    await page.getByRole('button', { name: 'Vérifier' }).click();
    await expect(page.getByText('Juste !')).toBeVisible();
    await page.getByRole('button', { name: 'Bien (proposé)' }).click();
    await expect(page.getByText('Rien à revoir pour l’instant')).toBeVisible();

    // The entry and its correction are stored on the device.
    await page.goto('/journal');
    await expect(page.getByRole('region', { name: 'Entrées précédentes' })).toBeVisible();
    expect(mock.aiCalls).toHaveLength(1);
    expect(mock.unexpected).toEqual([]);
  });
});

test('practises the Thème offline once a notion is studied', async ({ page, context }) => {
  // The placement test makes the present continuous a notion to consolidate (step 4).
  await page.goto('/parcours/positionnement/temps-verbaux');
  await page.getByRole('button', { name: 'Commencer le test' }).click();
  for (const answer of ['am having', 'are growing', 'are you writing', 'isn’t working']) {
    await page.getByRole('radio', { name: answer, exact: true }).check();
    await page.getByRole('button', { name: 'Valider' }).click();
  }
  await expect(page.getByText('Notion à consolider')).toBeVisible();
  await page.getByRole('button', { name: 'M’arrêter ici' }).click();

  await waitForServiceWorkerControl(page);
  await context.setOffline(true);
  await page.goto('/theme');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByText('En ce moment, je prépare la présentation de demain.')).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Ta phrase, en anglais' })
    .fill('I’m preparing tomorrow’s presentation at the moment.');
  await page.getByRole('button', { name: 'Vérifier' }).click();
  await expect(page.getByText('Juste !')).toBeVisible();
  await page.getByRole('button', { name: 'Phrase suivante' }).click();
  await expect(page.getByText('Phrase 2 sur 5')).toBeVisible();
  await context.setOffline(false);
});
