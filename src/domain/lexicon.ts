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

/** A piece of a sentence: a word, or what lies between two words (spaces, punctuation). */
export interface TextPiece {
  readonly text: string;
  readonly start: number;
  readonly word: boolean;
}

/** A word: letters and digits, with the apostrophes and hyphens inside it ("don't", "follow-up"). */
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/** The words of a sentence and what lies between them, in order, to pick an unknown word (D-095). */
export function piecesOf(text: string): TextPiece[] {
  const pieces: TextPiece[] = [];
  let cursor = 0;
  for (const match of text.matchAll(WORD)) {
    if (match.index > cursor) {
      pieces.push({ text: text.slice(cursor, match.index), start: cursor, word: false });
    }
    pieces.push({ text: match[0], start: match.index, word: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) pieces.push({ text: text.slice(cursor), start: cursor, word: false });
  return pieces;
}

/**
 * The expression from the `first` to the `last` word of a sentence (indexes
 * among its words, in any order), as written in it: "set up" from "We set up
 * a company"; an empty string when an index is out of range.
 */
export function expressionBetween(text: string, first: number, last: number): string {
  const words = piecesOf(text).filter((piece) => piece.word);
  const from = words[Math.min(first, last)];
  const to = words[Math.max(first, last)];
  if (from === undefined || to === undefined) return '';
  return text.slice(from.start, to.start + to.text.length);
}

/** End of a sentence: its final punctuation and closing quotes, before a space; or a line break. */
const SENTENCE_END = /[.!?]+["'”’)\]]*(?=\s)|\n/gu;

/**
 * Abbreviations whose full stop never ends a sentence, lower-cased (closed
 * list, D-058): a sentence too long is harmless, a fragment is not.
 */
const ABBREVIATIONS: ReadonlySet<string> = new Set([
  'e.g.',
  'i.e.',
  'etc.',
  'vs.',
  'cf.',
  'approx.',
  'mr.',
  'mrs.',
  'ms.',
  'dr.',
  'prof.',
  'a.m.',
  'p.m.',
  'u.s.',
  'u.k.',
]);

function endsWithAbbreviation(text: string, end: number): boolean {
  const token = /\S+$/u.exec(text.slice(0, end))?.[0] ?? '';
  return ABBREVIATIONS.has(token.replace(/^["'“‘([]+/u, '').toLowerCase());
}

/**
 * The sentence of `text` that holds its words from `first` to `last` (indexes
 * among its words, in any order), or the sentences, when they lie in
 * several: the example of a word touched in a paragraph (D-095). The whole
 * text when an index is out of range.
 */
export function sentenceAround(text: string, first: number, last: number): string {
  const words = piecesOf(text).filter((piece) => piece.word);
  const from = words[Math.min(first, last)];
  const to = words[Math.max(first, last)];
  if (from === undefined || to === undefined) return text.trim();
  const end = to.start + to.text.length;
  let start = 0;
  let stop = text.length;
  for (const match of text.matchAll(SENTENCE_END)) {
    const boundary = match.index + match[0].length;
    // The abbreviation is read before the closing marks: "(at 9 a.m.) went well" (D-096).
    const stops = /^[.!?]+/u.exec(match[0])?.[0] ?? '';
    if (stops.endsWith('.') && endsWithAbbreviation(text, match.index + stops.length)) continue;
    if (boundary <= from.start) start = boundary;
    else if (boundary >= end) {
      stop = boundary;
      break;
    }
  }
  return text.slice(start, stop).trim();
}

/** A 53-bit hash of a text (cyrb53), in hexadecimal: a key of fixed length, never a protection. */
function hashOf(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

/**
 * Where the drafts of the form of a word touched are kept (D-096): from the
 * whole sentence and the words touched, of fixed length, so that it fits in
 * a draft key and two sentences never share it.
 */
export function wordDraftKey(expression: string, sentence: string): string {
  return `lexicon-word:${hashOf(`${expression}\u0000${sentence}`)}`;
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
