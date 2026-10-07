import { describe, expect, it } from 'vitest';
import { REASON_SETS } from '../../../shared/ai/reasons.ts';
import { exerciseSchema, type Exercise } from '../../domain/curriculum/exercise.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createGeneratedExerciseRepository } from './generated-exercise-repository.ts';

const NOTION = 'tense-past-simple';

const fit: Exercise = exerciseSchema.parse({
  kind: 'fill-verb',
  sentence: 'We ___ the contract last week.',
  verb: 'sign',
  meaningFr: 'Nous avons signé le contrat la semaine dernière.',
  accepted: ['signed'],
  knownErrors: ['have signed'],
  explanation: '_Last week_ : prétérit.',
});

/** An anticipated error that is in fact accepted: unfit for local grading. */
const unfit: Exercise = exerciseSchema.parse({
  ...fit,
  sentence: 'They ___ the invoice yesterday.',
  accepted: ['paid'],
  knownErrors: ['paid'],
});

async function setup() {
  const db = await createTestDatabase();
  const clock = createTestClock();
  return { db, clock, generated: createGeneratedExerciseRepository(db, clock) };
}

describe('createGeneratedExerciseRepository', () => {
  it('stores only the exercises fit for local grading, at the step of their kind', async () => {
    const { generated } = await setup();
    const stored = await generated.add({
      notionId: NOTION,
      exercises: [fit, unfit],
      model: 'claude-sonnet-5',
      promptVersion: 'generate-exercises@1',
    });
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ step: 3, status: 'active', exercise: fit });
    expect(await generated.active(NOTION, 3)).toEqual(stored);
    expect(await generated.active(NOTION, 4)).toEqual([]);
  });

  it('stores a choice only when its reasons are a reviewed set of the notion (D-081)', async () => {
    const { generated } = await setup();
    const [right, ...wrong] = REASON_SETS[NOTION][0] ?? [''];
    const reviewed: Exercise = exerciseSchema.parse({
      kind: 'choice-with-reason',
      sentence: 'The team ___ the new office last Monday.',
      options: ['opened', 'opens', 'has opened'],
      answer: 'opened',
      reasons: [...wrong, right],
      reason: right,
      explanation: '_Last Monday_ : moment passé précis.',
    });
    const reworded = exerciseSchema.parse({ ...reviewed, reasons: [right, 'Autre raison'] });
    const stored = await generated.add({
      notionId: NOTION,
      exercises: [reviewed, reworded],
      model: 'claude-sonnet-5',
      promptVersion: 'generate-exercises@2',
    });
    expect(stored.map((document) => document.exercise)).toEqual([reviewed]);
  });

  it('never shows an unfit exercise that came from an import or a sync, but keeps it', async () => {
    const { db, generated, clock } = await setup();
    // Valid for the schema, but without a gap: any answer could be graded right (NO-05).
    const noGap = exerciseSchema.parse({ ...fit, sentence: 'We signed the contract.' });
    const now = clock.now();
    await db.table('generatedExercises').put({
      id: '7d3c2a4e-5b6f-4a8b-9c0d-1e2f3a4b5c6d',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      schemaVersion: 1,
      notionId: NOTION,
      step: 3,
      exercise: noGap,
      model: 'claude-sonnet-5',
      promptVersion: 'generate-exercises@1',
      status: 'active',
    });
    expect(await generated.active(NOTION, 3)).toEqual([]);
    expect(await db.table('generatedExercises').count()).toBe(1);
  });

  it('never shows a reported exercise again, but keeps it', async () => {
    const { db, generated, clock } = await setup();
    const [stored] = await generated.add({
      notionId: NOTION,
      exercises: [fit],
      model: 'claude-sonnet-5',
      promptVersion: 'generate-exercises@1',
    });
    clock.advance(1_000);
    await generated.report(stored?.id ?? '');
    expect(await generated.active(NOTION, 3)).toEqual([]);
    expect(await db.table('generatedExercises').count()).toBe(1);
  });
});
