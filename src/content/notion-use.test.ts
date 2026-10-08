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
  ] as const)('never take for %s the reviewed sentence "%s"', (notionId, sentence) => {
    expect(recognizes(notionId, sentence)).toBe(false);
  });
});
