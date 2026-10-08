import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { NotionCardContent } from '../../domain/cards/content.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { ModelCorrection, ModelError } from '../../domain/production/correction.ts';
import type { NotionUse } from '../../domain/production/notion-use.ts';
import { createFsrsScheduler } from '../../domain/srs/scheduler.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createCardRepository } from './card-repository.ts';
import { createDraftRepository } from './draft-repository.ts';
import { createPathRepository } from './path-repository.ts';
import {
  createProductionRepository,
  reviewedCorrectionOf,
  type NewProduction,
} from './production-repository.ts';

const DAY = 24 * 60 * 60 * 1000;
const NOTION: NotionId = 'tense-present-perfect-vs-past-simple';
const TEXT = 'Yesterday I have finished the report.';
const fallbackHint = () => 'Indice de la catégorie.';

async function setup() {
  const db = await createTestDatabase();
  const clock = createTestClock();
  const path = createPathRepository(db, clock);
  const cards = createCardRepository(db, clock, createFsrsScheduler());
  const productions = createProductionRepository(db, clock, { cards, path });
  return { db, clock, path, cards, productions, drafts: createDraftRepository(db, clock) };
}

function production(fields: Partial<NewProduction> = {}): NewProduction {
  return {
    module: 'journal',
    prompt: { text: 'What did you do yesterday?', language: 'en' },
    context: {
      notionId: null,
      itemId: 'journal/q01',
      tier: null,
      unstudied: false,
      hintUsed: false,
    },
    text: TEXT,
    durationMs: 120_000,
    ...fields,
  };
}

function error(fields: Partial<ModelError> = {}): ModelError {
  return {
    segment: 'have finished',
    start: 12,
    category: 'temps_verbaux',
    notionId: NOTION,
    severity: 'medium',
    confidence: 'high',
    hintFr: '_Yesterday_ : la période est-elle terminée ?',
    correction: 'finished',
    ruleFr: 'Moment passé précis : prétérit.',
    ...fields,
  };
}

function output(fields: Partial<ModelCorrection> = {}): ModelCorrection {
  return {
    intentFr: 'Hier, j’ai fini le rapport.',
    errors: [error()],
    unnatural: [],
    sentences: [
      {
        original: TEXT,
        corrected: 'Yesterday I finished the report.',
        meaningFr: 'Hier, j’ai fini le rapport.',
      },
    ],
    correctedText: 'Yesterday I finished the report.',
    naturalVersion: 'Yesterday I finished the report.',
    targetNotionUses: null,
    expressionOfTheDay: null,
    evaluation: { accuracy: 3, naturalness: 3, complexity: 2, level: 'A2', commentFr: 'Bien.' },
    ...fields,
  };
}

const received = (model: ModelCorrection = output()) => ({
  output: model,
  model: 'claude-sonnet-5',
  promptVersion: 'correct-production@2',
  costUsd: 0.012,
});

const context = { reference: null, fallbackHint };

/** Constructions of the contrast of NOTION (content/notion-use.ts). */
const PERFECT_OR_PAST: NotionUse = {
  groups: [['have|has {participle}'], ['{past}', 'did {base}']],
  required: 2,
};

describe('production repository', () => {
  it('stores a production before the call, with its activity, and removes its draft', async () => {
    const { db, productions, drafts } = await setup();
    await drafts.save('journal:q01', TEXT);
    const stored = await productions.submit(production({ draftKey: 'journal:q01' }));
    expect(stored).toMatchObject({ status: 'submitted', text: TEXT, correction: null });
    expect(await drafts.get('journal:q01')).toEqual({ state: 'absent' });
    expect(await db.table('activity').count()).toBe(1);
    await productions.markFailed(stored.id);
    expect(await productions.get(stored.id)).toMatchObject({
      value: { status: 'correction-failed', text: TEXT },
    });
  });

  it('applies a correction: errors with their diagnosis, and a card per sentence', async () => {
    const { productions, cards, path } = await setup();
    await path.recordPlacement(NOTION, [
      { questionId: `${NOTION}/p/01`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/02`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/03`, answer: 'a', correct: true },
    ]);
    const stored = await productions.submit(production());
    const outcome = await productions.applyCorrection(stored.id, received(), context);
    expect(outcome.cardsCreated).toBe(1);
    expect(outcome.production).toMatchObject({
      status: 'corrected',
      intentFr: 'Hier, j’ai fini le rapport.',
      correction: { promptVersion: 'correct-production@2', costUsd: 0.012 },
      // A journal entry has no result of its own.
      result: null,
    });
    const reviewed = reviewedCorrectionOf(outcome.production);
    expect(reviewed?.errors[0]?.range).toEqual({ start: 12, end: 25 });

    const [stored0] = await productions.errorsOf(stored.id);
    expect(stored0).toMatchObject({
      index: 0,
      notionId: NOTION,
      segment: { text: 'have finished', range: { start: 12, end: 25 } },
      diagnosis: 'lapsus',
    });
    const [card] = await cards.fromErrors([stored0?.id ?? '']);
    expect(card).toMatchObject({
      status: 'active',
      origin: 'error',
      content: {
        type: 'error',
        previousAttempt: TEXT,
        highlights: [{ start: 12, end: 25 }],
        answers: { canonical: 'Yesterday I finished the report.' },
      },
    });
  });

  it('suspends the card of a notion not studied yet (D-025)', async () => {
    const { productions, cards } = await setup();
    const stored = await productions.submit(production());
    await productions.applyCorrection(stored.id, received(), context);
    const [error0] = await productions.errorsOf(stored.id);
    expect(error0?.diagnosis).toBe('unstudied');
    expect((await cards.fromErrors([error0?.id ?? '']))[0]).toMatchObject({
      status: 'suspended',
      suspensionReason: 'unstudied-notion',
    });
  });

  it('sends a notion to consolidate back to step 3 after a second gap in seven days', async () => {
    const { productions, path, clock } = await setup();
    await path.recordPlacement(NOTION, [
      { questionId: `${NOTION}/p/01`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/02`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/03`, answer: 'a', correct: true },
    ]);
    const first = await productions.submit(production());
    expect((await productions.applyCorrection(first.id, received(), context)).events).toEqual([]);
    clock.advance(2 * DAY);
    const second = await productions.submit(production());
    const outcome = await productions.applyCorrection(second.id, received(), context);
    expect(outcome.events).toEqual([{ type: 'regressed' }]);
    expect(await path.progress(NOTION)).toMatchObject({
      values: { status: 'in_progress', step: 3, lastRegressionAt: clock.now() },
    });
    expect((await productions.errorsOf(second.id))[0]?.diagnosis).toBe('lacune');
  });

  it('never counts a doubtful error for a gap (D-024)', async () => {
    const { productions, path, clock } = await setup();
    await path.recordPlacement(NOTION, [
      { questionId: `${NOTION}/p/01`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/02`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/03`, answer: 'a', correct: true },
    ]);
    for (let day = 0; day < 3; day += 1) {
      clock.advance(DAY);
      const stored = await productions.submit(production());
      await productions.applyCorrection(
        stored.id,
        received(output({ errors: [error({ confidence: 'medium' })] })),
        context,
      );
    }
    expect(await path.progress(NOTION)).toMatchObject({ values: { status: 'to_consolidate' } });
  });

  it('keeps an error the app cannot find in the text as a point to check, counted nowhere (D-088)', async () => {
    const { productions, path, clock } = await setup();
    await path.recordPlacement(NOTION, [
      { questionId: `${NOTION}/p/01`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/02`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/03`, answer: 'a', correct: true },
    ]);
    const unfound = output({ errors: [error({ segment: 'has finish' })], sentences: [] });
    let last = null;
    for (let day = 0; day < 3; day += 1) {
      clock.advance(DAY);
      const stored = await productions.submit(production({ module: 'theme' }));
      last = await productions.applyCorrection(stored.id, received(unfound), context);
      const [kept] = await productions.errorsOf(stored.id);
      expect(kept).toMatchObject({ segment: { text: 'has finish', range: null }, diagnosis: null });
    }
    expect(last).toMatchObject({ result: 'correct', events: [], cardsCreated: 0 });
    expect(await path.progress(NOTION)).toMatchObject({ values: { status: 'to_consolidate' } });
  });

  it('applies a correction once only', async () => {
    const { productions, cards } = await setup();
    const stored = await productions.submit(production());
    await productions.applyCorrection(stored.id, received(), context);
    const again = await productions.applyCorrection(stored.id, received(), context);
    expect(again.cardsCreated).toBe(0);
    expect(await productions.errorsOf(stored.id)).toHaveLength(1);
    expect(await cards.all()).toHaveLength(1);
  });

  it('records a translation of the path graded by the model, with its draft and its time once', async () => {
    const { db, productions, path, drafts } = await setup();
    await path.recordPlacement(NOTION, [
      { questionId: `${NOTION}/p/01`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/02`, answer: 'a', correct: true },
      { questionId: `${NOTION}/p/03`, answer: 'a', correct: true },
    ]);
    await drafts.save('path:x/s4/01', TEXT);
    const stored = await productions.submit(
      production({
        module: 'path-translate',
        context: {
          notionId: NOTION,
          itemId: 'x/s4/01',
          tier: null,
          unstudied: false,
          hintUsed: true,
        },
      }),
    );
    const outcome = await productions.applyCorrection(stored.id, received(), {
      ...context,
      reference: {
        meaningFr: 'Hier, j’ai fini le rapport.',
        answers: ['I finished the report yesterday.'],
      },
      pathAnswer: {
        exerciseId: 'x/s4/01',
        source: 'core',
        hintUsed: true,
        durationMs: 30_000,
        context: 'path',
        draftKey: 'path:x/s4/01',
      },
    });
    expect(outcome.result).toBe('incorrect');
    expect(await path.attempts(NOTION)).toContainEqual(
      expect.objectContaining({
        exerciseId: 'x/s4/01',
        step: 4,
        result: 'incorrect',
        grader: 'ai',
        hintUsed: true,
        context: 'path',
      }),
    );
    expect(await drafts.get('path:x/s4/01')).toEqual({ state: 'absent' });
    // Its answer records its time: the production does not record it again.
    expect(await db.table('activity').count()).toBe(1);
  });

  it('makes a notion acquired after two productions of step 5 whose use is proven, with its cards (CUR-09, D-088)', async () => {
    const { db, productions, path, cards, clock } = await setup();
    await db.table('notionProgress').put({
      notionId: NOTION,
      status: 'in_progress',
      step: 5,
      recall: null,
      stepEnteredAt: clock.now(),
      acquiredAt: null,
      lastRegressionAt: null,
      createdAt: clock.now(),
      updatedAt: clock.now(),
      deletedAt: null,
      schemaVersion: 1,
    });
    const notionCards: NotionCardContent[] = [
      {
        type: 'notion',
        notionId: NOTION,
        meaningFr: 'J’ai fini hier.',
        hint: 'Moment passé.',
        answers: { canonical: 'I finished yesterday.', variants: [] },
      },
    ];
    const text = 'I have finished the report. I sent it to my manager yesterday.';
    const good = output({ errors: [], sentences: [], targetNotionUses: ['have finished', 'sent'] });
    // The model says the notion is used, but its words show only one of the two tenses.
    const unproven = output({ errors: [], sentences: [], targetNotionUses: ['have finished'] });
    const produce = production({
      module: 'path-produce',
      context: { notionId: NOTION, itemId: null, tier: null, unstudied: false, hintUsed: false },
      text,
    });
    const step5 = { ...context, notionCards, notionUse: PERFECT_OR_PAST };
    clock.advance(1_000);
    const first = await productions.submit(produce);
    const one = await productions.applyCorrection(first.id, received(good), step5);
    expect(one.result).toBe('correct');
    expect(one.events).toEqual([]);
    clock.advance(1_000);
    const between = await productions.submit(produce);
    const unprovenOutcome = await productions.applyCorrection(
      between.id,
      received(unproven),
      step5,
    );
    // Neither good nor bad: it does not break the series.
    expect(unprovenOutcome).toMatchObject({ result: null, events: [] });
    expect(unprovenOutcome.production.grader).toBeNull();
    clock.advance(1_000);
    const second = await productions.submit(produce);
    const two = await productions.applyCorrection(second.id, received(good), step5);
    expect(two.events).toEqual([{ type: 'acquired' }]);
    expect(await path.progress(NOTION)).toMatchObject({ values: { status: 'acquired' } });
    expect((await cards.all()).map((card) => card.origin)).toEqual(['notion']);
  });

  it('never makes a notion acquired from what the model says without proof (D-088)', async () => {
    const { db, productions, path, clock } = await setup();
    await db.table('notionProgress').put({
      notionId: NOTION,
      status: 'in_progress',
      step: 5,
      recall: null,
      stepEnteredAt: clock.now(),
      acquiredAt: null,
      lastRegressionAt: null,
      createdAt: clock.now(),
      updatedAt: clock.now(),
      deletedAt: null,
      schemaVersion: 1,
    });
    const text = 'I like my job. I work in Geneva.';
    const produce = production({
      module: 'path-produce',
      context: { notionId: NOTION, itemId: null, tier: null, unstudied: false, hintUsed: false },
      text,
    });
    for (const uses of [['I like my job', 'I work'], ['have finished', 'sent'], []]) {
      clock.advance(1_000);
      const stored = await productions.submit(produce);
      const outcome = await productions.applyCorrection(
        stored.id,
        received(output({ errors: [], sentences: [], targetNotionUses: uses })),
        { ...context, notionUse: PERFECT_OR_PAST },
      );
      expect(outcome).toMatchObject({ result: null, events: [] });
    }
    // Without the constructions of the notion, nothing can be proven.
    clock.advance(1_000);
    const stored = await productions.submit({ ...produce, text: 'I have finished. I sent it.' });
    const outcome = await productions.applyCorrection(
      stored.id,
      received(output({ errors: [], sentences: [], targetNotionUses: ['have finished', 'sent'] })),
      context,
    );
    expect(outcome.result).toBeNull();
    expect(await path.progress(NOTION)).toMatchObject({ values: { status: 'in_progress' } });
  });

  it('still reads a correction of the first version of the prompt, whose words prove nothing', async () => {
    const { productions } = await setup();
    const stored = await productions.submit(production());
    const outcome = await productions.applyCorrection(stored.id, received(), context);
    const current = output();
    // Plain JSON, as stored: the round trip drops the key of the current version.
    const firstVersion = z.json().parse(
      JSON.parse(
        JSON.stringify({
          ...current,
          targetNotionUses: undefined,
          usesTargetNotion: true,
          sentences: current.sentences.map((sentence) => ({
            ...sentence,
            variants: ['I like pizza.'],
          })),
        }),
      ),
    );
    const reviewed = reviewedCorrectionOf({
      ...outcome.production,
      correction: {
        promptVersion: 'correct-production@1',
        model: 'claude-sonnet-5',
        receivedAt: 0,
        costUsd: 0.01,
        output: firstVersion,
      },
    });
    expect(reviewed?.targetNotionUses).toEqual([]);
    expect(reviewed?.sentences[0]).toMatchObject({ answer: 'Yesterday I finished the report.' });
    expect(reviewed?.sentences[0]).not.toHaveProperty('variants');
  });

  it('records a Thème sentence graded locally, with the card of an anticipated error', async () => {
    const { productions, cards } = await setup();
    const outcome = await productions.recordLocalResult(
      production({
        module: 'theme',
        text: 'I have finished it yesterday.',
        context: {
          notionId: NOTION,
          itemId: `${NOTION}/t/01`,
          tier: 1,
          unstudied: false,
          hintUsed: false,
        },
      }),
      { result: 'incorrect', grader: 'local' },
      {
        category: 'temps_verbaux',
        correction: 'I finished it yesterday.',
        rule: 'Moment passé précis : prétérit.',
        card: {
          type: 'error',
          meaningFr: 'Je l’ai fini hier.',
          hint: 'Moment passé précis.',
          previousAttempt: 'I have finished it yesterday.',
          highlights: [],
          category: 'temps_verbaux',
          notionId: NOTION,
          answers: { canonical: 'I finished it yesterday.', variants: [] },
        },
      },
    );
    expect(outcome.production).toMatchObject({
      status: 'corrected',
      result: 'incorrect',
      grader: 'local',
    });
    const [error0] = await productions.errorsOf(outcome.production.id);
    expect(error0).toMatchObject({
      severity: 'medium',
      confidence: 'high',
      diagnosis: 'unstudied',
    });
    expect(await cards.all()).toHaveLength(1);
  });

  it('lets the learner judge a production whose correction did not come', async () => {
    const { productions } = await setup();
    const stored = await productions.submit(production({ module: 'theme' }));
    await productions.markFailed(stored.id);
    await productions.assess(stored.id, 'correct');
    expect(await productions.get(stored.id)).toMatchObject({
      value: { status: 'corrected', result: 'correct', grader: 'user' },
    });
  });

  it('keeps the self-corrections and lists the productions of a module, newest first', async () => {
    const { productions, clock } = await setup();
    const first = await productions.submit(production());
    clock.advance(1_000);
    const second = await productions.submit(production());
    await productions.saveSelfCorrections(first.id, [{ errorIndex: 0, text: 'finished' }]);
    expect((await productions.list('journal')).map((entry) => entry.id)).toEqual([
      second.id,
      first.id,
    ]);
    expect(await productions.get(first.id)).toMatchObject({
      value: { selfCorrections: [{ errorIndex: 0, text: 'finished' }] },
    });
  });
});
