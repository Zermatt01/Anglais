/**
 * Equivalence of answers (docs/ARCHITECTURE.md §6): each answer is turned into
 * the set of its normalized readings (contractions expanded, spelling and small
 * numbers made canonical). Two answers are equivalent when their sets share at
 * least one reading.
 */
import { expandContraction } from './contractions.ts';
import { tokenize } from './normalize.ts';
import { canonicalSpelling } from './spelling.ts';

/**
 * Small numbers written in words or in digits are the same answer
 * ("for three years" = "for 3 years"). "one" is left out: it is also a pronoun
 * ("the blue one", "no one"), which must never match the digit 1.
 */
const NUMBER_WORDS: Readonly<Record<string, string>> = {
  zero: '0',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
  thirteen: '13',
  fourteen: '14',
  fifteen: '15',
  sixteen: '16',
  seventeen: '17',
  eighteen: '18',
  nineteen: '19',
  twenty: '20',
};

/**
 * Upper bound on the number of readings of one answer. Each ambiguous
 * contraction doubles or triples the count; past this bound the remaining
 * tokens keep their first reading, which can only make a match less likely
 * (the answer then goes to the "unknown" path, never to "incorrect").
 */
const MAX_READINGS = 64;

function canonicalToken(token: string): string {
  const spelled = canonicalSpelling(token);
  return NUMBER_WORDS[spelled] ?? spelled;
}

/** All normalized readings of a text, each as a list of canonical tokens. */
export function readingsOf(text: string): string[][] {
  let readings: string[][] = [[]];
  const tokens = tokenize(text);
  for (const [index, token] of tokens.entries()) {
    const expansions = expandContraction(token, tokens[index + 1]).map((reading) =>
      reading.map(canonicalToken),
    );
    const usable =
      readings.length * expansions.length <= MAX_READINGS ? expansions : expansions.slice(0, 1);
    readings = readings.flatMap((prefix) => usable.map((expansion) => [...prefix, ...expansion]));
  }
  return readings;
}

/** All normalized readings of a text, each joined into a single string. */
export function answerForms(text: string): Set<string> {
  return new Set(readingsOf(text).map((tokens) => tokens.join(' ')));
}

/** True when both texts share at least one normalized reading. */
export function areEquivalent(a: string, b: string): boolean {
  const formsOfA = answerForms(a);
  for (const form of answerForms(b)) {
    if (formsOfA.has(form)) return true;
  }
  return false;
}

/**
 * True when one reading of `phrase` appears as a whole-word sequence inside one
 * reading of `text`. Used to check that a hint does not give the answer away.
 * An empty phrase is never contained.
 */
export function containsPhrase(text: string, phrase: string): boolean {
  const phraseForms = [...answerForms(phrase)].filter((form) => form.length > 0);
  if (phraseForms.length === 0) return false;
  for (const textForm of answerForms(text)) {
    const padded = ` ${textForm} `;
    if (phraseForms.some((form) => padded.includes(` ${form} `))) return true;
  }
  return false;
}
