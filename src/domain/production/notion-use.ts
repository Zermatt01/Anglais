/**
 * Whether a production of step 5 uses its notion, checked by the app
 * (PEDAGOGY §3.3, D-088).
 *
 * The model points to the words of the text that use the target notion
 * (`targetNotionUses`). They prove the use only if the app finds them in the
 * text, outside any counted error, and recognizes in them one of the notion's
 * constructions. A construction is a closed pattern, written in the content:
 * closed lists of words (auxiliaries, adverbs, prepositions) and closed lists
 * of verb forms (`verb-forms.ts`). No ending is read by a rule (D-058): a
 * verb missing from the lists is not recognized, and the use stays unproven.
 *
 * A use that is not proven is a point to check: the production then counts
 * neither for nor against the step.
 *
 * Pattern syntax: words separated by spaces, each one a slot; a slot is a
 * list of canonical words separated by "|" ("have|has"), or a role of verb
 * form in braces ("{ing}", "{participle}"), or "*" for any one word ("for *
 * years": "for three years", never "for a bank"). Between two slots, only words of
 * `INSERTABLE` may come ("have not been", "have you finished"), and none when
 * "+" joins them ("still+{base}": "I still work", never "Still, I work"). " … " splits
 * a pattern into parts that follow each other, with any words between them
 * ("{past} … ago"). Words are read like answers (`readingsOf`): lowercase,
 * contractions expanded ("I've" is "i have"), American spelling.
 *
 * A part with a verb is a whole verb group: no auxiliary, modal or "to" just
 * before it, and, when it ends with an auxiliary, no participle, -ing form or
 * auxiliary just after it. So "has worked" is not a past simple, "I have been
 * working" not a present simple, and "to work" not a present.
 *
 * Uses whose words overlap in the text are one use: the same words never
 * prove two tenses of a contrast or of the review (D-090).
 */
import { readingsOf } from '../correction/forms.ts';
import { locateSegment, type TextRange } from '../correction/segments.ts';
import { isVerbForm, VERB_FORM_ROLES, type VerbFormRole } from '../correction/verb-forms.ts';
import type { NotionId } from '../curriculum/notion-id.ts';
import type { AnswerResult } from '../taxonomy.ts';
import { isCountedError, type ReviewedCorrection } from './correction.ts';

/** The constructions that show a notion. */
export interface NotionUse {
  /**
   * Groups of patterns. For a contrast or a review, each group is one tense,
   * and each must be shown by its own words.
   */
  readonly groups: readonly (readonly string[])[];
  /** How many groups the production must show. */
  readonly required: number;
}

/** Words that may come between two slots of a pattern: negation, adverbs, subject pronouns. */
const INSERTABLE: ReadonlySet<string> = new Set([
  'not',
  'never',
  'ever',
  'always',
  'often',
  'usually',
  'sometimes',
  'rarely',
  'generally',
  'normally',
  'just',
  'already',
  'still',
  'also',
  'really',
  'recently',
  'currently',
  'finally',
  'actually',
  'probably',
  'definitely',
  'certainly',
  'only',
  'even',
  'all',
  'both',
  'nearly',
  'almost',
  'mostly',
  'now',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
]);

/** Auxiliaries and modals: a verb group that ends with one of them may go on. */
const AUXILIARIES: ReadonlySet<string> = new Set([
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'will',
  'would',
  'shall',
  'should',
  'can',
  'could',
  'may',
  'might',
  'must',
]);

/** Longest words of a use that the app reads, and most uses read per production. */
const MAX_USE_LENGTH = 300;
const MAX_USES = 8;

type Slot = (
  | { readonly kind: 'words'; readonly words: ReadonlySet<string> }
  | { readonly kind: 'form'; readonly role: VerbFormRole }
  | { readonly kind: 'any' }
) & {
  /** Written after "+": no insertable word may come before it. */
  readonly adjacent: boolean;
};

const ROLE_SLOT = /^\{([a-z]+)\}$/;

function isRole(value: string): value is VerbFormRole {
  return (VERB_FORM_ROLES as readonly string[]).includes(value);
}

function slotOf(token: string, adjacent: boolean): Slot {
  if (token === '*') return { kind: 'any', adjacent };
  const role = ROLE_SLOT.exec(token)?.[1];
  if (role !== undefined) {
    if (!isRole(role)) throw new Error(`Unknown verb form in a pattern: ${token}`);
    return { kind: 'form', role, adjacent };
  }
  return { kind: 'words', words: new Set(token.split('|')), adjacent };
}

/** A pattern as its parts, each a list of slots; throws on an unknown role. */
export function parsePattern(pattern: string): Slot[][] {
  return pattern.split(' … ').map((part) =>
    part
      .trim()
      .split(/\s+/)
      .flatMap((token) => token.split('+').map((piece, index) => slotOf(piece, index > 0))),
  );
}

function fits(slot: Slot, word: string): boolean {
  switch (slot.kind) {
    case 'words':
      return slot.words.has(word);
    case 'form':
      return isVerbForm(word, slot.role);
    case 'any':
      return true;
  }
}

/** End of a match of `slots` starting at `start`, or -1. */
function matchPart(words: readonly string[], slots: readonly Slot[], start: number): number {
  const at = (slot: number, position: number): number => {
    if (slot === slots.length) return position;
    const current = slots[slot];
    const word = words[position];
    if (current === undefined || word === undefined) return -1;
    if (fits(current, word)) {
      const end = at(slot + 1, position + 1);
      if (end !== -1) return end;
    }
    return slot > 0 && !current.adjacent && INSERTABLE.has(word) ? at(slot, position + 1) : -1;
  };
  return at(0, start);
}

function hasVerb(part: readonly Slot[]): boolean {
  return part.some(
    (slot) =>
      slot.kind === 'form' ||
      (slot.kind === 'words' && [...slot.words].some((word) => AUXILIARIES.has(word))),
  );
}

/** The nearest word before `index` (or from it, after) that is not insertable. */
function nearestWord(words: readonly string[], index: number, step: -1 | 1): string | undefined {
  let at = index;
  while (at >= 0 && at < words.length && INSERTABLE.has(words[at] ?? '')) at += step;
  return words[at];
}

/** Whether `words[start, end)` is a whole verb group (see the module comment). */
function isWholeVerbGroup(words: readonly string[], start: number, end: number): boolean {
  const before = nearestWord(words, start - 1, -1);
  if (before !== undefined && (AUXILIARIES.has(before) || before === 'to')) return false;
  if (!AUXILIARIES.has(words[end - 1] ?? '')) return true;
  const after = nearestWord(words, end, 1);
  return (
    after === undefined ||
    !(AUXILIARIES.has(after) || isVerbForm(after, 'participle') || isVerbForm(after, 'ing'))
  );
}

function matchesReading(words: readonly string[], parts: readonly (readonly Slot[])[]): boolean {
  let from = 0;
  for (const part of parts) {
    let end = -1;
    for (let start = from; start < words.length && end === -1; start += 1) {
      const found = matchPart(words, part, start);
      if (found !== -1 && (!hasVerb(part) || isWholeVerbGroup(words, start, found))) end = found;
    }
    if (end === -1) return false;
    from = end;
  }
  return true;
}

/** Whether `words` contain the construction of `pattern`, in one of their readings. */
export function matchesPattern(words: string, pattern: string): boolean {
  const parts = parsePattern(pattern);
  return readingsOf(words).some((reading) => matchesReading(reading, parts));
}

/** Largest number of groups each shown by its own use (a small bipartite matching). */
function groupsShown(fitting: readonly (readonly number[])[]): number {
  const owner = new Map<number, number>();
  const assign = (group: number, seen: Set<number>): boolean => {
    for (const use of fitting[group] ?? []) {
      if (seen.has(use)) continue;
      seen.add(use);
      const current = owner.get(use);
      if (current === undefined || assign(current, seen)) {
        owner.set(use, group);
        return true;
      }
    }
    return false;
  };
  let shown = 0;
  for (let group = 0; group < fitting.length; group += 1) {
    if (assign(group, new Set())) shown += 1;
  }
  return shown;
}

/**
 * The uses that prove the notion: found in the text, outside any counted
 * error, and showing one of its constructions. `proven` when they show enough
 * groups, each with its own use.
 */
export function provenUses(
  text: string,
  correction: ReviewedCorrection,
  use: NotionUse,
): { readonly proven: boolean; readonly ranges: readonly TextRange[] } {
  const counted = correction.errors.flatMap((error) =>
    isCountedError(error) && error.range !== null ? [error.range] : [],
  );
  const located = (correction.targetNotionUses ?? [])
    .filter((words) => /\S/.test(words) && words.length <= MAX_USE_LENGTH)
    .slice(0, MAX_USES)
    .flatMap((words) => {
      const range = locateSegment(text, words);
      if (range === null) return [];
      const inError = counted.some((error) => error.start < range.end && range.start < error.end);
      return inError ? [] : [{ words, range }];
    })
    .sort((a, b) => a.range.start - b.range.start);
  // Uses whose words overlap are one use, which proves one group at most.
  const units: { start: number; end: number; words: string[] }[] = [];
  for (const found of located) {
    const last = units.at(-1);
    if (last !== undefined && found.range.start < last.end) {
      last.end = Math.max(last.end, found.range.end);
      last.words.push(found.words);
    } else {
      units.push({ start: found.range.start, end: found.range.end, words: [found.words] });
    }
  }
  const fitting = use.groups.map((patterns) =>
    units.flatMap((unit, index) =>
      unit.words.some((words) => patterns.some((pattern) => matchesPattern(words, pattern)))
        ? [index]
        : [],
    ),
  );
  const ranges = units
    .filter((_unit, index) => fitting.some((uses) => uses.includes(index)))
    .map(({ start, end }) => ({ start, end }));
  return { proven: groupsShown(fitting) >= use.required, ranges };
}

/**
 * Result of a production of step 5 (PEDAGOGY §3.3, D-088): `incorrect` with a
 * counted error on the notion; `correct` when the app proves the use of the
 * notion; otherwise `null`: the use is a point to check, and the production
 * counts neither for nor against the step.
 */
export function stepFiveResult(
  text: string,
  correction: ReviewedCorrection,
  targetNotionId: NotionId,
  use: NotionUse | null,
): AnswerResult | null {
  const notionError = correction.errors.some(
    (error) => error.notionId === targetNotionId && isCountedError(error),
  );
  if (notionError) return 'incorrect';
  return use !== null && provenUses(text, correction, use).proven ? 'correct' : null;
}
