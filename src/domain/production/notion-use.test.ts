import { describe, expect, it } from 'vitest';
import { reviewCorrection, type ModelCorrection, type ModelError } from './correction.ts';
import {
  matchesPattern,
  parsePattern,
  provenUses,
  stepFiveResult,
  type NotionUse,
} from './notion-use.ts';

const NOTION = 'tense-present-perfect-continuous';
const PPC: NotionUse = { groups: [['have|has been {ing}']], required: 1 };

function error(fields: Partial<ModelError> & Pick<ModelError, 'segment'>): ModelError {
  return {
    start: 0,
    category: 'temps_verbaux',
    notionId: NOTION,
    severity: 'medium',
    confidence: 'high',
    hintFr: 'Indice.',
    correction: 'have been working',
    ruleFr: 'Règle.',
    ...fields,
  };
}

function correction(text: string, fields: Partial<ModelCorrection> = {}) {
  return reviewCorrection(text, {
    intentFr: 'x',
    errors: [],
    unnatural: [],
    sentences: [],
    correctedText: text,
    naturalVersion: text,
    targetNotionUses: null,
    expressionOfTheDay: null,
    evaluation: { accuracy: 4, naturalness: 4, complexity: 3, level: 'B1', commentFr: 'x' },
    ...fields,
  });
}

describe('matchesPattern (D-088)', () => {
  it.each([
    ['have been working', 'have|has been {ing}'],
    ["I've been working", 'have|has been {ing}'],
    ["She hasn't been sleeping well", 'have|has been {ing}'],
    ['Have you been waiting', 'have|has been {ing}'],
    ['have just finished', 'have|has|had just|already {participle}'],
    ['moved here two years ago', '{past} … ago'],
    ["didn't go", 'did {base}'],
    ["I'm going to apply", 'am|is|are going to {base}'],
    ['I prepare the reports', '{base}'],
    ['She works in Geneva', '{third}'],
    ['I have been to London', 'have|has {participle}'],
    ["won't be working", 'will|shall be {ing}'],
    ['I still work here', 'still+{base}'],
    ['for the last three years', 'for * * * years'],
  ])('finds the construction in "%s"', (words, pattern) => {
    expect(matchesPattern(words, pattern)).toBe(true);
  });

  it.each([
    // A whole verb group only: a tense is never read inside another one.
    ['has worked', '{past}'],
    ['had finished', '{past}'],
    ['have just finished', '{past}'],
    ['I have been working', '{base}'],
    ['has been working', 'have|has {participle}'],
    ['will have finished', 'have|has {participle}'],
    ['to work', '{base}'],
    ['I can work', '{base}'],
    ['is being repaired', 'am|is|are {ing}'],
    ['will be working', 'will|shall {base}'],
    // Closed lists only: no ending is read by a rule.
    ['It is something new', 'am|is|are {ing}'],
    ['she has blorked', 'have|has {participle}'],
    ['He is a teacher', '{third}'],
    ['two years ago', '{past} … ago'],
    ['I just want a break', 'just|already {past}'],
    // "+": nothing between the two words.
    ['Still, I work here', 'still+{base}'],
    // "*": exactly one word.
    ['for years', 'for * years'],
  ])('does not find it in "%s"', (words, pattern) => {
    expect(matchesPattern(words, pattern)).toBe(false);
  });

  it('refuses a pattern with an unknown role', () => {
    expect(() => parsePattern('have {gerund}')).toThrow();
  });
});

describe('provenUses and stepFiveResult (PEDAGOGY §3.3, D-088)', () => {
  const text = 'I have been working on a new project since May. It is going well.';

  it('proves the use from words found in the text with the construction', () => {
    const reviewed = correction(text, { targetNotionUses: ['have been working'] });
    expect(provenUses(text, reviewed, PPC)).toEqual({
      proven: true,
      ranges: [{ start: 2, end: 19 }],
    });
    expect(stepFiveResult(text, reviewed, NOTION, PPC)).toBe('correct');
  });

  it('proves nothing from what the model says without the words', () => {
    for (const uses of [[], null, ['I like pizza'], ['have been workin'], ['is going well']]) {
      const reviewed = correction(text, { targetNotionUses: uses });
      expect(stepFiveResult(text, reviewed, NOTION, PPC)).toBeNull();
    }
    const reviewed = correction(text, { targetNotionUses: ['have been working'] });
    expect(stepFiveResult(text, reviewed, NOTION, null)).toBeNull();
  });

  it('never takes as a proof words inside a counted error', () => {
    const wrong = 'I have been work here since May.';
    const reviewed = correction(wrong, {
      targetNotionUses: ['have been work'],
      errors: [error({ segment: 'have been work', start: 2, notionId: 'tense-present-perfect' })],
    });
    expect(provenUses(wrong, reviewed, PPC).proven).toBe(false);
  });

  it('is incorrect with a counted error on the notion, whatever the uses', () => {
    const wrong = 'I am working here since May, and I have been running a lot.';
    const reviewed = correction(wrong, {
      targetNotionUses: ['have been running'],
      errors: [error({ segment: 'am working', start: 2 })],
    });
    expect(stepFiveResult(wrong, reviewed, NOTION, PPC)).toBe('incorrect');
    const unfound = correction(wrong, {
      targetNotionUses: ['have been running'],
      errors: [error({ segment: 'is working', start: 2 })],
    });
    // An error the app cannot find is a point to check: the proven use counts.
    expect(stepFiveResult(wrong, unfound, NOTION, PPC)).toBe('correct');
  });

  it('never lets the same words prove two tenses, even when they are given twice (D-090)', () => {
    const review: NotionUse = {
      groups: [['i|you|we|they {base}'], ['i|you|we|they {base} … tomorrow'], ['{past}']],
      required: 3,
    };
    const text = 'I work tomorrow. I worked yesterday.';
    for (const uses of [
      ['I work tomorrow', 'I work tomorrow', 'I worked yesterday'],
      ['I work tomorrow', 'work tomorrow', 'I worked yesterday'],
    ]) {
      const reviewed = correction(text, { targetNotionUses: uses });
      expect(provenUses(text, reviewed, review).proven).toBe(false);
    }
    const three = 'I work today. I work tomorrow. I worked yesterday.';
    expect(
      provenUses(
        three,
        correction(three, { targetNotionUses: ['I work today', 'I work tomorrow', 'I worked'] }),
        review,
      ),
    ).toEqual({
      proven: true,
      ranges: [
        { start: 0, end: 12 },
        { start: 14, end: 29 },
        { start: 31, end: 39 },
      ],
    });
  });

  it('asks a contrast for each tense shown by its own use', () => {
    const contrast: NotionUse = {
      groups: [['have|has {participle}'], ['{past}', 'did {base}']],
      required: 2,
    };
    const both = 'I have lived in Lyon. I moved there in 2020.';
    expect(
      provenUses(both, correction(both, { targetNotionUses: ['have lived', 'moved'] }), contrast)
        .proven,
    ).toBe(true);
    const onlyPerfect = 'I have lived in Lyon and I have worked there.';
    expect(
      provenUses(
        onlyPerfect,
        correction(onlyPerfect, { targetNotionUses: ['have lived', 'have worked'] }),
        contrast,
      ).proven,
    ).toBe(false);
    expect(
      provenUses(both, correction(both, { targetNotionUses: ['have lived'] }), contrast).proven,
    ).toBe(false);
  });
});
