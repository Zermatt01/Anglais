/**
 * Closed lists the correction prompt gives the model (AI-03): the 50 notion
 * identifiers of docs/PEDAGOGY.md §11 and the 15 error categories of TAX-01.
 * `src/domain` tests keep both lists identical to the domain's, in the same
 * order. An output that cites anything else is rejected by the schemas.
 */

export const CONTRACT_NOTION_IDS = [
  'tense-present-continuous',
  'tense-present-simple',
  'tense-present-simple-vs-continuous',
  'tense-have-got',
  'tense-past-simple',
  'tense-past-continuous',
  'tense-present-perfect',
  'tense-just-already-yet-still',
  'tense-for-since-ago',
  'tense-present-perfect-vs-past-simple',
  'tense-used-to',
  'tense-future',
  'tense-present-perfect-continuous',
  'tense-past-perfect',
  'tense-future-continuous-perfect',
  'tense-review',
  'verbs-passive',
  'verbs-modals',
  'verbs-polite-requests',
  'verbs-say-tell',
  'verbs-reported-speech',
  'questions-do-negations',
  'questions-there-is-it',
  'questions-short-answers-tags',
  'questions-indirect',
  'patterns-ing-or-to',
  'patterns-purpose',
  'patterns-make-do',
  'nouns-pronouns-possessives',
  'nouns-articles',
  'nouns-countable-uncountable',
  'nouns-some-any-no',
  'nouns-all-both-each',
  'nouns-quantity',
  'adj-adjectives-adverbs',
  'adj-comparison',
  'adj-too-enough-so-such',
  'adj-word-order',
  'prep-time',
  'prep-place-movement',
  'prep-dependent',
  'prep-phrasal-verbs-basics',
  'prep-phrasal-verbs-common',
  'clauses-connectors',
  'clauses-conditionals',
  'clauses-relative',
  'clauses-wish',
  'vocab-rise-raise',
  'vocab-lend-borrow',
  'vocab-false-friends',
] as const;
export type ContractNotionId = (typeof CONTRACT_NOTION_IDS)[number];

export const CONTRACT_ERROR_CATEGORIES = [
  'temps_verbaux',
  'accord_sujet_verbe',
  'auxiliaires_questions_negations',
  'articles',
  'indenombrables_pluriels',
  'prepositions',
  'ordre_des_mots',
  'faux_amis',
  'calques_du_francais',
  'choix_lexical_collocations',
  'registre_ton',
  'connecteurs_structure',
  'orthographe',
  'ponctuation',
  'prononciation',
] as const;
export type ContractErrorCategory = (typeof CONTRACT_ERROR_CATEGORIES)[number];

/** Levels of the Common European Framework, from the lowest. */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];
