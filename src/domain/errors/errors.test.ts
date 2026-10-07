import { describe, expect, it } from 'vitest';
import { isNotionStudied, notStartedProgress, regressAfterLacuna } from '../curriculum/engine.ts';
import type { NotionProgressValues } from '../curriculum/progress.ts';
import { diagnoseNotion, LACUNA_RULE } from './diagnosis.ts';
import {
  DAY_MS,
  notionsToPrioritize,
  ruleBook,
  weakSpots,
  type ErrorRecord,
} from './statistics.ts';

const NOW = Date.UTC(2026, 9, 7, 9, 0, 0);

function progress(fields: Partial<NotionProgressValues>): NotionProgressValues {
  return { ...notStartedProgress(0), ...fields };
}

describe('isNotionStudied (PEDAGOGY §4.1)', () => {
  it.each([
    ['absent', null, false],
    ['not started', progress({}), false],
    ['in progress at step 3', progress({ status: 'in_progress', step: 3 }), false],
    ['in progress at step 4', progress({ status: 'in_progress', step: 4 }), true],
    ['to consolidate', progress({ status: 'to_consolidate', step: 4 }), true],
    ['acquired', progress({ status: 'acquired', step: 5 }), true],
  ])('%s: %s', (_label, values, studied) => {
    expect(isNotionStudied(values)).toBe(studied);
  });
});

describe('diagnoseNotion (PED-03)', () => {
  const base = { productionId: 'p3', qualifiesNow: true, past: [], now: NOW };

  it('treats an error on a notion not studied yet apart', () => {
    expect(diagnoseNotion({ ...base, studied: false })).toBe('unstudied');
  });

  it('is a slip the first time in seven days, a gap the second time', () => {
    expect(diagnoseNotion({ ...base, studied: true })).toBe('lapsus');
    expect(
      diagnoseNotion({ ...base, studied: true, past: [{ productionId: 'p1', at: NOW - DAY_MS }] }),
    ).toBe('lacune');
  });

  it('counts the errors of one production once, and only within seven days', () => {
    expect(
      diagnoseNotion({
        ...base,
        studied: true,
        past: [
          { productionId: 'p3', at: NOW },
          { productionId: 'p3', at: NOW },
        ],
      }),
    ).toBe('lapsus');
    expect(
      diagnoseNotion({
        ...base,
        studied: true,
        past: [{ productionId: 'p1', at: NOW - LACUNA_RULE.windowMs }],
      }),
    ).toBe('lapsus');
  });

  it('never reveals a gap from a production without a qualifying error (D-024)', () => {
    expect(
      diagnoseNotion({
        ...base,
        studied: true,
        qualifiesNow: false,
        past: [{ productionId: 'p1', at: NOW - DAY_MS }],
      }),
    ).toBe('lapsus');
  });
});

describe('regressAfterLacuna (PEDAGOGY §4.2)', () => {
  it('sends a notion to consolidate or acquired back to step 3', () => {
    for (const status of ['to_consolidate', 'acquired'] as const) {
      const transition = regressAfterLacuna(progress({ status, step: 5, acquiredAt: 1 }), NOW);
      expect(transition?.progress).toMatchObject({
        status: 'in_progress',
        step: 3,
        recall: null,
        stepEnteredAt: NOW,
        lastRegressionAt: NOW,
      });
      expect(transition?.event).toEqual({ type: 'regressed' });
    }
  });

  it('leaves a notion in progress at its step', () => {
    expect(regressAfterLacuna(progress({ status: 'in_progress', step: 4 }), NOW)).toBeNull();
    expect(regressAfterLacuna(null, NOW)).toBeNull();
  });
});

function record(fields: Partial<ErrorRecord>): ErrorRecord {
  return {
    productionId: 'p1',
    at: NOW - DAY_MS,
    category: 'temps_verbaux',
    notionId: 'tense-for-since-ago',
    segment: 'I work',
    correction: 'I have worked',
    rule: 'Present perfect avec _since_.',
    severity: 'medium',
    confidence: 'high',
    diagnosis: 'lapsus',
    reported: false,
    ...fields,
  };
}

describe('ruleBook (MOD-10)', () => {
  it('makes one sheet per category, the most recent trouble first, with the newest examples', () => {
    const sheets = ruleBook(
      [
        record({ at: NOW - 40 * DAY_MS }),
        record({ category: 'articles', notionId: 'nouns-articles', at: NOW - 2 * DAY_MS }),
        record({ category: 'articles', notionId: 'nouns-articles', at: NOW - 3 * DAY_MS }),
        record({ at: NOW - 50 * DAY_MS }),
        record({ at: NOW - 60 * DAY_MS }),
      ],
      NOW,
    );
    expect(sheets.map((sheet) => [sheet.category, sheet.recent, sheet.total])).toEqual([
      ['articles', 2, 2],
      ['temps_verbaux', 0, 3],
    ]);
    expect(sheets[0]?.examples.map((example) => example.at)).toEqual([
      NOW - 2 * DAY_MS,
      NOW - 3 * DAY_MS,
    ]);
    expect(sheets[0]?.notions).toEqual(['nouns-articles']);
  });

  it('leaves out minor, doubtful and reported errors', () => {
    expect(
      ruleBook(
        [record({ severity: 'minor' }), record({ confidence: 'low' }), record({ reported: true })],
        NOW,
      ),
    ).toEqual([]);
  });
});

describe('weakSpots (AI-02)', () => {
  it('lists recent categories and notions, each production counted once', () => {
    const spots = weakSpots(
      [
        record({ productionId: 'p1' }),
        record({ productionId: 'p1' }),
        record({ productionId: 'p2', category: 'articles', notionId: 'nouns-articles' }),
        record({ productionId: 'p3', category: 'articles', notionId: 'nouns-articles' }),
        record({
          productionId: 'p4',
          at: NOW - 40 * DAY_MS,
          category: 'prepositions',
          notionId: null,
        }),
      ],
      NOW,
      5,
    );
    expect(spots).toEqual({
      categories: ['articles', 'temps_verbaux'],
      notions: ['nouns-articles', 'tense-for-since-ago'],
    });
  });
});

describe('notionsToPrioritize (PEDAGOGY §4.2)', () => {
  it('puts first the notions of recent gaps and of errors made before studying them', () => {
    expect(
      notionsToPrioritize(
        [
          record({ diagnosis: 'lacune' }),
          record({ diagnosis: 'unstudied', notionId: 'tense-future' }),
          record({ diagnosis: 'lapsus', notionId: 'tense-past-simple' }),
          record({ diagnosis: 'lacune', notionId: 'tense-past-perfect', at: NOW - 40 * DAY_MS }),
        ],
        NOW,
      ),
    ).toEqual(new Set(['tense-for-since-ago', 'tense-future']));
  });
});
