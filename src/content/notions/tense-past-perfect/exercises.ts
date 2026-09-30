import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf('tense-past-perfect', REVIEW);

const BEFORE_PAST = 'Action antérieure à un autre moment du passé';
const SEQUENCE = 'Actions passées racontées dans l’ordre';
const PRESENT_LINK = 'Lien avec le présent';
const REPORTED = 'Discours rapporté au passé';
const FIRST_PAST = 'Première fois, vue depuis un moment du passé';
const Q_BEFORE = 'Question sur une action antérieure à un moment passé';
const Q_PRESENT = 'Question sur une expérience jusqu’à maintenant';
const Q_NOW = 'Question sur une action en cours';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'When I arrived at the office, my colleagues ___ home.',
    options: ['had gone', 'have gone', 'had went'],
    answer: 'had gone',
    reasons: [BEFORE_PAST, SEQUENCE, PRESENT_LINK],
    reason: BEFORE_PAST,
    explanation: 'Ils étaient partis avant mon arrivée : past perfect. Participe de _go_ : _gone_.',
  }),
  choice(2, {
    sentence: 'She was nervous because she ___ a presentation before.',
    options: ['had never given', 'has never given', 'had never gave'],
    answer: 'had never given',
    reasons: [BEFORE_PAST, PRESENT_LINK, SEQUENCE],
    reason: BEFORE_PAST,
    explanation:
      'Avant ce moment passé, aucune présentation : _had never given_ (participe _given_).',
  }),
  choice(3, {
    sentence: 'By the time we called, they ___ with a competitor.',
    options: ['had signed', 'have signed', 'had sign'],
    answer: 'had signed',
    reasons: [BEFORE_PAST, PRESENT_LINK, SEQUENCE],
    reason: BEFORE_PAST,
    explanation: '_By the time_ : la signature avait eu lieu avant notre appel.',
  }),
  choice(4, {
    sentence: 'He told me he ___ his badge.',
    options: ['had lost', 'had losed', 'have lost'],
    answer: 'had lost',
    reasons: [REPORTED, SEQUENCE, PRESENT_LINK],
    reason: REPORTED,
    explanation: 'Discours rapporté au passé : _he had lost_.',
  }),
  choice(5, {
    sentence: 'I ___ the email, so I didn’t know about the change.',
    options: ['hadn’t read', 'hadn’t readed', 'not had read'],
    answer: 'hadn’t read',
    reasons: [BEFORE_PAST, SEQUENCE, PRESENT_LINK],
    reason: BEFORE_PAST,
    explanation: 'Négation : _hadn’t_ + participe passé (_read_, irrégulier).',
  }),
  choice(6, {
    sentence: '___ you met the CEO before the interview?',
    options: ['Had', 'Did', 'Was'],
    answer: 'Had',
    reasons: [Q_BEFORE, Q_PRESENT, Q_NOW],
    reason: Q_BEFORE,
    explanation:
      'Le participe _met_ suit _had_ ; _did_ demanderait la base verbale (_Did you meet…?_).',
  }),
  choice(7, {
    sentence: 'When the manager ___, we started the meeting.',
    options: ['arrived', 'arrive', 'has arrived'],
    answer: 'arrived',
    reasons: [SEQUENCE, BEFORE_PAST, PRESENT_LINK],
    reason: SEQUENCE,
    explanation: 'Deux actions racontées dans l’ordre : le prétérit suffit.',
  }),
  choice(8, {
    sentence: 'They ___ the project before the deadline, so the client was happy.',
    options: ['had finished', 'have finished', 'had finish'],
    answer: 'had finished',
    reasons: [BEFORE_PAST, PRESENT_LINK, SEQUENCE],
    reason: BEFORE_PAST,
    explanation: 'Le projet était fini avant la date limite, dans un récit au passé.',
  }),
  choice(9, {
    sentence: 'It was the first time I ___ on a plane.',
    options: ['had been', 'have been', 'had be'],
    answer: 'had been',
    reasons: [FIRST_PAST, PRESENT_LINK, SEQUENCE],
    reason: FIRST_PAST,
    explanation:
      '_It was the first time_ + past perfect (et _It is the first time_ + present perfect).',
  }),
  choice(10, {
    sentence: 'The shares ___ 20% by the end of the day.',
    options: ['had fallen', 'had fell', 'has fallen'],
    answer: 'had fallen',
    reasons: [BEFORE_PAST, PRESENT_LINK, SEQUENCE],
    reason: BEFORE_PAST,
    explanation: '_By the end of the day_ : la baisse était accomplie à ce moment passé.',
  }),
  choice(11, {
    sentence: 'I realised I ___ my phone in the taxi.',
    options: ['had left', 'had leaved', 'has left'],
    answer: 'had left',
    reasons: [BEFORE_PAST, SEQUENCE, PRESENT_LINK],
    reason: BEFORE_PAST,
    explanation: 'Je l’avais laissé avant de m’en rendre compte : _had left_.',
  }),
  choice(12, {
    sentence: 'He had already ___ when I called.',
    options: ['left', 'leaved', 'leave'],
    answer: 'left',
    reasons: [BEFORE_PAST, SEQUENCE, PRESENT_LINK],
    reason: BEFORE_PAST,
    explanation: 'Participe de _leave_ : _left_.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'When we arrived, the film had already ___.',
    verb: 'start',
    meaningFr: 'Quand nous sommes arrivés, le film avait déjà commencé.',
    accepted: ['started'],
    knownErrors: ['start', 'starting'],
    explanation: '_Had already_ + participe passé : _started_.',
  }),
  fill(2, {
    sentence: 'She ___ in Paris before she moved to Zurich.',
    verb: 'work',
    meaningFr: 'Elle avait travaillé à Paris avant de s’installer à Zurich.',
    accepted: ['had worked', 'had been working', 'worked'],
    knownErrors: ['has worked', 'had work'],
    explanation:
      'Action antérieure : _had worked_. Avec _before_, qui indique l’ordre, _worked_ est aussi juste.',
  }),
  fill(3, {
    sentence: 'I ___ the report, so I couldn’t comment on it.',
    verb: 'read (à la forme négative)',
    meaningFr: 'Je n’avais pas lu le rapport, donc je n’ai pas pu le commenter.',
    accepted: ['hadn’t read', 'didn’t read'],
    knownErrors: ['hadn’t readed', 'haven’t readed'],
    explanation: '_Hadn’t read_ : la lecture n’avait pas eu lieu avant ce moment.',
  }),
  fill(4, {
    sentence: 'By the time the meeting ended, we ___ three decisions.',
    verb: 'make',
    meaningFr: 'À la fin de la réunion, nous avions pris trois décisions.',
    accepted: ['had made'],
    knownErrors: ['had maked', 'have made'],
    explanation: '_By the time_ : past perfect. Participe de _make_ : _made_.',
  }),
  fill(5, {
    sentence: 'He said he ___ the invoice the day before.',
    verb: 'send',
    meaningFr: 'Il a dit qu’il avait envoyé la facture la veille.',
    accepted: ['had sent'],
    knownErrors: ['had sended', 'has sent'],
    explanation: 'Discours rapporté, action antérieure : _had sent_.',
  }),
  fill(6, {
    sentence: '___ they met before the conference?',
    verb: 'have',
    meaningFr: 'Est-ce qu’ils s’étaient déjà rencontrés avant la conférence ?',
    accepted: ['Had'],
    knownErrors: ['Did'],
    explanation: 'Question au past perfect : _Had_ + sujet + participe (_met_).',
  }),
  fill(7, {
    sentence: 'The client was angry because we ___ the deadline.',
    verb: 'miss',
    meaningFr: 'Le client était en colère parce que nous avions manqué la date limite.',
    accepted: ['had missed', 'missed'],
    knownErrors: ['have missed', 'had miss'],
    explanation: 'La date limite avait été manquée avant sa colère : _had missed_.',
  }),
  fill(8, {
    sentence: 'It was the first time she ___ a team.',
    verb: 'lead',
    meaningFr: 'C’était la première fois qu’elle dirigeait une équipe.',
    accepted: ['had led'],
    knownErrors: ['had leaded', 'has led'],
    explanation: '_It was the first time_ + past perfect. Participe de _lead_ : _led_.',
  }),
  fill(9, {
    sentence: 'They ___ the contract before the lawyer arrived.',
    verb: 'sign',
    meaningFr: 'Ils avaient signé le contrat avant l’arrivée de l’avocat.',
    accepted: ['had signed', 'signed'],
    knownErrors: ['have signed', 'had sign'],
    explanation: 'Action antérieure : _had signed_ (avec _before_, _signed_ est aussi juste).',
  }),
  fill(10, {
    sentence: 'I ___ my keys, so I couldn’t get into the office.',
    verb: 'forget',
    meaningFr: 'J’avais oublié mes clés, donc je n’ai pas pu entrer dans le bureau.',
    accepted: ['had forgotten', 'forgot'],
    knownErrors: ['have forgotten', 'had forget'],
    explanation: 'L’oubli précède le moment raconté : _had forgotten_.',
  }),
  transform(11, {
    source: 'The meeting started.',
    instructionFr:
      'Réécris la phrase au past perfect, avec « When I arrived, » au début : elle avait déjà commencé.',
    accepted: [
      'When I arrived, the meeting had started.',
      'When I arrived, the meeting had already started.',
    ],
    knownErrors: ['When I arrived, the meeting has started.'],
    explanation: 'La réunion avait commencé avant l’arrivée : _had started_.',
  }),
  transform(12, {
    source: 'She had finished the report.',
    instructionFr: 'Mets la phrase à la forme négative.',
    accepted: ['She hadn’t finished the report.'],
    knownErrors: ['She didn’t had finished the report.', 'She hadn’t finish the report.'],
    explanation: 'Négation : _hadn’t_ + participe passé.',
  }),
  transform(13, {
    source: '“I have lost my badge,” he said.',
    instructionFr: 'Rapporte la phrase au passé, en commençant par « He said ».',
    accepted: ['He said he had lost his badge.', 'He said that he had lost his badge.'],
    knownErrors: ['He said he had losed his badge.'],
    explanation: 'Discours rapporté au passé : _have lost_ devient _had lost_.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Quand je suis arrivé, la réunion avait déjà commencé.',
    hint: 'Une action antérieure à un autre moment passé.',
    difficulty: 1,
    accepted: [
      'When I arrived, the meeting had already started.',
      'When I arrived, the meeting had already begun.',
      'When I got there, the meeting had already started.',
      'The meeting had already started when I arrived.',
      'The meeting had already begun when I arrived.',
    ],
    knownErrors: [
      'When I arrived, the meeting has already started.',
      'When I arrived, the meeting had already start.',
    ],
    explanation: '« Avait commencé » : _had started_ (ou _had begun_).',
  }),
  translate(2, {
    sentenceFr: 'Elle n’avait jamais pris l’avion avant.',
    hint: 'Le plus-que-parfait français, à la forme négative.',
    difficulty: 1,
    accepted: [
      'She had never flown before.',
      'She had never taken a plane before.',
      'She had never been on a plane before.',
      'She’d never flown before.',
    ],
    knownErrors: ['She has never flown before.', 'She had never flew before.'],
    explanation: '_Had never_ + participe : _had never flown_ (_fly_, _flew_, _flown_).',
  }),
  translate(3, {
    sentenceFr: 'Il m’a dit qu’il avait perdu ses clés.',
    hint: 'Discours rapporté au passé.',
    difficulty: 1,
    accepted: [
      'He told me he had lost his keys.',
      'He told me that he had lost his keys.',
      'He said he had lost his keys.',
      'He said that he had lost his keys.',
      'He told me he lost his keys.',
    ],
    knownErrors: ['He told me he had losed his keys.'],
    explanation: 'Discours rapporté : _he had lost_.',
  }),
  translate(4, {
    sentenceFr: 'Je n’avais pas lu le rapport.',
    hint: 'Le plus-que-parfait, à la forme négative.',
    difficulty: 1,
    accepted: ['I hadn’t read the report.'],
    knownErrors: ['I hadn’t readed the report.', 'I didn’t had read the report.'],
    explanation: '_Hadn’t_ + participe passé : _I hadn’t read the report._',
  }),
  translate(5, {
    sentenceFr: 'Le train était déjà parti quand nous sommes arrivés à la gare.',
    hint: 'Une action antérieure à notre arrivée.',
    difficulty: 2,
    accepted: [
      'The train had already left when we arrived at the station.',
      'The train had already left when we got to the station.',
      'When we arrived at the station, the train had already left.',
      'When we got to the station, the train had already left.',
      'The train had already gone when we arrived at the station.',
    ],
    knownErrors: ['The train has already left when we arrived at the station.'],
    explanation: '_Had already left_, puis _we arrived_ (prétérit).',
  }),
  translate(6, {
    sentenceFr: 'C’était la première fois que je voyais un tel résultat.',
    hint: '« C’était la première fois que… » : vu depuis un moment passé.',
    difficulty: 2,
    accepted: [
      'It was the first time I had seen such a result.',
      'It was the first time I had seen a result like that.',
      'It was the first time I had seen a result like this.',
      'That was the first time I had seen such a result.',
    ],
    knownErrors: ['It was the first time I have seen such a result.'],
    explanation: '_It was the first time_ + past perfect : _I had seen_.',
  }),
  translate(7, {
    sentenceFr: 'Au moment où nous avons appelé, ils avaient déjà signé avec un concurrent.',
    hint: 'Une action accomplie avant un moment passé.',
    difficulty: 2,
    accepted: [
      'By the time we called, they had already signed with a competitor.',
      'When we called, they had already signed with a competitor.',
      'By the time we called, they had already signed with a rival.',
      'By the time we phoned, they had already signed with a competitor.',
    ],
    knownErrors: ['By the time we called, they have already signed with a competitor.'],
    explanation: '_By the time_ + prétérit, puis past perfect : _had already signed_.',
  }),
  translate(8, {
    sentenceFr: 'Avant de rejoindre la banque, elle avait travaillé trois ans dans l’audit.',
    hint: 'Une période antérieure à un autre moment passé.',
    difficulty: 2,
    accepted: [
      'Before joining the bank, she had worked in audit for three years.',
      'Before joining the bank, she had worked in auditing for three years.',
      'Before she joined the bank, she had worked in audit for three years.',
      'Before she joined the bank, she had worked in auditing for three years.',
      'Before joining the bank, she had worked for three years in audit.',
      'Before joining the bank, she had spent three years in audit.',
    ],
    knownErrors: ['Before joining the bank, she has worked in audit for three years.'],
    explanation: '_Had worked_ : la période précède son arrivée à la banque.',
  }),
  translate(9, {
    sentenceFr: 'Quand le directeur a enfin répondu, nous avions déjà trouvé une solution.',
    hint: 'La solution précède la réponse.',
    difficulty: 3,
    accepted: [
      'When the director finally replied, we had already found a solution.',
      'When the director finally answered, we had already found a solution.',
      'When the manager finally replied, we had already found a solution.',
      'When the director finally responded, we had already found a solution.',
      'By the time the director replied, we had already found a solution.',
    ],
    knownErrors: ['When the director finally replied, we have already found a solution.'],
    explanation: '_Replied_ (prétérit), _had already found_ (antérieur).',
  }),
  translate(10, {
    sentenceFr: 'Je ne savais pas qu’il avait quitté l’entreprise l’année précédente.',
    hint: 'Un état passé, puis une action encore antérieure.',
    difficulty: 3,
    accepted: [
      'I didn’t know he had left the company the year before.',
      'I didn’t know that he had left the company the year before.',
      'I didn’t know he had left the company the previous year.',
      'I didn’t know that he had left the company the previous year.',
      'I didn’t know he had left the firm the year before.',
    ],
    knownErrors: ['I didn’t know he has left the company the year before.'],
    explanation: '_Didn’t know_, puis l’action antérieure : _had left_.',
  }),
  translate(11, {
    sentenceFr: 'Les marchés avaient beaucoup baissé avant l’annonce, puis ils ont remonté.',
    hint: 'Une action antérieure, puis une action racontée dans l’ordre.',
    difficulty: 3,
    accepted: [
      'The markets had fallen a lot before the announcement, and then they rose.',
      'The markets had fallen a lot before the announcement, then they rose.',
      'The markets had fallen a lot before the announcement, and then they recovered.',
      'The markets had fallen sharply before the announcement, and then they rose.',
      'The markets had dropped a lot before the announcement, and then they rose.',
      'The markets had fallen a lot before the announcement, and then they went back up.',
    ],
    knownErrors: ['The markets had fell a lot before the announcement, and then they rose.'],
    explanation: '_Had fallen_ (antérieur), puis _rose_ (prétérit) pour la suite du récit.',
  }),
];
