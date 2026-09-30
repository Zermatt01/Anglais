import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf('tense-review', REVIEW);

const PRESENT_SIMPLE = 'Habitude ou fait : présent simple';
const STATE = 'Verbe d’état : présent simple';
const PRESENT_CONTINUOUS = 'En cours maintenant : présent continu';
const PAST = 'Moment passé précis : prétérit';
const PAST_CONTINUOUS = 'En cours à un moment passé : passé continu';
const PRESENT_PERFECT = 'Lien avec maintenant : present perfect';
const DURATION = 'Durée jusqu’à maintenant : present perfect';
const PAST_PERFECT = 'Antérieur à un autre moment passé : past perfect';
const FUTURE_CLAUSE = 'Futur après _when_ ou _if_ : présent';
const ARRANGEMENT = 'Rendez-vous fixé : présent continu';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I ___ in this company since 2021.',
    options: ['have worked', 'work', 'worked'],
    answer: 'have worked',
    reasons: [DURATION, PRESENT_SIMPLE, PAST],
    reason: DURATION,
    explanation: '_Since 2021_ : la situation dure jusqu’à maintenant, present perfect.',
  }),
  choice(2, {
    sentence: 'Last year, we ___ two new offices.',
    options: ['opened', 'have opened', 'open'],
    answer: 'opened',
    reasons: [PAST, PRESENT_PERFECT, PRESENT_SIMPLE],
    reason: PAST,
    explanation: '_Last year_ : période terminée, prétérit.',
  }),
  choice(3, {
    sentence: 'Be quiet, the director ___ on the phone.',
    options: ['is talking', 'talks', 'talked'],
    answer: 'is talking',
    reasons: [PRESENT_CONTINUOUS, PRESENT_SIMPLE, PAST],
    reason: PRESENT_CONTINUOUS,
    explanation: '_Be quiet_ : l’appel a lieu maintenant, présent continu.',
  }),
  choice(4, {
    sentence: 'When the fire alarm went off, I ___ a report.',
    options: ['was writing', 'am writing', 'have written'],
    answer: 'was writing',
    reasons: [PAST_CONTINUOUS, PRESENT_CONTINUOUS, PRESENT_PERFECT],
    reason: PAST_CONTINUOUS,
    explanation: 'L’action était en cours quand l’alarme s’est déclenchée : passé continu.',
  }),
  choice(5, {
    sentence: 'This car ___ to my manager.',
    options: ['belongs', 'is belonging', 'belong'],
    answer: 'belongs',
    reasons: [STATE, PRESENT_CONTINUOUS, PRESENT_PERFECT],
    reason: STATE,
    explanation: '_Belong_ est un verbe d’état : présent simple, avec le _-s_.',
  }),
  choice(6, {
    sentence: 'I’ll email you as soon as I ___ the figures.',
    options: ['get', 'will get', 'got'],
    answer: 'get',
    reasons: [FUTURE_CLAUSE, PAST, PRESENT_PERFECT],
    reason: FUTURE_CLAUSE,
    explanation: 'Après _as soon as_, présent pour un futur.',
  }),
  choice(7, {
    sentence: 'When I arrived, the meeting ___.',
    options: ['had already started', 'has already started', 'already starts'],
    answer: 'had already started',
    reasons: [PAST_PERFECT, PRESENT_PERFECT, PRESENT_SIMPLE],
    reason: PAST_PERFECT,
    explanation: 'La réunion avait commencé avant mon arrivée : past perfect.',
  }),
  choice(8, {
    sentence: 'Have you ever ___ to Canada?',
    options: ['been', 'went', 'be'],
    answer: 'been',
    reasons: [PRESENT_PERFECT, PAST, PRESENT_SIMPLE],
    reason: PRESENT_PERFECT,
    explanation: 'Une expérience : present perfect, participe _been_.',
  }),
  choice(9, {
    sentence: 'Look! The price ___ again.',
    options: ['is falling', 'falls', 'falling'],
    answer: 'is falling',
    reasons: [PRESENT_CONTINUOUS, PRESENT_SIMPLE, PAST],
    reason: PRESENT_CONTINUOUS,
    explanation: '_Look!_ : ce qui se passe maintenant, présent continu.',
  }),
  choice(10, {
    sentence: 'I ___ him yesterday at the conference.',
    options: ['saw', 'have seen', 'see'],
    answer: 'saw',
    reasons: [PAST, PRESENT_PERFECT, PRESENT_SIMPLE],
    reason: PAST,
    explanation: '_Yesterday_ : prétérit, _saw_.',
  }),
  choice(11, {
    sentence: 'We ___ for the results for two weeks.',
    options: ['have been waiting', 'are waiting', 'wait'],
    answer: 'have been waiting',
    reasons: [DURATION, PRESENT_CONTINUOUS, PRESENT_SIMPLE],
    reason: DURATION,
    explanation: '_For two weeks_ jusqu’à maintenant : present perfect continu.',
  }),
  choice(12, {
    sentence: 'Tomorrow at 9, I ___ the new CFO; it’s in my diary.',
    options: ['am meeting', 'met', 'have met'],
    answer: 'am meeting',
    reasons: [ARRANGEMENT, PAST, PRESENT_PERFECT],
    reason: ARRANGEMENT,
    explanation: 'Un rendez-vous noté dans l’agenda : présent continu.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'She ___ at the bank since 2019.',
    verb: 'work',
    meaningFr: 'Elle travaille à la banque depuis 2019.',
    accepted: ['has worked', 'has been working'],
    knownErrors: ['works', 'worked'],
    explanation: '_Since_ : present perfect, simple ou continu.',
  }),
  fill(2, {
    sentence: 'I ___ the report two days ago.',
    verb: 'send',
    meaningFr: 'J’ai envoyé le rapport il y a deux jours.',
    accepted: ['sent'],
    knownErrors: ['have sent', 'sended'],
    explanation: '_Ago_ : prétérit, _sent_.',
  }),
  fill(3, {
    sentence: 'Right now, the team ___ the new model.',
    verb: 'test',
    meaningFr: 'En ce moment même, l’équipe teste le nouveau modèle.',
    accepted: ['is testing', 'are testing'],
    knownErrors: ['tests', 'test'],
    explanation: '_Right now_ : présent continu.',
  }),
  fill(4, {
    sentence: 'He ___ his phone, so he can’t call you.',
    verb: 'lose',
    meaningFr: 'Il a perdu son téléphone, donc il ne peut pas t’appeler.',
    accepted: ['has lost', 'lost'],
    knownErrors: ['has losed'],
    explanation:
      'Résultat présent : _has lost_. En anglais américain courant, _lost_ est aussi accepté.',
  }),
  fill(5, {
    sentence: 'I ___ when you called.',
    verb: 'sleep',
    meaningFr: 'Je dormais quand tu as appelé.',
    accepted: ['was sleeping'],
    knownErrors: ['am sleeping', 'was sleep'],
    explanation: 'Action en cours quand l’appel a eu lieu : passé continu.',
  }),
  fill(6, {
    sentence: 'By the time we arrived, they ___ dinner.',
    verb: 'finish',
    meaningFr: 'Quand nous sommes arrivés, ils avaient fini de dîner.',
    accepted: ['had finished'],
    knownErrors: ['have finished', 'finish'],
    explanation: '_By the time_ : past perfect.',
  }),
  fill(7, {
    sentence: 'If it ___ tomorrow, we’ll stay inside.',
    verb: 'rain',
    meaningFr: 'S’il pleut demain, nous resterons à l’intérieur.',
    accepted: ['rains'],
    knownErrors: ['will rain', 'rain'],
    explanation: 'Après _if_, présent pour un futur.',
  }),
  fill(8, {
    sentence: 'I usually ___ the train, but today I’m driving.',
    verb: 'take',
    meaningFr: 'D’habitude je prends le train, mais aujourd’hui je prends la voiture.',
    accepted: ['take'],
    knownErrors: ['am taking', 'takes'],
    explanation: '_Usually_ : habitude, présent simple.',
  }),
  fill(9, {
    sentence: 'We ___ each other for years.',
    verb: 'know',
    meaningFr: 'Nous nous connaissons depuis des années.',
    accepted: ['have known'],
    knownErrors: ['know', 'have been knowing'],
    explanation: 'Verbe d’état et durée jusqu’à maintenant : _have known_.',
  }),
  fill(10, {
    sentence: 'Look at those clouds: it ___ rain.',
    verb: 'be going to',
    meaningFr: 'Regarde ces nuages : il va pleuvoir.',
    accepted: ['is going to'],
    knownErrors: ['goes to', 'is going'],
    explanation: 'Prédiction fondée sur un indice : _it’s going to rain_.',
  }),
  transform(11, {
    source: 'I work here since 2020.',
    instructionFr: 'Corrige l’erreur de temps.',
    accepted: ['I have worked here since 2020.', 'I have been working here since 2020.'],
    knownErrors: ['I am working here since 2020.'],
    explanation: '_Since_ + present perfect.',
  }),
  transform(12, {
    source: 'I have seen him yesterday.',
    instructionFr: 'Corrige l’erreur de temps.',
    accepted: ['I saw him yesterday.'],
    knownErrors: ['I have saw him yesterday.'],
    explanation: '_Yesterday_ + prétérit.',
  }),
  transform(13, {
    source: 'When I will arrive, I will call you.',
    instructionFr: 'Corrige l’erreur de temps.',
    accepted: ['When I arrive, I will call you.'],
    knownErrors: ['When I will arrive, I call you.'],
    explanation: 'Après _when_, présent pour un futur : _When I arrive_.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Je vis à Genève depuis 2020.',
    hint: '« Depuis » : une situation qui dure jusqu’à maintenant.',
    difficulty: 1,
    accepted: ['I’ve lived in Geneva since 2020.', 'I’ve been living in Geneva since 2020.'],
    knownErrors: ['I live in Geneva since 2020.'],
    explanation: '_Since_ + present perfect.',
  }),
  translate(2, {
    sentenceFr: 'Hier, j’ai rencontré le nouveau directeur.',
    hint: 'Un moment passé précis.',
    difficulty: 1,
    accepted: [
      'Yesterday I met the new director.',
      'I met the new director yesterday.',
      'Yesterday I met the new manager.',
      'I met the new manager yesterday.',
    ],
    knownErrors: ['Yesterday I have met the new director.'],
    explanation: '_Yesterday_ + prétérit.',
  }),
  translate(3, {
    sentenceFr: 'Elle est en train de préparer sa présentation.',
    hint: 'Une action en cours maintenant.',
    difficulty: 1,
    accepted: [
      'She’s preparing her presentation.',
      'She’s preparing her presentation right now.',
      'She’s preparing her presentation now.',
    ],
    knownErrors: ['She prepares her presentation.', 'She preparing her presentation.'],
    explanation: '« Être en train de » : présent continu.',
  }),
  translate(4, {
    sentenceFr: 'Je t’enverrai le fichier quand je l’aurai terminé.',
    hint: 'Après « quand », quel temps pour un futur ?',
    difficulty: 1,
    accepted: [
      'I’ll send you the file when I finish it.',
      'I’ll send you the file when I’ve finished it.',
      'I’ll send you the file when it’s finished.',
      'I’ll send you the file when I’m done with it.',
      'When I finish the file, I’ll send it to you.',
      'When I’ve finished the file, I’ll send it to you.',
    ],
    knownErrors: ['I’ll send you the file when I will finish it.'],
    explanation: 'Après _when_ : présent ou present perfect, jamais _will_.',
  }),
  translate(5, {
    sentenceFr: 'Je préparais le rapport quand le serveur est tombé en panne.',
    hint: 'Une action en cours dans le passé, interrompue.',
    difficulty: 2,
    accepted: [
      'I was preparing the report when the server crashed.',
      'I was preparing the report when the server went down.',
      'I was preparing the report when the server broke down.',
      'I was writing the report when the server crashed.',
      'When the server crashed, I was preparing the report.',
    ],
    knownErrors: ['I was preparing the report when the server has crashed.'],
    explanation: 'Passé continu pour l’action longue, prétérit pour la panne.',
  }),
  translate(6, {
    sentenceFr: 'Nous n’avons pas encore reçu le paiement.',
    hint: '« Pas encore » : une action attendue.',
    difficulty: 2,
    accepted: [
      'We haven’t received the payment yet.',
      'We haven’t yet received the payment.',
      'We haven’t received payment yet.',
      'We didn’t receive the payment yet.',
    ],
    knownErrors: ['We haven’t received yet the payment.'],
    explanation:
      '_Not… yet_ avec le present perfect. En anglais américain courant, le prétérit est aussi accepté.',
  }),
  translate(7, {
    sentenceFr: 'Quand je suis arrivé, tout le monde était déjà parti.',
    hint: 'Une action antérieure à un autre moment passé.',
    difficulty: 2,
    accepted: [
      'When I arrived, everyone had already left.',
      'When I arrived, everybody had already left.',
      'When I arrived, everyone had already gone.',
      'When I got there, everyone had already left.',
      'Everyone had already left when I arrived.',
    ],
    knownErrors: ['When I arrived, everyone has already left.'],
    explanation: 'Past perfect : _had already left_.',
  }),
  translate(8, {
    sentenceFr: 'D’habitude, elle travaille à Genève, mais cette semaine elle travaille à Londres.',
    hint: 'Une habitude, puis une exception temporaire.',
    difficulty: 2,
    accepted: [
      'She usually works in Geneva, but this week she’s working in London.',
      'Usually she works in Geneva, but this week she’s working in London.',
      'She usually works in Geneva, but she’s working in London this week.',
      'She normally works in Geneva, but this week she’s working in London.',
    ],
    knownErrors: ['She usually is working in Geneva, but this week she’s working in London.'],
    explanation: 'Habitude : présent simple. Exception temporaire : présent continu.',
  }),
  translate(9, {
    sentenceFr:
      'Je travaille dans la finance depuis trois ans ; avant, j’ai étudié l’économie à Lyon.',
    hint: 'Une situation qui dure, puis une période terminée.',
    difficulty: 3,
    accepted: [
      'I’ve worked in finance for three years; before that, I studied economics in Lyon.',
      'I’ve been working in finance for three years; before that, I studied economics in Lyon.',
      'I’ve worked in finance for three years; before, I studied economics in Lyon.',
      'I’ve worked in finance for three years, and before that I studied economics in Lyon.',
      'I’ve been working in finance for three years, and before that I studied economics in Lyon.',
    ],
    knownErrors: ['I work in finance since three years; before that, I studied economics in Lyon.'],
    explanation: 'Present perfect + _for_, puis prétérit pour la période terminée.',
  }),
  translate(10, {
    sentenceFr: 'Je rencontre le recruteur demain ; je pense que l’entretien se passera bien.',
    hint: 'Un rendez-vous fixé, puis une prévision.',
    difficulty: 3,
    accepted: [
      'I’m meeting the recruiter tomorrow; I think the interview will go well.',
      'I’m seeing the recruiter tomorrow; I think the interview will go well.',
      'I’m going to meet the recruiter tomorrow; I think the interview will go well.',
      'I’m meeting the recruiter tomorrow; I think the interview is going to go well.',
      'I’m meeting the recruiter tomorrow, and I think the interview will go well.',
    ],
    knownErrors: ['I meeting the recruiter tomorrow; I think the interview will go well.'],
    explanation: 'Rendez-vous fixé : présent continu. Prévision : _will_.',
  }),
  translate(11, {
    sentenceFr: 'Elle apprend Python depuis six mois et elle a déjà créé deux tableaux de bord.',
    hint: 'Une activité qui dure, puis un résultat.',
    difficulty: 3,
    accepted: [
      'She’s been learning Python for six months, and she’s already created two dashboards.',
      'She’s been learning Python for six months and she’s already created two dashboards.',
      'She’s been learning Python for six months, and she’s already built two dashboards.',
      'She’s been learning Python for six months, and she has already made two dashboards.',
      'She’s been learning Python for six months, and she already created two dashboards.',
    ],
    knownErrors: ['She learns Python since six months, and she’s already created two dashboards.'],
    explanation:
      'Durée : _has been learning_. Résultat : _has already created_ (present perfect simple).',
  }),
];
