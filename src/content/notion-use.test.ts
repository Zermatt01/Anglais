/**
 * The constructions of step 5 (D-088): every notion with content has some,
 * they are well formed, and they recognize the reviewed answers of its Thème,
 * while a reviewed answer of another tense is not taken for the notion.
 */
import { describe, expect, it } from 'vitest';
import type { NotionId } from '../domain/curriculum/notion-id.ts';
import {
  matchesPattern,
  parsePattern,
  showsNotionAsReference,
} from '../domain/production/notion-use.ts';
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

/**
 * Core translations whose canonical answer the closed lists cannot show yet
 * (D-094): a verb or a subject missing from them, a question with "still",
 * "yet" or "how long", a "to" just before the verb group in an earlier clause,
 * or a state verb that takes another form on purpose. An answer to them that
 * matches no expected answer is compared by the learner.
 */
const UNPROVEN_TRANSLATIONS: ReadonlySet<string> = new Set([
  'tense-present-continuous/s4/07',
  'tense-present-continuous/s4/09',
  'tense-present-simple/s4/07',
  'tense-present-simple/s4/08',
  'tense-just-already-yet-still/s4/03',
  'tense-just-already-yet-still/s4/11',
  'tense-for-since-ago/s4/11',
  'tense-present-perfect-continuous/s4/08',
]);

describe('local proof of the notion at step 4 (D-094)', () => {
  it.each(contents)('shows the notion in each canonical answer of %s', (notionId, content) => {
    const use = NOTION_USES[notionId];
    if (use === undefined) throw new Error(`No constructions for ${notionId}`);
    const missed = content.exercises.flatMap((exercise) =>
      exercise.kind === 'translate' &&
      !UNPROVEN_TRANSLATIONS.has(exercise.id) &&
      !showsNotionAsReference(exercise.accepted[0] ?? '', exercise.accepted, use)
        ? [exercise.id]
        : [],
    );
    expect(missed).toEqual([]);
  });

  it.each(contents)(
    'never proves the notion in an anticipated error on it, in %s',
    (notionId, content) => {
      const use = NOTION_USES[notionId];
      if (use === undefined) throw new Error(`No constructions for ${notionId}`);
      const proven = content.exercises.flatMap((exercise) =>
        exercise.kind === 'translate'
          ? exercise.knownErrors.flatMap((error) =>
              typeof error !== 'string' &&
              !error.offNotion &&
              showsNotionAsReference(error.text, exercise.accepted, use)
                ? [`${exercise.id}: ${error.text}`]
                : [],
            )
          : [],
      );
      expect(proven).toEqual([]);
    },
  );

  // Second reviews of the adjustments (D-096): a word the closed lists cannot read
  // (the number of a subject, a time) carries the error.
  it.each([
    ['tense-present-continuous', 13, 'My colleagues is talking on the phone.'],
    ['tense-for-since-ago', 2, 'She has been a teacher since three years.'],
    ['tense-for-since-ago', 2, 'She has been a teacher for 2019 years.'],
    ['tense-present-simple-vs-continuous', 2, 'She’s usually presenting the results right now.'],
  ] as const)('never proves %s in translation %i: "%s"', (notionId, number, text) => {
    const content = contents.find(([id]) => id === notionId)?.[1];
    const use = NOTION_USES[notionId];
    const exercise = content?.exercises.find(
      (candidate) => candidate.id === `${notionId}/s4/${String(number).padStart(2, '0')}`,
    );
    if (use === undefined || exercise?.kind !== 'translate') throw new Error('No translation');
    expect(showsNotionAsReference(text, exercise.accepted, use)).toBe(false);
  });

  it('lists only translations that exist and that the lists cannot show', () => {
    const translations = new Map(
      contents.flatMap(([notionId, content]) =>
        content.exercises.flatMap((exercise) =>
          exercise.kind === 'translate' ? [[exercise.id, { notionId, exercise }] as const] : [],
        ),
      ),
    );
    for (const id of UNPROVEN_TRANSLATIONS) {
      const found = translations.get(id);
      expect(found, id).toBeDefined();
      const use = found === undefined ? undefined : NOTION_USES[found.notionId];
      if (found === undefined || use === undefined) continue;
      const canonical = found.exercise.accepted[0] ?? '';
      expect(showsNotionAsReference(canonical, found.exercise.accepted, use), id).toBe(false);
    }
  });
});
