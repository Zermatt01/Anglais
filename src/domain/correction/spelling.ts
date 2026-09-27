/**
 * British and American spellings of the same word are both correct (NO-05,
 * docs/ARCHITECTURE.md §6). Each token is mapped to one canonical spelling
 * (the American one), on both sides of a comparison, so "organise" matches
 * "organize" and "colour" matches "color".
 *
 * The mapping is applied symmetrically, so a rule that also rewrites an
 * unrelated word ("promise" → "promize") is harmless: that word is rewritten
 * identically in the expected answer and in the learner's answer. A rule is only
 * dangerous if it merges two different real words; the generic rules below are
 * restricted to avoid that, and pairs such as "four"/"for" or "prise"/"prize"
 * are deliberately left out.
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

/** Endings allowed after an "-our" stem ("favourite", "neighbourhood"…). */
const OUR_SUFFIX =
  /^(?:|s|ed|ing|er|ers|ite|ites|able|ably|ful|fully|less|hood|hoods|ism|ist|ists|y)$/;

/**
 * "-ise" verbs and their family ("organise", "organised", "organisation"…).
 * The stem must have at least three letters, which leaves out short words such
 * as "rise", "wise", "raise" and "prise".
 */
const ISE_FAMILY = /^(\p{L}{3,})is(e|es|ed|ing|er|ers|ation|ations|ational)$/u;

/** "-yse" verbs: "analyse", "paralyse", "catalyse". */
const YSE_FAMILY = /^(\p{L}+)ys(e|es|ed|ing|er|ers)$/u;

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
  // -ence → -ense
  defence: 'defense',
  defences: 'defenses',
  offence: 'offense',
  offences: 'offenses',
  licence: 'license',
  licences: 'licenses',
  pretence: 'pretense',
  // practise (British verb) → practice
  practise: 'practice',
  practises: 'practices',
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

  const ise = ISE_FAMILY.exec(token);
  if (ise) return `${ise[1] ?? ''}iz${ise[2] ?? ''}`;

  const yse = YSE_FAMILY.exec(token);
  if (yse) return `${yse[1] ?? ''}yz${yse[2] ?? ''}`;

  return token;
}
