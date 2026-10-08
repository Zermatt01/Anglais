/**
 * The constructions of step 5 (D-088): every notion with content has some,
 * they are well formed, and they recognize the reviewed answers of its Thème,
 * while a reviewed answer of another tense is not taken for the notion.
 */
import { describe, expect, it } from 'vitest';
import type { NotionId } from '../domain/curriculum/notion-id.ts';
import { matchesPattern, parsePattern } from '../domain/production/notion-use.ts';
import { loadNotionContent, NOTIONS_WITH_CONTENT } from './index.ts';
import { NOTION_USES } from './notion-use.ts';

const contents = await Promise.all(
  NOTIONS_WITH_CONTENT.map(async (notionId) => {
    const content = await loadNotionContent(notionId);
    if (content === null) throw new Error(`No content for ${notionId}`);
    return [notionId, content] as const;
  }),
);

/**
 * Thème sentences of a notion that use another form on purpose: a state verb
 * takes the present perfect simple, never the continuous.
 */
const OTHER_FORM_ON_PURPOSE: ReadonlySet<string> = new Set([
  'tense-present-perfect-continuous/t/06',
]);

const recognizes = (notionId: NotionId, words: string): boolean =>
  (NOTION_USES[notionId]?.groups ?? []).some((patterns) =>
    patterns.some((pattern) => matchesPattern(words, pattern)),
  );

describe('constructions of step 5 (D-088)', () => {
  it('exist for every notion with content, well formed', () => {
    for (const notionId of NOTIONS_WITH_CONTENT) {
      const use = NOTION_USES[notionId];
      expect(use, notionId).toBeDefined();
      if (use === undefined) continue;
      expect(use.required).toBeGreaterThanOrEqual(1);
      expect(use.required).toBeLessThanOrEqual(use.groups.length);
      for (const pattern of use.groups.flat()) expect(() => parsePattern(pattern)).not.toThrow();
    }
  });

  it.each(contents.filter(([notionId]) => NOTION_USES[notionId]?.required === 1))(
    'recognize the canonical answers of the Thème of %s',
    (notionId, content) => {
      const missed = content.theme
        .filter((item) => !OTHER_FORM_ON_PURPOSE.has(item.id))
        .map((item) => item.accepted[0] ?? '')
        .filter((answer) => !recognizes(notionId, answer));
      expect(missed).toEqual([]);
    },
  );

  it.each(contents.filter(([notionId]) => (NOTION_USES[notionId]?.required ?? 0) > 1))(
    'recognize one of the tenses of %s in each canonical answer of its Thème',
    (notionId, content) => {
      const missed = content.theme
        .map((item) => item.accepted[0] ?? '')
        .filter((answer) => !recognizes(notionId, answer));
      expect(missed).toEqual([]);
    },
  );

  it.each([
    ['tense-present-perfect-continuous', 'I have worked here for two years.'],
    ['tense-present-perfect-continuous', 'I am working on a new project.'],
    ['tense-present-perfect', 'I have been working here since May.'],
    ['tense-present-perfect', 'I worked there in 2020.'],
    ['tense-past-simple', 'I have finished the report.'],
    ['tense-past-simple', 'I had finished the report before noon.'],
    ['tense-past-continuous', 'I am waiting for the bus.'],
    ['tense-present-continuous', 'I was waiting for the bus.'],
    ['tense-present-simple', 'I am working from home today.'],
    ['tense-present-simple', 'I will call you tomorrow.'],
    ['tense-past-perfect', 'I have left the office.'],
    ['tense-future', 'I am working from home today.'],
    ['tense-future', 'I would like to help.'],
    ['tense-for-since-ago', 'I work for a bank.'],
    ['tense-just-already-yet-still', 'I sent the report on Monday.'],
    // Second reviews of phase 4 (D-090): an imperative is not a present.
    ['tense-present-simple', 'Call me tomorrow.'],
    ['tense-present-simple', 'Don’t worry about the file.'],
    ['tense-present-simple', 'Please send me the report.'],
    ['tense-future', 'Call me tomorrow.'],
    // "For" without a duration: an employer, a purpose, an occasion.
    ['tense-for-since-ago', 'I worked for a bank.'],
    ['tense-for-since-ago', 'I have worked for a bank.'],
    ['tense-for-since-ago', 'I applied for the job.'],
    ['tense-for-since-ago', 'I visited Paris for the first time.'],
    // "Still" outside a verb group, and an adjective in -ing after "be".
    ['tense-just-already-yet-still', 'Still, I like the idea.'],
    ['tense-present-continuous', 'The file is missing.'],
    ['tense-present-continuous', 'The results are promising.'],
  ] as const)('never take for %s the reviewed sentence "%s"', (notionId, sentence) => {
    expect(recognizes(notionId, sentence)).toBe(false);
  });

  it.each([
    ['tense-present-simple', 'Do you work on Saturdays?'],
    ['tense-present-simple', 'They don’t work on Fridays.'],
    ['tense-for-since-ago', 'For three years, I worked in London.'],
    ['tense-for-since-ago', 'I have lived here for the last two years.'],
    ['tense-for-since-ago', 'We have been waiting for a long time.'],
    ['tense-for-since-ago', 'I worked in London for five years.'],
    ['tense-just-already-yet-still', 'I’m still waiting for an answer.'],
    ['tense-just-already-yet-still', 'He still hasn’t answered.'],
    ['tense-future', 'The train leaves at 7:15 tomorrow.'],
  ] as const)('take for %s the reviewed sentence "%s"', (notionId, sentence) => {
    expect(recognizes(notionId, sentence)).toBe(true);
  });
});
