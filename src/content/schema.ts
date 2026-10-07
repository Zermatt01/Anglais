/**
 * Schemas of the curriculum content (CUR-01, docs/ARCHITECTURE.md §5): lessons,
 * timelines, placement questions, and the core exercises with their review
 * marks. The exercise itself is defined in the domain, shared with the
 * generated exercises (D-043).
 *
 * French text may mark English words with underscores ("le mot _yet_"): they
 * are shown in the English font, with `lang="en"`.
 */
import { z } from 'zod';
import {
  choiceWithReasonSchema,
  fillVerbSchema,
  placeWordSchema,
  transformSchema,
  translateSchema,
} from '../domain/curriculum/exercise.ts';
import { notionIdSchema } from '../domain/curriculum/notion-id.ts';
import { visibleTextSchema } from '../domain/primitives.ts';
import { learnerDomainSchema } from '../domain/settings.ts';
import { themeItemSchema } from '../domain/theme/item.ts';

const textSchema = visibleTextSchema.max(600);

/** Two readings, each a date: the author's, then the separate review (CUR-06, CUR-13). */
export const reviewSchema = z.strictObject({
  first: z.iso.date(),
  second: z.iso.date().nullable(),
});
export type ReviewMarks = z.infer<typeof reviewSchema>;

/**
 * `<notion-id>/s<step>/<nn>` for exercises, `<notion-id>/p/<nn>` for placement,
 * `<notion-id>/t/<nn>` for Thème sentences.
 */
const EXERCISE_ID = /^[a-z0-9-]+\/s[2-4]\/\d{2}$/;
const PLACEMENT_ID = /^[a-z0-9-]+\/p\/\d{2}$/;
const THEME_ID = /^[a-z0-9-]+\/t\/\d{2}$/;
const JOURNAL_ID = /^journal\/q\d{2}$/;

const coreFields = {
  id: z.string().regex(EXERCISE_ID),
  review: reviewSchema,
};

/** A core exercise: an exercise of the domain, with its identifier and review marks. */
export const coreExerciseSchema = z.discriminatedUnion('kind', [
  choiceWithReasonSchema.extend(coreFields),
  fillVerbSchema.extend(coreFields),
  transformSchema.extend(coreFields),
  placeWordSchema.extend(coreFields),
  translateSchema.extend(coreFields),
]);
export type CoreExercise = z.infer<typeof coreExerciseSchema>;

/**
 * Timeline of a tense (CUR-03), drawn as SVG. Positions go from -4 (past) to
 * 4 (future); 0 is now. Labels are short English phrases.
 */
const positionSchema = z.number().min(-4).max(4);
export const timelineMarkSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('point'), at: positionSchema, label: textSchema }),
  z.strictObject({
    type: z.literal('span'),
    from: positionSchema,
    to: positionSchema,
    label: textSchema,
  }),
  z.strictObject({
    type: z.literal('repeat'),
    from: positionSchema,
    to: positionSchema,
    label: textSchema,
  }),
]);
export const timelineSchema = z.strictObject({
  /** What the drawing shows, in French: read by screen readers. */
  descriptionFr: textSchema,
  marks: z.array(timelineMarkSchema).min(1).max(4),
});
export type Timeline = z.infer<typeof timelineSchema>;

/** Step 1, "Comprendre": a lesson readable in 2 to 3 minutes (CUR-03). */
export const lessonSchema = z.strictObject({
  intro: textSchema,
  /** When to use it. */
  usage: z.array(textSchema).min(1).max(6),
  /** Form, as a table. */
  form: z
    .strictObject({
      caption: textSchema,
      columns: z.array(textSchema).min(2).max(4),
      rows: z.array(z.array(textSchema)).min(1).max(8),
    })
    .refine((form) => form.rows.every((row) => row.length === form.columns.length), {
      message: 'every row must have one cell per column',
    }),
  timeline: timelineSchema.optional(),
  /** Contrast with the neighbouring notion. */
  contrast: z.strictObject({ title: textSchema, points: z.array(textSchema).min(1).max(5) }),
  /** Traps for French speakers. */
  pitfalls: z.array(textSchema).min(1).max(5),
  /** Four to six examples from the learner's domains (USR-05), read aloud on request. */
  examples: z
    .array(z.strictObject({ en: textSchema, fr: textSchema }))
    .min(4)
    .max(6),
});
export type Lesson = z.infer<typeof lessonSchema>;

/** Placement question (CUR-08): choose the right form, graded locally. */
export const placementQuestionSchema = z.strictObject({
  id: z.string().regex(PLACEMENT_ID),
  /** English sentence with one gap (`___`). */
  sentence: textSchema,
  contextFr: textSchema.optional(),
  options: z.array(textSchema).min(3).max(4),
  answer: textSchema,
  review: reviewSchema,
});
export type PlacementQuestion = z.infer<typeof placementQuestionSchema>;

/** A sentence of the Thème (MOD-05), with its identifier and review marks. */
export const coreThemeItemSchema = themeItemSchema.extend({
  id: z.string().regex(THEME_ID),
  review: reviewSchema,
});
export type CoreThemeItem = z.infer<typeof coreThemeItemSchema>;

/** A question of the journal (MOD-07): asked in English, with its French meaning on request. */
export const journalQuestionSchema = z.strictObject({
  id: z.string().regex(JOURNAL_ID),
  en: textSchema,
  fr: textSchema,
  domains: z.array(learnerDomainSchema).min(1).max(6),
  review: reviewSchema,
});
export type JournalQuestion = z.infer<typeof journalQuestionSchema>;

export const notionContentSchema = z.strictObject({
  notionId: notionIdSchema,
  lesson: lessonSchema,
  /** The core of steps 2 to 4 (at least ten per step, CUR-06). */
  exercises: z.array(coreExerciseSchema).min(1),
  /** Three to five questions (CUR-08). */
  placement: z.array(placementQuestionSchema).min(3).max(5),
  /** Step 5: prompts for two or three personal sentences, in French. */
  producePrompts: z.array(textSchema).min(2).max(5),
  /** Sentences of the Thème, at three tiers of instruction (MOD-05, PED-02). */
  theme: z.array(coreThemeItemSchema).min(6),
});
export type NotionContent = z.infer<typeof notionContentSchema>;
export type NotionContentInput = z.input<typeof notionContentSchema>;
