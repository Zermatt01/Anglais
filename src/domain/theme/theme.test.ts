import { describe, expect, it } from 'vitest';
import { notStartedProgress } from '../curriculum/engine.ts';
import type { NotionId } from '../curriculum/notion-id.ts';
import type { NotionProgressValues } from '../curriculum/progress.ts';
import {
  checkThemeItem,
  evaluateThemeAnswer,
  themeInstruction,
  themeItemSchema,
  type ThemeItem,
} from './item.ts';
import { pickThemeSeries, type ThemeCandidate, type ThemeHistoryEntry } from './selection.ts';
import { baseTier, calibrationShift, recommendedTier } from './tier.ts';

const NOW = Date.UTC(2026, 9, 7, 9, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

describe('tiers of the Thème (PED-02, PEDAGOGY §9.1)', () => {
  it('starts from the written level, tier 1 without one', () => {
    expect([
      baseTier(null),
      baseTier(2.5),
      baseTier(3),
      baseTier(3.5),
      baseTier(4),
      baseTier(6),
    ]).toEqual([1, 1, 2, 2, 3, 3]);
  });

  const block = (successes: number) => Array.from({ length: 20 }, (_, index) => index < successes);

  it('moves by one tier per block of 20 answers, never more than one tier from the base', () => {
    expect(calibrationShift(block(18))).toBe(1);
    expect(calibrationShift(block(17))).toBe(0);
    expect(calibrationShift(block(15))).toBe(0);
    expect(calibrationShift(block(14))).toBe(-1);
    expect(calibrationShift([...block(18), ...block(18)])).toBe(1);
    expect(calibrationShift([...block(18), ...block(10)])).toBe(0);
    // An unfinished block changes nothing.
    expect(calibrationShift(block(18).slice(0, 19))).toBe(0);
  });

  it('proposes tier 2 at most until the level is known (D-084)', () => {
    expect(recommendedTier(null, [])).toBe(1);
    expect(recommendedTier(null, [...block(20), ...block(20)])).toBe(2);
    expect(recommendedTier(null, block(0))).toBe(1);
    expect(recommendedTier(4, block(20))).toBe(3);
  });
});

const ITEM: ThemeItem = themeItemSchema.parse({
  sentenceFr: 'Je n’ai pas encore reçu les résultats.',
  situationFr:
    'Tu attends toujours les résultats, qui devaient arriver hier. Dis-le en une phrase.',
  instructionEn: 'Tell your manager that the results you were expecting are still missing.',
  hint: 'Une action attendue, pas encore faite.',
  accepted: ["I haven't received the results yet.", "I still haven't received the results."],
  knownErrors: ["I haven't received yet the results."],
  knownErrorCategory: 'temps_verbaux',
  explanation: '_Yet_ en fin de phrase négative.',
});

describe('Thème sentences', () => {
  it('gives the instruction of each tier', () => {
    expect(themeInstruction(ITEM, 1)).toEqual({ text: ITEM.sentenceFr, language: 'fr' });
    expect(themeInstruction(ITEM, 2)).toEqual({ text: ITEM.situationFr, language: 'fr' });
    expect(themeInstruction(ITEM, 3)).toEqual({ text: ITEM.instructionEn, language: 'en' });
  });

  it('grades locally what it can, and never declares an unexpected answer wrong (NO-05)', () => {
    expect(evaluateThemeAnswer(ITEM, 'I have not received the results yet').verdict).toBe(
      'correct',
    );
    expect(evaluateThemeAnswer(ITEM, "I haven't received yet the results.").verdict).toBe(
      'incorrect',
    );
    expect(evaluateThemeAnswer(ITEM, "The results haven't arrived yet.").verdict).toBe('unknown');
    expect(evaluateThemeAnswer(ITEM, '  ').verdict).toBe('unknown');
  });

  it('is fit when nothing gives the answer away', () => {
    expect(checkThemeItem(ITEM)).toEqual([]);
  });

  it.each([
    [
      'an English instruction that contains an answer',
      { instructionEn: "Say: I haven't received the results yet." },
      'instruction-reveals-answer',
    ],
    [
      'a hint that contains an answer',
      { hint: "I still haven't received the results." },
      'hint-reveals-answer',
    ],
    [
      'an anticipated error that is accepted',
      { knownErrors: ['I have not received the results yet.'] },
      'known-error-accepted',
    ],
  ])('refuses %s', (_label, change, issue) => {
    expect(checkThemeItem({ ...ITEM, ...change })).toContain(issue);
  });
});

function progress(fields: Partial<NotionProgressValues>): NotionProgressValues {
  return { ...notStartedProgress(0), ...fields };
}

const candidates: ThemeCandidate[] = [
  ...['01', '02', '03'].map((n) => ({
    itemId: `tense-past-simple/t/${n}`,
    notionId: 'tense-past-simple' as const,
  })),
  ...['01', '02', '03'].map((n) => ({
    itemId: `tense-future/t/${n}`,
    notionId: 'tense-future' as const,
  })),
  ...['01', '02'].map((n) => ({
    itemId: `tense-past-perfect/t/${n}`,
    notionId: 'tense-past-perfect' as const,
  })),
];

const studiedProgress = new Map<NotionId, NotionProgressValues>([
  ['tense-past-simple', progress({ status: 'in_progress', step: 4 })],
  ['tense-future', progress({ status: 'acquired', step: 5 })],
  ['tense-past-perfect', progress({ status: 'in_progress', step: 2 })],
]);

describe('pickThemeSeries (MOD-05, D-023)', () => {
  it('opens only once a notion is studied', () => {
    expect(
      pickThemeSeries({
        candidates,
        progress: new Map([['tense-past-simple', progress({ status: 'in_progress', step: 3 })]]),
        history: [],
        recentErrors: new Map(),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('mixes the studied notions, the notion in progress first, and the unseen sentences first', () => {
    const series = pickThemeSeries({
      candidates,
      progress: studiedProgress,
      // The notion not studied yet appeared recently: none this time.
      history: [
        {
          itemId: 'tense-past-perfect/t/01',
          notionId: 'tense-past-perfect',
          at: NOW - DAY,
          unstudied: true,
        },
        {
          itemId: 'tense-past-simple/t/01',
          notionId: 'tense-past-simple',
          at: NOW - DAY,
          unstudied: false,
        },
      ],
      recentErrors: new Map(),
      now: NOW,
    });
    expect(series.map((pick) => pick.itemId)).toEqual([
      'tense-past-simple/t/02',
      'tense-future/t/01',
      'tense-past-simple/t/03',
      'tense-future/t/02',
      'tense-past-simple/t/01',
    ]);
    expect(series.every((pick) => !pick.unstudied)).toBe(true);
  });

  it('weights a notion by its recent errors', () => {
    const [first] = pickThemeSeries({
      candidates,
      progress: new Map([
        ...studiedProgress,
        ['tense-future', progress({ status: 'to_consolidate', step: 4 })],
      ]),
      history: [],
      recentErrors: new Map([['tense-future', 3]]),
      now: NOW,
    });
    expect(first?.notionId).toBe('tense-future');
  });

  it('adds one sentence of a notion not studied yet, at most once in ten, never first', () => {
    const series = pickThemeSeries({
      candidates,
      progress: studiedProgress,
      history: [],
      recentErrors: new Map(),
      now: NOW,
    });
    expect(series.map((pick) => pick.unstudied)).toEqual([false, false, true, false, false]);
    expect(series[2]?.notionId).toBe('tense-past-perfect');

    const history: ThemeHistoryEntry[] = series.map((pick, index) => ({
      ...pick,
      at: NOW + index,
    }));
    const next = pickThemeSeries({
      candidates,
      progress: studiedProgress,
      history,
      recentErrors: new Map(),
      now: NOW + DAY,
    });
    expect(next.some((pick) => pick.unstudied)).toBe(false);
  });
});
