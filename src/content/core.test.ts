/**
 * Test of the core (CUR-06, CUR-11, D-057): every exercise of every notion is
 * well formed, gradable without marking a correct answer wrong, has at least
 * one expected answer and its review marks; each step has at least ten
 * exercises; lessons and placement questions are complete.
 */
import { describe, expect, it } from 'vitest';
import { countGaps } from '../domain/cards/content.ts';
import { areEquivalent } from '../domain/correction/forms.ts';
import { checkExercise, exerciseSchema, STEP_OF_KIND } from '../domain/curriculum/exercise.ts';
import { PHASE_3_NOTION_IDS, phaseOf, type NotionId } from '../domain/curriculum/notion-id.ts';
import { loadNotionContent, NOTIONS_WITH_CONTENT } from './index.ts';
import type { NotionContent } from './schema.ts';

const MIN_PER_STEP = 10;

const contents = await Promise.all(
  NOTIONS_WITH_CONTENT.map(async (notionId) => {
    const content = await loadNotionContent(notionId);
    if (content === null) throw new Error(`No content for ${notionId}`);
    return [notionId, content] as const;
  }),
);

/** Every French text of a lesson or an exercise, where English is marked with underscores. */
function markedTexts(content: NotionContent): string[] {
  const { lesson } = content;
  return [
    lesson.intro,
    ...lesson.usage,
    lesson.form.caption,
    ...lesson.form.columns,
    ...lesson.form.rows.flat(),
    lesson.contrast.title,
    ...lesson.contrast.points,
    ...lesson.pitfalls,
    ...content.producePrompts,
    ...content.placement.flatMap((question) => question.contextFr ?? []),
    ...content.exercises.flatMap((exercise) => {
      switch (exercise.kind) {
        case 'choice-with-reason':
          return [
            exercise.explanation,
            ...exercise.reasons,
            ...(exercise.contextFr === undefined ? [] : [exercise.contextFr]),
          ];
        case 'fill-verb':
        case 'place-word':
          return [exercise.explanation, exercise.meaningFr];
        case 'transform':
          return [exercise.explanation, exercise.instructionFr];
        case 'translate':
          return [exercise.explanation, exercise.hint, exercise.sentenceFr];
      }
    }),
  ];
}

it('has content for every notion of phase 3, and only for them (CUR-10)', () => {
  expect([...NOTIONS_WITH_CONTENT].sort()).toEqual([...PHASE_3_NOTION_IDS].sort());
});

describe.each(contents)('%s', (notionId: NotionId, content: NotionContent) => {
  it('is registered under its own identifier, and delivered in phase 3', () => {
    expect(content.notionId).toBe(notionId);
    expect(phaseOf(notionId)).toBe(3);
  });

  it('has at least ten exercises for each of steps 2, 3 and 4 (CUR-06)', () => {
    for (const step of [2, 3, 4]) {
      const count = content.exercises.filter((exercise) => STEP_OF_KIND[exercise.kind] === step);
      expect(count.length, `step ${String(step)}`).toBeGreaterThanOrEqual(MIN_PER_STEP);
    }
  });

  it('numbers its exercises by notion and step, without gaps or duplicates', () => {
    for (const step of [2, 3, 4]) {
      const ids = content.exercises
        .filter((exercise) => STEP_OF_KIND[exercise.kind] === step)
        .map((exercise) => exercise.id);
      const expected = ids.map(
        (_, index) => `${notionId}/s${String(step)}/${String(index + 1).padStart(2, '0')}`,
      );
      expect(ids).toEqual(expected);
    }
  });

  it('only has exercises fit for local grading (CUR-11, NO-05)', () => {
    for (const { id, review, ...exercise } of content.exercises) {
      const parsed = exerciseSchema.parse(exercise);
      expect({ id, issues: checkExercise(parsed) }).toEqual({ id, issues: [] });
      expect(review.first, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('never repeats a sentence', () => {
    const prompts = content.exercises.map((exercise) => {
      switch (exercise.kind) {
        case 'choice-with-reason':
        case 'fill-verb':
        case 'place-word':
          return exercise.sentence;
        case 'transform':
          return exercise.source;
        case 'translate':
          return exercise.sentenceFr;
      }
    });
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it('orders its translations by increasing difficulty (CUR-03)', () => {
    const difficulties = content.exercises.flatMap((exercise) =>
      exercise.kind === 'translate' ? [exercise.difficulty] : [],
    );
    expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
  });

  it('has three to five placement questions, each with one right option (CUR-08)', () => {
    content.placement.forEach((question, index) => {
      expect(question.id).toBe(`${notionId}/p/${String(index + 1).padStart(2, '0')}`);
      expect(countGaps(question.sentence), question.id).toBe(1);
      expect(question.options, question.id).toContain(question.answer);
      const others = question.options.filter((option) => option !== question.answer);
      expect(
        others.some((option) => areEquivalent(option, question.answer)),
        question.id,
      ).toBe(false);
      expect(question.review.first, question.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('has a timeline in its lesson, except for the review notion (CUR-03)', () => {
    expect(content.lesson.timeline !== undefined).toBe(notionId !== 'tense-review');
  });

  it('marks English words with balanced underscores, and never shows a gap in French text', () => {
    for (const text of markedTexts(content)) {
      expect(countGaps(text), text).toBe(0);
      expect((text.match(/_/g) ?? []).length % 2, text).toBe(0);
    }
  });
});
