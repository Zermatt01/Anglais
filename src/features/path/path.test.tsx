import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GeneratedExercise } from '../../../shared/ai/tasks.ts';
import { loadNotionContent } from '../../content/index.ts';
import type { NotionContent } from '../../content/schema.ts';
import { writeRecord } from '../../data/records.ts';
import { notStartedProgress } from '../../domain/curriculum/engine.ts';
import { STEP_OF_KIND, type Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues } from '../../domain/curriculum/progress.ts';
import type { SpeechSynthesizer } from '../../domain/speech.ts';
import type { AppServices } from '../app-services.ts';
import { createTestClock } from '../../test/database.ts';
import { createTestServices, renderApp, renderWithServices } from '../../test/render.tsx';
import { createFakeServer, TEST_ACCOUNT } from '../../test/server.ts';
import { DRAFT_SAVE_DELAY_MS } from '../drafts/use-draft.ts';
import { GenerateExercises } from './GenerateExercises.tsx';
import { AnswerCard } from './AnswerCard.tsx';

const NOTION = 'tense-present-continuous';

async function contentOf(notionId: NotionId): Promise<NotionContent> {
  const content = await loadNotionContent(notionId);
  if (content === null) throw new Error(`no content for ${notionId}`);
  return content;
}

async function seedProgress(
  services: AppServices,
  values: Partial<NotionProgressValues>,
  notionId: NotionId = NOTION,
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

function fakeSpeech(): SpeechSynthesizer & { spoken: { text: string; options: unknown }[] } {
  const spoken: { text: string; options: unknown }[] = [];
  return {
    spoken,
    voices: () => [
      { id: 'uk-voice', name: 'Arthur', lang: 'en-GB', isDefault: true },
      { id: 'us-voice', name: 'Samantha', lang: 'en-US', isDefault: false },
    ],
    onVoicesChanged: () => () => undefined,
    speak(text, options) {
      spoken.push({ text, options });
    },
    cancel: () => undefined,
  };
}

describe('path screen (MOD-04)', () => {
  it('lists the tenses track, with the notions of phase 8 announced', async () => {
    await renderApp('/parcours');
    const track = within(await screen.findByRole('region', { name: 'Temps verbaux' }));
    expect(track.getAllByRole('link', { name: /./ }).length).toBeGreaterThanOrEqual(13);
    expect(track.getByRole('link', { name: 'Présent continu' })).toBeInTheDocument();
    expect(track.getAllByText('Bientôt')).toHaveLength(3);
    expect(track.getAllByText('Non commencée')).toHaveLength(13);
    expect(screen.getByRole('region', { name: 'Prochaines pistes' })).toBeInTheDocument();
  });

  it('starts a notion when it is opened (PEDAGOGY §3.1)', async () => {
    const { services } = await renderApp('/parcours');
    fireEvent.click(await screen.findByRole('link', { name: 'Présent continu' }));
    expect(await screen.findByRole('link', { name: 'Lire la leçon' })).toBeInTheDocument();
    await waitFor(async () => {
      expect(await services.path.progress(NOTION)).toMatchObject({
        state: 'valid',
        values: { status: 'in_progress', step: 1 },
      });
    });
  });
});

describe('lesson (step 1)', () => {
  it('shows the lesson, its timeline and the "Pour aller plus loin" references (CUR-14)', async () => {
    await renderApp(`/parcours/${NOTION}/lecon`);
    expect(await screen.findByRole('region', { name: 'L’essentiel' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Frise/ })).toBeInTheDocument();
    expect(
      screen.getByText('Pour aller plus loin : livre rouge, unités 3 et 4 ; livre bleu, unité 1'),
    ).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Forme du présent continu' })).toBeInTheDocument();
  });

  it('reads an example aloud with the chosen settings', async () => {
    const speech = fakeSpeech();
    const services = await createTestServices({ speech });
    await renderApp(`/parcours/${NOTION}/lecon`, services);
    const example = 'Inflation is falling across the euro area.';
    fireEvent.click(await screen.findByRole('button', { name: `Écouter : ${example}` }));
    expect(speech.spoken).toEqual([
      { text: example, options: { variant: 'en-GB', voiceId: null, rate: 1 } },
    ]);
  });

  it('moves to step 2 when the learner confirms the lesson', async () => {
    const { services } = await renderApp(`/parcours/${NOTION}/lecon`);
    fireEvent.click(
      await screen.findByRole('button', { name: 'J’ai compris, je passe à la reconnaissance' }),
    );
    expect(await screen.findByRole('region', { name: 'Étape : Reconnaître' })).toBeInTheDocument();
    expect(await services.path.progress(NOTION)).toMatchObject({ values: { step: 2 } });
  });
});

describe('exercises (steps 2 to 4)', () => {
  it('asks for the form, then the reason, and records the answer', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 2 });
    const content = await contentOf(NOTION);
    const first = content.exercises[0];
    if (first?.kind !== 'choice-with-reason') throw new Error('expected a choice first');

    await renderApp(`/parcours/${NOTION}/exercices`, services);
    fireEvent.click(await screen.findByRole('radio', { name: first.answer }));
    fireEvent.click(await screen.findByRole('radio', { name: first.reason }));
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));

    expect(await screen.findByText('Juste !')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Exercice suivant' })).toBeInTheDocument();
    const attempts = await services.path.attempts(NOTION);
    expect(attempts).toMatchObject([
      { exerciseId: first.id, result: 'correct', grader: 'local', step: 2, context: 'path' },
    ]);
  });

  it('grades typed answers locally, and lets the learner judge an unexpected one (NO-05)', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 3 });
    await renderApp(`/parcours/${NOTION}/exercices`, services);

    // s3/01: "Please be quiet: the manager ___ to a client." (talk)
    const field = await screen.findByRole('textbox', { name: 'Ce qui manque' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'is talking' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Juste !')).toBeInTheDocument();

    // s3/02: "teach" is not among the expected or anticipated answers.
    fireEvent.click(await screen.findByRole('button', { name: 'Exercice suivant' }));
    const next = await screen.findByRole('textbox', { name: 'Ce qui manque' });
    await waitFor(() => {
      expect(next).toBeEnabled();
    });
    fireEvent.change(next, { target: { value: 'teach' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Réponse non prévue')).toBeInTheDocument();
    expect(screen.queryByText('Pas tout à fait')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Non, ma réponse est à revoir' }));
    expect(await screen.findByText('Noté comme à revoir')).toBeInTheDocument();

    await waitFor(async () => {
      // Same time on the test clock: compared without their order.
      const graded = (await services.path.attempts(NOTION)).map(
        ({ result, grader }) => `${result}/${grader}`,
      );
      expect(graded.sort()).toEqual(['correct/local', 'incorrect/user']);
    });
  });

  it('marks an anticipated error as wrong, with the expected answer', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 3 });
    await renderApp(`/parcours/${NOTION}/exercices`, services);
    const field = await screen.findByRole('textbox', { name: 'Ce qui manque' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'talks' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Pas tout à fait')).toBeInTheDocument();
    expect(screen.getByText(/Réponse attendue/)).toBeInTheDocument();
  });

  it('shows the result only once the answer is stored, and keeps it to try again (NO-06)', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 3 });
    const record = vi.spyOn(services.path, 'recordAnswer');
    record.mockRejectedValueOnce(new Error('QuotaExceededError'));
    await renderApp(`/parcours/${NOTION}/exercices`, services);

    const field = await screen.findByRole('textbox', { name: 'Ce qui manque' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'is talking' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));

    expect(await screen.findByText('Réponse non enregistrée')).toBeInTheDocument();
    expect(screen.queryByText('Juste !')).not.toBeInTheDocument();
    // What the learner typed is still kept as a draft.
    const draftKey = `path:${NOTION}/s3/01`;
    await waitFor(async () => {
      expect(await services.drafts.get(draftKey)).toEqual({ state: 'present', text: 'is talking' });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Juste !')).toBeInTheDocument();
    expect(record).toHaveBeenCalledTimes(2);
    expect(await services.path.attempts(NOTION)).toMatchObject([{ answer: 'is talking' }]);
    await waitFor(async () => {
      expect(await services.drafts.get(draftKey)).toEqual({ state: 'absent' });
    });
  });

  it('removes the draft with the answer, so that it never comes back (NO-06)', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 3 });
    await renderApp(`/parcours/${NOTION}/exercices`, services);
    const field = await screen.findByRole('textbox', { name: 'Ce qui manque' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    // Checked before the typing pause: the pending draft save must not outlive the answer.
    fireEvent.change(field, { target: { value: 'is talking' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Juste !')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, DRAFT_SAVE_DELAY_MS + 200));
    expect(await services.drafts.get(`path:${NOTION}/s3/01`)).toEqual({ state: 'absent' });
    expect(await services.path.attempts(NOTION)).toMatchObject([{ answer: 'is talking' }]);
  });

  it('makes a card of an anticipated error at step 4, and keeps a failed sentence on request (D-092)', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 4 });
    await renderApp(`/parcours/${NOTION}/exercices`, services);

    // s4/01: "Je travaille sur un nouveau projet en ce moment."
    const field = await screen.findByRole('textbox', { name: 'Ta traduction' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'I am work on a new project at the moment.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Pas tout à fait')).toBeInTheDocument();
    expect(
      await screen.findByText('Une carte reprendra cette phrase dans tes Reprises.'),
    ).toBeInTheDocument();
    expect(await services.cards.all()).toMatchObject([
      {
        status: 'active',
        origin: 'error',
        content: {
          type: 'error',
          meaningFr: 'Je travaille sur un nouveau projet en ce moment.',
          previousAttempt: 'I am work on a new project at the moment.',
          category: 'temps_verbaux',
          answers: { canonical: 'I’m working on a new project at the moment.' },
        },
      },
    ]);

    // s4/02: an answer the learner judges wrong makes no card, unless asked.
    fireEvent.click(screen.getByRole('button', { name: 'Exercice suivant' }));
    const next = await screen.findByRole('textbox', { name: 'Ta traduction' });
    await waitFor(() => {
      expect(next).toBeEnabled();
    });
    fireEvent.change(next, { target: { value: 'Look, the rain falls!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Notion à revoir' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Revoir cette phrase dans mes Reprises' }),
    );
    expect(await screen.findByText('Ajoutée à tes Reprises.')).toBeInTheDocument();
    const kept = (await services.cards.all()).find((card) => card.origin === 'notion');
    expect(kept).toMatchObject({
      status: 'active',
      content: { type: 'notion', meaningFr: 'Regarde, il pleut !', notionId: NOTION },
    });
  });

  it('judges a translation on its notion: an error off it, or a proven notion, is good (D-094)', async () => {
    const notionId: NotionId = 'tense-present-simple-vs-continuous';
    const services = await createTestServices();
    await seedProgress(services, { step: 4 }, notionId);
    await renderApp(`/parcours/${notionId}/exercices`, services);

    // s4/01: "D’habitude, je prends le bus." The adverb out of place is off the notion.
    const field = await screen.findByRole('textbox', { name: 'Ta traduction' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'I take usually the bus.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Notion juste, autre chose à revoir')).toBeInTheDocument();
    expect(screen.getByText('I usually take the bus.')).toBeInTheDocument();
    expect(
      await screen.findByText('Une carte reprendra cette phrase dans tes Reprises.'),
    ).toBeInTheDocument();

    // s4/02: "Elle présente les résultats en ce moment." A reviewed answer, its adverb moved:
    // the notion is proven by the app (D-096).
    fireEvent.click(screen.getByRole('button', { name: 'Exercice suivant' }));
    const next = await screen.findByRole('textbox', { name: 'Ta traduction' });
    await waitFor(() => {
      expect(next).toBeEnabled();
    });
    fireEvent.change(next, { target: { value: 'Currently she is presenting the results.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('La forme travaillée est juste')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Notion à revoir' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Notion juste, autre faute' }));
    expect(await screen.findByText('Notion juste, autre chose à revoir')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Revoir cette phrase dans mes Reprises' }),
    ).toBeInTheDocument();

    await waitFor(async () => {
      const graded = (await services.path.attempts(notionId)).map(
        ({ result, grader }) => `${result}/${grader}`,
      );
      expect(graded).toEqual(['acceptable/local', 'acceptable/local']);
    });
  });

  it('offers to go on to step 5 after fifteen translations, the notion to consolidate (D-094)', async () => {
    const clock = createTestClock();
    const services = await createTestServices({ clock });
    await seedProgress(services, { step: 4 });
    const content = await contentOf(NOTION);
    const translations = content.exercises.filter((exercise) => exercise.kind === 'translate');
    // Two good answers out of three: neither the pass (8 of 10) nor a recall (4 failures of 6).
    for (let index = 0; index < 14; index += 1) {
      clock.advance(1_000);
      await services.path.recordAnswer({
        notionId: NOTION,
        exerciseId: translations[index % translations.length]?.id ?? '',
        source: 'core',
        step: 4,
        answer: 'x',
        result: index % 3 === 0 ? 'incorrect' : 'correct',
        grader: 'local',
        hintUsed: false,
        durationMs: 1_000,
      });
    }
    // Fourteen answers: not yet, and the rule is checked again when stored.
    expect((await services.path.skipToProduce(NOTION)).transition).toBeNull();
    clock.advance(1_000);
    await services.path.recordAnswer({
      notionId: NOTION,
      exerciseId: translations[0]?.id ?? '',
      source: 'core',
      step: 4,
      answer: 'x',
      result: 'correct',
      grader: 'local',
      hintUsed: false,
      durationMs: 1_000,
    });

    await renderApp(`/parcours/${NOTION}/exercices`, services);
    fireEvent.click(await screen.findByRole('button', { name: 'Passer à l’étape « Produire »' }));
    expect(await screen.findByRole('textbox', { name: 'Tes phrases' })).toBeInTheDocument();
    expect(await services.path.progress(NOTION)).toMatchObject({
      values: { status: 'to_consolidate', step: 5 },
    });
  });

  it('sends a notion not started back to its lesson', async () => {
    await renderApp(`/parcours/${NOTION}/exercices`);
    expect(await screen.findByText('Commence par la leçon')).toBeInTheDocument();
  });
});

describe('exercise generation (CUR-07)', () => {
  const generated: GeneratedExercise[] = [
    {
      kind: 'fill-verb',
      sentence: 'The analysts ___ the new dashboard this week.',
      verb: 'test',
      meaningFr: 'Les analystes testent le nouveau tableau de bord cette semaine.',
      accepted: ['are testing'],
      knownErrors: ['is testing'],
      explanation: '_This week_ : situation temporaire.',
    },
    {
      kind: 'fill-verb',
      sentence: 'No gap here.',
      verb: 'test',
      meaningFr: 'Rien.',
      accepted: ['x'],
      knownErrors: [],
      explanation: 'x',
    },
  ];

  it('calls the model only on request, then stores the exercises that pass the checks', async () => {
    const run = vi.fn(() =>
      Promise.resolve({
        ok: true as const,
        output: { exercises: generated },
        costUsd: 0.021,
        model: 'claude-sonnet-5',
        promptVersion: 'generate-exercises@1',
      }),
    );
    const fake = createFakeServer({ account: TEST_ACCOUNT, run });
    const services = await createTestServices({ server: fake.server });
    await renderWithServices(<GenerateExercises notionId={NOTION} step={3} existing={[]} />, {
      services,
    });
    expect(fake.calls.run).toEqual([]);
    // The highest cost of the request, its new attempt included (D-081).
    expect(screen.getByText(/Coût : au plus 0,16 USD environ/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Créer 6 exercices avec l’IA' }));
    expect(await screen.findByText(/1 exercice\(s\) ajouté\(s\)/)).toBeInTheDocument();
    expect(screen.getByText(/1 écarté\(s\)/)).toBeInTheDocument();
    expect(fake.calls.run).toEqual(['generate-exercises']);
    expect(run).toHaveBeenCalledWith(
      'generate-exercises',
      expect.objectContaining({ notionId: NOTION, step: 3, englishVariant: 'en-GB' }),
    );
    expect(await services.generatedExercises.active(NOTION, 3)).toMatchObject([
      { model: 'claude-sonnet-5', promptVersion: 'generate-exercises@1', status: 'active' },
    ]);
  });

  it('stores again exercises it could not store, without asking the model again', async () => {
    const run = vi.fn(() =>
      Promise.resolve({
        ok: true as const,
        output: { exercises: generated },
        costUsd: 0.021,
        model: 'claude-sonnet-5',
        promptVersion: 'generate-exercises@1',
      }),
    );
    const fake = createFakeServer({ account: TEST_ACCOUNT, run });
    const services = await createTestServices({ server: fake.server });
    const add = services.generatedExercises.add.bind(services.generatedExercises);
    let failures = 1;
    const generatedExercises = {
      ...services.generatedExercises,
      add: (...args: Parameters<typeof add>) =>
        failures-- > 0 ? Promise.reject(new Error('QuotaExceededError')) : add(...args),
    };
    await renderWithServices(<GenerateExercises notionId={NOTION} step={3} existing={[]} />, {
      services: { ...services, generatedExercises },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Créer 6 exercices avec l’IA' }));
    expect(await screen.findByText('Exercices non enregistrés')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Réessayer l’enregistrement, sans nouveau coût' }),
    );
    expect(await screen.findByText(/1 exercice\(s\) ajouté\(s\)/)).toBeInTheDocument();
    expect(fake.calls.run).toEqual(['generate-exercises']);
  });

  it('makes a failure on a created exercise a point to check, never counted (D-089)', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 3 });
    const exercise: Exercise = {
      kind: 'fill-verb',
      sentence: 'The analysts ___ the new dashboard this week.',
      verb: 'test',
      meaningFr: 'Les analystes testent le nouveau tableau de bord cette semaine.',
      accepted: ['are testing'],
      knownErrors: ['is testing'],
      explanation: '_This week_ : situation temporaire.',
    };
    const stored = await services.generatedExercises.add({
      notionId: NOTION,
      exercises: [exercise],
      model: 'claude-sonnet-5',
      promptVersion: 'generate-exercises@1',
    });
    expect(stored).toHaveLength(1);
    // Every core exercise of the step already seen: the created one comes first.
    const { exercises } = await contentOf(NOTION);
    for (const core of exercises.filter((entry) => entry.kind !== 'choice-with-reason')) {
      await services.path.recordAnswer(
        {
          notionId: NOTION,
          exerciseId: core.id,
          source: 'core',
          step: STEP_OF_KIND[core.kind],
          answer: 'x',
          result: 'correct',
          grader: 'local',
          hintUsed: false,
          durationMs: 1_000,
        },
        undefined,
        'immediate-practice',
      );
    }
    await renderApp(`/parcours/${NOTION}/exercices`, services);
    expect(await screen.findByText('Exercice créé par l’IA')).toBeInTheDocument();
    const field = await screen.findByRole('textbox', { name: 'Ce qui manque' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'is testing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Point à vérifier')).toBeInTheDocument();
    expect(screen.getByText(/Réponse attendue/)).toBeInTheDocument();
    expect(screen.getByText(/are testing/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signaler cet exercice' })).toBeInTheDocument();
    // The failure is kept, but the score of the step does not count it.
    expect(screen.getByText(/Score : 0 sur 0/)).toBeInTheDocument();
    expect(await services.path.attempts(NOTION)).toContainEqual(
      expect.objectContaining({ source: 'generated', result: 'incorrect', context: 'path' }),
    );
  });

  it('needs the network', async () => {
    const fake = createFakeServer({ account: TEST_ACCOUNT });
    const services = await createTestServices({ server: fake.server, isOnline: () => false });
    await renderWithServices(<GenerateExercises notionId={NOTION} step={3} existing={[]} />, {
      services,
    });
    expect(screen.getByRole('button', { name: 'Créer 6 exercices avec l’IA' })).toBeDisabled();
  });
});

describe('placement test (CUR-08)', () => {
  it('starts a notion whose questions are all right at step 4, to consolidate', async () => {
    const { services } = await renderApp('/parcours/positionnement/temps-verbaux');
    fireEvent.click(await screen.findByRole('button', { name: 'Commencer le test' }));
    const { placement } = await contentOf(NOTION);
    for (const question of placement) {
      fireEvent.click(await screen.findByRole('radio', { name: question.answer }));
      fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
    }
    expect(await screen.findByText('Notion à consolider')).toBeInTheDocument();
    expect(await services.path.progress(NOTION)).toMatchObject({
      values: { status: 'to_consolidate', step: 4 },
    });
  });

  it('keeps the answers and offers to try again when the result cannot be stored', async () => {
    const services = await createTestServices();
    const record = vi.spyOn(services.path, 'recordPlacement');
    record.mockRejectedValueOnce(new Error('QuotaExceededError'));
    await renderApp('/parcours/positionnement/temps-verbaux', services);
    fireEvent.click(await screen.findByRole('button', { name: 'Commencer le test' }));
    const { placement } = await contentOf(NOTION);
    for (const question of placement) {
      fireEvent.click(await screen.findByRole('radio', { name: question.answer }));
      fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
    }

    expect(await screen.findByText('Résultat non enregistré')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Notion à consolider')).toBeInTheDocument();
    expect(record).toHaveBeenCalledTimes(2);
    expect(await services.path.progress(NOTION)).toMatchObject({
      values: { status: 'to_consolidate', step: 4 },
    });
  });
});

describe('step 5 (production)', () => {
  it('keeps the learner’s sentences on the device, and needs an account to correct them', async () => {
    const services = await createTestServices();
    await seedProgress(services, { step: 5 });
    await renderApp(`/parcours/${NOTION}/production`, services);
    const field = await screen.findByRole('textbox', { name: 'Tes phrases' });
    await waitFor(() => {
      expect(field).toBeEnabled();
    });
    fireEvent.change(field, { target: { value: 'I’m preparing for an interview this week.' } });
    await waitFor(
      async () => {
        expect(await services.drafts.get(`path-produce:${NOTION}`)).toMatchObject({
          state: 'present',
          text: 'I’m preparing for an interview this week.',
        });
      },
      { timeout: 3_000 },
    );
    expect(
      screen.getByText(/La correction par l’IA demande un compte connecté/),
    ).toBeInTheDocument();
  });
});

describe('reading settings (D-052)', () => {
  it('offers the English voices of the device, and plays a sample', async () => {
    const speech = fakeSpeech();
    const services = await createTestServices({ speech });
    await renderApp('/reglages', services);
    const voice = await screen.findByRole('combobox', { name: 'Voix' });
    expect(within(voice).getByRole('option', { name: 'Arthur (en-GB)' })).toBeInTheDocument();
    fireEvent.change(voice, { target: { value: 'uk-voice' } });
    await waitFor(async () => {
      expect((await services.settings.load()).values.speech.voiceUri).toBe('uk-voice');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Écouter un exemple' }));
    await waitFor(() => {
      expect(speech.spoken.at(-1)?.options).toEqual({
        variant: 'en-GB',
        voiceId: 'uk-voice',
        rate: 1,
      });
    });
  });

  it('says when the browser cannot read aloud', async () => {
    await renderApp('/reglages');
    expect(
      await screen.findByText(/ne sait pas lire les exemples à voix haute/),
    ).toBeInTheDocument();
  });
});

describe('sentence kept for review (D-092, D-096)', () => {
  it('waits for its notion when the notion is not studied, as in immediate practice', async () => {
    const services = await createTestServices();
    const exercise = (await contentOf(NOTION)).exercises.find(
      (entry) => entry.kind === 'translate',
    );
    if (exercise === undefined) throw new Error('no translation');
    await renderWithServices(
      <AnswerCard
        notionId={NOTION}
        exercise={exercise}
        source="core"
        result="incorrect"
        cardCreated={false}
      />,
      { services },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Revoir cette phrase dans mes Reprises' }));
    expect(
      await screen.findByText('Ajoutée à tes Reprises : elle attendra que tu étudies sa notion.'),
    ).toBeInTheDocument();
    expect(await services.cards.all()).toMatchObject([
      { status: 'suspended', suspensionReason: 'unstudied-notion' },
    ]);
  });
});
