/**
 * Catalog of the curriculum: the nine tracks and the closed list of the 50
 * notion identifiers, in the order of docs/PEDAGOGY.md §11, the single source
 * of truth (CUR-02). `src/content/pedagogy.test.ts` checks that this list is
 * identical to PEDAGOGY §11, identifiers, order, tracks and phases.
 *
 * Identifiers are stable once delivered: never rename or remove one. Titles,
 * lessons and references are content (`src/content`).
 */
import { z } from 'zod';

/** Tracks, in order (PEDAGOGY §11.1). */
export const TRACK_IDS = [
  'tenses',
  'verbs',
  'questions',
  'patterns',
  'nouns',
  'adjectives',
  'prepositions',
  'clauses',
  'vocabulary',
] as const;
export const trackIdSchema = z.enum(TRACK_IDS);
export type TrackId = z.infer<typeof trackIdSchema>;

/** Prefix of the notion identifiers of each track (PEDAGOGY §11.1). */
export const TRACK_NOTION_PREFIXES: Readonly<Record<TrackId, string>> = {
  tenses: 'tense',
  verbs: 'verbs',
  questions: 'questions',
  patterns: 'patterns',
  nouns: 'nouns',
  adjectives: 'adj',
  prepositions: 'prep',
  clauses: 'clauses',
  vocabulary: 'vocab',
};

/** Every notion, in the order of PEDAGOGY §11.2 (track by track). */
export const NOTION_IDS = [
  // 1. Tenses
  'tense-present-continuous',
  'tense-present-simple',
  'tense-present-simple-vs-continuous',
  'tense-have-got',
  'tense-past-simple',
  'tense-past-continuous',
  'tense-present-perfect',
  'tense-just-already-yet-still',
  'tense-for-since-ago',
  'tense-present-perfect-vs-past-simple',
  'tense-used-to',
  'tense-future',
  'tense-present-perfect-continuous',
  'tense-past-perfect',
  'tense-future-continuous-perfect',
  'tense-review',
  // 2. Passive, modals and reported speech
  'verbs-passive',
  'verbs-modals',
  'verbs-polite-requests',
  'verbs-say-tell',
  'verbs-reported-speech',
  // 3. Questions and auxiliaries
  'questions-do-negations',
  'questions-there-is-it',
  'questions-short-answers-tags',
  'questions-indirect',
  // 4. Verb + -ing or to
  'patterns-ing-or-to',
  'patterns-purpose',
  'patterns-make-do',
  // 5. Nouns, pronouns and determiners
  'nouns-pronouns-possessives',
  'nouns-articles',
  'nouns-countable-uncountable',
  'nouns-some-any-no',
  'nouns-all-both-each',
  'nouns-quantity',
  // 6. Adjectives, adverbs and word order
  'adj-adjectives-adverbs',
  'adj-comparison',
  'adj-too-enough-so-such',
  'adj-word-order',
  // 7. Prepositions and phrasal verbs
  'prep-time',
  'prep-place-movement',
  'prep-dependent',
  'prep-phrasal-verbs-basics',
  'prep-phrasal-verbs-common',
  // 8. Complex sentences
  'clauses-connectors',
  'clauses-conditionals',
  'clauses-relative',
  'clauses-wish',
  // 9. Professional vocabulary (outside Murphy)
  'vocab-rise-raise',
  'vocab-lend-borrow',
  'vocab-false-friends',
] as const;

export const notionIdSchema = z.enum(NOTION_IDS);
export type NotionId = z.infer<typeof notionIdSchema>;

/** The 13 notions delivered in phase 3 (CUR-10); all others come in phase 8 (D-037). */
export const PHASE_3_NOTION_IDS = [
  'tense-present-continuous',
  'tense-present-simple',
  'tense-present-simple-vs-continuous',
  'tense-past-simple',
  'tense-past-continuous',
  'tense-present-perfect',
  'tense-just-already-yet-still',
  'tense-for-since-ago',
  'tense-present-perfect-vs-past-simple',
  'tense-future',
  'tense-present-perfect-continuous',
  'tense-past-perfect',
  'tense-review',
] as const satisfies readonly NotionId[];
export type Phase3NotionId = (typeof PHASE_3_NOTION_IDS)[number];

const PHASE_3 = new Set<string>(PHASE_3_NOTION_IDS);

/** Delivery phase of a notion (PEDAGOGY §11.2). */
export function phaseOf(notionId: NotionId): 3 | 8 {
  return PHASE_3.has(notionId) ? 3 : 8;
}

/** Track of a notion, found by the prefix of its identifier. */
export function trackOf(notionId: NotionId): TrackId {
  const track = TRACK_IDS.find((id) => notionId.startsWith(`${TRACK_NOTION_PREFIXES[id]}-`));
  if (track === undefined) throw new Error(`No track for notion ${notionId}`);
  return track;
}

/** Notions of a track, in curriculum order. */
export function notionsOfTrack(trackId: TrackId): NotionId[] {
  return NOTION_IDS.filter((notionId) => trackOf(notionId) === trackId);
}

export function isNotionId(value: string): value is NotionId {
  return notionIdSchema.safeParse(value).success;
}
