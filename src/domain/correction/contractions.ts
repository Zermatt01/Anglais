/**
 * Contraction expansion (docs/ARCHITECTURE.md §6).
 *
 * Each normalized token is expanded into the list of full forms it may stand
 * for. Ambiguous contractions give several candidates ("he's" → "he is" or
 * "he has"; "I'd" → "I would" or "I had"): two answers are then equivalent when
 * at least one of their expansions coincide. A possessive "'s" after a noun is
 * never expanded ("the company's results" stays as it is).
 */

/**
 * Negative forms whose stem is not simply the word before "n't". "cannot" is
 * listed so that "can't", "cannot" and "can not" all share a reading. "ain't"
 * is non-standard and never expanded.
 */
const IRREGULAR_NEGATIVES: Readonly<Record<string, readonly (readonly string[])[]>> = {
  "won't": [['will', 'not']],
  "can't": [['cannot'], ['can', 'not']],
  "shan't": [['shall', 'not']],
  "ain't": [["ain't"]],
  cannot: [['cannot'], ['can', 'not']],
};

/** Words after which "'s" is the verb "is" or "has", never a possessive. */
const VERB_S_HOSTS = new Set([
  'it',
  'he',
  'she',
  'that',
  'there',
  'here',
  'what',
  'where',
  'who',
  'how',
  'when',
  'why',
]);

/**
 * Indefinite pronouns take either a possessive "'s" ("everyone's opinion") or
 * a verb ("everyone's here"): all three readings are kept.
 */
const AMBIGUOUS_S_HOSTS = new Set([
  'everyone',
  'everybody',
  'everything',
  'someone',
  'somebody',
  'something',
  'anyone',
  'anybody',
  'anything',
  'nobody',
  'nothing',
]);

/** Question words after which "'d" may also stand for "did" ("where'd you go?"). */
const WH_WORDS = new Set(['what', 'where', 'who', 'how', 'when', 'why']);

/**
 * Returns every full-form reading of one normalized token, each reading being a
 * list of tokens. A token that is not a contraction has a single reading: itself.
 */
export function expandContraction(token: string): string[][] {
  const irregular = IRREGULAR_NEGATIVES[token];
  if (irregular) return irregular.map((reading) => [...reading]);

  if (token === "let's") return [['let', 'us']];

  const negative = /^(.+)n't$/.exec(token);
  if (negative?.[1]) return [[negative[1], 'not']];

  const suffix = /^(.+)'(m|re|ve|ll|d|s)$/.exec(token);
  const host = suffix?.[1];
  const ending = suffix?.[2];
  if (host === undefined || ending === undefined) return [[token]];

  switch (ending) {
    case 'm':
      return host === 'i' ? [['i', 'am']] : [[token]];
    case 're':
      return [[host, 'are']];
    case 've':
      return [[host, 'have']];
    case 'll':
      return [[host, 'will']];
    case 'd': {
      const readings = [
        [host, 'would'],
        [host, 'had'],
      ];
      if (WH_WORDS.has(host)) readings.push([host, 'did']);
      return readings;
    }
    default: {
      // ending === 's'
      if (VERB_S_HOSTS.has(host)) {
        return [
          [host, 'is'],
          [host, 'has'],
        ];
      }
      if (AMBIGUOUS_S_HOSTS.has(host)) {
        return [[token], [host, 'is'], [host, 'has']];
      }
      return [[token]];
    }
  }
}
