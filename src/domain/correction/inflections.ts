/**
 * Inflected forms of a word, to check that a card's or an exercise's hint does
 * not give the answer away in another form: "meetings" for "meeting",
 * "finished" for "finish", "went" for "go" (CARD-01, DECISIONS D-047).
 *
 * Words are related only through the closed list of `word-families.ts`
 * (D-058, D-072): no ending is removed by a rule, so "united" is never taken
 * for a form of "unit", nor "news" for a form of "new". A word missing from
 * the list is only compared with itself.
 *
 * The only rule is the possessive "'s", which is not an inflection but a
 * clitic: "manager's" always contains the word "manager".
 */
import { readingsOf } from './forms.ts';
import { WORD_FAMILIES } from './word-families.ts';

/** Families of each form, by index in `WORD_FAMILIES`. */
const FAMILIES_OF_FORM: ReadonlyMap<string, readonly number[]> = (() => {
  const index = new Map<string, number[]>();
  WORD_FAMILIES.forEach((forms, family) => {
    for (const form of forms) {
      const families = index.get(form) ?? [];
      families.push(family);
      index.set(form, families);
    }
  });
  return index;
})();

/** The word itself, and without its possessive "'s". */
function wordsOf(token: string): string[] {
  return token.endsWith("'s") && token.length > 2 ? [token, token.slice(0, -2)] : [token];
}

/** True when both words are the same, or two forms of one word of the closed list. */
export function sameWordFamily(a: string, b: string): boolean {
  const wordsOfA = wordsOf(a);
  const wordsOfB = wordsOf(b);
  if (wordsOfA.some((word) => wordsOfB.includes(word))) return true;
  const familiesOfA = new Set(wordsOfA.flatMap((word) => FAMILIES_OF_FORM.get(word) ?? []));
  return wordsOfB.some((word) =>
    (FAMILIES_OF_FORM.get(word) ?? []).some((family) => familiesOfA.has(family)),
  );
}

/**
 * Words of a reading, hyphenated words split into their parts. For a hint,
 * this errs on the prudent side: "a follow-up" gives away "follow up".
 */
function looseWords(tokens: readonly string[]): string[] {
  return tokens.flatMap((token) => token.split('-')).filter((word) => word.length > 0);
}

/**
 * True when `text` contains `phrase`, word for word, allowing each word to be
 * in another form of its family ("has finished" contains "have finished"). An
 * empty phrase is never contained.
 */
export function containsInflectedPhrase(text: string, phrase: string): boolean {
  const phraseReadings = readingsOf(phrase)
    .map(looseWords)
    .filter((words) => words.length > 0);
  if (phraseReadings.length === 0) return false;
  for (const textWords of readingsOf(text).map(looseWords)) {
    for (const phraseWords of phraseReadings) {
      for (let start = 0; start + phraseWords.length <= textWords.length; start += 1) {
        const window = textWords.slice(start, start + phraseWords.length);
        if (window.every((word, index) => sameWordFamily(word, phraseWords[index] ?? ''))) {
          return true;
        }
      }
    }
  }
  return false;
}
