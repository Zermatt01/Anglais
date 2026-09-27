/**
 * What a card shows and expects (CARD-02, CARD-03, docs/ARCHITECTURE.md §4.2).
 *
 * These schemas only check the *shape* of a card. Whether a card can be solved
 * by someone who has forgotten its context is a separate, pedagogical rule:
 * `isCardSolvable` (CARD-01). Keeping them apart lets an unsolvable card coming
 * from an import be stored as suspended instead of being lost (MOD-14).
 */
import { z } from 'zod';
import { notionIdSchema } from '../curriculum/notion-id.ts';
import { errorCategorySchema, soundCategorySchema } from '../taxonomy.ts';

/** Gap marker in a cloze sentence or a collocation context: three underscores or more. */
export const GAP_MARKER = '___';
const GAP_PATTERN = /_{3,}/g;

/** Number of gaps in a text. */
export function countGaps(text: string): number {
  return text.match(GAP_PATTERN)?.length ?? 0;
}

const MAX_SHORT_TEXT = 1_000;
const MAX_ATTEMPT_TEXT = 2_000;
const MAX_VARIANTS = 30;

const shortTextSchema = z.string().max(MAX_SHORT_TEXT);

/** Expected answer: the canonical form first, then the acceptable variants. */
export const cardAnswersSchema = z.strictObject({
  canonical: shortTextSchema,
  variants: z.array(shortTextSchema).max(MAX_VARIANTS),
});
export type CardAnswers = z.infer<typeof cardAnswersSchema>;

/** Highlighted part of the previous attempt, in UTF-16 code units. */
export const highlightSchema = z
  .strictObject({ start: z.int().nonnegative(), end: z.int().nonnegative() })
  .refine((range) => range.end > range.start, 'a highlight must not be empty');

/** Card created from an error in a production (CARD-02). */
export const errorCardContentSchema = z.strictObject({
  type: z.literal('error'),
  /** Meaning to express: the original French sentence, or the intention in French. */
  meaningFr: shortTextSchema,
  /** Targeted hint on the notion, which must not give the answer. */
  hint: shortTextSchema,
  /** The learner's previous attempt, hidden by default. */
  previousAttempt: z.string().max(MAX_ATTEMPT_TEXT),
  highlights: z.array(highlightSchema).max(20),
  category: errorCategorySchema,
  notionId: notionIdSchema.nullable(),
  answers: cardAnswersSchema,
});

/** Sentence with one gap (CARD-03). */
export const clozeCardContentSchema = z.strictObject({
  type: z.literal('cloze'),
  meaningFr: shortTextSchema,
  /** English sentence containing exactly one gap marker. */
  text: shortTextSchema,
  /** Base form of the verb to use, when the gap is a verb form. */
  infinitive: shortTextSchema.nullable(),
  hint: shortTextSchema.nullable(),
  notionId: notionIdSchema.nullable(),
  /** What fills the gap. */
  answers: cardAnswersSchema,
});

/** Collocation to produce from its meaning and a context (CARD-03). */
export const collocationCardContentSchema = z.strictObject({
  type: z.literal('collocation'),
  meaningFr: shortTextSchema,
  /** English sentence in which the collocation is replaced by one gap marker. */
  context: shortTextSchema,
  hint: shortTextSchema.nullable(),
  notionId: notionIdSchema.nullable(),
  answers: cardAnswersSchema,
});

/** Card of an acquired notion, reviewed in production (CUR-09). */
export const notionCardContentSchema = z.strictObject({
  type: z.literal('notion'),
  notionId: notionIdSchema,
  /** French sentence to express in English with the notion. */
  meaningFr: shortTextSchema,
  hint: shortTextSchema.nullable(),
  answers: cardAnswersSchema,
});

/** Text to say aloud, targeting one sound category (CARD-03, MOD-06). */
export const pronunciationCardContentSchema = z.strictObject({
  type: z.literal('pronunciation'),
  /** English text to pronounce; it is shown, since the task is to say it. */
  text: shortTextSchema,
  soundCategory: soundCategorySchema,
});

export const cardContentSchema = z.discriminatedUnion('type', [
  errorCardContentSchema,
  clozeCardContentSchema,
  collocationCardContentSchema,
  notionCardContentSchema,
  pronunciationCardContentSchema,
]);
export type CardContent = z.infer<typeof cardContentSchema>;
export type CardType = CardContent['type'];

/** Notion taught by the card's lesson, if any. */
export function notionOfCard(content: CardContent): string | null {
  return content.type === 'pronunciation' ? null : content.notionId;
}

/** Card statuses (CARD-06). */
export const cardStatusSchema = z.enum(['active', 'suspended', 'mastered']);
export type CardStatus = z.infer<typeof cardStatusSchema>;

/** Why a card is suspended (docs/PEDAGOGY.md §6.1, D-025). */
export const suspensionReasonSchema = z.enum(['reported', 'unstudied-notion', 'unsolvable']);
export type SuspensionReason = z.infer<typeof suspensionReasonSchema>;

/** Where a card comes from. */
export const cardOriginSchema = z.enum(['error', 'lexicon', 'notion', 'pronunciation', 'import']);
export type CardOrigin = z.infer<typeof cardOriginSchema>;
