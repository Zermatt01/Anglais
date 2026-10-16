/**
 * Which errors are on the notion of a translation (D-093), as decided by the
 * learner: the choice and the forms of the tense, its agreement with the
 * subject, its questions and negations (word order of questions included),
 * the place of _just, already, yet, still_ (filed under tenses, PEDAGOGY §7.4),
 * and the transpositions of French that the notion's lesson teaches
 * (_I come from receiving_, _It's been three weeks that…_). The place of a
 * frequency adverb, a preposition or a word is off the notion.
 */
import type { ErrorCategory } from '../taxonomy.ts';
import { trackOf, type NotionId, type TrackId } from './notion-id.ts';

/** Categories an error must have to be on a notion of the track; closed lists. */
const ON_NOTION_CATEGORIES: Readonly<Partial<Record<TrackId, readonly ErrorCategory[]>>> = {
  tenses: [
    'temps_verbaux',
    'accord_sujet_verbe',
    'auxiliaires_questions_negations',
    'calques_du_francais',
  ],
};

/** Whether an error of this category can be on the notion; none for a track not delivered yet. */
export function isNotionCategory(notionId: NotionId, category: ErrorCategory): boolean {
  return ON_NOTION_CATEGORIES[trackOf(notionId)]?.includes(category) ?? false;
}

/** Categories that are never off a notion of the track: its own grammar. */
const NEVER_OFF: readonly ErrorCategory[] = [
  'temps_verbaux',
  'accord_sujet_verbe',
  'auxiliaires_questions_negations',
];

/** Whether a reviewed anticipated error is classified consistently with this rule. */
export function isConsistentClassification(
  notionId: NotionId,
  error: { readonly category: ErrorCategory; readonly offNotion: boolean },
): boolean {
  return error.offNotion
    ? !NEVER_OFF.includes(error.category)
    : isNotionCategory(notionId, error.category);
}
