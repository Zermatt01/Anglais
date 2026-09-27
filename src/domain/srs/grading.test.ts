import { describe, expect, it } from 'vitest';
import { isMastered, proposeGrade } from './grading.ts';
import type { SrsState } from './state.ts';

describe('proposeGrade (PEDAGOGY §6.1)', () => {
  it('maps results to grades', () => {
    expect(proposeGrade('incorrect', false)).toBe('again');
    expect(proposeGrade('acceptable', false)).toBe('hard');
    expect(proposeGrade('correct', false)).toBe('good');
  });

  it('lowers a correct answer given after a hint to hard', () => {
    expect(proposeGrade('correct', true)).toBe('hard');
    expect(proposeGrade('incorrect', true)).toBe('again');
  });

  it('never proposes easy: only the learner chooses it', () => {
    const grades = (['correct', 'acceptable', 'incorrect'] as const).flatMap((result) => [
      proposeGrade(result, false),
      proposeGrade(result, true),
    ]);
    expect(grades).not.toContain('easy');
  });
});

describe('isMastered (CARD-06)', () => {
  const state = (stability: number): SrsState => ({
    due: 0,
    stability,
    difficulty: 5,
    scheduledDays: 0,
    learningSteps: 0,
    reps: 10,
    lapses: 0,
    phase: 'review',
    lastReview: 0,
  });

  it('requires a stability above 120 days and three correct results in a row', () => {
    expect(isMastered(state(121), ['incorrect', 'correct', 'correct', 'correct'])).toBe(true);
  });

  it('is not reached at exactly 120 days', () => {
    expect(isMastered(state(120), ['correct', 'correct', 'correct'])).toBe(false);
  });

  it('is not reached when one of the last three results is not correct', () => {
    expect(isMastered(state(200), ['correct', 'acceptable', 'correct'])).toBe(false);
    expect(isMastered(state(200), ['correct', 'correct'])).toBe(false);
  });
});
