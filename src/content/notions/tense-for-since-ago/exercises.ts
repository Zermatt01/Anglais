import { exercisesOf, offNotion, onNotion } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf('tense-for-since-ago', REVIEW);

const FOR = 'Une durée : combien de temps ?';
const SINCE = 'Un point de départ : depuis quand ?';
const AGO = 'Un moment passé, compté à partir de maintenant : il y a';
const CONTINUES = 'Situation commencée dans le passé, qui continue maintenant';
const PRESENT_HABIT = 'Habitude présente';
const NOW = 'Action en cours maintenant, sans lien avec le passé';
const PAST_POINT = 'Avec _ago_ : un moment passé précis, donc le prétérit';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I’ve worked here ___ 2021.',
    options: ['since', 'for', 'ago'],
    answer: 'since',
    reasons: [SINCE, FOR, AGO],
    reason: SINCE,
    explanation: '_2021_ est un point de départ : _since_.',
  }),
  choice(2, {
    sentence: 'She’s been waiting ___ twenty minutes.',
    options: ['for', 'since', 'ago'],
    answer: 'for',
    reasons: [FOR, SINCE, AGO],
    reason: FOR,
    explanation: '_Twenty minutes_ est une durée : _for_.',
  }),
  choice(3, {
    sentence: 'I started this job three years ___.',
    options: ['ago', 'for', 'during'],
    answer: 'ago',
    reasons: [AGO, FOR, SINCE],
    reason: AGO,
    explanation: '« Il y a trois ans » : _three years ago_, avec le prétérit (_started_).',
  }),
  choice(4, {
    sentence: 'We haven’t met ___ the conference in May.',
    options: ['since', 'for', 'ago'],
    answer: 'since',
    reasons: [SINCE, FOR, AGO],
    reason: SINCE,
    explanation: '_The conference in May_ est un point de départ : _since_.',
  }),
  choice(5, {
    sentence: 'They’ve known each other ___ ages.',
    options: ['for', 'since', 'ago'],
    answer: 'for',
    reasons: [FOR, SINCE, AGO],
    reason: FOR,
    explanation: '_Ages_ (très longtemps) est une durée : _for ages_.',
  }),
  choice(6, {
    sentence: 'The company moved to Zurich ten years ___.',
    options: ['ago', 'for', 'during'],
    answer: 'ago',
    reasons: [AGO, FOR, SINCE],
    reason: AGO,
    explanation: '« Il y a dix ans » : _ten years ago_, avec le prétérit.',
  }),
  choice(7, {
    sentence: 'I ___ in Geneva since 2020.',
    options: ['have lived', 'live', 'am living'],
    answer: 'have lived',
    reasons: [CONTINUES, PRESENT_HABIT, NOW],
    reason: CONTINUES,
    explanation:
      '« J’habite à Genève depuis 2020 » : la situation continue, donc present perfect, et non le présent.',
  }),
  choice(8, {
    sentence: 'How long ___ here?',
    options: ['have you worked', 'you have worked', 'did you worked'],
    answer: 'have you worked',
    reasons: [
      'Question sur une durée qui continue jusqu’à maintenant',
      'Question sur un moment passé précis',
      'Question sur une habitude',
    ],
    reason: 'Question sur une durée qui continue jusqu’à maintenant',
    explanation: '_How long_ + present perfect ; dans la question, _have_ passe avant le sujet.',
  }),
  choice(9, {
    sentence: 'He ___ the bank two years ago.',
    options: ['left', 'has left', 'has leaved'],
    answer: 'left',
    reasons: [PAST_POINT, CONTINUES, NOW],
    reason: PAST_POINT,
    explanation: '_Ago_ situe l’action à un moment passé : prétérit, _left_.',
  }),
  choice(10, {
    sentence: 'I haven’t had a holiday ___ last summer.',
    options: ['since', 'for', 'ago'],
    answer: 'since',
    reasons: [SINCE, FOR, AGO],
    reason: SINCE,
    explanation: '_Last summer_ est un point de départ : _since_.',
  }),
  choice(11, {
    sentence: 'We’ve been on this project ___ six weeks.',
    options: ['for', 'since', 'ago'],
    answer: 'for',
    reasons: [FOR, SINCE, AGO],
    reason: FOR,
    explanation: '_Six weeks_ est une durée : _for_.',
  }),
  choice(12, {
    sentence: 'She has had her own company ___ she was 25.',
    options: ['since', 'for', 'ago'],
    answer: 'since',
    reasons: [SINCE, FOR, AGO],
    reason: SINCE,
    explanation: '_Since_ peut introduire une proposition : _since she was 25_.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'I ___ here since January.',
    verb: 'work',
    meaningFr: 'Je travaille ici depuis janvier.',
    accepted: ['have worked', 'have been working'],
    knownErrors: ['work', 'am working', 'worked'],
    explanation: 'La situation continue : present perfect, simple ou continu.',
  }),
  fill(2, {
    sentence: 'She ___ him for ten years.',
    verb: 'know',
    meaningFr: 'Elle le connaît depuis dix ans.',
    accepted: ['has known'],
    knownErrors: ['knows', 'is knowing', 'has been knowing'],
    explanation: '_Know_ est un verbe d’état : present perfect simple, _has known_.',
  }),
  fill(3, {
    sentence: 'We ___ for the bus for twenty minutes.',
    verb: 'wait',
    meaningFr: 'Nous attendons le bus depuis vingt minutes.',
    accepted: ['have been waiting', 'have waited'],
    knownErrors: ['wait', 'are waiting'],
    explanation: 'L’attente continue : _have been waiting_ (ou _have waited_).',
  }),
  fill(4, {
    sentence: 'They ___ to Canada five years ago.',
    verb: 'move',
    meaningFr: 'Ils ont déménagé au Canada il y a cinq ans.',
    accepted: ['moved'],
    knownErrors: ['have moved', 'move'],
    explanation: '_Ago_ : prétérit, _moved_.',
  }),
  fill(5, {
    sentence: 'How long ___ Spanish?',
    verb: 'you / study',
    meaningFr: 'Depuis combien de temps étudies-tu l’espagnol ?',
    accepted: ['have you studied', 'have you been studying'],
    knownErrors: ['you have studied', 'did you studied'],
    explanation: '_How long_ + present perfect : _have you been studying_ (ou _have you studied_).',
  }),
  fill(6, {
    sentence: 'I ___ my manager since Monday.',
    verb: 'see (à la forme négative)',
    meaningFr: 'Je n’ai pas vu ma responsable depuis lundi.',
    accepted: ['haven’t seen'],
    knownErrors: ['don’t see', 'didn’t see'],
    explanation: '_Since Monday_ : present perfect, _haven’t seen_.',
  }),
  fill(7, {
    sentence: 'The price of oil ___ by 20% since March.',
    verb: 'rise',
    meaningFr: 'Le prix du pétrole a augmenté de 20 % depuis mars.',
    accepted: ['has risen', 'has been rising'],
    knownErrors: ['rose', 'has raised', 'rises'],
    explanation: '_Since March_ : present perfect. Participe de _rise_ : _risen_.',
  }),
  fill(8, {
    sentence: 'He ___ for the bank since he graduated.',
    verb: 'work',
    meaningFr: 'Il travaille pour la banque depuis qu’il a obtenu son diplôme.',
    accepted: ['has worked', 'has been working'],
    knownErrors: ['works', 'worked'],
    explanation: 'La situation continue depuis son diplôme : present perfect.',
  }),
  fill(9, {
    sentence: 'Our team ___ this client for three years.',
    verb: 'have',
    meaningFr: 'Notre équipe a ce client depuis trois ans.',
    accepted: ['has had', 'have had'],
    knownErrors: ['is having'],
    explanation:
      '_Have_ (posséder) est un verbe d’état : _has had_. En anglais britannique, _team_ admet aussi le pluriel.',
  }),
  fill(10, {
    sentence: 'I ___ to the gym for months.',
    verb: 'go (à la forme négative)',
    meaningFr: 'Je ne suis pas allé à la salle de sport depuis des mois.',
    accepted: ['haven’t been', 'haven’t gone'],
    knownErrors: ['don’t go', 'didn’t go'],
    explanation: 'Absence qui dure jusqu’à maintenant : _haven’t been_ (ou _haven’t gone_).',
  }),
  transform(11, {
    source: 'I work in Lyon.',
    instructionFr: 'Ajoute « since 2022 » à la fin et adapte le temps du verbe.',
    accepted: ['I have worked in Lyon since 2022.', 'I have been working in Lyon since 2022.'],
    knownErrors: ['I work in Lyon since 2022.', 'I am working in Lyon since 2022.'],
    explanation: 'Avec _since_, la situation continue : present perfect, simple ou continu.',
  }),
  transform(12, {
    source: 'It’s been three years that I work here.',
    instructionFr: 'Corrige ce calque du français.',
    accepted: [
      'I have worked here for three years.',
      'I have been working here for three years.',
      'It has been three years since I started working here.',
      'It has been three years since I started work here.',
    ],
    knownErrors: ['I work here since three years.', 'I have worked here since three years.'],
    explanation:
      '« Cela fait trois ans que » : _for three years_ + present perfect, ou _It’s been three years since…_',
  }),
  transform(13, {
    source: 'She started this job two years ago.',
    instructionFr: 'Réécris la phrase avec « for » et le present perfect de « have ».',
    accepted: ['She has had this job for two years.'],
    knownErrors: ['She has this job for two years.', 'She has had this job since two years.'],
    explanation: 'La situation continue : _has had_ + _for_ + durée.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Je travaille ici depuis trois ans.',
    hint: '« Depuis » + une durée ; la situation continue.',
    difficulty: 1,
    accepted: ['I’ve worked here for three years.', 'I’ve been working here for three years.'],
    knownErrors: [
      onNotion('I work here since three years.', 'temps_verbaux'),
      onNotion('I work here for three years.', 'temps_verbaux'),
      onNotion('I have worked here since three years.', 'temps_verbaux'),
    ],
    explanation: 'Present perfect + _for_ + durée : _I’ve worked here for three years._',
  }),
  translate(2, {
    sentenceFr: 'Elle est enseignante depuis 2019.',
    hint: '« Depuis » + un point de départ.',
    difficulty: 1,
    accepted: ['She’s been a teacher since 2019.'],
    knownErrors: [
      onNotion('She is a teacher since 2019.', 'temps_verbaux'),
      onNotion('She has been a teacher for 2019.', 'temps_verbaux'),
    ],
    explanation: 'Present perfect de _be_ + _since_ : _She’s been a teacher since 2019._',
  }),
  translate(3, {
    sentenceFr: 'Il a quitté l’entreprise il y a deux ans.',
    hint: '« Il y a » + une durée : un moment passé précis.',
    difficulty: 1,
    accepted: ['He left the company two years ago.', 'He left the firm two years ago.'],
    knownErrors: [
      onNotion('He has left the company two years ago.', 'temps_verbaux'),
      onNotion('He left the company since two years.', 'temps_verbaux'),
    ],
    explanation: '_Ago_ + prétérit : _He left the company two years ago._',
  }),
  translate(4, {
    sentenceFr: 'Depuis combien de temps apprends-tu l’anglais ?',
    hint: 'Question sur une durée qui continue jusqu’à maintenant.',
    difficulty: 1,
    accepted: [
      'How long have you been learning English?',
      'How long have you been studying English?',
      'How long have you studied English?',
    ],
    knownErrors: [
      onNotion('Since how long do you learn English?', 'temps_verbaux'),
      onNotion('Since when do you learn English?', 'temps_verbaux'),
    ],
    explanation: '« Depuis combien de temps » : _How long_ + present perfect (souvent continu).',
  }),
  translate(5, {
    sentenceFr: 'Nous attendons depuis 9 heures.',
    hint: '« Depuis » + un point de départ ; l’attente continue.',
    difficulty: 2,
    accepted: [
      'We’ve been waiting since 9 o’clock.',
      'We’ve been waiting since nine o’clock.',
      'We’ve been waiting since 9.',
      'We’ve been waiting since nine.',
      'We’ve been waiting since 9 a.m.',
      'We’ve waited since 9 o’clock.',
    ],
    knownErrors: [
      onNotion('We wait since 9 o’clock.', 'temps_verbaux'),
      onNotion('We are waiting since 9 o’clock.', 'temps_verbaux'),
    ],
    explanation: 'Present perfect continu + _since_ : _We’ve been waiting since 9 o’clock._',
  }),
  translate(6, {
    sentenceFr: 'Je ne l’ai pas vu depuis la réunion.',
    hint: 'Une absence qui dure depuis un point de départ.',
    difficulty: 2,
    accepted: [
      'I haven’t seen him since the meeting.',
      'I haven’t seen her since the meeting.',
      'I haven’t seen it since the meeting.',
    ],
    knownErrors: [
      onNotion('I didn’t see him since the meeting.', 'temps_verbaux'),
      onNotion('I don’t see him since the meeting.', 'temps_verbaux'),
    ],
    explanation: '_Since_ + present perfect : _I haven’t seen him since the meeting._',
  }),
  translate(7, {
    sentenceFr: 'La banque centrale a relevé ses taux il y a trois mois.',
    hint: '« Il y a » : un moment passé précis.',
    difficulty: 2,
    accepted: [
      'The central bank raised its rates three months ago.',
      'The central bank raised its interest rates three months ago.',
      'The central bank raised rates three months ago.',
      'The central bank raised interest rates three months ago.',
      'Three months ago, the central bank raised its rates.',
    ],
    knownErrors: [
      onNotion('The central bank has raised its rates three months ago.', 'temps_verbaux'),
      offNotion('The central bank rose its rates three months ago.', 'choix_lexical_collocations'),
    ],
    explanation: '_Ago_ + prétérit. _Raise_ (augmenter quelque chose), au prétérit : _raised_.',
  }),
  translate(8, {
    sentenceFr: 'Ils se connaissent depuis l’université.',
    hint: 'Verbe d’état ; « depuis » + un point de départ.',
    difficulty: 2,
    accepted: [
      'They’ve known each other since university.',
      'They’ve known each other since college.',
      'They’ve known one another since university.',
    ],
    knownErrors: [
      onNotion('They know each other since university.', 'temps_verbaux'),
      onNotion('They have been knowing each other since university.', 'temps_verbaux'),
    ],
    explanation: '_Know_ est un verbe d’état : _They’ve known each other since university._',
  }),
  translate(9, {
    sentenceFr: 'Il vit à Genève depuis six ans ; avant, il a vécu à Paris pendant deux ans.',
    hint: 'Une situation qui continue, puis une période terminée.',
    difficulty: 3,
    accepted: [
      'He’s lived in Geneva for six years; before that, he lived in Paris for two years.',
      'He’s been living in Geneva for six years; before that, he lived in Paris for two years.',
      'He’s lived in Geneva for six years; before, he lived in Paris for two years.',
      'He’s lived in Geneva for six years; previously, he lived in Paris for two years.',
      'He’s lived in Geneva for six years, and before that he lived in Paris for two years.',
      'He’s been living in Geneva for six years, and before that he lived in Paris for two years.',
    ],
    knownErrors: [
      onNotion(
        'He lives in Geneva for six years; before that, he lived in Paris for two years.',
        'temps_verbaux',
      ),
      onNotion(
        'He’s lived in Geneva since six years; before that, he lived in Paris for two years.',
        'temps_verbaux',
      ),
    ],
    explanation:
      'Situation actuelle : present perfect + _for_. Période terminée : prétérit + _for_.',
  }),
  translate(10, {
    sentenceFr: 'Cela fait trois semaines que nous n’avons pas de nouvelles du client.',
    hint: 'Une absence de nouvelles qui dure ; attention au calque « cela fait… que ».',
    difficulty: 3,
    accepted: [
      'We haven’t heard from the client for three weeks.',
      'We haven’t heard from the client in three weeks.',
      'We haven’t heard from the customer for three weeks.',
      'It’s been three weeks since we heard from the client.',
      'It’s been three weeks since we last heard from the client.',
      'It’s been three weeks since we’ve heard from the client.',
    ],
    knownErrors: [
      onNotion('It’s been three weeks that we don’t hear from the client.', 'calques_du_francais'),
    ],
    explanation:
      '_We haven’t heard from the client for three weeks_, ou _It’s been three weeks since…_',
  }),
  translate(11, {
    sentenceFr: 'Depuis combien de temps est-ce que ton entreprise travaille avec cette banque ?',
    hint: 'Question sur une durée qui continue jusqu’à maintenant.',
    difficulty: 3,
    accepted: [
      'How long has your company worked with this bank?',
      'How long has your company been working with this bank?',
      'How long has your company worked with that bank?',
      'How long has your company been working with that bank?',
      'How long has your firm been working with this bank?',
    ],
    knownErrors: [
      onNotion('Since how long does your company work with this bank?', 'temps_verbaux'),
    ],
    explanation: '_How long_ + present perfect : _has your company been working_.',
  }),
  // Added on 2026-10-16 (D-094): presented by difficulty with the ones above.
  translate(12, {
    sentenceFr: 'Je n’ai pas pris de vacances depuis un an.',
    hint: 'Une durée jusqu’à maintenant, à la forme négative.',
    difficulty: 1,
    accepted: [
      'I haven’t had a holiday for a year.',
      'I haven’t taken a holiday for a year.',
      'I haven’t had a holiday in a year.',
      'I haven’t had a vacation for a year.',
      'I haven’t taken a vacation in a year.',
    ],
    knownErrors: [
      onNotion('I don’t take a holiday since a year.', 'temps_verbaux'),
      onNotion('I haven’t had a holiday since a year.', 'temps_verbaux'),
    ],
    explanation:
      'Une durée jusqu’à maintenant : present perfect, avec _for_ (_for a year_), jamais _since_ devant une durée.',
  }),
  translate(13, {
    sentenceFr: 'Il a commencé à travailler ici il y a six mois.',
    hint: 'Un moment passé, situé par rapport à aujourd’hui.',
    difficulty: 1,
    accepted: [
      'He started working here six months ago.',
      'He started to work here six months ago.',
      'He began working here six months ago.',
      'He started here six months ago.',
    ],
    knownErrors: [
      onNotion('He has started working here six months ago.', 'temps_verbaux'),
      onNotion('He started working here since six months.', 'temps_verbaux'),
    ],
    explanation: '« Il y a » + durée : _ago_, avec le prétérit : _started… six months ago_.',
  }),
  translate(14, {
    sentenceFr: 'Le serveur ne fonctionne plus depuis dix minutes.',
    hint: 'Une situation qui dure jusqu’à maintenant, à la forme négative.',
    difficulty: 1,
    accepted: [
      'The server hasn’t been working for ten minutes.',
      'The server hasn’t worked for ten minutes.',
      'The server has been down for ten minutes.',
    ],
    knownErrors: [
      onNotion('The server doesn’t work since ten minutes.', 'temps_verbaux'),
      onNotion('The server hasn’t been working since ten minutes.', 'temps_verbaux'),
    ],
    explanation: 'Une durée jusqu’à maintenant : _for ten minutes_, avec le present perfect.',
  }),
  translate(15, {
    sentenceFr: 'Ça fait combien de temps que vous connaissez la directrice ?',
    hint: 'Une question sur une durée jusqu’à maintenant, avec un verbe d’état.',
    difficulty: 2,
    accepted: ['How long have you known the director?'],
    knownErrors: [
      onNotion('Since how long do you know the director?', 'temps_verbaux'),
      onNotion('How long do you know the director?', 'temps_verbaux'),
    ],
    explanation: '« Depuis combien de temps » : _How long have you known…?_ (verbe d’état).',
  }),
  translate(16, {
    sentenceFr: 'Il y a combien de temps que tu as quitté ton dernier poste ?',
    hint: 'Une question sur un moment passé, compté depuis aujourd’hui.',
    difficulty: 2,
    accepted: [
      'How long ago did you leave your last job?',
      'How long ago did you leave your previous job?',
    ],
    knownErrors: [
      onNotion('How long ago have you left your last job?', 'temps_verbaux'),
      onNotion('Since how long did you leave your last job?', 'temps_verbaux'),
    ],
    explanation: 'Un moment passé : _How long ago did you leave…?_, avec le prétérit.',
  }),
  translate(17, {
    sentenceFr:
      'Je vis en Suisse depuis cinq ans, mais j’ai appris l’allemand il y a seulement un an.',
    hint: 'Une durée jusqu’à maintenant, puis un moment passé.',
    difficulty: 3,
    accepted: [
      'I’ve lived in Switzerland for five years, but I only learnt German a year ago.',
      'I’ve been living in Switzerland for five years, but I only learnt German a year ago.',
      'I’ve lived in Switzerland for five years, but I learnt German only a year ago.',
      'I’ve lived in Switzerland for five years, but I only learnt German one year ago.',
    ],
    knownErrors: [
      onNotion(
        'I live in Switzerland since five years, but I only learnt German a year ago.',
        'temps_verbaux',
      ),
      onNotion(
        'I’ve lived in Switzerland since five years, but I only learnt German a year ago.',
        'temps_verbaux',
      ),
    ],
    explanation:
      'Une durée jusqu’à maintenant : _I’ve lived… for five years_ ; un moment passé : _learnt… a year ago_.',
  }),
  translate(18, {
    sentenceFr: 'Cela fait des mois que nous travaillons sur ce dossier.',
    hint: 'Une activité qui dure jusqu’à maintenant : ne transpose pas « cela fait ».',
    difficulty: 3,
    accepted: [
      'We’ve been working on this case for months.',
      'We’ve been working on this file for months.',
      'We’ve worked on this case for months.',
      'We’ve worked on this file for months.',
    ],
    knownErrors: [
      onNotion('It’s been months that we work on this case.', 'calques_du_francais'),
      onNotion('We work on this case since months.', 'temps_verbaux'),
    ],
    explanation:
      '« Cela fait… que » : present perfect (continu) + _for_ : _We’ve been working… for months_.',
  }),
  translate(19, {
    sentenceFr: 'Je n’ai pas parlé à mon ancien manager depuis que j’ai quitté la banque.',
    hint: 'Une durée qui part d’un moment passé, à la forme négative.',
    difficulty: 3,
    accepted: [
      'I haven’t spoken to my former manager since I left the bank.',
      'I haven’t talked to my former manager since I left the bank.',
      'I haven’t spoken to my old manager since I left the bank.',
      'I haven’t talked to my old manager since I left the bank.',
    ],
    knownErrors: [
      onNotion('I didn’t speak to my former manager since I left the bank.', 'temps_verbaux'),
      onNotion(
        'I haven’t spoken to my former manager since I have left the bank.',
        'temps_verbaux',
      ),
    ],
    explanation:
      'Present perfect + _since_ + le moment de départ. Pour un événement ponctuel comme quitter la banque, le prétérit est la norme après _since_ : _since I left the bank_. Le present perfect s’y emploie pour un état qui dure jusqu’à maintenant : _since I’ve known you_.',
  }),
  translate(20, {
    sentenceFr:
      'Il y a trois ans, j’ai créé une entreprise, et depuis, j’ai embauché dix personnes.',
    hint: 'Un moment passé, puis ce qui s’est passé depuis jusqu’à maintenant.',
    difficulty: 3,
    accepted: [
      'Three years ago, I started a company, and since then, I’ve hired ten people.',
      'Three years ago, I founded a company, and since then, I’ve hired ten people.',
      'Three years ago, I set up a company, and since then, I’ve hired ten people.',
      'I started a company three years ago, and since then, I’ve hired ten people.',
      'I started a company three years ago, and I’ve hired ten people since then.',
    ],
    knownErrors: [
      onNotion(
        'Three years ago, I have started a company, and since then, I’ve hired ten people.',
        'temps_verbaux',
      ),
    ],
    explanation: '_Ago_ : prétérit (_started_) ; _since then_ : present perfect (_I’ve hired_).',
  }),
];
