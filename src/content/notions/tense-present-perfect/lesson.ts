import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le present perfect (_have_ ou _has_ + participe passé) relie le passé au présent : une expérience vécue, ou une action passée dont le résultat compte maintenant.',
  usage: [
    'Une expérience, à un moment non précisé de la vie : _I’ve worked with Python before._ ; _Have you ever been to New York?_',
    'Une action passée dont le résultat se voit maintenant : _I’ve lost my badge_ (je ne l’ai plus).',
    'Une action dans une période pas encore terminée : _I’ve had three interviews this week._',
    'Mots fréquents : _ever_, _never_, _before_, _so far_, _this week_, _this year_, _many times_.',
  ],
  form: {
    caption: 'Forme du present perfect',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      ['Affirmation', 'sujet + _have_ ou _has_ + participe passé', '_She has visited our office._'],
      ['Négation', 'sujet + _haven’t_ ou _hasn’t_ + participe passé', '_I haven’t met him._'],
      ['Question', '_Have_ ou _Has_ + sujet + participe passé ?', '_Have you ever used Tableau?_'],
      ['Participes réguliers', 'base verbale + _-ed_', '_worked_, _studied_, _planned_'],
      [
        'Participes irréguliers',
        'à apprendre par cœur',
        '_be_ → _been_, _do_ → _done_, _go_ → _gone_, _see_ → _seen_, _write_ → _written_',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : une action passée, sans date précise, dont la conséquence dure jusqu’à maintenant.',
    marks: [
      { type: 'point', at: -2, label: 'I’ve lost my badge' },
      { type: 'span', from: -2, to: 0, label: 'result: I don’t have it now' },
    ],
  },
  contrast: {
    title: 'Present perfect ou prétérit ?',
    points: [
      'Present perfect : pas de moment précis, lien avec le présent. Prétérit : moment passé précis et terminé.',
      '_I’ve been to Tokyo_ (expérience) ; _I went to Tokyo in 2022_ (moment précis).',
      'En anglais américain courant, on entend aussi le prétérit dans certains de ces cas (_Did you ever go to Tokyo?_). La forme avec le present perfect reste correcte partout.',
    ],
  },
  pitfalls: [
    'Jamais de moment passé précis avec le present perfect : _I’ve seen him yesterday_ est faux ; il faut _I saw him yesterday_.',
    '_Been_ ou _gone_ : _She’s been to Paris_ (elle y est allée et en est revenue) ; _She’s gone to Paris_ (elle y est en ce moment).',
    'Le participe passé des irréguliers diffère souvent du prétérit : _I’ve written_, et non _I’ve wrote_.',
    'La 3e personne du singulier prend _has_ : _He has finished._',
  ],
  examples: [
    {
      en: 'I’ve worked with large datasets before.',
      fr: 'J’ai déjà travaillé avec de grands jeux de données.',
    },
    {
      en: 'Have you ever given a presentation in English?',
      fr: 'As-tu déjà fait une présentation en anglais ?',
    },
    {
      en: 'The bank has opened three new branches this year.',
      fr: 'La banque a ouvert trois nouvelles agences cette année.',
    },
    {
      en: 'I’ve lost my access card, so I can’t get into the building.',
      fr: 'J’ai perdu mon badge, donc je ne peux pas entrer dans le bâtiment.',
    },
    { en: 'We haven’t received the payment.', fr: 'Nous n’avons pas reçu le paiement.' },
  ],
};
