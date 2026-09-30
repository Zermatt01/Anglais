import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, place, translate } = exercisesOf('tense-present-simple', REVIEW);

const HABIT = 'Habitude, routine ou horaire régulier';
const PERMANENT = 'Fait permanent ou situation stable';
const GENERAL = 'Vérité générale';
const STATE = 'Verbe d’état (savoir, appartenir, dépendre…)';
const NOW = 'Action en cours au moment où l’on parle';
const FINISHED = 'Action terminée dans le passé';
const Q_SINGULAR = 'Question au présent simple, sujet à la 3e personne du singulier';
const Q_PLURAL = 'Question au présent simple, sujet au pluriel ou _you_';
const Q_CONTINUOUS = 'Question sur une action en cours';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'She ___ the markets every morning before breakfast.',
    options: ['checks', 'check', 'checking'],
    answer: 'checks',
    reasons: [HABIT, NOW, GENERAL],
    reason: HABIT,
    explanation: '_Every morning_ : une routine. Sujet _she_ : le verbe prend un _-s_, _checks_.',
  }),
  choice(2, {
    sentence: 'My brother ___ for an insurance company in Lyon.',
    options: ['works', 'work', 'working'],
    answer: 'works',
    reasons: [PERMANENT, NOW, GENERAL],
    reason: PERMANENT,
    explanation: 'Son emploi est une situation stable : _works_, avec le _-s_ de la 3e personne.',
  }),
  choice(3, {
    sentence: 'Higher interest rates ___ borrowing more expensive.',
    options: ['make', 'makes', 'making'],
    answer: 'make',
    reasons: [GENERAL, NOW, HABIT],
    reason: GENERAL,
    explanation:
      'Un mécanisme toujours vrai : vérité générale. Le sujet _rates_ est au pluriel : _make_, sans _-s_.',
  }),
  choice(4, {
    sentence: '___ your manager speak German?',
    options: ['Does', 'Do', 'Is'],
    answer: 'Does',
    reasons: [Q_SINGULAR, Q_PLURAL, Q_CONTINUOUS],
    reason: Q_SINGULAR,
    explanation: '_Your manager_ = _he_ ou _she_ : la question se construit avec _does_.',
  }),
  choice(5, {
    sentence: 'I ___ the answer to your question.',
    options: ['know', 'am knowing', 'knows'],
    answer: 'know',
    reasons: [STATE, NOW, HABIT],
    reason: STATE,
    explanation: '_Know_ décrit un état, pas une action : il reste au présent simple.',
  }),
  choice(6, {
    sentence: 'The train to Geneva ___ at 7:45 every day.',
    options: ['leaves', 'leave', 'leaving'],
    answer: 'leaves',
    reasons: [HABIT, NOW, GENERAL],
    reason: HABIT,
    explanation: 'Un horaire régulier : présent simple, _leaves_ (sujet _the train_).',
  }),
  choice(7, {
    sentence: 'He ___ coffee; he only drinks tea.',
    options: ['doesn’t drink', 'don’t drink', 'doesn’t drinks'],
    answer: 'doesn’t drink',
    reasons: [HABIT, NOW, FINISHED],
    reason: HABIT,
    explanation: 'Une habitude. Négation à la 3e personne : _doesn’t_ + base verbale, sans _-s_.',
  }),
  choice(8, {
    sentence: 'This laptop ___ to the bank, not to me.',
    options: ['belongs', 'is belonging', 'belong'],
    answer: 'belongs',
    reasons: [STATE, NOW, HABIT],
    reason: STATE,
    explanation: '_Belong_ est un verbe d’état : jamais au continu. Sujet singulier : _belongs_.',
  }),
  choice(9, {
    sentence: 'How often ___ your manager travel abroad?',
    options: ['does', 'do', 'is'],
    answer: 'does',
    reasons: [Q_SINGULAR, Q_PLURAL, Q_CONTINUOUS],
    reason: Q_SINGULAR,
    explanation: 'Question sur une habitude, sujet singulier : _does_ + base verbale.',
  }),
  choice(10, {
    sentence: 'Most of my students ___ to school by train.',
    options: ['come', 'comes', 'coming'],
    answer: 'come',
    reasons: [HABIT, NOW, GENERAL],
    reason: HABIT,
    explanation: 'Une habitude. _Most of my students_ est au pluriel : _come_, sans _-s_.',
  }),
  choice(11, {
    sentence: 'Inflation ___ the value of savings.',
    options: ['reduces', 'reduce', 'reducing'],
    answer: 'reduces',
    reasons: [GENERAL, NOW, HABIT],
    reason: GENERAL,
    explanation: 'Un mécanisme économique toujours vrai. Sujet singulier : _reduces_.',
  }),
  choice(12, {
    sentence: 'We ___ our team meeting on Mondays at nine.',
    options: ['have', 'has', 'having'],
    answer: 'have',
    reasons: [HABIT, NOW, GENERAL],
    reason: HABIT,
    explanation: '_On Mondays_ : chaque lundi, une routine. Sujet _we_ : _have_.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'She ___ in a bank in Zurich.',
    verb: 'work',
    meaningFr: 'Elle travaille dans une banque à Zurich.',
    accepted: ['works'],
    knownErrors: ['work', 'working'],
    explanation: 'Situation stable, sujet _she_ : _works_.',
  }),
  fill(2, {
    sentence: 'The model ___ house prices quite well.',
    verb: 'predict',
    meaningFr: 'Le modèle prédit assez bien le prix des logements.',
    accepted: ['predicts'],
    knownErrors: ['predict', 'predicting'],
    explanation: '_The model_ = _it_ : le verbe prend un _-s_, _predicts_.',
  }),
  fill(3, {
    sentence: 'My manager ___ on Fridays.',
    verb: 'work (à la forme négative)',
    meaningFr: 'Ma responsable ne travaille pas le vendredi.',
    accepted: ['doesn’t work'],
    knownErrors: ['don’t work', 'doesn’t works', 'not works'],
    explanation: 'Négation à la 3e personne : _doesn’t_ + base verbale, sans _-s_.',
  }),
  fill(4, {
    sentence: '___ she speak Italian?',
    verb: 'do',
    meaningFr: 'Est-ce qu’elle parle italien ?',
    accepted: ['Does'],
    knownErrors: ['Do', 'Is'],
    explanation: 'Question au présent simple, sujet _she_ : _Does_ + base verbale.',
  }),
  fill(5, {
    sentence: 'He ___ his emails twice a day.',
    verb: 'check',
    meaningFr: 'Il consulte ses e-mails deux fois par jour.',
    accepted: ['checks'],
    knownErrors: ['check', 'checking'],
    explanation: 'Habitude (_twice a day_), sujet _he_ : _checks_.',
  }),
  fill(6, {
    sentence: 'The bank ___ loans to small businesses.',
    verb: 'offer',
    meaningFr: 'La banque propose des prêts aux petites entreprises.',
    accepted: ['offers'],
    knownErrors: ['offering'],
    explanation: 'Un fait stable, sujet singulier : _offers_.',
  }),
  fill(7, {
    sentence: 'What time ___ the office open?',
    verb: 'do',
    meaningFr: 'À quelle heure le bureau ouvre-t-il ?',
    accepted: ['does'],
    knownErrors: ['do'],
    explanation: 'Question sur un horaire, sujet _the office_ : _does_ + _open_.',
  }),
  fill(8, {
    sentence: 'She ___ to the gym three times a week.',
    verb: 'go',
    meaningFr: 'Elle va à la salle de sport trois fois par semaine.',
    accepted: ['goes'],
    knownErrors: ['go', 'gos', 'going'],
    explanation: '_Go_ prend _-es_ à la 3e personne : _goes_.',
  }),
  fill(9, {
    sentence: 'My sister ___ statistics at university.',
    verb: 'study',
    meaningFr: 'Ma sœur étudie les statistiques à l’université.',
    accepted: ['studies'],
    knownErrors: ['study', 'studys'],
    explanation: 'Consonne + _y_ : _study_ devient _studies_.',
  }),
  fill(10, {
    sentence: 'It ___ on the market conditions.',
    verb: 'depend',
    meaningFr: 'Cela dépend des conditions du marché.',
    accepted: ['depends'],
    knownErrors: ['depend'],
    explanation: '_Depend_ est un verbe d’état : présent simple, _it depends on_.',
  }),
  transform(11, {
    source: 'She works on Saturdays.',
    instructionFr: 'Mets la phrase à la forme négative.',
    accepted: ['She doesn’t work on Saturdays.'],
    knownErrors: [
      'She doesn’t works on Saturdays.',
      'She don’t work on Saturdays.',
      'She not works on Saturdays.',
    ],
    explanation: 'Négation : _doesn’t_ + base verbale ; le _-s_ passe sur _does_.',
  }),
  transform(12, {
    source: 'They speak Spanish.',
    instructionFr: 'Mets la phrase à la forme interrogative.',
    accepted: ['Do they speak Spanish?'],
    knownErrors: ['Does they speak Spanish?', 'Speak they Spanish?'],
    explanation: 'Question : _Do_ + sujet + base verbale (_they_ : _do_, pas _does_).',
  }),
  transform(13, {
    source: 'I check the figures every week.',
    instructionFr: 'Remplace « I » par « He » et accorde le verbe.',
    accepted: ['He checks the figures every week.'],
    knownErrors: ['He check the figures every week.'],
    explanation: 'Sujet à la 3e personne du singulier : _checks_.',
  }),
  place(14, {
    sentence: 'I work late on Thursdays.',
    word: 'usually',
    meaningFr: 'Je travaille généralement tard le jeudi.',
    accepted: [
      'I usually work late on Thursdays.',
      'Usually I work late on Thursdays.',
      'I work late on Thursdays usually.',
    ],
    knownErrors: ['I work usually late on Thursdays.'],
    explanation: 'L’adverbe de fréquence se place avant le verbe : _I usually work_.',
  }),
  place(15, {
    sentence: 'She is on time.',
    word: 'always',
    meaningFr: 'Elle est toujours à l’heure.',
    accepted: ['She is always on time.'],
    explanation: 'Avec _be_, l’adverbe de fréquence se place après le verbe : _She is always_.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Elle travaille pour une banque.',
    hint: 'Situation stable, sujet à la 3e personne du singulier.',
    difficulty: 1,
    accepted: ['She works for a bank.', 'She works at a bank.', 'She works in a bank.'],
    knownErrors: ['She work for a bank.'],
    explanation: 'Situation stable : présent simple, avec le _-s_ de la 3e personne.',
  }),
  translate(2, {
    sentenceFr: 'Je ne bois pas de café.',
    hint: 'Négation au présent simple : il faut un auxiliaire.',
    difficulty: 1,
    accepted: ['I don’t drink coffee.'],
    knownErrors: ['I not drink coffee.', 'I don’t drinks coffee.'],
    explanation: 'Négation : _don’t_ + base verbale.',
  }),
  translate(3, {
    sentenceFr: 'Est-ce que tu parles allemand ?',
    hint: 'Question au présent simple : l’auxiliaire se place en tête.',
    difficulty: 1,
    accepted: ['Do you speak German?'],
    knownErrors: ['Are you speak German?', 'Speak you German?'],
    explanation: 'Question : _Do_ + sujet + base verbale.',
  }),
  translate(4, {
    sentenceFr: 'Le train part à huit heures.',
    hint: 'Un horaire : présent simple, sujet singulier.',
    difficulty: 1,
    accepted: [
      'The train leaves at eight.',
      'The train leaves at eight o’clock.',
      'The train leaves at 8.',
      'The train leaves at 8 am.',
      'The train departs at eight.',
      'The train departs at eight o’clock.',
    ],
    knownErrors: ['The train leave at eight.'],
    explanation: 'Un horaire : présent simple, _leaves_.',
  }),
  translate(5, {
    sentenceFr: 'Mon manager ne vient jamais au bureau le lundi.',
    hint: 'Habitude : l’adverbe de fréquence se place avant le verbe.',
    difficulty: 2,
    accepted: [
      'My manager never comes to the office on Mondays.',
      'My manager never comes into the office on Mondays.',
      'My manager never comes to the office on Monday.',
      'My boss never comes to the office on Mondays.',
      'My boss never comes into the office on Mondays.',
      'On Mondays, my manager never comes to the office.',
    ],
    knownErrors: [
      'My manager never come to the office on Mondays.',
      'My manager comes never to the office on Mondays.',
    ],
    explanation:
      '_Never_ se place avant le verbe, qui garde son _-s_ : _never comes_. Pas de _don’t_ avec _never_.',
  }),
  translate(6, {
    sentenceFr: 'À quelle heure est-ce que la réunion commence ?',
    hint: 'Question sur un horaire, sujet singulier.',
    difficulty: 2,
    accepted: [
      'What time does the meeting start?',
      'What time does the meeting begin?',
      'When does the meeting start?',
      'When does the meeting begin?',
      'At what time does the meeting start?',
    ],
    knownErrors: ['What time the meeting starts?', 'What time does the meeting starts?'],
    explanation: 'Question : _does_ + sujet + base verbale (_start_, sans _-s_).',
  }),
  translate(7, {
    sentenceFr: 'Cela dépend du client.',
    hint: 'Verbe d’état, sujet à la 3e personne.',
    difficulty: 2,
    accepted: [
      'It depends on the client.',
      'That depends on the client.',
      'It depends on the customer.',
      'That depends on the customer.',
    ],
    knownErrors: ['It depend on the client.', 'It depends of the client.'],
    explanation: '_Depend_ est un verbe d’état : _it depends on_ (avec la préposition _on_).',
  }),
  translate(8, {
    sentenceFr: 'Nos clients paient généralement par carte.',
    hint: 'Habitude ; attention au sujet pluriel et à la place de l’adverbe.',
    difficulty: 2,
    accepted: [
      'Our customers usually pay by card.',
      'Our clients usually pay by card.',
      'Our customers generally pay by card.',
      'Our clients generally pay by card.',
      'Our customers normally pay by card.',
      'Our clients normally pay by card.',
      'Our customers usually pay by credit card.',
      'Our customers usually pay with a card.',
    ],
    knownErrors: ['Our customers usually pays by card.', 'Our customers pay usually by card.'],
    explanation:
      'Sujet pluriel : _pay_, sans _-s_. L’adverbe se place avant le verbe : _usually pay_.',
  }),
  translate(9, {
    sentenceFr: 'Elle ne travaille pas le vendredi, mais elle répond à ses e-mails.',
    hint: 'Deux habitudes : une négation, puis une affirmation.',
    difficulty: 3,
    accepted: [
      'She doesn’t work on Fridays, but she answers her emails.',
      'She doesn’t work on Fridays, but she replies to her emails.',
      'She doesn’t work on Fridays, but she answers her e-mails.',
      'She doesn’t work on Friday, but she answers her emails.',
      'She doesn’t work on Fridays but she answers her emails.',
      'She doesn’t work on Fridays, but she does answer her emails.',
    ],
    knownErrors: [
      'She don’t work on Fridays, but she answers her emails.',
      'She doesn’t works on Fridays, but she answers her emails.',
    ],
    explanation:
      'Négation : _doesn’t work_ ; affirmation : _answers_, avec le _-s_ de la 3e personne.',
  }),
  translate(10, {
    sentenceFr: 'Combien de langues est-ce que ton frère parle ?',
    hint: 'Question au présent simple, sujet singulier.',
    difficulty: 3,
    accepted: ['How many languages does your brother speak?'],
    knownErrors: [
      'How many languages your brother speaks?',
      'How many languages does your brother speaks?',
    ],
    explanation: 'Question : _How many languages_ + _does_ + sujet + base verbale.',
  }),
  translate(11, {
    sentenceFr: 'Les banques centrales relèvent leurs taux quand l’inflation augmente.',
    hint: 'Vérité générale : deux verbes au présent simple, l’un avec un complément, l’autre sans.',
    difficulty: 3,
    accepted: [
      'Central banks raise their rates when inflation rises.',
      'Central banks raise rates when inflation rises.',
      'Central banks raise interest rates when inflation rises.',
      'Central banks raise their interest rates when inflation rises.',
      'Central banks raise their rates when inflation goes up.',
      'Central banks raise their rates when inflation increases.',
      'Central banks raise rates when inflation goes up.',
      'Central banks raise rates when inflation increases.',
    ],
    knownErrors: [
      'Central banks rise their rates when inflation rises.',
      'Central banks raise their rates when inflation raises.',
    ],
    explanation:
      '_Raise_ (augmenter quelque chose) : _raise their rates_. _Rise_ (augmenter, sans complément) : _inflation rises_.',
  }),
];
