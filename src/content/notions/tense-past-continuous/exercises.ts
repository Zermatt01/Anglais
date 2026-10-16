import { exercisesOf, offNotion, onNotion } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf('tense-past-continuous', REVIEW);

const BACKGROUND = 'Action longue en cours, interrompue par une autre';
const INTERRUPT = 'Action courte qui interrompt une action en cours';
const AT_TIME = 'Action en cours à un moment précis du passé';
const PERIOD = 'Situation en cours pendant une période passée';
const PARALLEL = 'Deux actions en cours en même temps';
const STATE = 'Verbe d’état : pas de forme continue';
const NOW = 'Action en cours maintenant';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I ___ the report when the server crashed.',
    options: ['was writing', 'were writing', 'am writing'],
    answer: 'was writing',
    reasons: [BACKGROUND, INTERRUPT, NOW],
    reason: BACKGROUND,
    explanation: 'La rédaction était en cours quand la panne est arrivée. _I_ demande _was_.',
  }),
  choice(2, {
    sentence: 'I was writing the report when the server ___.',
    options: ['crashed', 'has crashed', 'crashes'],
    answer: 'crashed',
    reasons: [INTERRUPT, BACKGROUND, NOW],
    reason: INTERRUPT,
    explanation: 'La panne est l’action courte qui interrompt : prétérit, _crashed_.',
  }),
  choice(3, {
    sentence: 'At 10 a.m. yesterday, we ___ the budget with the CFO.',
    options: ['were discussing', 'was discussing', 'are discussing'],
    answer: 'were discussing',
    reasons: [AT_TIME, INTERRUPT, NOW],
    reason: AT_TIME,
    explanation: 'Hier à 10 heures, la discussion était en cours. _We_ demande _were_.',
  }),
  choice(4, {
    sentence: 'While I ___ the data, my colleague was preparing the slides.',
    options: ['was cleaning', 'were cleaning', 'am cleaning'],
    answer: 'was cleaning',
    reasons: [PARALLEL, INTERRUPT, NOW],
    reason: PARALLEL,
    explanation: '_While_ : deux actions en cours en même temps, toutes deux au passé continu.',
  }),
  choice(5, {
    sentence: 'What ___ when I called you?',
    options: ['were you doing', 'did you doing', 'you were doing'],
    answer: 'were you doing',
    reasons: [
      'Question sur une action en cours à un moment passé',
      'Question sur une action terminée',
      'Question sur une action en cours maintenant',
    ],
    reason: 'Question sur une action en cours à un moment passé',
    explanation: 'Question au passé continu : _were_ + sujet + verbe en _-ing_.',
  }),
  choice(6, {
    sentence: 'She ___ the answer, so she didn’t say anything.',
    options: ['didn’t know', 'wasn’t knowing', 'weren’t knowing'],
    answer: 'didn’t know',
    reasons: [STATE, BACKGROUND, NOW],
    reason: STATE,
    explanation: '_Know_ est un verbe d’état : prétérit, jamais le passé continu.',
  }),
  choice(7, {
    sentence: 'The phone ___ while I was having lunch.',
    options: ['rang', 'ringed', 'rings'],
    answer: 'rang',
    reasons: [INTERRUPT, BACKGROUND, NOW],
    reason: INTERRUPT,
    explanation: 'L’appel interrompt le déjeuner : prétérit. _Ring_ est irrégulier : _rang_.',
  }),
  choice(8, {
    sentence: 'They ___ for the bus when it started to rain.',
    options: ['were waiting', 'was waiting', 'are waiting'],
    answer: 'were waiting',
    reasons: [BACKGROUND, INTERRUPT, NOW],
    reason: BACKGROUND,
    explanation: 'L’attente était en cours quand la pluie a commencé. _They_ : _were_.',
  }),
  choice(9, {
    sentence: 'At that time, my sister ___ in Berlin.',
    options: ['was living', 'were living', 'is living'],
    answer: 'was living',
    reasons: [PERIOD, INTERRUPT, NOW],
    reason: PERIOD,
    explanation: '_At that time_ : une situation en cours à une période passée.',
  }),
  choice(10, {
    sentence: 'I ___ attention, so I missed the last point.',
    options: ['wasn’t paying', 'weren’t paying', 'didn’t paying'],
    answer: 'wasn’t paying',
    reasons: [AT_TIME, INTERRUPT, NOW],
    reason: AT_TIME,
    explanation:
      'Au moment du dernier point, l’attention n’était pas là : passé continu, _wasn’t paying_.',
  }),
  choice(11, {
    sentence: 'When the manager arrived, the interns ___ coffee.',
    options: ['were drinking', 'was drinking', 'are drinking'],
    answer: 'were drinking',
    reasons: [BACKGROUND, INTERRUPT, NOW],
    reason: BACKGROUND,
    explanation: 'Le café était en cours quand la responsable est arrivée. _Interns_ : _were_.',
  }),
  choice(12, {
    sentence: 'It ___ heavily when we left the office.',
    options: ['was raining', 'were raining', 'is raining'],
    answer: 'was raining',
    reasons: [BACKGROUND, INTERRUPT, NOW],
    reason: BACKGROUND,
    explanation: 'La pluie est le décor, déjà en cours quand nous sommes partis.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'I ___ an email when you called.',
    verb: 'write',
    meaningFr: 'J’écrivais un e-mail quand tu as appelé.',
    accepted: ['was writing'],
    knownErrors: ['were writing', 'writing', 'am writing'],
    explanation: 'Action longue interrompue : _was writing_.',
  }),
  fill(2, {
    sentence: 'We ___ the figures when the lights went out.',
    verb: 'check',
    meaningFr: 'Nous vérifiions les chiffres quand la lumière s’est éteinte.',
    accepted: ['were checking'],
    knownErrors: ['was checking', 'checking'],
    explanation: '_We_ demande _were_ : _were checking_.',
  }),
  fill(3, {
    sentence: 'She was driving to work when her phone ___.',
    verb: 'ring',
    meaningFr: 'Elle conduisait pour aller au travail quand son téléphone a sonné.',
    accepted: ['rang'],
    knownErrors: ['ringed', 'rung', 'has rung'],
    explanation: 'L’action courte qui interrompt : prétérit, _rang_.',
  }),
  fill(4, {
    sentence: 'What ___ at 8 p.m. last night?',
    verb: 'you / do',
    meaningFr: 'Que faisais-tu hier soir à 20 heures ?',
    accepted: ['were you doing'],
    knownErrors: ['did you doing', 'you were doing'],
    explanation: 'Question sur une action en cours à une heure passée : _were you doing_.',
  }),
  fill(5, {
    sentence: 'The students ___ when the teacher came in.',
    verb: 'talk',
    meaningFr: 'Les élèves parlaient quand le professeur est entré.',
    accepted: ['were talking'],
    knownErrors: ['was talking', 'talking'],
    explanation: 'Le bavardage était en cours : _were talking_.',
  }),
  fill(6, {
    sentence: 'While I ___ the report, I found a mistake in the data.',
    verb: 'read',
    meaningFr: 'En lisant le rapport, j’ai trouvé une erreur dans les données.',
    accepted: ['was reading'],
    knownErrors: ['were reading', 'am reading'],
    explanation: '_While_ + passé continu pour l’action longue ; _found_ pour l’événement.',
  }),
  fill(7, {
    sentence: 'I ___, so I didn’t hear the question.',
    verb: 'listen (à la forme négative)',
    meaningFr: 'Je n’écoutais pas, donc je n’ai pas entendu la question.',
    accepted: ['wasn’t listening'],
    knownErrors: ['weren’t listening', 'didn’t listening'],
    explanation: 'Négation au passé continu : _wasn’t_ + verbe en _-ing_.',
  }),
  fill(8, {
    sentence: 'At midnight, the servers ___ the backup.',
    verb: 'run',
    meaningFr: 'À minuit, les serveurs exécutaient la sauvegarde.',
    accepted: ['were running'],
    knownErrors: ['was running', 'running'],
    explanation: 'À minuit, la sauvegarde était en cours : _were running_.',
  }),
  fill(9, {
    sentence: 'My colleague ___ from home when the strike started.',
    verb: 'work',
    meaningFr: 'Mon collègue travaillait à domicile quand la grève a commencé.',
    accepted: ['was working'],
    knownErrors: ['were working', 'working'],
    explanation: 'Situation en cours quand la grève a commencé : _was working_.',
  }),
  fill(10, {
    sentence: 'The market ___ quickly when the central bank intervened.',
    verb: 'fall',
    meaningFr: 'Le marché chutait rapidement quand la banque centrale est intervenue.',
    accepted: ['was falling'],
    knownErrors: ['were falling', 'was fallen'],
    explanation: 'La baisse était en cours au moment de l’intervention : _was falling_.',
  }),
  transform(11, {
    source: 'They were working late.',
    instructionFr: 'Mets la phrase à la forme interrogative.',
    accepted: ['Were they working late?'],
    knownErrors: ['Did they working late?', 'Was they working late?'],
    explanation: 'Question : _were_ passe devant le sujet.',
  }),
  transform(12, {
    source: 'He was listening.',
    instructionFr: 'Mets la phrase à la forme négative.',
    accepted: ['He wasn’t listening.'],
    knownErrors: ['He didn’t listening.', 'He weren’t listening.'],
    explanation: 'Négation : _was not_ (_wasn’t_) + verbe en _-ing_, sans _did_.',
  }),
  transform(13, {
    source: 'I read the news.',
    instructionFr: 'Mets le verbe au passé continu et ajoute « when my manager called » à la fin.',
    accepted: ['I was reading the news when my manager called.'],
    knownErrors: ['I were reading the news when my manager called.'],
    explanation: 'Action longue au passé continu, interrompue par _called_ (prétérit).',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Je travaillais quand tu as appelé.',
    hint: 'Une action longue, interrompue par une action courte.',
    difficulty: 1,
    accepted: ['I was working when you called.', 'When you called, I was working.'],
    knownErrors: [
      onNotion('I were working when you called.', 'accord_sujet_verbe'),
      onNotion('I was work when you called.', 'temps_verbaux'),
    ],
    explanation: 'Action longue : _I was working_ ; action courte : _you called_.',
  }),
  translate(2, {
    sentenceFr: 'Que faisais-tu à 10 heures ?',
    hint: 'Question sur une action en cours à une heure passée.',
    difficulty: 1,
    accepted: [
      'What were you doing at 10 o’clock?',
      'What were you doing at 10?',
      'What were you doing at ten?',
      'What were you doing at ten o’clock?',
      'What were you doing at 10 a.m.?',
    ],
    knownErrors: [
      onNotion('What did you doing at 10 o’clock?', 'auxiliaires_questions_negations'),
      onNotion('What you were doing at 10 o’clock?', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Question au passé continu : _What were you doing…?_',
  }),
  translate(3, {
    sentenceFr: 'Nous attendions le bus quand il a commencé à neiger.',
    hint: 'Le décor au passé continu, l’événement au prétérit.',
    difficulty: 1,
    accepted: [
      'We were waiting for the bus when it started to snow.',
      'We were waiting for the bus when it started snowing.',
      'We were waiting for the bus when it began to snow.',
      'We were waiting for the bus when it began snowing.',
    ],
    knownErrors: [
      onNotion('We was waiting for the bus when it started to snow.', 'accord_sujet_verbe'),
    ],
    explanation: '_We were waiting_ (décor), _it started to snow_ (événement).',
  }),
  translate(4, {
    sentenceFr: 'Il pleuvait quand je suis sorti du bureau.',
    hint: 'Le décor au passé continu, l’événement au prétérit.',
    difficulty: 1,
    accepted: [
      'It was raining when I left the office.',
      'It was raining when I came out of the office.',
      'It was raining when I went out of the office.',
      'When I left the office, it was raining.',
    ],
    knownErrors: [onNotion('It were raining when I left the office.', 'accord_sujet_verbe')],
    explanation: 'La pluie est le décor, déjà en cours : _it was raining_.',
  }),
  translate(5, {
    sentenceFr: 'Pendant que je préparais les diapositives, ma collègue analysait les données.',
    hint: 'Deux actions en cours en même temps.',
    difficulty: 2,
    accepted: [
      'While I was preparing the slides, my colleague was analysing the data.',
      'While I was preparing the slides, my colleague was analysing data.',
      'My colleague was analysing the data while I was preparing the slides.',
      'While I was preparing the slides, my co-worker was analysing the data.',
    ],
    knownErrors: [
      onNotion(
        'While I were preparing the slides, my colleague was analysing the data.',
        'accord_sujet_verbe',
      ),
    ],
    explanation: '_While_ : deux actions simultanées, toutes deux au passé continu.',
  }),
  translate(6, {
    sentenceFr: 'Je n’écoutais pas quand elle a expliqué le modèle.',
    hint: 'Une action en cours, niée, puis un événement.',
    difficulty: 2,
    accepted: [
      'I wasn’t listening when she explained the model.',
      'When she explained the model, I wasn’t listening.',
    ],
    knownErrors: [
      onNotion(
        'I didn’t listening when she explained the model.',
        'auxiliaires_questions_negations',
      ),
      onNotion('I weren’t listening when she explained the model.', 'accord_sujet_verbe'),
    ],
    explanation: 'Négation au passé continu : _wasn’t listening_.',
  }),
  translate(7, {
    sentenceFr: 'Le téléphone a sonné pendant que je prenais ma douche.',
    hint: 'L’événement au prétérit, l’action longue au passé continu.',
    difficulty: 2,
    accepted: [
      'The phone rang while I was having a shower.',
      'The phone rang while I was taking a shower.',
      'The phone rang while I was having my shower.',
      'The phone rang while I was taking my shower.',
      'While I was having a shower, the phone rang.',
      'While I was taking a shower, the phone rang.',
    ],
    knownErrors: [onNotion('The phone ringed while I was having a shower.', 'temps_verbaux')],
    explanation: '_Rang_ (événement), _was having a shower_ (action en cours).',
  }),
  translate(8, {
    sentenceFr: 'Quand je suis arrivé, les participants discutaient déjà du budget.',
    hint: 'L’action était déjà en cours à ton arrivée.',
    difficulty: 2,
    accepted: [
      'When I arrived, the participants were already discussing the budget.',
      'When I arrived, the participants were already talking about the budget.',
      'When I arrived, the attendees were already discussing the budget.',
      'When I got there, the participants were already discussing the budget.',
      'The participants were already discussing the budget when I arrived.',
    ],
    knownErrors: [
      onNotion(
        'When I arrived, the participants was already discussing the budget.',
        'accord_sujet_verbe',
      ),
      offNotion(
        'When I arrived, the participants were already discussing about the budget.',
        'prepositions',
      ),
    ],
    explanation:
      'Action déjà en cours : _were already discussing_. _Discuss_ se construit sans préposition.',
  }),
  translate(9, {
    sentenceFr: 'Pendant que les marchés chutaient, les investisseurs vendaient leurs actions.',
    hint: 'Deux actions en cours en même temps, au pluriel.',
    difficulty: 3,
    accepted: [
      'While the markets were falling, investors were selling their shares.',
      'While the markets were falling, the investors were selling their shares.',
      'While the markets were falling, investors were selling their stocks.',
      'While markets were falling, investors were selling their shares.',
      'While the markets were dropping, investors were selling their shares.',
      'Investors were selling their shares while the markets were falling.',
    ],
    knownErrors: [
      onNotion(
        'While the markets was falling, investors were selling their shares.',
        'accord_sujet_verbe',
      ),
    ],
    explanation: 'Deux actions simultanées au passé continu ; sujets pluriels : _were_.',
  }),
  translate(10, {
    sentenceFr: 'Elle révisait pour son examen quand son ordinateur est tombé en panne.',
    hint: 'Une action longue, interrompue par une panne.',
    difficulty: 3,
    accepted: [
      'She was studying for her exam when her computer broke down.',
      'She was revising for her exam when her computer broke down.',
      'She was studying for her exam when her computer crashed.',
      'She was revising for her exam when her computer crashed.',
      'She was studying for her exam when her laptop broke down.',
      'She was studying for her exam when her computer stopped working.',
      'She was revising for her exam when her computer stopped working.',
    ],
    knownErrors: [
      onNotion(
        'She were studying for her exam when her computer broke down.',
        'accord_sujet_verbe',
      ),
    ],
    explanation: '_Was studying_ (ou _revising_), puis la panne au prétérit.',
  }),
  translate(11, {
    sentenceFr: 'Qu’est-ce que vous faisiez quand l’alarme s’est déclenchée ?',
    hint: 'Question sur une action en cours au moment d’un événement passé.',
    difficulty: 3,
    accepted: [
      'What were you doing when the alarm went off?',
      'What were you doing when the alarm sounded?',
      'What were you doing when the fire alarm went off?',
      'What were you doing when the alarm rang?',
    ],
    knownErrors: [
      onNotion('What did you doing when the alarm went off?', 'auxiliaires_questions_negations'),
      onNotion('What you were doing when the alarm went off?', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Question au passé continu, puis l’événement au prétérit (_went off_).',
  }),
  // Added on 2026-10-16 (D-094): presented by difficulty with the ones above.
  translate(12, {
    sentenceFr: 'Il neigeait quand nous sommes partis.',
    hint: 'Une action en cours dans le passé, pendant qu’une autre a lieu.',
    difficulty: 1,
    accepted: ['It was snowing when we left.'],
    knownErrors: [
      onNotion('It was snow when we left.', 'temps_verbaux'),
      onNotion('It were snowing when we left.', 'accord_sujet_verbe'),
    ],
    explanation: 'Le décor, en cours : _was snowing_ ; l’action ponctuelle : _left_.',
  }),
  translate(13, {
    sentenceFr: 'Tu dormais quand je suis rentré ?',
    hint: 'Une question sur une action en cours à un moment passé.',
    difficulty: 1,
    accepted: [
      'Were you sleeping when I got home?',
      'Were you sleeping when I came home?',
      'Were you sleeping when I got back?',
      'Were you sleeping when I came back?',
    ],
    knownErrors: [
      onNotion('Did you sleeping when I got home?', 'auxiliaires_questions_negations'),
      onNotion('Was you sleeping when I got home?', 'accord_sujet_verbe'),
    ],
    explanation: 'Question au passé continu : _Were you sleeping…?_, avec _were_ pour _you_.',
  }),
  translate(14, {
    sentenceFr: 'Hier à midi, nous déjeunions avec un client.',
    hint: 'Une action en cours à un moment précis du passé.',
    difficulty: 2,
    accepted: [
      'At noon yesterday, we were having lunch with a client.',
      'Yesterday at noon, we were having lunch with a client.',
      'We were having lunch with a client at noon yesterday.',
      'Yesterday at midday, we were having lunch with a client.',
      'At midday yesterday, we were having lunch with a client.',
    ],
    knownErrors: [
      onNotion('At noon yesterday, we were have lunch with a client.', 'temps_verbaux'),
      onNotion('At noon yesterday, we was having lunch with a client.', 'accord_sujet_verbe'),
    ],
    explanation: 'À un moment précis du passé, une action en cours : _we were having lunch_.',
  }),
  translate(15, {
    sentenceFr: 'Je ne regardais pas l’écran quand l’erreur est apparue.',
    hint: 'Une action en cours dans le passé, à la forme négative.',
    difficulty: 2,
    accepted: [
      'I wasn’t looking at the screen when the error appeared.',
      'I wasn’t looking at the screen when the error came up.',
      'I wasn’t watching the screen when the error appeared.',
    ],
    knownErrors: [
      onNotion(
        'I didn’t looking at the screen when the error appeared.',
        'auxiliaires_questions_negations',
      ),
      onNotion('I weren’t looking at the screen when the error appeared.', 'accord_sujet_verbe'),
    ],
    explanation: 'Négation au passé continu : _wasn’t looking_, puis l’événement au prétérit.',
  }),
  translate(16, {
    sentenceFr: 'Pendant qu’elle conduisait, elle écoutait un podcast sur la finance.',
    hint: 'Deux actions en cours en même temps, dans le passé.',
    difficulty: 2,
    accepted: [
      'While she was driving, she was listening to a podcast about finance.',
      'While she was driving, she was listening to a finance podcast.',
      'While she was driving, she was listening to a podcast on finance.',
      'She was listening to a podcast about finance while she was driving.',
      'She was listening to a finance podcast while she was driving.',
    ],
    knownErrors: [
      onNotion(
        'While she was driving, she was listen to a podcast about finance.',
        'temps_verbaux',
      ),
      offNotion(
        'While she was driving, she was listening a podcast about finance.',
        'prepositions',
      ),
    ],
    explanation: 'Deux actions simultanées : _was driving_, _was listening to_ (avec _to_).',
  }),
  translate(17, {
    sentenceFr: 'Quand la panne a eu lieu, les clients essayaient de se connecter.',
    hint: 'Un événement ponctuel, pendant une action en cours.',
    difficulty: 3,
    accepted: [
      'When the outage happened, customers were trying to log in.',
      'When the outage happened, the customers were trying to log in.',
      'When the outage happened, clients were trying to log in.',
      'When the system went down, customers were trying to log in.',
      'When the outage happened, customers were trying to log on.',
    ],
    knownErrors: [
      onNotion('When the outage happened, customers were try to log in.', 'temps_verbaux'),
    ],
    explanation: 'L’action en cours : _were trying_ ; l’événement : _happened_.',
  }),
  translate(18, {
    sentenceFr:
      'Je travaillais sur la présentation quand mon ordinateur s’est éteint, et j’ai tout perdu.',
    hint: 'Une action en cours, interrompue, puis une conséquence.',
    difficulty: 3,
    accepted: [
      'I was working on the presentation when my computer shut down, and I lost everything.',
      'I was working on the presentation when my computer switched off, and I lost everything.',
      'I was working on the presentation when my computer turned off, and I lost everything.',
      'I was working on the presentation when my laptop shut down, and I lost everything.',
    ],
    knownErrors: [
      onNotion(
        'I was work on the presentation when my computer shut down, and I lost everything.',
        'temps_verbaux',
      ),
    ],
    explanation: 'Action en cours : _was working_ ; interruption et conséquence au prétérit.',
  }),
  translate(19, {
    sentenceFr: 'Pendant que tu expliquais le modèle, je prenais des notes.',
    hint: 'Deux actions en cours en même temps, dans le passé.',
    difficulty: 3,
    accepted: [
      'While you were explaining the model, I was taking notes.',
      'I was taking notes while you were explaining the model.',
      'While you were explaining the model, I was making notes.',
    ],
    knownErrors: [
      onNotion('While you were explaining the model, I was take notes.', 'temps_verbaux'),
      onNotion('While you was explaining the model, I was taking notes.', 'accord_sujet_verbe'),
    ],
    explanation: 'Deux actions simultanées : _were explaining_ (avec _you_), _was taking_.',
  }),
  translate(20, {
    sentenceFr: 'Elle ne m’écoutait pas : elle lisait ses messages.',
    hint: 'Ce qui ne se passait pas, puis ce qui se passait à ce moment-là.',
    difficulty: 2,
    accepted: [
      'She wasn’t listening to me: she was reading her messages.',
      'She wasn’t listening to me: she was checking her messages.',
    ],
    knownErrors: [
      onNotion(
        'She didn’t listening to me: she was reading her messages.',
        'auxiliaires_questions_negations',
      ),
      offNotion('She wasn’t listening me: she was reading her messages.', 'prepositions'),
    ],
    explanation:
      'Négation au passé continu : _wasn’t listening to_ ; action en cours : _was reading_.',
  }),
];
