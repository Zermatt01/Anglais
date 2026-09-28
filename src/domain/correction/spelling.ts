/**
 * British and American spellings of the same word are both correct (NO-05,
 * docs/ARCHITECTURE.md §6). Each token is mapped to one canonical spelling
 * (the American one), on both sides of a comparison, so "organise" matches
 * "organize" and "colour" matches "color".
 *
 * Only attested pairs are merged: two spellings of the same word. No generic
 * rule may rewrite other words, since a rewrite would also accept misspellings
 * ("exercize", "surprize"). Spellings that depend on grammar are never merged
 * either: British "practise" is a verb only, and "analyses" is both a verb and
 * the plural noun of "analysis". These are listed in
 * `CONTEXT_DEPENDENT_SPELLINGS`: an answer key using them must list both
 * spellings as variants, otherwise the other one is "unknown", never "incorrect".
 */

/** Stems ending in "-our" whose American spelling ends in "-or". */
const OUR_STEMS = [
  'armour',
  'behaviour',
  'colour',
  'endeavour',
  'favour',
  'flavour',
  'harbour',
  'honour',
  'humour',
  'labour',
  'neighbour',
  'odour',
  'parlour',
  'rigour',
  'rumour',
  'saviour',
  'savour',
  'tumour',
  'valour',
  'vapour',
  'vigour',
] as const;

/**
 * Endings after which both spellings keep the "-our"/"-or" difference
 * ("favourite", "neighbourhood", "behavioural"). Endings where British English
 * drops the "u" too ("humorous", "vigorous", "honorary") are excluded, so that
 * "humourous" stays a misspelling.
 */
const OUR_SUFFIX =
  /^(?:|s|ed|ing|er|ers|ite|ites|able|ably|al|ally|ful|fully|less|hood|hoods|ism|ist|ists|y)$/;

/**
 * Words spelt "-ise" in British English and "-ize" in American English. Words
 * spelt "-ise" in both varieties (advertise, advise, comprise, compromise,
 * devise, exercise, franchise, improvise, merchandise, premise, promise,
 * revise, supervise, surprise, televise…) are deliberately absent.
 */
const ISE_STEMS = [
  'apolog',
  'author',
  'capital',
  'categor',
  'central',
  'character',
  'civil',
  'critic',
  'custom',
  'digit',
  'econom',
  'emphas',
  'energ',
  'familiar',
  'final',
  'formal',
  'general',
  'global',
  'harmon',
  'hospital',
  'ideal',
  'industrial',
  'item',
  'jeopard',
  'legal',
  'local',
  'marginal',
  'maxim',
  'memor',
  'minim',
  'mobil',
  'modern',
  'monet',
  'neutral',
  'normal',
  'optim',
  'organ',
  'patron',
  'penal',
  'personal',
  'polar',
  'popular',
  'priorit',
  'privat',
  'public',
  'rational',
  'real',
  'recogn',
  'revital',
  'scrutin',
  'special',
  'stabil',
  'standard',
  'subsid',
  'summar',
  'symbol',
  'sympath',
  'synchron',
  'theor',
  'util',
  'visual',
] as const;

const ISE_ENDINGS = [
  'ise',
  'ises',
  'ised',
  'ising',
  'iser',
  'isers',
  'isation',
  'isations',
  'isational',
] as const;

/**
 * Pairs whose spelling depends on the grammatical role, never merged (see the
 * module comment). Content tests can use this list to require both variants.
 */
export const CONTEXT_DEPENDENT_SPELLINGS: readonly (readonly [
  british: string,
  american: string,
])[] = [
  ['practise', 'practice'],
  ['practises', 'practices'],
  ['licence', 'license'],
  ['licences', 'licenses'],
  ['analyses', 'analyzes'],
  ['paralyses', 'paralyzes'],
  ['catalyses', 'catalyzes'],
];

/** Whole-word pairs, British (or variant) spelling → canonical spelling. */
const WORD_PAIRS: Readonly<Record<string, string>> = {
  // -re → -er
  centre: 'center',
  centres: 'centers',
  centred: 'centered',
  centring: 'centering',
  metre: 'meter',
  metres: 'meters',
  kilometre: 'kilometer',
  kilometres: 'kilometers',
  centimetre: 'centimeter',
  centimetres: 'centimeters',
  millimetre: 'millimeter',
  millimetres: 'millimeters',
  litre: 'liter',
  litres: 'liters',
  theatre: 'theater',
  theatres: 'theaters',
  fibre: 'fiber',
  fibres: 'fibers',
  calibre: 'caliber',
  spectre: 'specter',
  sombre: 'somber',
  meagre: 'meager',
  lustre: 'luster',
  manoeuvre: 'maneuver',
  manoeuvres: 'maneuvers',
  manoeuvred: 'maneuvered',
  // -yse → -yze, verb forms only ("analyses" is also a plural noun)
  analyse: 'analyze',
  analysed: 'analyzed',
  analysing: 'analyzing',
  analyser: 'analyzer',
  analysers: 'analyzers',
  paralyse: 'paralyze',
  paralysed: 'paralyzed',
  paralysing: 'paralyzing',
  catalyse: 'catalyze',
  catalysed: 'catalyzed',
  catalysing: 'catalyzing',
  // Doubled consonant before a suffix
  travelled: 'traveled',
  travelling: 'traveling',
  traveller: 'traveler',
  travellers: 'travelers',
  cancelled: 'canceled',
  cancelling: 'canceling',
  labelled: 'labeled',
  labelling: 'labeling',
  modelled: 'modeled',
  modelling: 'modeling',
  levelled: 'leveled',
  levelling: 'leveling',
  fuelled: 'fueled',
  fuelling: 'fueling',
  signalled: 'signaled',
  signalling: 'signaling',
  channelled: 'channeled',
  channelling: 'channeling',
  totalled: 'totaled',
  totalling: 'totaling',
  counsellor: 'counselor',
  counsellors: 'counselors',
  counselling: 'counseling',
  marvellous: 'marvelous',
  jewellery: 'jewelry',
  woollen: 'woolen',
  // Single consonant in British English
  enrol: 'enroll',
  enrols: 'enrolls',
  enrolment: 'enrollment',
  enrolments: 'enrollments',
  fulfil: 'fulfill',
  fulfils: 'fulfills',
  fulfilment: 'fulfillment',
  skilful: 'skillful',
  skilfully: 'skillfully',
  wilful: 'willful',
  instalment: 'installment',
  instalments: 'installments',
  distil: 'distill',
  // -ence → -ense (nouns in both varieties)
  defence: 'defense',
  defences: 'defenses',
  offence: 'offense',
  offences: 'offenses',
  pretence: 'pretense',
  // Verb forms of British "practise" (not "practise"/"practises", see above)
  practised: 'practiced',
  practising: 'practicing',
  // -ogue → -og
  catalogue: 'catalog',
  catalogues: 'catalogs',
  dialogue: 'dialog',
  dialogues: 'dialogs',
  analogue: 'analog',
  // Silent e and other single-word differences
  judgement: 'judgment',
  judgements: 'judgments',
  acknowledgement: 'acknowledgment',
  acknowledgements: 'acknowledgments',
  ageing: 'aging',
  programme: 'program',
  programmes: 'programs',
  grey: 'gray',
  sceptical: 'skeptical',
  sceptic: 'skeptic',
  mould: 'mold',
  plough: 'plow',
  cosy: 'cozy',
  aluminium: 'aluminum',
  pyjamas: 'pajamas',
  moustache: 'mustache',
  aeroplane: 'airplane',
  aeroplanes: 'airplanes',
  maths: 'math',
  paediatric: 'pediatric',
  foetus: 'fetus',
  // Both past forms are correct: British "-t", American "-ed"
  learnt: 'learned',
  burnt: 'burned',
  dreamt: 'dreamed',
  spelt: 'spelled',
  spoilt: 'spoiled',
  leapt: 'leaped',
  knelt: 'kneeled',
  // Both forms are correct in both varieties
  towards: 'toward',
  afterwards: 'afterward',
  // -ise → -ize, generated from the attested stems
  ...Object.fromEntries(
    ISE_STEMS.flatMap((stem) =>
      ISE_ENDINGS.map((ending) => [`${stem}${ending}`, `${stem}iz${ending.slice(2)}`]),
    ),
  ),
};

/** Canonical spelling of one normalized (lowercase) token. */
export function canonicalSpelling(token: string): string {
  const pair = WORD_PAIRS[token];
  if (pair !== undefined) return pair;

  for (const stem of OUR_STEMS) {
    if (token.startsWith(stem) && OUR_SUFFIX.test(token.slice(stem.length))) {
      return `${stem.slice(0, -2)}r${token.slice(stem.length)}`;
    }
  }
  return token;
}
