import { describe, expect, it } from 'vitest';
import {
  activeStep,
  afterPathAnswer,
  afterProduction,
  answerScore,
  applyPlacement,
  finishLesson,
  isPlacementPassed,
  isVerifiableAnswer,
  isPoolExhausted,
  isStep5Complete,
  notStartedProgress,
  pickNextExercise,
  startNotion,
  stepStanding,
  type PathAnswer,
} from './engine.ts';
import type { NotionProgressValues, Step } from './progress.ts';

const T0 = 1_000_000;

function progressAt(
  step: Step,
  overrides: Partial<NotionProgressValues> = {},
): NotionProgressValues {
  return { ...notStartedProgress(T0), status: 'in_progress', step, ...overrides };
}

/**
 * Answers of `step`, one per second after `start`: `1` right, `0` wrong, `h`
 * right with a hint; `G` right and `X` wrong on an exercise created by the model.
 */
function answers(step: Step, pattern: string, start = T0 + 1_000): PathAnswer[] {
  return Array.from(pattern, (mark, index) => ({
    at: start + index * 1_000,
    step,
    result: mark === '0' || mark === 'X' ? 'incorrect' : 'correct',
    hintUsed: mark === 'h',
    source: mark === 'G' || mark === 'X' ? 'generated' : 'core',
  }));
}

const NOW = T0 + 1_000_000;

describe('starting a notion and reading its lesson', () => {
  it('opens a notion not started at step 1, once', () => {
    const started = startNotion(null, T0);
    expect(started?.progress).toMatchObject({ status: 'in_progress', step: 1, stepEnteredAt: T0 });
    expect(startNotion(started?.progress ?? null, T0 + 1)).toBeNull();
    expect(startNotion(progressAt(3), T0)).toBeNull();
  });

  it('goes from step 1 to step 2 when the lesson is confirmed, without a test', () => {
    expect(finishLesson(progressAt(1), NOW)).toMatchObject({
      progress: { step: 2, stepEnteredAt: NOW },
      event: { type: 'step-passed', from: 1, to: 2 },
    });
    // Directly from the lesson of a notion not started yet.
    expect(finishLesson(null, NOW)?.progress.step).toBe(2);
  });

  it('never moves a notion back when its lesson is read again', () => {
    expect(finishLesson(progressAt(3), NOW)).toBeNull();
    expect(finishLesson(progressAt(4, { status: 'to_consolidate' }), NOW)).toBeNull();
    expect(finishLesson(progressAt(5, { status: 'acquired' }), NOW)).toBeNull();
  });
});

describe('answerScore', () => {
  it('counts a hinted answer as half a good answer (PEDAGOGY §3.3)', () => {
    const base = { at: 0, step: 4, source: 'core' } as const;
    expect(answerScore({ ...base, result: 'correct', hintUsed: false })).toBe(1);
    expect(answerScore({ ...base, result: 'acceptable', hintUsed: false })).toBe(1);
    expect(answerScore({ ...base, result: 'correct', hintUsed: true })).toBe(0.5);
    expect(answerScore({ ...base, result: 'incorrect', hintUsed: true })).toBe(0);
  });
});

describe('asymmetric trust in the exercises created by the model (D-089)', () => {
  it('counts a success on a created exercise, never a failure', () => {
    expect(isVerifiableAnswer({ source: 'generated', result: 'correct' })).toBe(true);
    expect(isVerifiableAnswer({ source: 'generated', result: 'acceptable' })).toBe(true);
    expect(isVerifiableAnswer({ source: 'generated', result: 'incorrect' })).toBe(false);
    expect(isVerifiableAnswer({ source: 'core', result: 'incorrect' })).toBe(true);
  });

  it('passes a step with successes on created exercises, whatever their failures', () => {
    // Eight core successes and two created ones, among four failures on created exercises.
    const result = afterPathAnswer(progressAt(3), answers(3, '1111XX1111XXGG'), NOW);
    expect(result?.event).toEqual({ type: 'step-passed', from: 3, to: 4 });
  });

  it('never counts the failures on created exercises in the window of the pass', () => {
    // Core: 7 good out of the last 10 verifiable answers; the created failures change nothing.
    expect(afterPathAnswer(progressAt(3), answers(3, '1110111X0X1X0'), NOW)).toBeNull();
    expect(stepStanding(progressAt(3), answers(3, '11XX0'))).toEqual({
      counted: 3,
      window: 10,
      score: 2,
      needed: 8,
    });
  });

  it('never starts a recall, nor suggests the lesson, from failures on created exercises', () => {
    expect(afterPathAnswer(progressAt(3), answers(3, 'XXXXXX'), NOW)).toBeNull();
    expect(afterPathAnswer(progressAt(2), answers(2, 'XXXX11'), NOW)).toBeNull();
    // Core failures still count: four among the last six verifiable answers.
    expect(afterPathAnswer(progressAt(3), answers(3, '1X00X001'), NOW)?.event).toEqual({
      type: 'recall-started',
      step: 2,
    });
  });

  it('leaves the failures on created exercises out of a recall series', () => {
    const recallStart = T0 + 50_000;
    const inRecall = progressAt(4, { recall: { step: 3, startedAt: recallStart } });
    expect(afterPathAnswer(inRecall, answers(3, '11X1X', recallStart + 1), NOW)).toBeNull();
    expect(afterPathAnswer(inRecall, answers(3, '11X1XG1', recallStart + 1), NOW)?.event).toEqual({
      type: 'recall-passed',
      step: 4,
    });
  });
});

describe('afterPathAnswer: passing a step', () => {
  it('needs at least 10 answers', () => {
    expect(afterPathAnswer(progressAt(2), answers(2, '111111111'), NOW)).toBeNull();
  });

  it('passes with 8 good answers among the last 10', () => {
    const result = afterPathAnswer(progressAt(2), answers(2, '0000111101111111'), NOW);
    expect(result).toMatchObject({
      progress: { step: 3, stepEnteredAt: NOW, recall: null },
      event: { type: 'step-passed', from: 2, to: 3 },
      changed: true,
    });
  });

  it('does not pass with 7.5 because of hints', () => {
    expect(afterPathAnswer(progressAt(4), answers(4, '111111hhh0'), NOW)?.event.type).not.toBe(
      'step-passed',
    );
    expect(afterPathAnswer(progressAt(4), answers(4, '11111111hh'), NOW)?.event).toEqual({
      type: 'step-passed',
      from: 4,
      to: 5,
    });
  });

  it('only counts the answers of the current step given since it was entered', () => {
    const entered = T0 + 20_000;
    const progress = progressAt(3, { stepEnteredAt: entered });
    const older = answers(3, '1111111111');
    const otherStep = answers(2, '1111111111', entered + 1_000);
    expect(afterPathAnswer(progress, [...older, ...otherStep], NOW)).toBeNull();
    const recent = answers(3, '1111111111', entered);
    expect(afterPathAnswer(progress, [...older, ...recent], NOW)?.event.type).toBe('step-passed');
  });

  it('keeps a notion to consolidate in that status when it passes step 4', () => {
    const progress = progressAt(4, { status: 'to_consolidate' });
    expect(afterPathAnswer(progress, answers(4, '1111111111'), NOW)?.progress).toMatchObject({
      status: 'to_consolidate',
      step: 5,
    });
  });

  it('does nothing for a notion not in progress, or at steps 1 and 5', () => {
    expect(afterPathAnswer(progressAt(1), answers(1, '1111111111'), NOW)).toBeNull();
    expect(afterPathAnswer(progressAt(5), answers(5, '1111111111'), NOW)).toBeNull();
    const acquired = progressAt(4, { status: 'acquired' });
    expect(afterPathAnswer(acquired, answers(4, '1111111111'), NOW)).toBeNull();
  });
});

describe('afterPathAnswer: repeated failures', () => {
  it('needs at least 6 answers of the step', () => {
    expect(afterPathAnswer(progressAt(3), answers(3, '00000'), NOW)).toBeNull();
  });

  it('starts a recall of the previous step after 4 failures among the last 6', () => {
    const result = afterPathAnswer(progressAt(3), answers(3, '1111010100'), NOW);
    expect(result).toMatchObject({
      progress: { step: 3, recall: { step: 2, startedAt: NOW } },
      event: { type: 'recall-started', step: 2 },
      changed: true,
    });
    expect(activeStep(result?.progress ?? null)).toBe(2);
  });

  it('counts a hinted answer as a success, not a failure', () => {
    expect(afterPathAnswer(progressAt(4), answers(4, 'hhh000'), NOW)).toBeNull();
  });

  it('never recalls below step 2: the lesson is suggested instead', () => {
    expect(afterPathAnswer(progressAt(2), answers(2, '000000'), NOW)).toEqual({
      progress: progressAt(2),
      event: { type: 'lesson-suggested' },
      changed: false,
    });
  });
});

describe('afterPathAnswer: recall', () => {
  const recallStart = T0 + 50_000;
  const inRecall = progressAt(4, { recall: { step: 3, startedAt: recallStart } });

  it('waits for a series of 5 answers of the recalled step', () => {
    expect(afterPathAnswer(inRecall, answers(3, '1111', recallStart + 1), NOW)).toBeNull();
  });

  it('goes back to the original step, counter reset, after 4 successes out of 5', () => {
    const result = afterPathAnswer(inRecall, answers(3, '11011', recallStart + 1), NOW);
    expect(result).toMatchObject({
      progress: { step: 4, recall: null, stepEnteredAt: NOW },
      event: { type: 'recall-passed', step: 4 },
    });
  });

  it('starts a new series after a missed one', () => {
    const result = afterPathAnswer(inRecall, answers(3, '10101', recallStart + 1), NOW);
    expect(result).toMatchObject({
      progress: { step: 4, recall: { step: 3, startedAt: NOW } },
      event: { type: 'recall-continued', step: 3 },
    });
    // The answers of the missed series do not count in the new one.
    const next = result?.progress ?? inRecall;
    expect(afterPathAnswer(next, answers(3, '10101', recallStart + 1), NOW + 1)).toBeNull();
  });

  it('ignores answers of the recalled step given before the recall', () => {
    const before = answers(3, '11111', T0);
    expect(afterPathAnswer(inRecall, before, NOW)).toBeNull();
  });
});

describe('step 5', () => {
  const good = { usesNotion: true, hasNotionError: false };

  it('needs two consecutive productions using the notion without error', () => {
    expect(isStep5Complete([good])).toBe(false);
    expect(isStep5Complete([good, good])).toBe(true);
    expect(isStep5Complete([good, { usesNotion: true, hasNotionError: true }, good])).toBe(false);
    expect(isStep5Complete([good, { usesNotion: false, hasNotionError: false }])).toBe(false);
  });

  it('makes the notion acquired', () => {
    expect(afterProduction(progressAt(5), [good, good], NOW)?.progress).toMatchObject({
      status: 'acquired',
      acquiredAt: NOW,
    });
    expect(afterProduction(progressAt(4), [good, good], NOW)).toBeNull();
  });
});

describe('placement', () => {
  it('passes only when every question is right, with at least 3 questions', () => {
    expect(isPlacementPassed([true, true, true, true])).toBe(true);
    expect(isPlacementPassed([true, true, true, false])).toBe(false);
    expect(isPlacementPassed([true, true])).toBe(false);
  });

  it('starts a passed notion at step 4, to consolidate (D-022)', () => {
    expect(applyPlacement(null, true, NOW)?.progress).toMatchObject({
      status: 'to_consolidate',
      step: 4,
      stepEnteredAt: NOW,
    });
    expect(applyPlacement(null, false, NOW)).toBeNull();
  });

  it('never changes a notion already started', () => {
    expect(applyPlacement(progressAt(2), true, NOW)).toBeNull();
  });
});

describe('pickNextExercise', () => {
  const pool = ['a', 'b', 'c'];

  it('takes the first exercise never seen, in pool order', () => {
    expect(pickNextExercise(pool, [])).toBe('a');
    expect(pickNextExercise(pool, [{ exerciseId: 'a', at: 1 }])).toBe('b');
  });

  it('then the one seen longest ago, avoiding the one just done', () => {
    const seen = [
      { exerciseId: 'a', at: 1 },
      { exerciseId: 'b', at: 2 },
      { exerciseId: 'c', at: 3 },
      { exerciseId: 'a', at: 4 },
    ];
    expect(pickNextExercise(pool, seen)).toBe('b');
    expect(pickNextExercise(pool, seen, 'b')).toBe('c');
  });

  it('repeats the only exercise of a pool, and returns null for an empty pool', () => {
    expect(pickNextExercise(['a'], [{ exerciseId: 'a', at: 1 }], 'a')).toBe('a');
    expect(pickNextExercise([], [])).toBeNull();
  });

  it('knows when every exercise has been done (COST-09)', () => {
    expect(isPoolExhausted(pool, [{ exerciseId: 'a', at: 1 }])).toBe(false);
    expect(
      isPoolExhausted(
        pool,
        pool.map((exerciseId, at) => ({ exerciseId, at })),
      ),
    ).toBe(true);
  });
});

describe('stepStanding', () => {
  it('shows the score over the last 10 answers of the step', () => {
    expect(stepStanding(progressAt(3), answers(3, '1101'))).toEqual({
      counted: 4,
      window: 10,
      score: 3,
      needed: 8,
    });
  });

  it('shows the recall series during a recall', () => {
    const progress = progressAt(4, { recall: { step: 3, startedAt: T0 } });
    expect(stepStanding(progress, answers(3, '110'))).toEqual({
      counted: 3,
      window: 5,
      score: 2,
      needed: 4,
    });
  });
});
