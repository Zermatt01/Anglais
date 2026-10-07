import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, place, translate } = exercisesOf(
  'tense-present-continuous',
  REVIEW,
);

const NOW = 'Action en cours au moment où l’on parle';
const TEMPORARY = 'Situation temporaire, vraie en ce moment';
const TREND = 'Évolution en cours, qui change peu à peu';
const HABIT = 'Habitude ou fait permanent';
const FINISHED = 'Action terminée dans le passé';
const Q_NOW = 'Question sur une activité en cours en ce moment';
const Q_HABIT = 'Question sur une habitude';
const Q_PAST = 'Question sur le passé';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'Can you call back later? Sarah ___ a presentation to the board right now.',
    options: ['is giving', 'gives', 'is give'],
    answer: 'is giving',
    reasons: [NOW, HABIT, FINISHED],
    reason: NOW,
    explanation:
      'On demande de rappeler plus tard : la présentation a lieu en ce moment. Forme : _is_ + _giving_.',
  }),
  choice(2, {
    sentence: 'The share price ___ steadily at the moment, so we’re waiting before we buy.',
    options: ['is falling', 'falls', 'falling'],
    answer: 'is falling',
    reasons: [TREND, HABIT, FINISHED],
    reason: TREND,
    explanation:
      '_At the moment_ : le cours baisse peu à peu, en ce moment. C’est une évolution en cours.',
  }),
  choice(3, {
    sentence: 'I ___ from home this week because our office is closed.',
    options: ['am working', 'am work', 'working'],
    answer: 'am working',
    reasons: [TEMPORARY, HABIT, FINISHED],
    reason: TEMPORARY,
    explanation:
      '_This week_ : la situation est limitée dans le temps. Forme complète : _am_ + _working_.',
  }),
  choice(4, {
    sentence: 'Listen! The fire alarm ___.',
    options: ['is ringing', 'rings', 'ringing'],
    answer: 'is ringing',
    reasons: [NOW, HABIT, FINISHED],
    reason: NOW,
    explanation: '_Listen!_ attire l’attention sur ce qui se passe à l’instant.',
  }),
  choice(5, {
    sentence: 'More and more banks ___ AI to detect fraud.',
    options: ['are using', 'is using', 'using'],
    answer: 'are using',
    reasons: [TREND, HABIT, FINISHED],
    reason: TREND,
    explanation:
      '_More and more_ signale un changement progressif. Le sujet _banks_ est au pluriel : _are using_.',
  }),
  choice(6, {
    sentence: 'What ___ on at the moment? — A fraud detection model.',
    options: ['are you working', 'do you working', 'you are working'],
    answer: 'are you working',
    reasons: [Q_NOW, Q_HABIT, Q_PAST],
    reason: Q_NOW,
    explanation:
      'Question au présent continu : _are_ + sujet + verbe en _-ing_. _At the moment_ : l’activité de ces jours-ci.',
  }),
  choice(7, {
    sentence: 'She ___ her thesis on central bank policy this semester.',
    options: ['is writing', 'are writing', 'writing'],
    answer: 'is writing',
    reasons: [TEMPORARY, HABIT, FINISHED],
    reason: TEMPORARY,
    explanation: '_This semester_ : une période limitée. Le sujet _she_ demande _is_.',
  }),
  choice(8, {
    sentence: 'Sorry, I can’t talk now — I ___.',
    options: ['am driving', 'drive', 'driving'],
    answer: 'am driving',
    reasons: [NOW, HABIT, FINISHED],
    reason: NOW,
    explanation:
      'On ne peut pas parler maintenant, parce que l’action est en cours : _am driving_.',
  }),
  choice(9, {
    sentence: 'Please be quiet: the students ___ an exam right now.',
    options: ['are taking', 'take', 'is taking'],
    answer: 'are taking',
    reasons: [NOW, HABIT, FINISHED],
    reason: NOW,
    explanation:
      '_Right now_ : l’examen a lieu en ce moment. _Students_ est au pluriel : _are taking_.',
  }),
  choice(10, {
    sentence: 'Unemployment ___ in several regions this year.',
    options: ['is rising', 'are rising', 'rising'],
    answer: 'is rising',
    reasons: [TREND, HABIT, FINISHED],
    reason: TREND,
    explanation:
      'Le chômage change peu à peu : évolution en cours. _Unemployment_ est singulier : _is rising_.',
  }),
  choice(11, {
    sentence: 'Why ___ at me like that? Is something wrong?',
    options: ['are you looking', 'do you looking', 'you are looking'],
    answer: 'are you looking',
    reasons: [Q_NOW, Q_HABIT, Q_PAST],
    reason: Q_NOW,
    explanation: 'On parle de ce qui se passe maintenant : _are_ + sujet + _looking_.',
  }),
  choice(12, {
    sentence: 'My manager ___ in Singapore until Friday, so he’s answering emails at night.',
    options: ['is staying', 'are staying', 'staying'],
    answer: 'is staying',
    reasons: [TEMPORARY, HABIT, FINISHED],
    reason: TEMPORARY,
    explanation: '_Until Friday_ : un séjour limité, donc une situation temporaire.',
  }),
  choice(13, {
    sentence: 'The printer ___ at the moment, so use the one on the second floor.',
    options: ['isn’t working', 'aren’t working', 'not working'],
    answer: 'isn’t working',
    reasons: [TEMPORARY, HABIT, FINISHED],
    reason: TEMPORARY,
    explanation:
      'Une panne passagère : situation temporaire. Négation : _isn’t_ + verbe en _-ing_ (_printer_ est singulier).',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'Please be quiet: the manager ___ to a client.',
    verb: 'talk',
    meaningFr: 'Silence, s’il vous plaît : la responsable parle avec un client.',
    accepted: ['is talking'],
    knownErrors: ['talks', 'is talk', 'talking'],
    explanation: 'L’action a lieu maintenant : _is_ + _talking_.',
  }),
  fill(2, {
    sentence: 'I ___ a new course on data visualisation this term.',
    verb: 'teach',
    meaningFr: 'Je donne un nouveau cours de visualisation de données ce trimestre.',
    accepted: ['am teaching'],
    knownErrors: ['am teach', 'teaching'],
    explanation: '_This term_ : une situation temporaire. _Teach_ devient _teaching_.',
  }),
  fill(3, {
    sentence: 'Look! It ___ again.',
    verb: 'snow',
    meaningFr: 'Regarde ! Il neige encore.',
    accepted: ['is snowing'],
    knownErrors: ['snows', 'snowing'],
    explanation: '_Look!_ : on montre ce qui se passe à l’instant.',
  }),
  fill(4, {
    sentence: 'We ___ the budget at the moment, so the figures may change.',
    verb: 'review',
    meaningFr: 'Nous révisons le budget en ce moment, donc les chiffres peuvent changer.',
    accepted: ['are reviewing'],
    knownErrors: ['are review', 'reviewing'],
    explanation: '_At the moment_ : le travail est en cours. _We_ demande _are_.',
  }),
  fill(5, {
    sentence: 'Prices ___ faster than wages this year.',
    verb: 'rise',
    meaningFr: 'Les prix augmentent plus vite que les salaires cette année.',
    accepted: ['are rising'],
    knownErrors: ['is rising', 'rising', 'are raising'],
    explanation:
      'Évolution en cours : _are rising_. Attention : _raise_ (augmenter quelque chose) demande un complément ; ici, c’est _rise_.',
  }),
  fill(6, {
    sentence: 'She can’t come to the phone; she ___ a shower.',
    verb: 'have',
    meaningFr: 'Elle ne peut pas venir au téléphone : elle prend une douche.',
    accepted: ['is having'],
    knownErrors: ['has', 'having'],
    explanation:
      '_Have a shower_ est une action, qui peut se mettre au présent continu : _is having_.',
  }),
  fill(7, {
    sentence: 'The two teams ___ together on the migration project this month.',
    verb: 'work',
    meaningFr: 'Les deux équipes travaillent ensemble sur le projet de migration ce mois-ci.',
    accepted: ['are working'],
    knownErrors: ['is working', 'working'],
    explanation: '_This month_ : situation temporaire. _Teams_ est au pluriel : _are working_.',
  }),
  fill(8, {
    sentence: 'I ___ for a new job, but please keep it confidential.',
    verb: 'look',
    meaningFr: 'Je cherche un nouvel emploi, mais garde-le pour toi, s’il te plaît.',
    accepted: ['am looking'],
    knownErrors: ['look', 'am look'],
    explanation: 'La recherche est en cours en ce moment : _am looking_.',
  }),
  fill(9, {
    sentence: 'My colleague ___ in Madrid this month, so our meetings are online.',
    verb: 'stay',
    meaningFr: 'Mon collègue séjourne à Madrid ce mois-ci, donc nos réunions ont lieu en ligne.',
    accepted: ['is staying'],
    knownErrors: ['are staying', 'staying'],
    explanation: 'Un séjour limité dans le temps : situation temporaire, _is staying_.',
  }),
  transform(10, {
    source: 'They are testing the new app.',
    instructionFr: 'Mets la phrase à la forme interrogative.',
    accepted: ['Are they testing the new app?'],
    knownErrors: ['Do they testing the new app?', 'Are they test the new app?'],
    explanation: 'Question : _be_ passe devant le sujet ; le verbe garde sa forme en _-ing_.',
  }),
  transform(11, {
    source: 'She is answering emails.',
    instructionFr: 'Mets la phrase à la forme négative.',
    accepted: ['She isn’t answering emails.'],
    knownErrors: ['She doesn’t answering emails.', 'She not answering emails.'],
    explanation: 'Négation : _is not_ (_isn’t_) + verbe en _-ing_, sans _do_.',
  }),
  transform(12, {
    source: 'The interns write the report.',
    instructionFr: 'Mets le verbe au présent continu : l’action a lieu en ce moment.',
    accepted: ['The interns are writing the report.'],
    knownErrors: ['The interns is writing the report.', 'The interns writing the report.'],
    explanation:
      '_Interns_ est au pluriel : _are_ + _writing_ (le _e_ muet de _write_ disparaît devant _-ing_).',
  }),
  place(13, {
    sentence: 'I’m working on the report.',
    word: 'currently',
    meaningFr: 'Je travaille actuellement sur le rapport.',
    accepted: [
      'I’m currently working on the report.',
      'Currently I’m working on the report.',
      'I’m working on the report currently.',
    ],
    explanation:
      '_Currently_ se place le plus souvent entre _be_ et le verbe en _-ing_ ; en tête ou en fin de phrase, c’est aussi correct.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Je travaille sur un nouveau projet en ce moment.',
    hint: 'Situation en cours : _be_ + verbe en _-ing_.',
    difficulty: 1,
    accepted: [
      'I’m working on a new project at the moment.',
      'I’m working on a new project right now.',
      'I’m working on a new project now.',
      'I’m currently working on a new project.',
      'I’m working on a new project currently.',
      'At the moment I’m working on a new project.',
      'Right now I’m working on a new project.',
      'Currently I’m working on a new project.',
    ],
    knownErrors: ['I am work on a new project at the moment.'],
    explanation:
      'Action en cours : présent continu, _I’m working_. _At the moment_, _right now_ et _currently_ conviennent tous.',
  }),
  translate(2, {
    sentenceFr: 'Regarde, il pleut !',
    hint: 'Ce que l’on voit en ce moment même.',
    difficulty: 1,
    accepted: ['Look, it’s raining!', 'It’s raining, look!'],
    knownErrors: ['Look, it rains!', 'Look, it raining!'],
    explanation: 'On montre ce qui se passe à l’instant : _it’s raining_.',
  }),
  translate(3, {
    sentenceFr: 'Nous attendons la réponse du client.',
    hint: 'L’attente dure en ce moment.',
    difficulty: 1,
    accepted: [
      'We’re waiting for the client’s reply.',
      'We’re waiting for the client’s answer.',
      'We’re waiting for the client’s response.',
      'We’re waiting for the customer’s reply.',
      'We’re waiting for the customer’s answer.',
      'We’re waiting for the customer’s response.',
      'We’re waiting for a reply from the client.',
      'We’re waiting for an answer from the client.',
      'We’re waiting for a response from the client.',
    ],
    knownErrors: ['We are wait for the client’s reply.', 'We waiting for the client’s reply.'],
    explanation: 'L’attente est en cours : _we’re waiting for_ (avec la préposition _for_).',
  }),
  translate(4, {
    sentenceFr: 'Qu’est-ce que tu es en train de faire ?',
    hint: 'Question sur l’action en cours : _be_ passe devant le sujet.',
    difficulty: 1,
    accepted: ['What are you doing?', 'What are you doing right now?', 'What are you doing now?'],
    knownErrors: ['What do you doing?', 'What you are doing?'],
    explanation:
      '« Être en train de » : présent continu. Question : _What are you doing?_ (_be_ avant le sujet).',
  }),
  translate(5, {
    sentenceFr: 'Les taux d’intérêt augmentent dans la plupart des pays.',
    hint: 'Une évolution en cours en ce moment.',
    difficulty: 2,
    accepted: [
      'Interest rates are rising in most countries.',
      'Interest rates are increasing in most countries.',
      'Interest rates are going up in most countries.',
    ],
    knownErrors: [
      'Interest rates are raising in most countries.',
      'Interest rates is rising in most countries.',
    ],
    explanation:
      'Évolution en cours : _are rising_. _Rise_ (sans complément), et non _raise_ (augmenter quelque chose).',
  }),
  translate(6, {
    sentenceFr: 'Je loge chez un ami cette semaine.',
    hint: 'Une situation temporaire, limitée à cette semaine.',
    difficulty: 2,
    accepted: [
      'I’m staying with a friend this week.',
      'I’m staying at a friend’s this week.',
      'I’m staying at a friend’s place this week.',
      'I’m staying at a friend’s house this week.',
      'This week I’m staying with a friend.',
      'This week I’m staying at a friend’s.',
      'This week I’m staying at a friend’s place.',
    ],
    knownErrors: ['I am stay with a friend this week.'],
    explanation: 'Séjour limité dans le temps : _I’m staying with a friend_.',
  }),
  translate(7, {
    sentenceFr: 'Pourquoi est-ce que tu ris ?',
    hint: 'Question sur ce qui se passe maintenant.',
    difficulty: 2,
    accepted: ['Why are you laughing?'],
    knownErrors: ['Why do you laughing?', 'Why you are laughing?'],
    explanation: 'Question au présent continu : _Why are you laughing?_',
  }),
  translate(8, {
    sentenceFr: 'Mon équipe n’utilise pas ce logiciel en ce moment.',
    hint: 'Négation au présent continu, sans _do_.',
    difficulty: 2,
    accepted: [
      'My team isn’t using this software at the moment.',
      'My team isn’t using this software right now.',
      'My team isn’t currently using this software.',
      'My team isn’t using that software at the moment.',
      'My team isn’t using that software right now.',
      'At the moment my team isn’t using this software.',
    ],
    knownErrors: [
      'My team doesn’t using this software at the moment.',
      'My team not using this software at the moment.',
    ],
    explanation: 'Négation : _isn’t_ + verbe en _-ing_ (_team_ est singulier).',
  }),
  translate(9, {
    sentenceFr:
      'Je ne peux pas te parler maintenant : je suis en train de préparer une présentation pour demain.',
    hint: 'Deux idées : une impossibilité maintenant, puis l’action en cours.',
    difficulty: 3,
    accepted: [
      'I can’t talk to you now: I’m preparing a presentation for tomorrow.',
      'I can’t talk now: I’m preparing a presentation for tomorrow.',
      'I can’t talk to you right now: I’m preparing a presentation for tomorrow.',
      'I can’t talk right now: I’m preparing a presentation for tomorrow.',
      'I can’t speak to you now: I’m preparing a presentation for tomorrow.',
      'I can’t speak now: I’m preparing a presentation for tomorrow.',
      'I can’t talk to you now because I’m preparing a presentation for tomorrow.',
      'I can’t talk now because I’m preparing a presentation for tomorrow.',
    ],
    knownErrors: ['I can’t talk to you now: I prepare a presentation for tomorrow.'],
    explanation:
      'L’action est en cours au moment où l’on parle : _I’m preparing_. Le présent simple _I prepare_ ne convient pas ici.',
  }),
  translate(10, {
    sentenceFr:
      'Ce trimestre, la banque recrute des analystes de données et teste un nouvel outil.',
    hint: 'Deux actions temporaires, liées à ce trimestre.',
    difficulty: 3,
    accepted: [
      'This quarter, the bank is hiring data analysts and testing a new tool.',
      'This quarter, the bank is hiring data analysts and is testing a new tool.',
      'This quarter, the bank is recruiting data analysts and testing a new tool.',
      'This quarter, the bank is recruiting data analysts and is testing a new tool.',
      'The bank is hiring data analysts and testing a new tool this quarter.',
      'The bank is recruiting data analysts and testing a new tool this quarter.',
    ],
    knownErrors: ['This quarter, the bank is hiring data analysts and test a new tool.'],
    explanation:
      'Deux situations temporaires : _is hiring_ et _(is) testing_. Le second _is_ peut être sous-entendu.',
  }),
  translate(11, {
    sentenceFr: 'Les étudiants ne dorment pas : ils révisent pour l’examen de demain.',
    hint: 'Deux actions en cours maintenant, l’une à la forme négative.',
    difficulty: 3,
    accepted: [
      'The students aren’t sleeping: they’re studying for tomorrow’s exam.',
      'The students aren’t sleeping: they’re revising for tomorrow’s exam.',
      'The students aren’t sleeping: they’re studying for the exam tomorrow.',
      'The students aren’t sleeping: they’re revising for the exam tomorrow.',
      'The students aren’t sleeping, they’re studying for tomorrow’s exam.',
      'The students aren’t sleeping, they’re revising for tomorrow’s exam.',
      'The students are not asleep: they’re studying for tomorrow’s exam.',
    ],
    knownErrors: ['The students don’t sleeping: they’re studying for tomorrow’s exam.'],
    explanation:
      'Négation au présent continu (_aren’t sleeping_), puis action en cours (_they’re studying_, ou _revising_ en anglais britannique).',
  }),
];
