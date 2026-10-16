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
import { isNotionCategory } from '../curriculum/notion-errors.ts';
import type { NotionId } from '../curriculum/notion-id.ts';
import type { AnswerResult } from '../taxonomy.ts';
import { isCountedError, isPointToCheck, type ReviewedCorrection } from './correction.ts';

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

/** A match of a part: where it ends, and the words its slots took (insertable words left out). */
interface PartMatch {
  readonly end: number;
  readonly picked: readonly string[];
}

/** A match of `slots` starting at `start`, or `null`. */
function matchPart(
  words: readonly string[],
  slots: readonly Slot[],
  start: number,
): PartMatch | null {
  const at = (slot: number, position: number, picked: readonly string[]): PartMatch | null => {
    if (slot === slots.length) return { end: position, picked };
    const current = slots[slot];
    const word = words[position];
    if (current === undefined || word === undefined) return null;
    if (fits(current, word)) {
      const found = at(slot + 1, position + 1, [...picked, word]);
      if (found !== null) return found;
    }
    return slot > 0 && !current.adjacent && INSERTABLE.has(word)
      ? at(slot, position + 1, picked)
      : null;
  };
  return at(0, start, []);
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

/** The first match of `part` from `from` on that is a whole verb group when it has a verb. */
function findPart(words: readonly string[], part: readonly Slot[], from: number): PartMatch | null {
  for (let start = from; start < words.length; start += 1) {
    const found = matchPart(words, part, start);
    if (found !== null && (!hasVerb(part) || isWholeVerbGroup(words, start, found.end))) {
      return found;
    }
  }
  return null;
}

/**
 * The words a construction takes in a reading, when its first part starts at
 * `start`: its parts follow each other. `null` when it does not match there.
 */
function constructionAt(
  words: readonly string[],
  parts: readonly (readonly Slot[])[],
  start: number,
): string | null {
  const [first, ...rest] = parts;
  if (first === undefined) return null;
  const head = matchPart(words, first, start);
  if (head === null || (hasVerb(first) && !isWholeVerbGroup(words, start, head.end))) return null;
  const taken = [head.picked.join(' ')];
  let from = head.end;
  for (const part of rest) {
    const found = findPart(words, part, from);
    if (found === null) return null;
    taken.push(found.picked.join(' '));
    from = found.end;
  }
  return taken.join(' … ');
}

function matchesReading(words: readonly string[], parts: readonly (readonly Slot[])[]): boolean {
  return words.some((_, start) => constructionAt(words, parts, start) !== null);
}

/** Whether `words` contain the construction of `pattern`, in one of their readings. */
export function matchesPattern(words: string, pattern: string): boolean {
  const parts = parsePattern(pattern);
  return readingsOf(words).some((reading) => matchesReading(reading, parts));
}

/**
 * Every construction of `patterns` in a text, as the words its slots take, in
 * any reading: "I usually take the bus" gives "i take" for `i|you|we|they
 * {base}`; "I've worked here for three years" gives "have worked … for three
 * years" for `have|has {participle} … for * years`.
 */
export function constructionsIn(text: string, patterns: readonly string[]): Set<string> {
  const found = new Set<string>();
  const parsed = patterns.map(parsePattern);
  for (const reading of readingsOf(text)) {
    for (const parts of parsed) {
      reading.forEach((_, start) => {
        const construction = constructionAt(reading, parts, start);
        if (construction !== null) found.add(construction);
      });
    }
  }
  return found;
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

/** Subject pronouns: their place is part of the tense (questions, D-093). */
const SUBJECTS: ReadonlySet<string> = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they']);

/**
 * Words of the tense notions whose presence and place count (D-093): the
 * negation, and the words of "just, already, yet, still" and "for, since, ago".
 */
const NOTION_WORDS: ReadonlySet<string> = new Set([
  'not',
  'never',
  'ever',
  'just',
  'already',
  'yet',
  'still',
  'for',
  'since',
  'ago',
]);

/** Adverbs whose place is off the notion (a frequency adverb, D-093): left out. */
const IGNORED: ReadonlySet<string> = new Set(
  [...INSERTABLE].filter((word) => !SUBJECTS.has(word) && !NOTION_WORDS.has(word)),
);

function isVerbWord(word: string): boolean {
  return AUXILIARIES.has(word) || VERB_FORM_ROLES.some((role) => isVerbForm(word, role));
}

/**
 * The verb skeleton of a reading: its subjects, auxiliaries, modals, verb
 * forms of the closed lists and words of the notions, in their order; any
 * other words (nouns, articles, prepositions…) are one gap, "…"; the adverbs
 * of `IGNORED` are left out.
 */
function skeletonOf(reading: readonly string[]): string {
  const kept: string[] = [];
  for (const word of reading) {
    if (IGNORED.has(word)) continue;
    if (SUBJECTS.has(word) || NOTION_WORDS.has(word) || isVerbWord(word)) kept.push(word);
    else if (kept.at(-1) !== '…') kept.push('…');
  }
  return kept.join(' ');
}

const skeletonsOf = (text: string): Set<string> => new Set(readingsOf(text).map(skeletonOf));

/**
 * Whether a translation of step 4 uses the notion as one of its reviewed
 * answers does (D-094), without the model: one of its readings has the verb
 * skeleton of a reviewed answer that shows the notion. The verbs, auxiliaries,
 * subjects and words of the notion must be the same, in the same order; the
 * other words may differ (a noun, a preposition, an article), and the place
 * of a frequency adverb does not count. "Usually I take the bus" is "i take …"
 * as "I usually take the bus" is; "What you are doing?" is not "What are you
 * doing?"; "I'll call you when I'll be there" has a "will" more than "I'll call
 * you when I'm there". A verb missing from the closed lists is a gap: the
 * translation must then match without it.
 */
export function showsNotionAsReference(
  translation: string,
  accepted: readonly string[],
  use: NotionUse,
): boolean {
  const shown = skeletonsOf(translation);
  return accepted.some(
    (reference) =>
      use.groups.some((patterns) => constructionsIn(reference, patterns).size > 0) &&
      [...skeletonsOf(reference)].some((skeleton) => shown.has(skeleton)),
  );
}

/**
 * Result of a translation of step 4 checked by the model (PEDAGOGY §3.3,
 * D-088, D-094): `incorrect` with a counted error on the target notion, of a
 * category of the notion (a frequency adverb out of place is not); otherwise
 * `correct` or `acceptable` (other errors) only when the app proves the use
 * of the notion, by the constructions of a reviewed answer or by the words
 * the model points to; `null` when it cannot: the learner decides.
 */
export function stepFourResult(
  text: string,
  correction: ReviewedCorrection,
  targetNotionId: NotionId,
  proof: { readonly accepted: readonly string[]; readonly use: NotionUse | null },
): AnswerResult | null {
  const errors = correction.errors.filter((error) => !isPointToCheck(error));
  const onNotion = errors.some(
    (error) =>
      error.notionId === targetNotionId &&
      isCountedError(error) &&
      isNotionCategory(targetNotionId, error.category),
  );
  if (onNotion) return 'incorrect';
  const { use } = proof;
  if (use === null) return null;
  const proven =
    showsNotionAsReference(text, proof.accepted, use) || provenUses(text, correction, use).proven;
  if (!proven) return null;
  return errors.length > 0 ? 'acceptable' : 'correct';
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
