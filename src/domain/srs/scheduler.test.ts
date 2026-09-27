import { describe, expect, it } from 'vitest';
import { createFsrsScheduler, SRS_PARAMETERS } from './scheduler.ts';
import { srsReviewLogSchema, srsStateSchema, type SrsState } from './state.ts';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const NOW = Date.UTC(2026, 8, 27, 8, 0, 0);

const scheduler = createFsrsScheduler();
const noFuzz = createFsrsScheduler({ ...SRS_PARAMETERS, enableFuzz: false });

/** Reviews a card several times, each review happening when the card is due. */
function reviewWhenDue(
  initial: SrsState,
  grades: readonly ('again' | 'hard' | 'good' | 'easy')[],
): SrsState {
  let state = initial;
  for (const grade of grades) {
    state = noFuzz.review(state, grade, state.due).state;
  }
  return state;
}

describe('createFsrsScheduler', () => {
  it('creates a new card that is due immediately', () => {
    const state = scheduler.initialState(NOW);
    expect(srsStateSchema.parse(state)).toEqual(state);
    expect(state).toMatchObject({ due: NOW, phase: 'new', reps: 0, lapses: 0, lastReview: null });
  });

  it('follows the learning steps of the parameters (1 min, then 10 min)', () => {
    const first = noFuzz.review(noFuzz.initialState(NOW), 'again', NOW);
    expect(first.state.phase).toBe('learning');
    expect(first.state.due).toBe(NOW + MINUTE);

    const second = noFuzz.review(noFuzz.initialState(NOW), 'good', NOW);
    expect(second.state.due).toBe(NOW + 10 * MINUTE);
  });

  it('graduates a card to review after the learning steps', () => {
    const state = reviewWhenDue(noFuzz.initialState(NOW), ['good', 'good']);
    expect(state.phase).toBe('review');
    expect(state.due - (state.lastReview ?? 0)).toBeGreaterThanOrEqual(DAY);
  });

  it('spaces successful reviews further and further apart', () => {
    const graduated = reviewWhenDue(noFuzz.initialState(NOW), ['good', 'good']);
    const next = noFuzz.review(graduated, 'good', graduated.due).state;
    const after = noFuzz.review(next, 'good', next.due).state;
    expect(next.scheduledDays).toBeGreaterThan(graduated.scheduledDays);
    expect(after.scheduledDays).toBeGreaterThan(next.scheduledDays);
  });

  it('counts a lapse and relearns a forgotten card', () => {
    const graduated = reviewWhenDue(noFuzz.initialState(NOW), ['good', 'good']);
    const { state } = noFuzz.review(graduated, 'again', graduated.due);
    expect(state.phase).toBe('relearning');
    expect(state.lapses).toBe(graduated.lapses + 1);
    expect(state.due).toBe(graduated.due + 10 * MINUTE);
  });

  it('schedules hard sooner than good, and good sooner than easy', () => {
    const graduated = reviewWhenDue(noFuzz.initialState(NOW), ['good', 'good']);
    const dueAfter = (grade: 'hard' | 'good' | 'easy') =>
      noFuzz.review(graduated, grade, graduated.due).state.due;
    expect(dueAfter('hard')).toBeLessThan(dueAfter('good'));
    expect(dueAfter('good')).toBeLessThan(dueAfter('easy'));
  });

  it('returns a serializable log describing the review', () => {
    const initial = scheduler.initialState(NOW);
    const { log } = scheduler.review(initial, 'good', NOW + 5 * MINUTE);
    expect(srsReviewLogSchema.parse(log)).toEqual(log);
    expect(log).toMatchObject({ grade: 'good', phase: 'new', reviewedAt: NOW + 5 * MINUTE });
  });

  it('is deterministic for the same inputs, fuzz included', () => {
    const graduated = reviewWhenDue(scheduler.initialState(NOW), ['good', 'good']);
    const later = graduated.due + 3 * DAY;
    expect(scheduler.review(graduated, 'good', later)).toEqual(
      scheduler.review(graduated, 'good', later),
    );
  });

  it('keeps states round-trippable through JSON', () => {
    const graduated = reviewWhenDue(noFuzz.initialState(NOW), ['good', 'good', 'hard']);
    const restored = srsStateSchema.parse(JSON.parse(JSON.stringify(graduated)));
    expect(noFuzz.review(restored, 'good', restored.due)).toEqual(
      noFuzz.review(graduated, 'good', graduated.due),
    );
  });
});
