/**
 * Inflected forms of a word, to check that a card's hint does not give the
 * answer away in another form: "meetings" for "meeting", "finished" for
 * "finish", "went" for "go" (CARD-01, DECISIONS D-047).
 *
 * This is a deliberately rough stemmer, not a dictionary: it may relate two
 * words that are not really of the same family. For a hint, that errs on the
 * prudent side: the card is refused, never shown with a revealing hint. Words
 * of three letters or less are only compared exactly (or through the irregular
 * forms), so "on" never matches "one". Frequent words whose ending only looks
 * like an inflection ("news", "economics", "evening") are listed in
 * `NOT_INFLECTED` and compared exactly too.
 */
import { readingsOf } from './forms.ts';

/** Frequent irregular forms, mapped to their base form. */
const IRREGULAR_FORMS: Readonly<Record<string, string>> = {
  am: 'be',
  is: 'be',
  are: 'be',
  was: 'be',
  were: 'be',
  been: 'be',
  being: 'be',
  has: 'have',
  had: 'have',
  having: 'have',
  does: 'do',
  did: 'do',
  done: 'do',
  goes: 'go',
  went: 'go',
  gone: 'go',
  made: 'make',
  took: 'take',
  taken: 'take',
  got: 'get',
  gotten: 'get',
  gave: 'give',
  given: 'give',
  came: 'come',
  saw: 'see',
  seen: 'see',
  knew: 'know',
  known: 'know',
  thought: 'think',
  told: 'tell',
  said: 'say',
  found: 'find',
  left: 'leave',
  felt: 'feel',
  kept: 'keep',
  brought: 'bring',
  bought: 'buy',
  began: 'begin',
  begun: 'begin',
  wrote: 'write',
  written: 'write',
  spoke: 'speak',
  spoken: 'speak',
  sent: 'send',
  spent: 'spend',
  met: 'meet',
  paid: 'pay',
  ran: 'run',
  rose: 'rise',
  risen: 'rise',
  lent: 'lend',
  built: 'build',
  held: 'hold',
  led: 'lead',
  lost: 'lose',
  won: 'win',
  sold: 'sell',
  stood: 'stand',
  understood: 'understand',
  taught: 'teach',
  caught: 'catch',
  chose: 'choose',
  chosen: 'choose',
  fell: 'fall',
  fallen: 'fall',
  grew: 'grow',
  grown: 'grow',
  drove: 'drive',
  driven: 'drive',
  children: 'child',
  men: 'man',
  women: 'woman',
  people: 'person',
};

/**
 * Words ending in -s, -ing or -ed that are not inflections of a shorter word:
 * no ending is removed from them ("news" is not the plural of "new"). Words
 * ending in -ss, -us and -is ("business", "status", "analysis") are already
 * protected by the rule itself.
 */
const NOT_INFLECTED = new Set([
  // Uncountable nouns and nouns with the same singular and plural
  'news',
  'economics',
  'physics',
  'mathematics',
  'politics',
  'statistics',
  'ethics',
  'logistics',
  'analytics',
  'athletics',
  'electronics',
  'series',
  'species',
  'means',
  'headquarters',
  'lens',
  'gas',
  // Adverbs and conjunctions ending in -s
  'always',
  'perhaps',
  'whereas',
  'besides',
  'sometimes',
  // Nouns ending in -ing or -ed that are not verb forms
  'evening',
  'morning',
  'during',
  'nothing',
  'something',
  'anything',
  'everything',
  'ceiling',
  'hundred',
  'indeed',
]);

const VOWELS = /[aeiou]/;

/** Base forms a longer word may come from, by removing a regular ending. */
function regularBases(token: string): string[] {
  const bases: string[] = [];
  const add = (base: string) => {
    if (base.length >= 3 && VOWELS.test(base)) bases.push(base);
  };
  const withoutDoubling = (base: string) => (/([^aeiou])\1$/.test(base) ? base.slice(0, -1) : base);

  if (token.endsWith("'s")) add(token.slice(0, -2));
  if (/ie[sd]$/.test(token)) add(`${token.slice(0, -3)}y`);
  if (token.endsWith('es')) add(token.slice(0, -2));
  if (token.endsWith('s') && !/(ss|us|is)$/.test(token)) add(token.slice(0, -1));
  for (const ending of ['ed', 'ing']) {
    const base = token.slice(0, -ending.length);
    // The stem itself must be long enough: "thing" is not "th" + "ing".
    if (token.endsWith(ending) && base.length >= 3) {
      add(base);
      add(`${base}e`);
      add(withoutDoubling(base));
    }
  }
  return bases;
}

/** The word itself and the base forms it may be an inflection of. */
export function lemmaCandidates(token: string): Set<string> {
  const candidates = new Set([token]);
  const irregular = IRREGULAR_FORMS[token];
  if (irregular !== undefined) candidates.add(irregular);
  if (token.length > 3 && !NOT_INFLECTED.has(token)) {
    for (const base of regularBases(token)) candidates.add(base);
  }
  return candidates;
}

/** True when both words may be forms of the same word. */
export function sameWordFamily(a: string, b: string): boolean {
  if (a === b) return true;
  const ofA = lemmaCandidates(a);
  for (const candidate of lemmaCandidates(b)) {
    if (ofA.has(candidate)) return true;
  }
  return false;
}

/**
 * True when `text` contains `phrase`, word for word, allowing each word to be
 * in another inflected form ("has finished" contains "have finished"). An empty
 * phrase is never contained.
 */
export function containsInflectedPhrase(text: string, phrase: string): boolean {
  const phraseReadings = readingsOf(phrase).filter((tokens) => tokens.length > 0);
  if (phraseReadings.length === 0) return false;
  for (const textTokens of readingsOf(text)) {
    for (const phraseTokens of phraseReadings) {
      for (let start = 0; start + phraseTokens.length <= textTokens.length; start += 1) {
        const window = textTokens.slice(start, start + phraseTokens.length);
        if (window.every((token, index) => sameWordFamily(token, phraseTokens[index] ?? ''))) {
          return true;
        }
      }
    }
  }
  return false;
}
