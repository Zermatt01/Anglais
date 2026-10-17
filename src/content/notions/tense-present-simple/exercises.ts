import { exercisesOf, offNotion, onNotion } from '../../builders.ts';
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
    knownErrors: [onNotion('She work for a bank.', 'accord_sujet_verbe')],
    explanation: 'Situation stable : présent simple, avec le _-s_ de la 3e personne.',
  }),
  translate(2, {
    sentenceFr: 'Je ne bois pas de café.',
    hint: 'Négation au présent simple : il faut un auxiliaire.',
    difficulty: 1,
    accepted: ['I don’t drink coffee.'],
    knownErrors: [
      onNotion('I not drink coffee.', 'auxiliaires_questions_negations'),
      onNotion('I don’t drinks coffee.', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Négation : _don’t_ + base verbale.',
  }),
  translate(3, {
    sentenceFr: 'Est-ce que tu parles allemand ?',
    hint: 'Question au présent simple : l’auxiliaire se place en tête.',
    difficulty: 1,
    accepted: ['Do you speak German?'],
    knownErrors: [
      onNotion('Are you speak German?', 'auxiliaires_questions_negations'),
      onNotion('Speak you German?', 'auxiliaires_questions_negations'),
    ],
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
    knownErrors: [onNotion('The train leave at eight.', 'accord_sujet_verbe')],
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
      onNotion('My manager never come to the office on Mondays.', 'accord_sujet_verbe'),
      offNotion('My manager comes never to the office on Mondays.', 'ordre_des_mots'),
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
    knownErrors: [
      onNotion('What time the meeting starts?', 'auxiliaires_questions_negations'),
      onNotion('What time does the meeting starts?', 'auxiliaires_questions_negations'),
    ],
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
    knownErrors: [
      onNotion('It depend on the client.', 'accord_sujet_verbe'),
      offNotion('It depends of the client.', 'prepositions'),
    ],
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
    knownErrors: [
      onNotion('Our customers usually pays by card.', 'accord_sujet_verbe'),
      offNotion('Our customers pay usually by card.', 'ordre_des_mots'),
    ],
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
      onNotion('She don’t work on Fridays, but she answers her emails.', 'accord_sujet_verbe'),
      onNotion(
        'She doesn’t works on Fridays, but she answers her emails.',
        'auxiliaires_questions_negations',
      ),
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
      onNotion('How many languages your brother speaks?', 'auxiliaires_questions_negations'),
      onNotion('How many languages does your brother speaks?', 'auxiliaires_questions_negations'),
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
      offNotion(
        'Central banks rise their rates when inflation rises.',
        'choix_lexical_collocations',
      ),
      offNotion(
        'Central banks raise their rates when inflation raises.',
        'choix_lexical_collocations',
      ),
    ],
    explanation:
      '_Raise_ (augmenter quelque chose) : _raise their rates_. _Rise_ (augmenter, sans complément) : _inflation rises_.',
  }),
  // Added on 2026-10-16 (D-094): presented by difficulty with the ones above.
  translate(12, {
    sentenceFr: 'Il enseigne l’économie dans un lycée.',
    hint: 'Un métier : une situation stable.',
    difficulty: 1,
    accepted: [
      'He teaches economics at a high school.',
      'He teaches economics in a high school.',
      'He teaches economics at a secondary school.',
      'He teaches economics in a secondary school.',
    ],
    knownErrors: [
      onNotion('He teach economics at a high school.', 'accord_sujet_verbe'),
      offNotion('He teaches the economics at a high school.', 'articles'),
    ],
    explanation:
      'Situation stable : présent simple, _he teaches_ (avec _-es_). Une matière en général se dit sans article.',
  }),
  translate(13, {
    sentenceFr: 'Nous ne travaillons pas le week-end.',
    hint: 'Une habitude, à la forme négative.',
    difficulty: 1,
    accepted: [
      'We don’t work at weekends.',
      'We don’t work at the weekend.',
      'We don’t work on weekends.',
      'We don’t work on the weekend.',
    ],
    knownErrors: [
      onNotion('We not work at weekends.', 'auxiliaires_questions_negations'),
      onNotion('We don’t works at weekends.', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Négation au présent simple : _don’t_ + base verbale, _we don’t work_.',
  }),
  translate(14, {
    sentenceFr: 'Est-ce qu’elle parle anglais au travail ?',
    hint: 'Une question sur une habitude, avec un sujet à la troisième personne.',
    difficulty: 1,
    accepted: ['Does she speak English at work?'],
    knownErrors: [
      onNotion('Does she speaks English at work?', 'auxiliaires_questions_negations'),
      onNotion('Is she speak English at work?', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Question : _Does_ + sujet + base verbale, sans _-s_ : _Does she speak…?_',
  }),
  translate(15, {
    sentenceFr: 'Le marché ouvre à neuf heures et ferme à dix-sept heures trente.',
    hint: 'Un horaire officiel, avec un sujet singulier.',
    difficulty: 2,
    accepted: [
      'The market opens at nine and closes at half past five.',
      'The market opens at 9 am and closes at 5.30 pm.',
      'The market opens at 9 am and closes at 5:30 pm.',
      'The market opens at 9:00 and closes at 17:30.',
      'The market opens at nine and closes at five thirty.',
    ],
    knownErrors: [
      onNotion('The market open at nine and close at half past five.', 'accord_sujet_verbe'),
    ],
    explanation: 'Un horaire : présent simple, _opens_ et _closes_, avec le _-s_.',
  }),
  translate(16, {
    sentenceFr: 'Combien est-ce que ce logiciel coûte par mois ?',
    hint: 'Une question sur un prix, avec un auxiliaire.',
    difficulty: 2,
    accepted: [
      'How much does this software cost per month?',
      'How much does this software cost a month?',
    ],
    knownErrors: [
      onNotion('How much this software costs per month?', 'auxiliaires_questions_negations'),
      onNotion('How much does this software costs per month?', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Question : _How much does_ + sujet + base verbale (_cost_, sans _-s_).',
  }),
  translate(17, {
    sentenceFr: 'Je ne comprends pas cette formule.',
    hint: 'Un verbe d’état, à la forme négative.',
    difficulty: 2,
    accepted: ['I don’t understand this formula.'],
    knownErrors: [
      onNotion('I not understand this formula.', 'auxiliaires_questions_negations'),
      onNotion('I don’t understands this formula.', 'auxiliaires_questions_negations'),
    ],
    explanation: 'Négation au présent simple : _I don’t understand_.',
  }),
  translate(18, {
    sentenceFr: 'Mon frère vit à Lausanne, mais il travaille à Berne.',
    hint: 'Deux faits stables, avec des sujets à la troisième personne.',
    difficulty: 3,
    accepted: [
      'My brother lives in Lausanne, but he works in Bern.',
      'My brother lives in Lausanne, but he works in Berne.',
    ],
    knownErrors: [
      onNotion('My brother live in Lausanne, but he work in Bern.', 'accord_sujet_verbe'),
      onNotion('My brother lives in Lausanne, but he work in Bern.', 'accord_sujet_verbe'),
    ],
    explanation: 'Faits stables : _lives_, _works_, avec le _-s_ de la troisième personne.',
  }),
  translate(19, {
    sentenceFr: 'Les élèves rendent leurs devoirs le lundi, et je les corrige le mardi.',
    hint: 'Deux habitudes de la semaine.',
    difficulty: 3,
    accepted: [
      'The students hand in their homework on Mondays, and I mark it on Tuesdays.',
      'The students hand in their homework on Mondays, and I correct it on Tuesdays.',
      'The students hand in their homework on Mondays, and I grade it on Tuesdays.',
      'The pupils hand in their homework on Mondays, and I mark it on Tuesdays.',
      'The students submit their homework on Mondays, and I mark it on Tuesdays.',
    ],
    knownErrors: [
      onNotion(
        'The students hand in their homework on Mondays, and I marks it on Tuesdays.',
        'accord_sujet_verbe',
      ),
      offNotion(
        'The students hand in their homeworks on Mondays, and I mark them on Tuesdays.',
        'indenombrables_pluriels',
      ),
    ],
    explanation:
      'Habitudes : présent simple, _hand in_ et _I mark_. Dans l’usage courant recommandé, _homework_ est indénombrable : pas de _-s_, et on le reprend par _it_.',
  }),
  translate(20, {
    sentenceFr: 'Un client qui paie en avance reçoit une remise de cinq pour cent.',
    hint: 'Une règle générale, avec un sujet singulier et une proposition relative.',
    difficulty: 3,
    accepted: [
      'A customer who pays in advance gets a five per cent discount.',
      'A customer who pays in advance gets a 5% discount.',
      'A customer who pays in advance gets a five percent discount.',
      'A customer who pays in advance receives a five per cent discount.',
      'A customer who pays in advance receives a 5% discount.',
      'A client who pays in advance gets a five per cent discount.',
      'A client who pays in advance gets a 5% discount.',
    ],
    knownErrors: [
      onNotion('A customer who pay in advance get a five per cent discount.', 'accord_sujet_verbe'),
    ],
    explanation:
      'Règle générale : présent simple, _pays_ et _gets_, avec le _-s_ de la troisième personne.',
  }),
];
