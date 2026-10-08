/**
 * The written production of phase 4, screen by screen, on a real in-memory
 * database and a fake server: the journal and its correction in two steps,
 * the Thème, the step-5 production, and the model check of a translation.
 * No test reaches Anthropic, and no screen calls the model on its own.
 */
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AiTaskName } from '../../../shared/ai/tasks.ts';
import { writeRecord } from '../../data/records.ts';
import { notStartedProgress } from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues } from '../../domain/curriculum/progress.ts';
import type { AiRunResult } from '../../services/ai-client/ai-client.ts';
import { answered, correctionOf } from '../../test/corrections.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { createFakeServer, TEST_ACCOUNT } from '../../test/server.ts';
import type { AppServices } from '../app-services.ts';

type Run = (task: AiTaskName, input: unknown) => Promise<AiRunResult<AiTaskName>>;

async function servicesWith(run: Run) {
  const fake = createFakeServer({ account: TEST_ACCOUNT, run });
  return { fake, services: await createTestServices({ server: fake.server }) };
}

async function seedProgress(
  services: AppServices,
  notionId: NotionId,
  values: Partial<NotionProgressValues>,
) {
  const now = services.clock.now();
  await writeRecord(
    services.db,
    'notionProgress',
    {
      ...notStartedProgress(now),
      status: 'in_progress',
      ...values,
      notionId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      schemaVersion: 1,
    },
    now,
  );
}

async function typeIn(name: string | RegExp, text: string) {
  const field = await screen.findByRole('textbox', { name });
  await waitFor(() => {
    expect(field).toBeEnabled();
  });
  fireEvent.change(field, { target: { value: text } });
  return field;
}

const JOURNAL_TEXT = 'Yesterday I have met the client.';

describe('journal (MOD-07)', () => {
  it('corrects an entry in two steps, on request only, and makes its card', async () => {
    const { fake, services } = await servicesWith(() =>
      Promise.resolve(
        answered(correctionOf(JOURNAL_TEXT, { segment: 'have met', correction: 'met' })),
      ),
    );
    await renderApp('/journal', services);
    await typeIn('Ton texte, en anglais', JOURNAL_TEXT);
    // Nothing is sent before the learner asks (COST-01).
    expect(fake.calls.run).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Corriger mon texte' }));

    expect(
      await screen.findByText('Un passage est à revoir. Essaie de le corriger toi-même.'),
    ).toBeInTheDocument();
    expect(fake.calls.run).toEqual(['correct-production']);
    fireEvent.change(screen.getByRole('textbox', { name: 'Ta correction du passage 1' }), {
      target: { value: 'met' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier mes corrections' }));
    expect(await screen.findByText('Bien vu : c’est la correction.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Version naturelle' })).toHaveTextContent(
      'Yesterday I met the client.',
    );
    expect(screen.getByRole('region', { name: 'Expression du jour' })).toBeInTheDocument();

    const [entry] = await services.productions.list('journal');
    expect(entry).toMatchObject({ status: 'corrected', text: JOURNAL_TEXT });
    expect(entry?.selfCorrections).toEqual([{ errorIndex: 0, text: 'met' }]);
    // The notion is not studied yet: its card waits (D-025).
    expect(await services.cards.all()).toMatchObject([
      { status: 'suspended', suspensionReason: 'unstudied-notion' },
    ]);
  });

  it('keeps the text when the correction does not come, and tries again on request', async () => {
    let answers = 0;
    const { fake, services } = await servicesWith(() => {
      answers += 1;
      return Promise.resolve(
        answers === 1
          ? { ok: false, error: { code: 'upstream_error' } }
          : answered(correctionOf(JOURNAL_TEXT, null)),
      );
    });
    await renderApp('/journal', services);
    await typeIn('Ton texte, en anglais', JOURNAL_TEXT);
    fireEvent.click(screen.getByRole('button', { name: 'Corriger mon texte' }));
    expect(await screen.findByText('Correction non reçue')).toBeInTheDocument();
    const [entry] = await services.productions.list('journal');
    expect(entry).toMatchObject({ status: 'correction-failed', text: JOURNAL_TEXT });

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Aucune erreur : bravo.')).toBeInTheDocument();
    expect(fake.calls.run).toEqual(['correct-production', 'correct-production']);
  });

  it('stores one production and asks once, even after a double tap', async () => {
    const { fake, services } = await servicesWith(() =>
      Promise.resolve(answered(correctionOf(JOURNAL_TEXT, null))),
    );
    await renderApp('/journal', services);
    await typeIn('Ton texte, en anglais', JOURNAL_TEXT);
    const button = screen.getByRole('button', { name: 'Corriger mon texte' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(await screen.findByText('Aucune erreur : bravo.')).toBeInTheDocument();
    expect(fake.calls.run).toEqual(['correct-production']);
    expect(await services.productions.list('journal')).toHaveLength(1);
  });

  it('shows the correction at once when self-correction is turned off in the settings', async () => {
    const { services } = await servicesWith(() =>
      Promise.resolve(
        answered(correctionOf(JOURNAL_TEXT, { segment: 'have met', correction: 'met' })),
      ),
    );
    await services.settings.update({ selfCorrection: false });
    await renderApp('/journal', services);
    await typeIn('Ton texte, en anglais', JOURNAL_TEXT);
    fireEvent.click(screen.getByRole('button', { name: 'Corriger mon texte' }));
    expect(await screen.findByText('Une erreur corrigée.')).toBeInTheDocument();
  });
});

describe('Thème (MOD-05)', () => {
  it('opens only once a notion is studied', async () => {
    const services = await createTestServices();
    await renderApp('/theme', services);
    fireEvent.click(await screen.findByRole('button', { name: 'Commencer' }));
    expect(await screen.findByText('Pas encore de phrases')).toBeInTheDocument();
  });

  it('grades locally what it can, makes a card of an anticipated error, and lets the learner compare', async () => {
    const services = await createTestServices();
    await seedProgress(services, 'tense-past-simple', { step: 4 });
    await renderApp('/theme', services);
    fireEvent.click(await screen.findByRole('button', { name: 'Commencer' }));

    expect(await screen.findByText('Hier, j’ai envoyé le contrat au client.')).toBeInTheDocument();
    await typeIn('Ta phrase, en anglais', 'I sent the contract to the client yesterday.');
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Juste !')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Phrase suivante' }));

    expect(
      await screen.findByText('Nous avons rencontré l’équipe de direction la semaine dernière.'),
    ).toBeInTheDocument();
    await typeIn('Ta phrase, en anglais', 'We meeted the management team last week.');
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Pas tout à fait')).toBeInTheDocument();
    expect(
      screen.getByText('Une carte reprendra cette phrase dans tes Reprises.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Phrase suivante' }));

    // A notion not studied yet, with its hint shown (D-023).
    expect(await screen.findByText(/Notion pas encore étudiée/)).toBeInTheDocument();
    expect(screen.getByText('Indice')).toBeInTheDocument();
    await typeIn('Ta phrase, en anglais', 'At this moment I prepare the slides for tomorrow.');
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Réponse non prévue')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Non, elle est à revoir' }));
    expect(await screen.findByText('Noté comme à revoir')).toBeInTheDocument();

    const answers = await services.productions.list('theme');
    expect(answers.map((entry) => [entry.result, entry.grader]).sort()).toEqual([
      ['correct', 'local'],
      ['incorrect', 'local'],
      ['incorrect', 'user'],
    ]);
    expect(answers.find((entry) => entry.grader === 'user')?.context).toMatchObject({
      unstudied: true,
      hintUsed: true,
      tier: 1,
    });
    expect(await services.cards.all()).toHaveLength(1);
  });
});

describe('step 5 (production, D-076)', () => {
  it('makes a notion acquired after two good productions, with its cards (CUR-09)', async () => {
    const notionId: NotionId = 'tense-present-continuous';
    const text = 'I am preparing for an interview this week.';
    const { services } = await servicesWith(() =>
      Promise.resolve(answered(correctionOf(text, null, { targetNotionUses: ['am preparing'] }))),
    );
    await seedProgress(services, notionId, { step: 5 });
    await renderApp(`/parcours/${notionId}/production`, services);

    for (const round of [1, 2]) {
      await typeIn('Tes phrases', text);
      fireEvent.click(screen.getByRole('button', { name: 'Corriger mes phrases' }));
      expect(
        await screen.findByText(
          'Production réussie : la notion est bien employée, sans erreur sur elle.',
        ),
      ).toBeInTheDocument();
      if (round === 1) {
        expect(
          await screen.findByText(/Productions réussies d’affilée : 1 sur 2/),
        ).toBeInTheDocument();
      }
    }
    expect(await screen.findByText('Notion acquise')).toBeInTheDocument();
    expect(await services.path.progress(notionId)).toMatchObject({
      values: { status: 'acquired' },
    });
    const cards = await services.cards.all();
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.origin === 'notion')).toBe(true);
  });
});

describe('step 5, use of the notion not proven (D-088)', () => {
  it('counts a production whose use the app cannot prove neither for nor against the step', async () => {
    const notionId: NotionId = 'tense-present-continuous';
    const text = 'I like my new job a lot.';
    const { services } = await servicesWith(() =>
      Promise.resolve(answered(correctionOf(text, null, { targetNotionUses: ['I like'] }))),
    );
    await seedProgress(services, notionId, { step: 5 });
    await renderApp(`/parcours/${notionId}/production`, services);
    await typeIn('Tes phrases', text);
    fireEvent.click(screen.getByRole('button', { name: 'Corriger mes phrases' }));
    expect(
      await screen.findByText(/L’application n’a pas pu vérifier que ton texte emploie la notion/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Productions réussies d’affilée : 0 sur 2/)).toBeInTheDocument();
    expect((await services.productions.list('path-produce'))[0]).toMatchObject({
      status: 'corrected',
      result: null,
    });
    expect(await services.path.progress(notionId)).toMatchObject({
      values: { status: 'in_progress', step: 5 },
    });
  });
});

describe('step 4 checked by the model (D-076)', () => {
  it('records an unexpected translation graded by the model, on request', async () => {
    const notionId: NotionId = 'tense-present-continuous';
    const answer = 'These days I am busy with a new project.';
    const { fake, services } = await servicesWith(() =>
      Promise.resolve(answered(correctionOf(answer, null))),
    );
    await seedProgress(services, notionId, { step: 4 });
    await renderApp(`/parcours/${notionId}/exercices`, services);
    await typeIn('Ta traduction', answer);
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Réponse non prévue')).toBeInTheDocument();
    expect(fake.calls.run).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Faire vérifier par l’IA' }));
    expect(await screen.findByText('Juste !')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Exercice suivant' })).toBeInTheDocument();
    expect(await services.path.attempts(notionId)).toEqual([
      expect.objectContaining({ step: 4, result: 'correct', grader: 'ai', context: 'path' }),
    ]);
    expect((await services.productions.list('path-translate'))[0]).toMatchObject({
      status: 'corrected',
      result: 'correct',
    });
  });
});

describe('daily session (MOD-02)', () => {
  it('goes through the modules in order, and skips what cannot be done yet', async () => {
    await renderApp('/');
    const session = within(await screen.findByRole('region', { name: 'Séance du jour' }));
    expect(await session.findByRole('link', { name: 'Continuer : Parcours' })).toBeInTheDocument();
    expect(session.getByText('Fait aujourd’hui.')).toBeInTheDocument();
    expect(
      session.getByText('Il s’ouvre dès qu’une notion atteint l’étape « Traduire ».'),
    ).toBeInTheDocument();
    expect(
      session.getByText('Il demande un compte connecté pour la correction.'),
    ).toBeInTheDocument();
  });
});
