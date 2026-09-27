/**
 * Text normalization for local answer checking (docs/ARCHITECTURE.md §6, COST-02).
 *
 * Normalization only removes differences that never change whether an answer is
 * right: letter case, typographic apostrophes and quotes, spacing, punctuation,
 * thousands separators and hyphens between words. Everything else (word choice,
 * word order, verb forms) is kept, so that two normalized answers are equal only
 * when a teacher would grade them the same way.
 */

/** Typographic apostrophes and look-alikes, all read as a plain apostrophe. */
const APOSTROPHE_LIKE = /[‘’‛ʹʼ`´′]/g;

/** Hyphens, dashes and minus signs, all read as a plain hyphen. */
const DASH_LIKE = /[‐-―−]/g;

/** A comma used as a thousands separator: "6,000" is the same number as "6000". */
const THOUSANDS_SEPARATOR = /(?<=\d),(?=\d{3}(?!\d))/g;

/**
 * Hyphenated spellings that are single words once the hyphen is removed.
 * Hyphens are otherwise read as spaces ("three-year" = "three year").
 */
const CLOSED_COMPOUNDS: readonly (readonly [RegExp, string])[] = [
  [/\be-mail/g, 'email'],
  [/\bon-line\b/g, 'online'],
  [/\bco-operat/g, 'cooperat'],
  [/\bco-ordinat/g, 'coordinat'],
];

/**
 * A token is a decimal number ("6.5"), a word with inner apostrophes ("don't",
 * "o'clock", "company's"), or a currency or percent sign. Leading and trailing
 * apostrophes are dropped ("students'" → "students"), like any other punctuation.
 */
const TOKEN = /\d+(?:\.\d+)+|[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*|[%$€£]/gu;

/** Splits a text into normalized tokens (lowercase, no punctuation). */
export function tokenize(text: string): string[] {
  let normalized = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(APOSTROPHE_LIKE, "'")
    .replace(DASH_LIKE, '-')
    .replace(THOUSANDS_SEPARATOR, '');
  for (const [pattern, replacement] of CLOSED_COMPOUNDS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.match(TOKEN) ?? [];
}

/** Normalized form of a text: its tokens joined by single spaces. */
export function normalizeText(text: string): string {
  return tokenize(text).join(' ');
}
