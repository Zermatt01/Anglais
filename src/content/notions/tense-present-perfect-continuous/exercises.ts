import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf(
  'tense-present-perfect-continuous',
  REVIEW,
);

const DURATION = 'Activité qui dure jusqu’à maintenant (accent sur la durée)';
const TRACE = 'Activité récente dont on voit encore la conséquence';
const RESULT = 'Résultat ou quantité : present perfect simple';
const STATE = 'Verbe d’état : pas de forme continue';
const Q_DURATION = 'Question sur une activité qui dure jusqu’à maintenant';
const Q_RESULT = 'Question sur un résultat ou une quantité';
const Q_HABIT = 'Question sur une habitude';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I ___ for the bus for twenty minutes.',
    options: ['have been waiting', 'have been wait', 'has been waiting'],
    answer: 'have been waiting',
    reasons: [DURATION, RESULT, TRACE],
    reason: DURATION,
    explanation: 'L’attente dure depuis vingt minutes : _have been waiting_ (avec _I_, _have_).',
  }),
  choice(2, {
    sentence: 'You look tired. — Yes, I ___ all night.',
    options: ['have been working', 'have been worked', 'have working'],
    answer: 'have been working',
    reasons: [TRACE, RESULT, STATE],
    reason: TRACE,
    explanation: 'La fatigue est la trace d’une activité récente : _have been working_.',
  }),
  choice(3, {
    sentence: 'She ___ three reports this week.',
    options: ['has written', 'has wrote', 'has been wrote'],
    answer: 'has written',
    reasons: [RESULT, DURATION, TRACE],
    reason: RESULT,
    explanation: 'Une quantité terminée (trois rapports) : present perfect simple, _has written_.',
  }),
  choice(4, {
    sentence: 'How long ___ Spanish?',
    options: ['have you been learning', 'have you been learn', 'you have been learning'],
    answer: 'have you been learning',
    reasons: [Q_DURATION, Q_RESULT, Q_HABIT],
    reason: Q_DURATION,
    explanation: '_How long_ + present perfect continu ; _have_ passe avant le sujet.',
  }),
  choice(5, {
    sentence: 'I ___ him for ten years.',
    options: ['have known', 'have been knowing', 'am knowing'],
    answer: 'have known',
    reasons: [STATE, DURATION, TRACE],
    reason: STATE,
    explanation: '_Know_ est un verbe d’état : present perfect simple, même avec une durée.',
  }),
  choice(6, {
    sentence: 'It ___ all day, so the roads are wet.',
    options: ['has been raining', 'has been rained', 'have been raining'],
    answer: 'has been raining',
    reasons: [TRACE, RESULT, STATE],
    reason: TRACE,
    explanation: 'Les routes mouillées sont la trace de la pluie : _has been raining_.',
  }),
  choice(7, {
    sentence: 'Prices ___ since January.',
    options: ['have been rising', 'has been rising', 'have been rise'],
    answer: 'have been rising',
    reasons: [DURATION, STATE, RESULT],
    reason: DURATION,
    explanation: 'La hausse dure depuis janvier ; _prices_ est au pluriel : _have been rising_.',
  }),
  choice(8, {
    sentence: 'Sorry I’m late. ___ long?',
    options: ['Have you been waiting', 'Have you waiting', 'Are you been waiting'],
    answer: 'Have you been waiting',
    reasons: [Q_DURATION, Q_RESULT, Q_HABIT],
    reason: Q_DURATION,
    explanation: 'Question sur la durée de l’attente, jusqu’à maintenant.',
  }),
  choice(9, {
    sentence: 'We ___ on this project since March.',
    options: ['have been working', 'are working', 'have been work'],
    answer: 'have been working',
    reasons: [DURATION, RESULT, TRACE],
    reason: DURATION,
    explanation:
      '_Since March_ : l’activité dure jusqu’à maintenant. Le présent seul ne convient pas.',
  }),
  choice(10, {
    sentence: 'My eyes are red because I ___ at a screen all day.',
    options: ['have been looking', 'have been look', 'has been looking'],
    answer: 'have been looking',
    reasons: [TRACE, RESULT, STATE],
    reason: TRACE,
    explanation: 'Les yeux rouges sont la trace de l’activité : _have been looking_.',
  }),
  choice(11, {
    sentence: 'How many emails ___ today?',
    options: ['have you sent', 'have you been sent', 'have you sending'],
    answer: 'have you sent',
    reasons: [Q_RESULT, Q_DURATION, Q_HABIT],
    reason: Q_RESULT,
    explanation: '_How many_ : une quantité, donc present perfect simple.',
  }),
  choice(12, {
    sentence: 'He ___ from home lately.',
    options: ['has been working', 'has been work', 'have been working'],
    answer: 'has been working',
    reasons: [DURATION, RESULT, STATE],
    reason: DURATION,
    explanation: '_Lately_ : une activité récente qui dure. _He_ demande _has_.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'I ___ for this company for five years.',
    verb: 'work',
    meaningFr: 'Je travaille pour cette entreprise depuis cinq ans.',
    accepted: ['have been working', 'have worked'],
    knownErrors: ['am working', 'work', 'have working'],
    explanation: 'Durée jusqu’à maintenant : _have been working_ (ou _have worked_).',
  }),
  fill(2, {
    sentence: 'She ___ English since she was six.',
    verb: 'learn',
    meaningFr: 'Elle apprend l’anglais depuis l’âge de six ans.',
    accepted: ['has been learning', 'has learned'],
    knownErrors: ['is learning', 'learns', 'has been learn'],
    explanation: '_Since_ + activité qui continue : _has been learning_.',
  }),
  fill(3, {
    sentence: 'You’re wet! ___ in the rain?',
    verb: 'you / walk',
    meaningFr: 'Tu es trempé ! Tu as marché sous la pluie ?',
    accepted: ['Have you been walking'],
    knownErrors: ['Have you walking', 'You have been walking'],
    explanation: 'Une trace visible (tu es trempé) : _Have you been walking…?_',
  }),
  fill(4, {
    sentence: 'The team ___ the data all morning.',
    verb: 'clean',
    meaningFr: 'L’équipe a passé toute la matinée à nettoyer les données.',
    accepted: ['has been cleaning', 'have been cleaning'],
    knownErrors: ['has been clean', 'has cleaning'],
    explanation:
      'Activité qui dure (_all morning_) : _has been cleaning_. En anglais britannique, _team_ admet aussi le pluriel.',
  }),
  fill(5, {
    sentence: 'How long ___ for the bus?',
    verb: 'they / wait',
    meaningFr: 'Depuis combien de temps attendent-ils le bus ?',
    accepted: ['have they been waiting', 'have they waited'],
    knownErrors: ['have they waiting', 'they have been waiting'],
    explanation: '_How long_ + present perfect continu : _have they been waiting_.',
  }),
  fill(6, {
    sentence: 'I ___ well recently.',
    verb: 'sleep (à la forme négative)',
    meaningFr: 'Je ne dors pas bien ces derniers temps.',
    accepted: ['haven’t been sleeping', 'haven’t slept'],
    knownErrors: ['haven’t been sleep', 'hasn’t been sleeping'],
    explanation: '_Recently_ : _haven’t been sleeping_ (ou _haven’t slept_).',
  }),
  fill(7, {
    sentence: 'Interest rates ___ for months.',
    verb: 'fall',
    meaningFr: 'Les taux d’intérêt baissent depuis des mois.',
    accepted: ['have been falling', 'have fallen'],
    knownErrors: ['are falling', 'have been fall', 'has been falling'],
    explanation:
      '_For months_ : _have been falling_. Le présent seul ne va pas avec _for_ + durée.',
  }),
  fill(8, {
    sentence: 'I ___ her since university.',
    verb: 'know',
    meaningFr: 'Je la connais depuis l’université.',
    accepted: ['have known'],
    knownErrors: ['have been knowing', 'know'],
    explanation: '_Know_ est un verbe d’état : _have known_, jamais au continu.',
  }),
  fill(9, {
    sentence: 'She’s tired because she ___ all day.',
    verb: 'teach',
    meaningFr: 'Elle est fatiguée parce qu’elle a fait cours toute la journée.',
    accepted: ['has been teaching'],
    knownErrors: ['has been teached', 'has teaching'],
    explanation: 'La fatigue est la trace de l’activité : _has been teaching_.',
  }),
  fill(10, {
    sentence: 'We ___ three new analysts this year.',
    verb: 'hire',
    meaningFr: 'Nous avons embauché trois nouveaux analystes cette année.',
    accepted: ['have hired'],
    knownErrors: ['have been hired'],
    explanation:
      'Une quantité (trois analystes) : present perfect simple. _Have been hired_ voudrait dire « avons été embauchés ».',
  }),
  transform(11, {
    source: 'I work here.',
    instructionFr: 'Mets la phrase au present perfect continu, avec « for two years » à la fin.',
    accepted: ['I have been working here for two years.'],
    knownErrors: ['I am working here for two years.', 'I have working here for two years.'],
    explanation: 'Present perfect continu : _have been working_ + _for_ + durée.',
  }),
  transform(12, {
    source: 'She has been waiting for a long time.',
    instructionFr: 'Mets la phrase à la forme interrogative.',
    accepted: ['Has she been waiting for a long time?'],
    knownErrors: ['Is she been waiting for a long time?', 'Has she waiting for a long time?'],
    explanation: 'Question : _Has_ + sujet + _been_ + verbe en _-ing_.',
  }),
  transform(13, {
    source: 'I have been knowing him for years.',
    instructionFr: 'Corrige la phrase : « know » est un verbe d’état.',
    accepted: ['I have known him for years.'],
    knownErrors: ['I know him for years.'],
    explanation: 'Verbe d’état : present perfect simple, _have known_.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'J’attends depuis une heure.',
    hint: 'Une activité qui dure jusqu’à maintenant ; « depuis » + une durée.',
    difficulty: 1,
    accepted: ['I’ve been waiting for an hour.', 'I’ve waited for an hour.'],
    knownErrors: [
      'I’m waiting since an hour.',
      'I wait since one hour.',
      'I’m waiting for an hour.',
    ],
    explanation: '_I’ve been waiting for an hour_ : present perfect continu + _for_.',
  }),
  translate(2, {
    sentenceFr: 'Il pleut depuis ce matin.',
    hint: '« Depuis » + un point de départ ; l’activité dure.',
    difficulty: 1,
    accepted: ['It’s been raining since this morning.'],
    knownErrors: ['It rains since this morning.', 'It’s raining since this morning.'],
    explanation: '_It’s been raining since this morning._',
  }),
  translate(3, {
    sentenceFr: 'Depuis combien de temps travailles-tu ici ?',
    hint: 'Question sur une durée qui va jusqu’à maintenant.',
    difficulty: 1,
    accepted: ['How long have you been working here?', 'How long have you worked here?'],
    knownErrors: ['Since when do you work here?', 'Since how long do you work here?'],
    explanation: '_How long have you been working here?_',
  }),
  translate(4, {
    sentenceFr: 'Tu as l’air fatigué. Tu as travaillé tard ?',
    hint: 'Une trace visible d’une activité récente.',
    difficulty: 1,
    accepted: [
      'You look tired. Have you been working late?',
      'You look tired. Did you work late?',
      'You look tired. Were you working late?',
    ],
    knownErrors: ['You look tired. Have you been work late?'],
    explanation: 'La fatigue est une trace : _Have you been working late?_',
  }),
  translate(5, {
    sentenceFr: 'Nous préparons ce lancement depuis trois mois.',
    hint: 'Une activité qui dure jusqu’à maintenant.',
    difficulty: 2,
    accepted: [
      'We’ve been preparing this launch for three months.',
      'We’ve been preparing for this launch for three months.',
      'We’ve been working on this launch for three months.',
      'We’ve been preparing the launch for three months.',
    ],
    knownErrors: [
      'We prepare this launch since three months.',
      'We are preparing this launch for three months.',
    ],
    explanation: '_We’ve been preparing… for three months_.',
  }),
  translate(6, {
    sentenceFr: 'Les prix augmentent depuis le début de l’année.',
    hint: 'Une évolution qui dure depuis un point de départ.',
    difficulty: 2,
    accepted: [
      'Prices have been rising since the beginning of the year.',
      'Prices have been going up since the beginning of the year.',
      'Prices have been increasing since the beginning of the year.',
      'Prices have been rising since the start of the year.',
      'Prices have been going up since the start of the year.',
      'Prices have risen since the beginning of the year.',
    ],
    knownErrors: [
      'Prices are rising since the beginning of the year.',
      'Prices have been raising since the beginning of the year.',
    ],
    explanation: '_Have been rising_ ; _rise_ (sans complément), et non _raise_.',
  }),
  translate(7, {
    sentenceFr: 'Elle apprend l’allemand depuis deux ans.',
    hint: 'Une activité qui dure ; « depuis » + une durée.',
    difficulty: 2,
    accepted: [
      'She’s been learning German for two years.',
      'She’s been studying German for two years.',
    ],
    knownErrors: ['She learns German since two years.', 'She is learning German for two years.'],
    explanation: '_She’s been learning German for two years._',
  }),
  translate(8, {
    sentenceFr: 'Je connais ce client depuis longtemps.',
    hint: 'Verbe d’état : pas de forme continue.',
    difficulty: 2,
    accepted: [
      'I’ve known this client for a long time.',
      'I’ve known that client for a long time.',
      'I’ve known this customer for a long time.',
      'I’ve known this client for ages.',
      'I’ve known this client for years.',
    ],
    knownErrors: [
      'I’ve been knowing this client for a long time.',
      'I know this client since a long time.',
    ],
    explanation: 'Verbe d’état : _I’ve known_, même avec une durée.',
  }),
  translate(9, {
    sentenceFr:
      'Nous travaillons sur ce modèle depuis des semaines, et nous avons enfin trouvé l’erreur.',
    hint: 'Une activité qui dure, puis un résultat.',
    difficulty: 3,
    accepted: [
      'We’ve been working on this model for weeks, and we’ve finally found the error.',
      'We’ve been working on this model for weeks, and we’ve finally found the mistake.',
      'We’ve been working on this model for weeks and we’ve finally found the error.',
      'We’ve been working on this model for weeks, and we finally found the error.',
      'We’ve been working on this model for weeks, and we have at last found the error.',
    ],
    knownErrors: ['We work on this model since weeks, and we’ve finally found the error.'],
    explanation:
      'Durée de l’activité : _have been working_. Résultat : _have found_ (present perfect simple).',
  }),
  translate(10, {
    sentenceFr: 'Depuis combien de temps est-ce que tu attends la réponse de la banque ?',
    hint: 'Question sur une attente qui dure jusqu’à maintenant.',
    difficulty: 3,
    accepted: [
      'How long have you been waiting for the bank’s answer?',
      'How long have you been waiting for the bank’s reply?',
      'How long have you been waiting for the bank’s response?',
      'How long have you been waiting for an answer from the bank?',
      'How long have you been waiting for a reply from the bank?',
      'How long have you been waiting to hear from the bank?',
    ],
    knownErrors: ['Since how long are you waiting for the bank’s answer?'],
    explanation: '_How long have you been waiting for…?_',
  }),
  translate(11, {
    sentenceFr: 'J’ai écrit des e-mails toute la matinée ; j’en ai envoyé quarante.',
    hint: 'La durée d’une activité, puis une quantité.',
    difficulty: 3,
    accepted: [
      'I’ve been writing emails all morning; I’ve sent forty.',
      'I’ve been writing emails all morning; I’ve sent 40.',
      'I’ve been writing emails all morning; I’ve sent forty of them.',
      'I’ve been writing emails all morning; I’ve sent 40 of them.',
      'I’ve been writing emails all morning, and I’ve sent forty.',
      'I’ve been writing emails all morning, and I’ve sent forty of them.',
    ],
    knownErrors: ['I’ve been write emails all morning; I’ve sent forty.'],
    explanation: 'Activité : _have been writing_. Quantité : _have sent_ (simple).',
  }),
];
