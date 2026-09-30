import { describe, expect, it } from 'vitest';
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
