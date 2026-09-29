/**
 * Text normalization for local answer checking (docs/ARCHITECTURE.md §6, COST-02).
 *
 * Normalization only removes differences that never change whether an answer is
 * right: letter case, typographic apostrophes and quotes, spacing, punctuation
 * and thousands separators. Everything else (word choice, word order, verb
 * forms, hyphens inside a word) is kept, so that two normalized answers are
 * equal only when a teacher would grade them the same way.
 */

/** Typographic apostrophes and look-alikes, all read as a plain apostrophe. */
const APOSTROPHE_LIKE = /[‘’‛ʹʼ`´′]/g;

/** Hyphens, dashes and minus signs, all read as a plain hyphen. */
const DASH_LIKE = /[‐-―−]/g;

/** A comma used as a thousands separator: "6,000" is the same number as "6000". */
const THOUSANDS_SEPARATOR = /(?<=\d),(?=\d{3}(?!\d))/g;

/**
 * Hyphenated spellings that are the same word as their closed spelling, in
 * every use (DECISIONS D-058, D-072). The list is closed: any other hyphen is
 * part of the word, since a hyphen often changes the word ("a follow-up" is a
 * noun, "follow up" a verb; "a three-year plan", but "for three years").
 */
const HYPHENATED_SPELLINGS: Readonly<Record<string, string>> = {
  'e-mail': 'email',
  'e-mails': 'emails',
  'e-mailed': 'emailed',
  'e-mailing': 'emailing',
  'on-line': 'online',
  'co-operate': 'cooperate',
  'co-operates': 'cooperates',
  'co-operated': 'cooperated',
  'co-operating': 'cooperating',
  'co-operation': 'cooperation',
  'co-operative': 'cooperative',
  'co-ordinate': 'coordinate',
  'co-ordinates': 'coordinates',
  'co-ordinated': 'coordinated',
  'co-ordinating': 'coordinating',
  'co-ordination': 'coordination',
  'co-ordinator': 'coordinator',
  'co-ordinators': 'coordinators',
  'co-worker': 'coworker',
  'co-workers': 'coworkers',
};

/**
 * A token is a decimal number ("6.5"), a word with inner apostrophes or
 * hyphens ("don't", "o'clock", "company's", "follow-up"), or a currency or
 * percent sign. Apostrophes and hyphens at word edges are dropped
 * ("students'" → "students"), like any other punctuation: a dash between
 * spaces ("rates rose — sharply") separates words.
 */
const TOKEN = /\d+(?:\.\d+)+|[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*|[%$€£]/gu;

/** Splits a text into normalized tokens (lowercase, no punctuation). */
export function tokenize(text: string): string[] {
  const normalized = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(APOSTROPHE_LIKE, "'")
    .replace(DASH_LIKE, '-')
    .replace(THOUSANDS_SEPARATOR, '');
  return (normalized.match(TOKEN) ?? []).map((token) => HYPHENATED_SPELLINGS[token] ?? token);
}

/** Normalized form of a text: its tokens joined by single spaces. */
export function normalizeText(text: string): string {
  return tokenize(text).join(' ');
}
