/**
 * "Mon lexique" (MOD-09): lexical chunks rather than isolated words (PED-10,
 * Lewis). Each entry is unique by its normalized expression, and comes with a
 * collocation card: its example sentence with the expression replaced by a
 * gap, and its French meaning (CARD-03).
 */
import type { CollocationCardContent } from './cards/content.ts';
import { GAP_MARKER } from './cards/content.ts';
import { isCardSolvable } from './cards/solvability.ts';
import { normalizeText } from './correction/normalize.ts';

/** Longest expression, meaning and example (`lexicon` table). */
export const MAX_EXPRESSION = 300;
export const MAX_MEANING = 500;
export const MAX_EXAMPLE = 1_000;

/** The unique key of an entry: two spellings of one expression are one entry. */
export function lexiconKey(expression: string): string {
  return normalizeText(expression);
}

export interface LexiconEntryText {
  readonly expression: string;
  readonly meaningFr: string;
  readonly example: string;
}

/** Positions of `needle` in `text`, ignoring case. */
function occurrences(text: string, needle: string): number[] {
  const haystack = text.toLowerCase();
  const target = needle.toLowerCase();
  const found: number[] = [];
  if (target.length === 0) return found;
  let index = haystack.indexOf(target);
  while (index !== -1) {
    found.push(index);
    index = haystack.indexOf(target, index + 1);
  }
  return found;
}

/**
 * The collocation card of an entry, or `null` when the example does not
 * contain the expression exactly once (then no card can be made from it).
 */
export function collocationCardOf(entry: LexiconEntryText): CollocationCardContent | null {
  const expression = entry.expression.trim();
  const positions = occurrences(entry.example, expression);
  const [start] = positions;
  if (positions.length !== 1 || start === undefined) return null;
  const content: CollocationCardContent = {
    type: 'collocation',
    meaningFr: entry.meaningFr.trim(),
    context: `${entry.example.slice(0, start)}${GAP_MARKER}${entry.example.slice(start + expression.length)}`,
    hint: null,
    notionId: null,
    answers: { canonical: entry.example.slice(start, start + expression.length), variants: [] },
  };
  return isCardSolvable(content).solvable ? content : null;
}
