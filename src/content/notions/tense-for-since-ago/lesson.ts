import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    '« Depuis » se traduit par _for_ ou _since_, avec le present perfect ; « il y a » se traduit par _ago_, avec le prétérit.',
  usage: [
    '_For_ + une durée (combien de temps ?) : _I’ve worked here for three years._',
    '_Since_ + un point de départ (depuis quand ?) : _I’ve worked here since 2021._',
    '_Ago_, placé après une durée, avec le prétérit : _I started three years ago._',
    '_How long…?_ pour demander la durée : _How long have you lived in Geneva?_',
    'Avec un verbe d’action, le present perfect continu est aussi très courant : _I’ve been working here for three years._',
  ],
  form: {
    caption: 'For, since et ago',
    columns: ['Mot', 'Suivi de', 'Temps', 'Exemple'],
    rows: [
      [
        '_for_',
        'une durée : _two hours_, _six months_, _years_',
        'present perfect (la situation continue)',
        '_She’s been here for two hours._',
      ],
      [
        '_since_',
        'un point de départ : _Monday_, _2020_, _I arrived_',
        'present perfect',
        '_We’ve known each other since university._',
      ],
      ['_ago_', 'une durée, placée avant _ago_', 'prétérit', '_He left the bank two years ago._'],
      [
        '_How long…?_',
        'question sur la durée',
        'present perfect',
        '_How long have you been a teacher?_',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : _since_ marque le point de départ ; _for_, la durée qui va de ce point jusqu’à maintenant.',
    marks: [
      { type: 'point', at: -3, label: 'since 2021' },
      { type: 'span', from: -3, to: 0, label: 'for three years' },
    ],
  },
  contrast: {
    title: 'Présent en français, present perfect en anglais',
    points: [
      'Le français dit « je travaille ici depuis trois ans », au présent. L’anglais regarde la période qui va jusqu’à maintenant : _I’ve worked here for three years_ ou _I’ve been working here for three years._',
      'Pour une durée terminée, dans le passé : prétérit + _for_. _I lived in Madrid for two years_ (je n’y vis plus).',
      '_Ago_ ne s’emploie jamais avec le present perfect : _I’ve started two years ago_ est faux ; il faut _I started two years ago._',
    ],
  },
  pitfalls: [
    '_I work here since 2020_ est faux : _I’ve worked here since 2020._',
    '_Since three years_ est faux : une durée prend _for_, _for three years._',
    '_It’s been three years that I work here_ est un calque du français : _I’ve been working here for three years_, ou _It’s been three years since I started working here._',
    'Avec un verbe d’état, pas de forme continue : _I’ve known her for ten years_, et non _I’ve been knowing her_.',
  ],
  examples: [
    {
      en: 'I’ve worked in asset management for five years.',
      fr: 'Je travaille dans la gestion d’actifs depuis cinq ans.',
    },
    { en: 'She’s been a teacher since 2019.', fr: 'Elle est enseignante depuis 2019.' },
    {
      en: 'The central bank raised its rates three months ago.',
      fr: 'La banque centrale a relevé ses taux il y a trois mois.',
    },
    {
      en: 'How long have you been learning Python?',
      fr: 'Depuis combien de temps apprends-tu Python ?',
    },
    {
      en: 'We haven’t seen each other since the conference.',
      fr: 'Nous ne nous sommes pas vus depuis la conférence.',
    },
  ],
};
