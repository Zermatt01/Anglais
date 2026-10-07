import { describe, expect, it } from 'vitest';
import { immediatePractice, pickSeveral } from '../curriculum/practice.ts';
import { pickJournalQuestion } from '../journal.ts';
import { markedPieces } from '../production/marks.ts';
import { dailySession, SESSION_TARGETS, type TodayActivity } from './daily-session.ts';

const NOTHING: TodayActivity = {
  dueCards: 0,
  cardsReviewed: 0,
  pathAnswers: 0,
  pathProductions: 0,
  themeSentences: 0,
  journalEntries: 0,
};
const ALL = { theme: true, journal: true };

describe('dailySession (MOD-02)', () => {
  it('goes through Reprises, the path, the Thème and the journal, in this order', () => {
    const start = dailySession({ ...NOTHING, dueCards: 12 }, ALL);
    expect(start.steps.map((step) => step.id)).toEqual(['review', 'path', 'theme', 'journal']);
    expect(start.next).toBe('review');
    expect(start.steps[0]).toMatchObject({ done: false, count: 0, target: 12 });

    const afterReview = dailySession({ ...NOTHING, cardsReviewed: 12, pathAnswers: 3 }, ALL);
    expect(afterReview.next).toBe('path');
    expect(afterReview.steps[1]).toMatchObject({ count: 3, target: SESSION_TARGETS.pathAnswers });
  });

  it('resumes where the learner stopped, whatever they did on their own', () => {
    const session = dailySession({ ...NOTHING, pathProductions: 1, themeSentences: 7 }, ALL);
    expect(session.next).toBe('journal');
    expect(session.steps[2]).toMatchObject({ done: true, count: 5 });
  });

  it('skips a module that cannot be done yet, and ends', () => {
    expect(dailySession({ ...NOTHING, pathAnswers: 8 }, { theme: false, journal: true }).next).toBe(
      'journal',
    );
    expect(
      dailySession(
        { ...NOTHING, pathAnswers: 8, journalEntries: 1 },
        { theme: false, journal: true },
      ).next,
    ).toBeNull();
  });
});

describe('pickJournalQuestion (MOD-07)', () => {
  const questions = [
    { id: 'q1', domains: ['daily-life'] as const },
    { id: 'q2', domains: ['finance'] as const },
    { id: 'q3', domains: ['finance', 'teaching'] as const },
  ];

  it('asks a question of the learner’s domains never asked, then the oldest one', () => {
    expect(pickJournalQuestion(questions, new Map(), ['finance'])).toBe('q2');
    expect(pickJournalQuestion(questions, new Map([['q2', 5]]), ['finance'])).toBe('q3');
    expect(
      pickJournalQuestion(
        questions,
        new Map([
          ['q2', 5],
          ['q3', 2],
        ]),
        ['finance'],
      ),
    ).toBe('q3');
  });

  it('falls back on every question, and leaves out the skipped ones', () => {
    expect(pickJournalQuestion(questions, new Map(), ['job-interviews'])).toBe('q1');
    expect(pickJournalQuestion(questions, new Map(), ['finance'], new Set(['q2', 'q3']))).toBe(
      'q1',
    );
    expect(pickJournalQuestion([], new Map(), ['finance'])).toBeNull();
  });
});

describe('immediate practice (PED-07)', () => {
  it('takes the exercises not seen recently first, without repeating one', () => {
    const seen = [
      { exerciseId: 'a', at: 10 },
      { exerciseId: 'b', at: 5 },
    ];
    expect(pickSeveral(['a', 'b', 'c', 'd'], seen, 3, 100)).toEqual(['c', 'd', 'b']);
    expect(pickSeveral(['a'], [], 3, 100)).toEqual(['a']);
  });

  it('chains three controlled exercises and one translation', () => {
    expect(immediatePractice(['s3/1', 's3/2', 's3/3', 's3/4'], ['s4/1', 's4/2'], [], 0)).toEqual([
      's3/1',
      's3/2',
      's3/3',
      's4/1',
    ]);
  });
});

describe('markedPieces (UI-02)', () => {
  it('cuts the text around the marks, and leaves out a mark that overlaps another', () => {
    const text = 'I have see him yesterday.';
    const pieces = markedPieces(text, [
      { range: { start: 7, end: 10 }, kind: 'major', key: 0 },
      { range: { start: 2, end: 10 }, kind: 'medium', key: 1 },
      { range: { start: 15, end: 24 }, kind: 'unnatural', key: 2 },
      { range: { start: 20, end: 99 }, kind: 'minor', key: 3 },
    ]);
    expect(pieces.map((piece) => [piece.text, piece.mark?.key ?? null])).toEqual([
      ['I ', null],
      ['have see', 1],
      [' him ', null],
      ['yesterday', 2],
      ['.', null],
    ]);
    expect(pieces.map((piece) => piece.text).join('')).toBe(text);
  });
});
