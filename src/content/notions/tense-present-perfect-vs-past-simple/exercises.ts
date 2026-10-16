import { exercisesOf, offNotion, onNotion } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, translate } = exercisesOf(
  'tense-present-perfect-vs-past-simple',
  REVIEW,
);

const AMERICAN_PAST = ' En anglais américain courant, le prétérit est aussi accepté dans ce cas.';

const PAST = 'Moment passé précis ou période terminée : prétérit';
const CONTINUES = 'Situation qui dure jusqu’à maintenant : present perfect';
const EXPERIENCE = 'Expérience, sans moment précis : present perfect';
const FIRST = 'Première fois, jusqu’à maintenant : present perfect';
const Q_WHEN = 'Question sur le moment : prétérit';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I ___ the report yesterday.',
    options: ['finished', 'have finished'],
    answer: 'finished',
    reasons: [PAST, EXPERIENCE],
    reason: PAST,
    explanation: '_Yesterday_ : moment passé précis. Le present perfect est impossible ici.',
  }),
  choice(2, {
    sentence: 'We ___ each other since 2019.',
    options: ['have known', 'knew'],
    answer: 'have known',
    reasons: [CONTINUES, PAST],
    reason: CONTINUES,
    explanation: '_Since 2019_ : la situation dure jusqu’à maintenant.',
  }),
  choice(3, {
    sentence: 'When ___ your degree?',
    options: ['did you finish', 'have you finished'],
    answer: 'did you finish',
    reasons: [Q_WHEN, EXPERIENCE],
    reason: Q_WHEN,
    explanation: '_When_ demande un moment précis : prétérit.',
  }),
  choice(4, {
    sentence: 'This is the first time I ___ in a trading room.',
    options: ['have worked', 'work'],
    answer: 'have worked',
    reasons: [FIRST, PAST],
    reason: FIRST,
    explanation: '_This is the first time_ + present perfect.',
  }),
  choice(5, {
    sentence: 'She ___ in Madrid from 2018 to 2021.',
    options: ['lived', 'has lived'],
    answer: 'lived',
    reasons: [PAST, CONTINUES],
    reason: PAST,
    explanation: '_From 2018 to 2021_ : période terminée, prétérit.',
  }),
  choice(6, {
    sentence: 'She still works in finance. How long ___ there?',
    options: ['has she worked', 'did she work'],
    answer: 'has she worked',
    reasons: [CONTINUES, PAST],
    reason: CONTINUES,
    explanation: 'Elle y travaille encore : la durée va jusqu’à maintenant, present perfect.',
  }),
  choice(7, {
    sentence: 'I ___ him two weeks ago.',
    options: ['met', 'have met'],
    answer: 'met',
    reasons: [PAST, EXPERIENCE],
    reason: PAST,
    explanation: '_Ago_ : moment passé précis, prétérit.',
  }),
  choice(8, {
    sentence: 'The company ___ 50 people since January.',
    options: ['has hired', 'hired'],
    answer: 'has hired',
    reasons: [CONTINUES, PAST],
    reason: CONTINUES,
    explanation: '_Since January_ : période qui va jusqu’à maintenant, present perfect.',
  }),
  choice(9, {
    sentence: 'When I was a student, I ___ to New York twice.',
    options: ['went', 'have been'],
    answer: 'went',
    reasons: [PAST, EXPERIENCE],
    reason: PAST,
    explanation: '_When I was a student_ : période terminée, prétérit.',
  }),
  choice(10, {
    sentence: 'Our profits ___ every year since 2020.',
    options: ['have grown', 'grew'],
    answer: 'have grown',
    reasons: [CONTINUES, PAST],
    reason: CONTINUES,
    explanation: '_Since 2020_ : present perfect. Participe de _grow_ : _grown_.',
  }),
  choice(11, {
    sentence: 'What time ___ this morning?',
    options: ['did you arrive', 'have you arrived'],
    answer: 'did you arrive',
    reasons: [Q_WHEN, EXPERIENCE],
    reason: Q_WHEN,
    explanation: '_What time_ demande un moment précis : prétérit.',
  }),
  choice(12, {
    sentence: 'It’s the first time we ___ such a large contract.',
    options: ['have signed', 'sign'],
    answer: 'have signed',
    reasons: [FIRST, PAST],
    reason: FIRST,
    explanation: '_It’s the first time_ + present perfect : _we have signed_.',
  }),

  // Step 3: practise
  fill(1, {
    sentence: 'I ___ my first internship in 2022.',
    verb: 'do',
    meaningFr: 'J’ai fait mon premier stage en 2022.',
    accepted: ['did'],
    knownErrors: ['have done', 'have did'],
    explanation: '_In 2022_ : prétérit, _did_.',
  }),
  fill(2, {
    sentence: 'She ___ at this bank since 2019.',
    verb: 'work',
    meaningFr: 'Elle travaille dans cette banque depuis 2019.',
    accepted: ['has worked', 'has been working'],
    knownErrors: ['worked', 'works'],
    explanation: '_Since 2019_ : present perfect, simple ou continu.',
  }),
  fill(3, {
    sentence: 'When ___ the job offer?',
    verb: 'you / receive',
    meaningFr: 'Quand as-tu reçu l’offre d’emploi ?',
    accepted: ['did you receive'],
    knownErrors: ['have you received', 'did you received'],
    explanation: '_When_ : question sur le moment, prétérit.',
  }),
  fill(4, {
    sentence: 'I ___ this client before, but I don’t remember when.',
    verb: 'meet',
    meaningFr: 'J’ai déjà rencontré ce client, mais je ne me souviens pas quand.',
    accepted: ['have met', 'met'],
    knownErrors: ['have meet'],
    explanation:
      'Expérience sans date : _have met_. En anglais américain courant, _met_ est aussi accepté.',
  }),
  fill(5, {
    sentence: 'They ___ the new office last spring.',
    verb: 'open',
    meaningFr: 'Ils ont ouvert le nouveau bureau au printemps dernier.',
    accepted: ['opened'],
    knownErrors: ['have opened'],
    explanation: '_Last spring_ : période terminée, prétérit.',
  }),
  fill(6, {
    sentence: 'This is the first time I ___ a presentation in English.',
    verb: 'give',
    meaningFr: 'C’est la première fois que je fais une présentation en anglais.',
    accepted: ['have given'],
    knownErrors: ['give', 'have gave'],
    explanation: '_This is the first time_ + present perfect. Participe de _give_ : _given_.',
  }),
  fill(7, {
    sentence: 'Inflation ___ sharply last year.',
    verb: 'rise',
    meaningFr: 'L’inflation a fortement augmenté l’année dernière.',
    accepted: ['rose'],
    knownErrors: ['has risen', 'raised'],
    explanation:
      '_Last year_ : prétérit. _Rise_ : _rose_ (et non _raised_, qui demande un complément).',
  }),
  fill(8, {
    sentence: 'We ___ five new products so far this year.',
    verb: 'launch',
    meaningFr: 'Nous avons lancé cinq nouveaux produits depuis le début de l’année.',
    accepted: ['have launched'],
    knownErrors: ['have launch'],
    explanation: '_So far this year_ : période qui continue, present perfect.',
  }),
  fill(9, {
    sentence: 'He ___ the company in 2020.',
    verb: 'join',
    meaningFr: 'Il a rejoint l’entreprise en 2020.',
    accepted: ['joined'],
    knownErrors: ['has joined'],
    explanation: '_In 2020_ : prétérit.',
  }),
  fill(10, {
    sentence: 'I ___ in Paris for two years when I was a child.',
    verb: 'live',
    meaningFr: 'J’ai vécu à Paris pendant deux ans quand j’étais enfant.',
    accepted: ['lived'],
    knownErrors: ['have lived', 'have been living'],
    explanation: 'Période terminée (_when I was a child_) : prétérit, même avec _for_.',
  }),
  transform(11, {
    source: 'I have finished the report.',
    instructionFr: 'Ajoute « yesterday » à la fin et adapte le temps du verbe.',
    accepted: ['I finished the report yesterday.'],
    knownErrors: ['I have finished the report yesterday.'],
    explanation: 'Avec _yesterday_, le prétérit est obligatoire.',
  }),
  transform(12, {
    source: 'I visited Japan.',
    instructionFr:
      'Transforme en expérience sans date, avec « never » : « Je ne suis jamais allé au Japon ».',
    accepted: ['I have never been to Japan.', 'I have never visited Japan.'],
    knownErrors: ['I have never went to Japan.'],
    explanation: 'Expérience : _have never been to_ (ou _have never visited_).',
  }),
  transform(13, {
    source: 'When have you started this job?',
    instructionFr: 'Corrige la question : elle porte sur un moment passé.',
    accepted: ['When did you start this job?'],
    knownErrors: ['When did you started this job?'],
    explanation: '_When_ + prétérit : _When did you start…?_ (base verbale après _did_).',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'J’ai terminé mes études en 2023.',
    hint: 'Une date précise, dans le passé.',
    difficulty: 1,
    accepted: [
      'I finished my studies in 2023.',
      'I completed my studies in 2023.',
      'I graduated in 2023.',
      'I finished university in 2023.',
      'I finished my degree in 2023.',
    ],
    knownErrors: [onNotion('I have finished my studies in 2023.', 'temps_verbaux')],
    explanation: '_In 2023_ : prétérit.',
  }),
  translate(2, {
    sentenceFr: 'Je connais Anna depuis 2020.',
    hint: 'Une situation qui dure jusqu’à maintenant ; verbe d’état.',
    difficulty: 1,
    accepted: ['I’ve known Anna since 2020.'],
    knownErrors: [
      onNotion('I know Anna since 2020.', 'temps_verbaux'),
      onNotion('I knew Anna since 2020.', 'temps_verbaux'),
    ],
    explanation: '_Since 2020_ + present perfect : _I’ve known Anna since 2020._',
  }),
  translate(3, {
    sentenceFr: 'Quand est-ce que tu es arrivé ?',
    hint: 'Question sur le moment.',
    difficulty: 1,
    accepted: ['When did you arrive?', 'When did you get here?', 'When did you get there?'],
    knownErrors: [onNotion('When have you arrived?', 'temps_verbaux')],
    explanation: '_When_ : prétérit, _When did you arrive?_',
  }),
  translate(4, {
    sentenceFr: 'C’est la première fois que je viens à Zurich.',
    hint: '« C’est la première fois que… » : une expérience jusqu’à maintenant.',
    difficulty: 1,
    accepted: [
      'This is the first time I’ve been to Zurich.',
      'It’s the first time I’ve been to Zurich.',
      'This is the first time I’ve come to Zurich.',
      'It’s the first time I’ve come to Zurich.',
      'It’s my first time in Zurich.',
      'This is my first time in Zurich.',
    ],
    knownErrors: [onNotion('This is the first time I come to Zurich.', 'temps_verbaux')],
    explanation: '_This is the first time_ + present perfect : _I’ve been to Zurich._',
  }),
  translate(5, {
    sentenceFr: 'Nous avons signé le contrat la semaine dernière.',
    hint: 'Une période terminée.',
    difficulty: 2,
    accepted: ['We signed the contract last week.', 'Last week we signed the contract.'],
    knownErrors: [onNotion('We have signed the contract last week.', 'temps_verbaux')],
    explanation: '_Last week_ : prétérit.',
  }),
  translate(6, {
    sentenceFr: 'Il travaille pour nous depuis cinq ans ; avant, il était chez un concurrent.',
    hint: 'Une situation qui dure, puis une période terminée.',
    difficulty: 2,
    accepted: [
      'He’s worked for us for five years; before that, he was at a competitor.',
      'He’s been working for us for five years; before that, he was at a competitor.',
      'He’s worked for us for five years; before that, he worked for a competitor.',
      'He’s been working for us for five years; before that, he worked for a competitor.',
      'He’s worked for us for five years; before that, he was with a competitor.',
      'He’s worked for us for five years; before, he worked for a competitor.',
      'He’s worked for us for five years, and before that he worked for a competitor.',
    ],
    knownErrors: [
      onNotion(
        'He works for us since five years; before that, he was at a competitor.',
        'temps_verbaux',
      ),
    ],
    explanation:
      'Situation actuelle : present perfect + _for_. Période terminée : prétérit (_was_, _worked_).',
  }),
  translate(7, {
    sentenceFr: 'As-tu vu le rapport de la BCE hier ?',
    hint: 'Question sur un moment passé précis.',
    difficulty: 2,
    accepted: [
      'Did you see the ECB report yesterday?',
      'Did you see the ECB’s report yesterday?',
      'Did you read the ECB report yesterday?',
    ],
    knownErrors: [onNotion('Have you seen the ECB report yesterday?', 'temps_verbaux')],
    explanation: '_Yesterday_ : prétérit, même dans une question.',
  }),
  translate(8, {
    sentenceFr: 'Les ventes ont augmenté de 10 % depuis le début de l’année.',
    hint: 'Une période qui continue jusqu’à maintenant.',
    difficulty: 2,
    accepted: [
      'Sales have increased by 10% since the beginning of the year.',
      'Sales have risen by 10% since the beginning of the year.',
      'Sales have gone up by 10% since the beginning of the year.',
      'Sales have increased by 10% since the start of the year.',
      'Sales have risen by 10% since the start of the year.',
      'Sales have increased 10% since the beginning of the year.',
      'Sales have grown by 10% since the beginning of the year.',
    ],
    knownErrors: [
      offNotion(
        'Sales have raised by 10% since the beginning of the year.',
        'choix_lexical_collocations',
      ),
    ],
    explanation: '_Since_ + present perfect : _have increased_ (ou _have risen_).',
  }),
  translate(9, {
    sentenceFr:
      'J’ai travaillé dans trois pays ; mon premier poste, je l’ai obtenu à Londres en 2019.',
    hint: 'Une expérience sans date, puis un détail daté.',
    difficulty: 3,
    accepted: [
      'I’ve worked in three countries; I got my first job in London in 2019.',
      'I’ve worked in three countries; I got my first position in London in 2019.',
      'I’ve worked in three countries; my first job was in London in 2019.',
      'I’ve worked in three countries. I got my first job in London in 2019.',
      'I’ve worked in three countries, and I got my first job in London in 2019.',
    ],
    knownErrors: [
      onNotion(
        'I’ve worked in three countries; I have got my first job in London in 2019.',
        'temps_verbaux',
      ),
    ],
    explanation: 'Expérience : _I’ve worked_. Détail daté (_in 2019_) : prétérit, _I got_.',
  }),
  translate(10, {
    sentenceFr:
      'Depuis mon arrivée, j’ai rencontré toute l’équipe, mais je n’ai pas encore vu le directeur.',
    hint: 'Une période qui va de ton arrivée jusqu’à maintenant.',
    difficulty: 3,
    accepted: [
      'Since I arrived, I’ve met the whole team, but I haven’t seen the director yet.',
      'Since I arrived, I’ve met the whole team, but I haven’t met the director yet.',
      'Since I arrived, I’ve met the entire team, but I haven’t seen the director yet.',
      'Since I arrived, I’ve met the whole team, but I haven’t seen the manager yet.',
      'Since my arrival, I’ve met the whole team, but I haven’t seen the director yet.',
      'Since I arrived, I’ve met the whole team but I haven’t seen the director yet.',
      'Since I arrived, I’ve met the whole team, but I haven’t yet seen the director.',
    ],
    explanation:
      '_Since I arrived_ (prétérit après _since_), puis present perfect : _I’ve met_, _I haven’t seen… yet_.',
  }),
  translate(11, {
    sentenceFr: 'Quand as-tu commencé à travailler ici, et combien de projets as-tu gérés depuis ?',
    hint: 'Une question sur le moment, puis une question sur la période jusqu’à maintenant.',
    difficulty: 3,
    accepted: [
      'When did you start working here, and how many projects have you managed since then?',
      'When did you start working here, and how many projects have you managed since?',
      'When did you start to work here, and how many projects have you managed since then?',
      'When did you start working here, and how many projects have you run since then?',
      'When did you start working here and how many projects have you managed since then?',
    ],
    knownErrors: [
      onNotion(
        'When have you started working here, and how many projects have you managed since then?',
        'temps_verbaux',
      ),
    ],
    explanation:
      '_When_ : prétérit (_did you start_). _Since then_ : present perfect (_have you managed_).',
  }),
  // Added on 2026-10-16 (D-094): presented by difficulty with the ones above.
  translate(12, {
    sentenceFr: 'J’ai rencontré le PDG en 2022.',
    hint: 'Un moment passé précis.',
    difficulty: 1,
    accepted: ['I met the CEO in 2022.'],
    knownErrors: [
      onNotion('I have met the CEO in 2022.', 'temps_verbaux'),
      onNotion('I meet the CEO in 2022.', 'temps_verbaux'),
    ],
    explanation: 'Une date passée : prétérit, _I met_.',
  }),
  translate(13, {
    sentenceFr: 'Tu as déjà visité notre bureau de Zurich ?',
    hint: 'Une question sur une expérience, sans moment précis.',
    difficulty: 1,
    accepted: [
      'Have you ever visited our Zurich office?',
      'Have you ever been to our Zurich office?',
      'Have you visited our Zurich office before?',
      'Have you already visited our Zurich office?',
      'Did you ever visit our Zurich office?',
    ],
    knownErrors: [
      onNotion('Did you ever visited our Zurich office?', 'auxiliaires_questions_negations'),
      onNotion('Have you ever visit our Zurich office?', 'temps_verbaux'),
    ],
    explanation: 'Une expérience, sans moment précis : _Have you ever visited…?_' + AMERICAN_PAST,
  }),
  translate(14, {
    sentenceFr: 'Elle a envoyé le fichier il y a une heure.',
    hint: 'Un moment passé, situé par rapport à maintenant.',
    difficulty: 1,
    accepted: ['She sent the file an hour ago.', 'She sent the file one hour ago.'],
    knownErrors: [onNotion('She has sent the file an hour ago.', 'temps_verbaux')],
    explanation: '_Ago_ situe un moment passé : prétérit, _She sent_.',
  }),
  translate(15, {
    sentenceFr: 'Quelqu’un a pris ma chaise !',
    hint: 'Une action passée dont on voit le résultat maintenant.',
    difficulty: 2,
    accepted: [
      'Someone has taken my chair!',
      'Someone’s taken my chair!',
      'Somebody has taken my chair!',
      'Someone took my chair!',
    ],
    knownErrors: [
      onNotion('Someone has took my chair!', 'temps_verbaux'),
      onNotion('Someone have taken my chair!', 'accord_sujet_verbe'),
    ],
    explanation: 'Résultat présent : _has taken_ (participe de _take_).' + AMERICAN_PAST,
  }),
  translate(16, {
    sentenceFr: 'Nous avons vendu notre appartement l’année dernière.',
    hint: 'Un moment passé terminé.',
    difficulty: 2,
    accepted: [
      'We sold our flat last year.',
      'We sold our apartment last year.',
      'Last year, we sold our flat.',
    ],
    knownErrors: [
      onNotion('We have sold our flat last year.', 'temps_verbaux'),
      onNotion('We selled our flat last year.', 'temps_verbaux'),
    ],
    explanation: '_Last year_ : prétérit, _sold_ (verbe irrégulier).',
  }),
  translate(17, {
    sentenceFr: 'Combien de fois est-ce que vous avez changé de poste depuis votre diplôme ?',
    hint: 'Une période qui va d’un moment passé jusqu’à maintenant.',
    difficulty: 2,
    accepted: [
      'How many times have you changed jobs since you graduated?',
      'How many times have you changed jobs since graduating?',
      'How many times have you changed jobs since your degree?',
      'How often have you changed jobs since you graduated?',
    ],
    knownErrors: [
      onNotion(
        'How many times you have changed jobs since you graduated?',
        'auxiliaires_questions_negations',
      ),
    ],
    explanation:
      'Jusqu’à maintenant : _How many times have you changed…?_ ; le point de départ au prétérit : _since you graduated_.',
  }),
  translate(18, {
    sentenceFr:
      'J’ai travaillé dans l’audit pendant deux ans ; maintenant, je suis analyste dans une start-up.',
    hint: 'Une période terminée, puis la situation actuelle.',
    difficulty: 3,
    accepted: [
      'I worked in audit for two years; now I’m an analyst at a start-up.',
      'I worked in audit for two years; now I’m an analyst at a startup.',
      'I worked in auditing for two years; now I’m an analyst at a start-up.',
      'I worked in audit for two years, and now I’m an analyst at a start-up.',
      'I worked in audit for two years; now I’m an analyst in a start-up.',
    ],
    knownErrors: [
      onNotion('I work in audit for two years; now I’m an analyst at a start-up.', 'temps_verbaux'),
    ],
    explanation:
      'Une période terminée : prétérit, _I worked… for two years_ ; aujourd’hui : _I’m_.',
  }),
  translate(19, {
    sentenceFr: 'Je n’ai pas encore lu son CV, mais je l’ai rencontré hier.',
    hint: 'Une action attendue, pas encore faite, puis un moment passé précis.',
    difficulty: 3,
    accepted: [
      'I haven’t read his CV yet, but I met him yesterday.',
      'I haven’t yet read his CV, but I met him yesterday.',
      'I haven’t read his resume yet, but I met him yesterday.',
      'I didn’t read his CV yet, but I met him yesterday.',
    ],
    knownErrors: [
      onNotion('I haven’t read his CV yet, but I have met him yesterday.', 'temps_verbaux'),
    ],
    explanation:
      'Pas encore : _I haven’t read… yet_ ; hier : prétérit, _I met him yesterday_.' +
      AMERICAN_PAST,
  }),
  translate(20, {
    sentenceFr:
      'Les prix ont augmenté depuis janvier, alors nous avons revu nos tarifs le mois dernier.',
    hint: 'Une évolution jusqu’à maintenant, puis un moment passé précis.',
    difficulty: 3,
    accepted: [
      'Prices have gone up since January, so we revised our rates last month.',
      'Prices have risen since January, so we revised our rates last month.',
      'Prices have increased since January, so we revised our rates last month.',
      'Prices have gone up since January, so we revised our prices last month.',
      'Prices have risen since January, so we adjusted our rates last month.',
    ],
    knownErrors: [
      onNotion(
        'Prices have gone up since January, so we have revised our rates last month.',
        'temps_verbaux',
      ),
      offNotion(
        'Prices have raised since January, so we revised our rates last month.',
        'choix_lexical_collocations',
      ),
    ],
    explanation:
      'Depuis janvier : present perfect, _have gone up_ ; le mois dernier : prétérit, _revised_.',
  }),
];
