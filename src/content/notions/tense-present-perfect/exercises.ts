import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf('tense-present-perfect', REVIEW);

const EXPERIENCE = 'Expérience, à un moment non précisé';
const RESULT = 'Résultat présent d’une action passée';
const UNFINISHED_PERIOD = 'Action dans une période pas encore terminée';
const PAST_POINT = 'Action à un moment passé précis';
const NOW = 'Action en cours maintenant';
const Q_EXPERIENCE = 'Question sur une expérience de la vie';
const Q_UNFINISHED = 'Question sur une période pas encore terminée';
const Q_PAST = 'Question sur un moment passé précis';
const Q_NOW = 'Question sur une action en cours';

/** Accepted American usage (D-035): the past simple with the same meaning. */
const AMERICAN_PAST = ' En anglais américain courant, le prétérit est aussi accepté dans ce cas.';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I ___ to Singapore twice.',
    options: ['have been', 'have went', 'have be'],
    answer: 'have been',
    reasons: [EXPERIENCE, PAST_POINT, NOW],
    reason: EXPERIENCE,
    explanation:
      'Une expérience, sans date : present perfect. Participe de _be_ : _been_ (_went_ est un prétérit).',
  }),
  choice(2, {
    sentence: 'She ___ her badge, so she can’t get into the building.',
    options: ['has lost', 'have lost', 'has losed'],
    answer: 'has lost',
    reasons: [RESULT, EXPERIENCE, NOW],
    reason: RESULT,
    explanation:
      'La perte a une conséquence maintenant (elle ne peut pas entrer). _She_ demande _has_ ; _lose_ : _lost_.',
  }),
  choice(3, {
    sentence: '___ you ever worked in a start-up?',
    options: ['Have', 'Has', 'Did'],
    answer: 'Have',
    reasons: [Q_EXPERIENCE, Q_PAST, Q_NOW],
    reason: Q_EXPERIENCE,
    explanation:
      '_Ever_ : question sur une expérience. Le participe _worked_ suit _have_ ; _did_ demanderait la base verbale.',
  }),
  choice(4, {
    sentence: 'We ___ three new clients this month.',
    options: ['have signed', 'has signed', 'have sign'],
    answer: 'have signed',
    reasons: [UNFINISHED_PERIOD, PAST_POINT, NOW],
    reason: UNFINISHED_PERIOD,
    explanation: '_This month_ n’est pas terminé : present perfect, _have signed_.',
  }),
  choice(5, {
    sentence: 'He ___ the report, so you can read it now.',
    options: ['has written', 'has wrote', 'have written'],
    answer: 'has written',
    reasons: [RESULT, EXPERIENCE, PAST_POINT],
    reason: RESULT,
    explanation:
      'Le rapport existe maintenant : résultat présent. Participe de _write_ : _written_.',
  }),
  choice(6, {
    sentence: 'I have never ___ sushi.',
    options: ['eaten', 'ate', 'eat'],
    answer: 'eaten',
    reasons: [EXPERIENCE, RESULT, PAST_POINT],
    reason: EXPERIENCE,
    explanation: '_Never_ : aucune expérience jusqu’à maintenant. Participe de _eat_ : _eaten_.',
  }),
  choice(7, {
    sentence: 'Our supplier ___ its prices this year.',
    options: ['has raised', 'has rose', 'has raise'],
    answer: 'has raised',
    reasons: [UNFINISHED_PERIOD, PAST_POINT, NOW],
    reason: UNFINISHED_PERIOD,
    explanation:
      '_This year_ n’est pas terminé. _Raise_ (augmenter quelque chose) est régulier : _raised_.',
  }),
  choice(8, {
    sentence: 'I ___ this film before, so let’s watch something else.',
    options: ['have seen', 'have saw', 'has seen'],
    answer: 'have seen',
    reasons: [EXPERIENCE, RESULT, NOW],
    reason: EXPERIENCE,
    explanation: '_Before_ : une expérience passée. Participe de _see_ : _seen_.',
  }),
  choice(9, {
    sentence: 'Look! Someone ___ the window.',
    options: ['has broken', 'has broke', 'have broken'],
    answer: 'has broken',
    reasons: [RESULT, EXPERIENCE, PAST_POINT],
    reason: RESULT,
    explanation: 'On voit le résultat maintenant. Participe de _break_ : _broken_.',
  }),
  choice(10, {
    sentence: 'She ___ in three different countries.',
    options: ['has lived', 'has live', 'have lived'],
    answer: 'has lived',
    reasons: [EXPERIENCE, NOW, PAST_POINT],
    reason: EXPERIENCE,
    explanation: 'Une expérience de vie, sans date : _has lived_.',
  }),
  choice(11, {
    sentence: 'How many interviews ___ this week?',
    options: ['have you had', 'have you have', 'you have had'],
    answer: 'have you had',
    reasons: [Q_UNFINISHED, Q_PAST, Q_NOW],
    reason: Q_UNFINISHED,
    explanation: '_This week_ n’est pas terminée. Question : _have_ + sujet + participe (_had_).',
  }),
  choice(12, {
    sentence: 'My manager ___ to Tokyo, so she isn’t in the office this week.',
    options: ['has gone', 'has went', 'have gone'],
    answer: 'has gone',
    reasons: [RESULT, EXPERIENCE, NOW],
    reason: RESULT,
    explanation:
      '_Gone_ : elle est partie et se trouve encore là-bas, d’où son absence. Participe de _go_ : _gone_.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'She ___ her keys, so she can’t open the door.',
    verb: 'lose',
    meaningFr: 'Elle a perdu ses clés, donc elle ne peut pas ouvrir la porte.',
    accepted: ['has lost', 'lost'],
    knownErrors: ['has losed', 'have lost'],
    explanation: 'Résultat présent : _has lost_.' + AMERICAN_PAST,
  }),
  fill(2, {
    sentence: 'We ___ a lot of progress this year.',
    verb: 'make',
    meaningFr: 'Nous avons fait beaucoup de progrès cette année.',
    accepted: ['have made'],
    knownErrors: ['have maked', 'has made', 'have make'],
    explanation: '_This year_ n’est pas terminée : _have made_ (participe irrégulier de _make_).',
  }),
  fill(3, {
    sentence: 'Have you ever ___ a marathon?',
    verb: 'run',
    meaningFr: 'As-tu déjà couru un marathon ?',
    accepted: ['run'],
    knownErrors: ['ran', 'runned'],
    explanation: 'Participe de _run_ : _run_ (le prétérit est _ran_).',
  }),
  fill(4, {
    sentence: 'He has never ___ to Asia.',
    verb: 'be',
    meaningFr: 'Il n’est jamais allé en Asie.',
    accepted: ['been'],
    knownErrors: ['went', 'be'],
    explanation: '« Aller quelque part » comme expérience : _have been to_.',
  }),
  fill(5, {
    sentence: 'I ___ the invoice, but I haven’t paid it.',
    verb: 'receive',
    meaningFr: 'J’ai reçu la facture, mais je ne l’ai pas payée.',
    accepted: ['have received'],
    knownErrors: ['has received', 'have receive'],
    explanation: 'Résultat présent : _have received_, avec _I_.',
  }),
  fill(6, {
    sentence: 'The share price ___ a lot this week.',
    verb: 'change',
    meaningFr: 'Le cours de l’action a beaucoup changé cette semaine.',
    accepted: ['has changed'],
    knownErrors: ['have changed', 'has change'],
    explanation: '_This week_ n’est pas terminée ; sujet singulier : _has changed_.',
  }),
  fill(7, {
    sentence: 'I ___ my password, so I can’t log in.',
    verb: 'forget',
    meaningFr: 'J’ai oublié mon mot de passe, donc je ne peux pas me connecter.',
    accepted: ['have forgotten', 'forgot'],
    knownErrors: ['has forgotten', 'have forget'],
    explanation: 'Résultat présent : _have forgotten_.' + AMERICAN_PAST,
  }),
  fill(8, {
    sentence: 'They ___ three offices this year.',
    verb: 'open',
    meaningFr: 'Ils ont ouvert trois bureaux cette année.',
    accepted: ['have opened'],
    knownErrors: ['has opened', 'have open'],
    explanation: '_This year_ n’est pas terminée : _have opened_.',
  }),
  fill(9, {
    sentence: 'She ___ the book, so she can give it back to you.',
    verb: 'read',
    meaningFr: 'Elle a lu le livre, donc elle peut te le rendre.',
    accepted: ['has read', 'read'],
    knownErrors: ['has readed', 'have read'],
    explanation: 'Résultat présent : _has read_ (participe identique à la base).' + AMERICAN_PAST,
  }),
  fill(10, {
    sentence: 'I ___ with this client many times.',
    verb: 'work',
    meaningFr: 'J’ai travaillé avec ce client de nombreuses fois.',
    accepted: ['have worked', 'worked'],
    knownErrors: ['has worked', 'have work'],
    explanation: 'Une expérience répétée, sans date : _have worked_.' + AMERICAN_PAST,
  }),
  transform(11, {
    source: 'You have worked abroad.',
    instructionFr: 'Pose la question avec « ever » : « As-tu déjà travaillé à l’étranger ? »',
    accepted: ['Have you ever worked abroad?', 'Did you ever work abroad?'],
    knownErrors: ['Did you ever worked abroad?', 'Have you ever work abroad?'],
    explanation: 'Question : _Have_ + sujet + _ever_ + participe.' + AMERICAN_PAST,
  }),
  transform(12, {
    source: 'She has met the CEO.',
    instructionFr: 'Mets la phrase à la forme négative.',
    accepted: ['She hasn’t met the CEO.'],
    knownErrors: ['She hasn’t meet the CEO.', 'She doesn’t have met the CEO.'],
    explanation: 'Négation : _hasn’t_ + participe passé, sans _do_.',
  }),
  transform(13, {
    source: 'I write two articles.',
    instructionFr: 'Mets la phrase au present perfect.',
    accepted: ['I have written two articles.'],
    knownErrors: ['I have wrote two articles.', 'I have writed two articles.'],
    explanation: 'Participe de _write_ : _written_.',
  }),
  transform(14, {
    source: 'He goes to Brazil.',
    instructionFr: 'Mets la phrase au present perfect : il est là-bas en ce moment.',
    accepted: ['He has gone to Brazil.'],
    knownErrors: ['He has went to Brazil.', 'He have gone to Brazil.'],
    explanation: '_Has gone_ : il est parti et n’est pas revenu.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'J’ai perdu mes clés, donc je ne peux pas rentrer chez moi.',
    hint: 'Une action passée dont la conséquence compte maintenant.',
    difficulty: 1,
    accepted: [
      'I’ve lost my keys, so I can’t get home.',
      'I’ve lost my keys, so I can’t go home.',
      'I’ve lost my keys, so I can’t get into my house.',
      'I’ve lost my keys, so I can’t get into my flat.',
      'I’ve lost my keys, so I can’t get back home.',
      'I lost my keys, so I can’t get home.',
      'I lost my keys, so I can’t go home.',
    ],
    knownErrors: ['I’ve losed my keys, so I can’t get home.'],
    explanation: 'Résultat présent : _I’ve lost_.' + AMERICAN_PAST,
  }),
  translate(2, {
    sentenceFr: 'As-tu déjà travaillé à l’étranger ?',
    hint: 'Question sur une expérience de la vie.',
    difficulty: 1,
    accepted: ['Have you ever worked abroad?', 'Did you ever work abroad?'],
    knownErrors: ['Have you ever work abroad?', 'Did you ever worked abroad?'],
    explanation:
      '« Déjà », pour une expérience, se dit _ever_ : _Have you ever worked abroad?_' +
      AMERICAN_PAST,
  }),
  translate(3, {
    sentenceFr: 'Je n’ai jamais vu ce graphique.',
    hint: 'Une expérience, à la forme négative.',
    difficulty: 1,
    accepted: [
      'I’ve never seen this chart.',
      'I’ve never seen that chart.',
      'I’ve never seen this graph.',
      'I’ve never seen that graph.',
      'I have not seen this chart before.',
    ],
    knownErrors: ['I’ve never saw this chart.', 'I haven’t never seen this chart.'],
    explanation: '_Never_ + participe : _I’ve never seen_. Pas de double négation.',
  }),
  translate(4, {
    sentenceFr: 'Elle a écrit trois articles cette année.',
    hint: 'Une période pas encore terminée.',
    difficulty: 1,
    accepted: [
      'She has written three articles this year.',
      'This year she has written three articles.',
      'She wrote three articles this year.',
    ],
    knownErrors: ['She has wrote three articles this year.'],
    explanation: '_This year_ n’est pas terminée : _has written_.' + AMERICAN_PAST,
  }),
  translate(5, {
    sentenceFr: 'Nous avons embauché deux stagiaires ce mois-ci.',
    hint: 'Une période pas encore terminée ; sujet _we_.',
    difficulty: 2,
    accepted: [
      'We’ve hired two interns this month.',
      'We’ve recruited two interns this month.',
      'This month we’ve hired two interns.',
      'We hired two interns this month.',
      'We recruited two interns this month.',
    ],
    knownErrors: ['We has hired two interns this month.'],
    explanation: '_This month_ n’est pas terminé : _we’ve hired_.' + AMERICAN_PAST,
  }),
  translate(6, {
    sentenceFr: 'Il est allé à Tokyo, il n’est pas au bureau cette semaine.',
    hint: 'Il est parti et se trouve encore là-bas.',
    difficulty: 2,
    accepted: [
      'He’s gone to Tokyo; he isn’t in the office this week.',
      'He’s gone to Tokyo, so he isn’t in the office this week.',
      'He’s gone to Tokyo; he’s not in the office this week.',
      'He’s gone to Tokyo, so he’s not in the office this week.',
      'He went to Tokyo; he isn’t in the office this week.',
      'He went to Tokyo, so he isn’t in the office this week.',
    ],
    knownErrors: ['He has went to Tokyo; he isn’t in the office this week.'],
    explanation:
      '_He’s gone to Tokyo_ : il y est encore (_he’s been to Tokyo_ voudrait dire qu’il en est revenu).',
  }),
  translate(7, {
    sentenceFr: 'J’ai rencontré votre directrice une fois.',
    hint: 'Une expérience, sans date.',
    difficulty: 2,
    accepted: [
      'I’ve met your director once.',
      'I’ve met your manager once.',
      'I met your director once.',
      'I met your manager once.',
    ],
    knownErrors: ['I’ve meet your director once.'],
    explanation: 'Une expérience : _I’ve met_ (participe irrégulier de _meet_).',
  }),
  translate(8, {
    sentenceFr: 'Est-ce qu’elle a fini le rapport ?',
    hint: 'Une question sur le résultat, maintenant.',
    difficulty: 2,
    accepted: [
      'Has she finished the report?',
      'Did she finish the report?',
      'Has she completed the report?',
    ],
    knownErrors: ['Has she finish the report?', 'Did she finished the report?'],
    explanation: 'Question : _Has she finished…?_' + AMERICAN_PAST,
  }),
  translate(9, {
    sentenceFr:
      'Je n’ai jamais travaillé dans une banque, mais j’ai fait deux stages dans l’assurance.',
    hint: 'Deux expériences, sans date, dont une à la forme négative.',
    difficulty: 3,
    accepted: [
      'I’ve never worked in a bank, but I’ve done two internships in insurance.',
      'I’ve never worked at a bank, but I’ve done two internships in insurance.',
      'I’ve never worked for a bank, but I’ve done two internships in insurance.',
      'I’ve never worked in a bank, but I’ve done two internships in the insurance sector.',
      'I’ve never worked in a bank, but I’ve had two internships in insurance.',
      'I never worked in a bank, but I did two internships in insurance.',
      'I’ve never worked in a bank but I’ve done two internships in insurance.',
    ],
    knownErrors: ['I’ve never worked in a bank, but I’ve did two internships in insurance.'],
    explanation: 'Deux expériences : _I’ve never worked_, _I’ve done_.' + AMERICAN_PAST,
  }),
  translate(10, {
    sentenceFr: 'Les prix ont beaucoup augmenté cette année, donc nous avons revu notre budget.',
    hint: 'Une période pas encore terminée, puis une conséquence.',
    difficulty: 3,
    accepted: [
      'Prices have risen a lot this year, so we have revised our budget.',
      'Prices have gone up a lot this year, so we have revised our budget.',
      'Prices have increased a lot this year, so we have revised our budget.',
      'Prices have risen a lot this year, so we have reviewed our budget.',
      'Prices have risen a lot this year, so we have adjusted our budget.',
      'Prices have risen a lot this year, so we have updated our budget.',
      'Prices have gone up a lot this year, so we have reviewed our budget.',
      'Prices rose a lot this year, so we revised our budget.',
      'Prices went up a lot this year, so we revised our budget.',
    ],
    knownErrors: [
      'Prices have raised a lot this year, so we have revised our budget.',
      'Prices have rose a lot this year, so we have revised our budget.',
    ],
    explanation:
      '_Have risen_ (participe de _rise_, sans complément), puis _have revised_.' + AMERICAN_PAST,
  }),
  translate(11, {
    sentenceFr: 'Combien de fois est-ce que tu es allé à Londres ?',
    hint: 'Une question sur une expérience répétée.',
    difficulty: 3,
    accepted: ['How many times have you been to London?', 'How often have you been to London?'],
    knownErrors: [
      'How many times have you went to London?',
      'How many times you have been to London?',
    ],
    explanation: 'Expérience : _have you been to_. Question : _have_ avant le sujet.',
  }),
];
