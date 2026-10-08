import { describe, expect, it } from 'vitest';
import type { Step } from '../../domain/curriculum/progress.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createDraftRepository } from './draft-repository.ts';
import { createPathRepository, type NewAnswer } from './path-repository.ts';

const NOTION = 'tense-just-already-yet-still';

async function setup() {
  const db = await createTestDatabase();
  const clock = createTestClock();
  return { db, clock, path: createPathRepository(db, clock) };
}

function answer(step: Step, correct: boolean, number: number): NewAnswer {
  return {
    notionId: NOTION,
    exerciseId: `${NOTION}/s${String(step)}/${String(number).padStart(2, '0')}`,
    source: 'core',
    step,
    answer: 'x',
    result: correct ? 'correct' : 'incorrect',
    grader: 'local',
    hintUsed: false,
    durationMs: 3_000,
  };
}

describe('createPathRepository', () => {
  it('reports a notion never opened as absent', async () => {
    const { path } = await setup();
    expect(await path.progress(NOTION)).toEqual({ state: 'absent' });
    expect((await path.allProgress()).size).toBe(0);
  });

  it('starts a notion once, then moves to step 2 when the lesson is confirmed', async () => {
    const { path, clock } = await setup();
    expect((await path.start(NOTION)).transition?.event).toEqual({ type: 'started' });
    expect(await path.start(NOTION)).toEqual({ transition: null, progressUnreadable: false });
    clock.advance(1_000);
    await path.finishLesson(NOTION);
    expect(await path.progress(NOTION)).toMatchObject({
      state: 'valid',
      values: { status: 'in_progress', step: 2 },
    });
  });

  it('records each answer and passes the step after 8 good answers out of 10', async () => {
    const { path, clock } = await setup();
    await path.finishLesson(NOTION);
    let last = null;
    for (let number = 1; number <= 10; number += 1) {
      clock.advance(1_000);
      last = await path.recordAnswer(answer(2, number !== 3 && number !== 7, number));
    }
    expect(last?.transition?.event).toEqual({ type: 'step-passed', from: 2, to: 3 });
    expect(await path.progress(NOTION)).toMatchObject({ values: { step: 3 } });
    expect(await path.attempts(NOTION)).toHaveLength(10);
  });

  it('keeps the failures on exercises created by the model, but never counts them (D-089)', async () => {
    const { path, clock } = await setup();
    await path.finishLesson(NOTION);
    let last = null;
    for (let number = 1; number <= 6; number += 1) {
      clock.advance(1_000);
      last = await path.recordAnswer({ ...answer(2, false, number), source: 'generated' });
    }
    // Six failures: no lesson suggested, since none of them is verifiable.
    expect(last?.transition).toBeNull();
    expect(await path.attempts(NOTION)).toHaveLength(6);
    for (let number = 1; number <= 10; number += 1) {
      clock.advance(1_000);
      last = await path.recordAnswer({ ...answer(2, true, number), source: 'generated' });
    }
    // Its successes count: ten good answers pass the step.
    expect(last?.transition?.event).toEqual({ type: 'step-passed', from: 2, to: 3 });
  });

  it('starts a recall of the previous step after repeated failures', async () => {
    const { path, clock } = await setup();
    await path.finishLesson(NOTION);
    for (let number = 1; number <= 10; number += 1) {
      clock.advance(1_000);
      await path.recordAnswer(answer(2, true, number));
    }
    let last = null;
    for (let number = 1; number <= 6; number += 1) {
      clock.advance(1_000);
      last = await path.recordAnswer(answer(3, number > 4, number));
    }
    expect(last?.transition?.event).toEqual({ type: 'recall-started', step: 2 });
    expect(await path.progress(NOTION)).toMatchObject({
      values: { step: 3, recall: { step: 2 } },
    });
  });

  it('writes the answers, their activity and the progress to the synchronization outbox', async () => {
    const { db, path, clock } = await setup();
    await path.finishLesson(NOTION);
    clock.advance(1_000);
    await path.recordAnswer(answer(2, true, 1));
    const tables = ((await db.table('syncOutbox').toArray()) as { table: string }[]).map(
      (entry) => entry.table,
    );
    expect(tables.sort()).toEqual(['activity', 'exerciseAttempts', 'notionProgress']);
  });

  it('records an answer of an immediate practice without changing the step (D-075)', async () => {
    const { path, clock } = await setup();
    await path.finishLesson(NOTION);
    let last = null;
    for (let number = 1; number <= 10; number += 1) {
      clock.advance(1_000);
      last = await path.recordAnswer(answer(2, true, number), undefined, 'immediate-practice');
    }
    expect(last?.transition).toBeNull();
    expect(await path.progress(NOTION)).toMatchObject({ values: { step: 2 } });
    expect((await path.attempts(NOTION)).map((attempt) => attempt.context)).toEqual(
      Array.from({ length: 10 }, () => 'immediate-practice'),
    );
  });

  it('removes the draft of a typed answer with it, in one transaction (NO-06)', async () => {
    const { db, clock, path } = await setup();
    const drafts = createDraftRepository(db, clock);
    await path.finishLesson(NOTION);
    await drafts.save('path:typed', 'x');
    await drafts.save('path:other', 'still typing');
    await path.recordAnswer(answer(2, true, 1), 'path:typed');
    expect(await drafts.get('path:typed')).toEqual({ state: 'absent' });
    expect(await drafts.get('path:other')).toEqual({ state: 'present', text: 'still typing' });
    expect(await path.attempts(NOTION)).toHaveLength(1);

    // An answer that cannot be stored leaves its draft in place.
    await expect(
      path.recordAnswer({ ...answer(2, true, 2), durationMs: -1 }, 'path:other'),
    ).rejects.toThrow();
    expect(await drafts.get('path:other')).toEqual({ state: 'present', text: 'still typing' });
    expect(await path.attempts(NOTION)).toHaveLength(1);
  });

  it('never overwrites an unreadable progress, but still records the answer (NO-06)', async () => {
    const { db, path } = await setup();
    const unreadable = { notionId: NOTION, schemaVersion: 99, step: 'future format' };
    await db.table('notionProgress').put(unreadable);
    const outcome = await path.recordAnswer(answer(2, true, 1));
    expect(outcome).toEqual({ transition: null, progressUnreadable: true });
    expect(await db.table('notionProgress').get(NOTION)).toEqual(unreadable);
    expect(await path.attempts(NOTION)).toHaveLength(1);
    expect(await path.progress(NOTION)).toEqual({ state: 'unreadable' });
  });

  it('starts a notion passed at placement at step 4, to consolidate', async () => {
    const { path } = await setup();
    const passed = await path.recordPlacement(
      NOTION,
      [1, 2, 3, 4].map((number) => ({
        questionId: `${NOTION}/p/0${String(number)}`,
        answer: 'yet',
        correct: true,
      })),
    );
    expect(passed.passed).toBe(true);
    expect(await path.progress(NOTION)).toMatchObject({
      values: { status: 'to_consolidate', step: 4 },
    });
    const attempts = await path.attempts(NOTION);
    expect(attempts.map((attempt) => attempt.context)).toEqual([
      'placement',
      'placement',
      'placement',
      'placement',
    ]);
  });

  it('leaves a notion not started when its placement is failed', async () => {
    const { path } = await setup();
    const failed = await path.recordPlacement(NOTION, [
      { questionId: `${NOTION}/p/01`, answer: 'yet', correct: true },
      { questionId: `${NOTION}/p/02`, answer: 'still', correct: false },
      { questionId: `${NOTION}/p/03`, answer: 'just', correct: true },
    ]);
    expect(failed).toMatchObject({ passed: false, transition: null });
    expect(await path.progress(NOTION)).toEqual({ state: 'absent' });
  });

  it('only returns the answers of the notion asked for', async () => {
    const { path } = await setup();
    await path.recordAnswer(answer(2, true, 1));
    await path.recordAnswer({ ...answer(2, true, 1), notionId: 'tense-past-simple' });
    expect(await path.attempts(NOTION)).toHaveLength(1);
  });
});
