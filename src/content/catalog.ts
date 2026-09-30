/**
 * Titles of the tracks and notions, and the "Pour aller plus loin" references
 * of the notions delivered so far (CUR-02, CUR-14). Copied from
 * docs/PEDAGOGY.md §11, the single source of truth; `pedagogy.test.ts` checks
 * that they are identical to it. Underscores mark English words.
 */
import type { NotionId, TrackId } from '../domain/curriculum/notion-id.ts';
import type { NotionReference } from './references.ts';

export const TRACK_TITLES: Readonly<Record<TrackId, string>> = {
  tenses: 'Temps verbaux',
  verbs: 'Passif, modaux et discours indirect',
  questions: 'Questions et auxiliaires',
  patterns: 'Verbe + _-ing_ ou _to_',
  nouns: 'Noms, pronoms et déterminants',
  adjectives: 'Adjectifs, adverbes et ordre des mots',
  prepositions: 'Prépositions et _phrasal verbs_',
  clauses: 'Phrases complexes',
  vocabulary: 'Vocabulaire professionnel (hors Murphy)',
};

export const NOTION_TITLES: Readonly<Record<NotionId, string>> = {
  'tense-present-continuous': 'Présent continu',
  'tense-present-simple': 'Présent simple',
  'tense-present-simple-vs-continuous': 'Présent simple ou continu',
  'tense-have-got': '_Have_ et _have got_',
  'tense-past-simple': 'Prétérit (réguliers et irréguliers fréquents)',
  'tense-past-continuous': 'Passé continu',
  'tense-present-perfect': 'Present perfect (expérience et résultat)',
  'tense-just-already-yet-still': '_Just_, _already_, _yet_ et _still_',
  'tense-for-since-ago': '_For_, _since_ et _ago_',
  'tense-present-perfect-vs-past-simple': 'Present perfect ou prétérit',
  'tense-used-to': '_Used to_ (et _be used to_)',
  'tense-future': 'Futur (_will_, _going to_, présent continu)',
  'tense-present-perfect-continuous': 'Present perfect continu',
  'tense-past-perfect': 'Past perfect',
  'tense-future-continuous-perfect': 'Futur continu et futur antérieur',
  'tense-review': 'Récapitulatif',
  'verbs-passive': 'Passif',
  'verbs-modals': 'Modaux (_can_, _could_, _might_, _must_, _should_, _have to_…)',
  'verbs-polite-requests': 'Demandes polies et offres',
  'verbs-say-tell': '_Say_ ou _tell_',
  'verbs-reported-speech': 'Discours indirect',
  'questions-do-negations': 'Questions et négations avec _do_, _does_, _did_',
  'questions-there-is-it': '_There is_ / _there are_, et _it_',
  'questions-short-answers-tags': 'Réponses courtes, _so_/_neither_ et _question tags_',
  'questions-indirect': 'Questions indirectes',
  'patterns-ing-or-to': 'Verbe + _-ing_ ou _to_',
  'patterns-purpose': 'Exprimer le but (_to_, _in order to_, _so that_)',
  'patterns-make-do': '_Make_ ou _do_',
  'nouns-pronouns-possessives': "Pronoms et possessifs (_I/me_, _my/mine_, _myself_, _-'s_)",
  'nouns-articles': 'Articles (_a/an_, _the_, article zéro)',
  'nouns-countable-uncountable': 'Dénombrables, indénombrables, pluriels et noms composés',
  'nouns-some-any-no': '_Some_, _any_, _no_ et leurs composés',
  'nouns-all-both-each': '_All_, _every_, _each_, _both_, _either_, _neither_',
  'nouns-quantity': '_Much_, _many_, _a lot_, _few_, _little_',
  'adj-adjectives-adverbs': 'Adjectifs et adverbes (_quick/quickly_, _good/well_, _bored/boring_)',
  'adj-comparison': 'Comparatifs et superlatifs',
  'adj-too-enough-so-such': '_Too_, _enough_, _so_, _such_, _quite_, _rather_',
  'adj-word-order': 'Ordre des mots',
  'prep-time': 'Prépositions de temps',
  'prep-place-movement': 'Prépositions de lieu et de mouvement',
  'prep-dependent': 'Prépositions après un nom, un adjectif ou un verbe',
  'prep-phrasal-verbs-basics': '_Phrasal verbs_ : sens et construction',
  'prep-phrasal-verbs-common': '_Phrasal verbs_ courants',
  'clauses-connectors': 'Connecteurs (_because_, _although_, _unless_, _in case_…)',
  'clauses-conditionals': 'Conditionnels (_if_)',
  'clauses-relative': 'Relatives',
  'clauses-wish': '_Wish_',
  'vocab-rise-raise': '_Rise_ ou _raise_',
  'vocab-lend-borrow': '_Lend_ ou _borrow_',
  'vocab-false-friends': 'Faux amis professionnels',
};

const red = (...units: number[]): NotionReference => ({ book: 'essential', units });
const blue = (...units: number[]): NotionReference => ({ book: 'grammar-in-use', units });

/**
 * References of the notions delivered so far (D-038): the 13 notions of phase
 * 3. Phase 8 adds those of its notions. A notion without an entry has none.
 */
export const NOTION_REFERENCES: Readonly<Partial<Record<NotionId, readonly NotionReference[]>>> = {
  'tense-present-continuous': [red(3, 4), blue(1)],
  'tense-present-simple': [red(5, 6, 7), blue(2)],
  'tense-present-simple-vs-continuous': [red(8), blue(3, 4)],
  'tense-past-simple': [red(10, 11, 12, 24), blue(5)],
  'tense-past-continuous': [red(13, 14), blue(6)],
  'tense-present-perfect': [red(15, 17), blue(7, 8)],
  'tense-just-already-yet-still': [red(16, 94), blue(111)],
  'tense-for-since-ago': [red(18, 19), blue(11, 12)],
  'tense-present-perfect-vs-past-simple': [red(20), blue(13, 14)],
  'tense-future': [red(26, 27, 28, 29), blue(19, 20, 21, 22, 23, 25)],
  'tense-present-perfect-continuous': [blue(9, 10)],
  'tense-past-perfect': [blue(15, 16)],
  'tense-review': [],
};
