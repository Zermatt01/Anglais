import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le present perfect continu (_have been_ + verbe en _-ing_) insiste sur la durée d’une activité commencée dans le passé, qui continue maintenant ou vient de s’arrêter en laissant une trace.',
  usage: [
    'Une activité qui dure jusqu’à maintenant, avec _for_, _since_ ou _how long_ : _I’ve been working on this model for three weeks._',
    'Une activité récente dont on voit encore la conséquence : _You look tired. — I’ve been preparing for the exam._',
    'L’accent porte sur l’activité et sa durée, pas sur le résultat.',
    'Mots fréquents : _for_, _since_, _how long_, _all day_, _lately_, _recently_.',
  ],
  form: {
    caption: 'Forme du present perfect continu',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      [
        'Affirmation',
        'sujet + _have been_ ou _has been_ + verbe en _-ing_',
        '_She has been waiting._',
      ],
      [
        'Négation',
        'sujet + _haven’t been_ ou _hasn’t been_ + verbe en _-ing_',
        '_I haven’t been sleeping well._',
      ],
      [
        'Question',
        '_Have_ ou _Has_ + sujet + _been_ + verbe en _-ing_ ?',
        '_How long have you been studying?_',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : une activité commencée dans le passé qui se prolonge jusqu’à maintenant.',
    marks: [{ type: 'span', from: -2.5, to: 0, label: 'I’ve been working on it' }],
  },
  contrast: {
    title: 'Present perfect continu ou simple ?',
    points: [
      'Continu : l’activité et sa durée. _I’ve been writing the report all morning_ (il n’est peut-être pas fini).',
      'Simple : le résultat ou une quantité. _I’ve written three pages_ ; _I’ve written the report_ (il est fini).',
      'Avec _how many_ ou un nombre, on emploie le simple : _How many emails have you sent?_ Avec un verbe d’état aussi : _I’ve known him for years._',
    ],
  },
  pitfalls: [
    '« J’attends depuis une heure » → _I’ve been waiting for an hour_, et non _I’m waiting since an hour_.',
    '_Been_ ne disparaît jamais : _I’ve working here_ est faux ; il faut _I’ve been working here._',
    'Les verbes d’état ne se mettent pas au continu : _I’ve known her since 2019_, et non _I’ve been knowing her_.',
  ],
  examples: [
    { en: 'I’ve been learning Python for six months.', fr: 'J’apprends Python depuis six mois.' },
    {
      en: 'We’ve been waiting for the client’s reply since Monday.',
      fr: 'Nous attendons la réponse du client depuis lundi.',
    },
    {
      en: 'Prices have been rising steadily this year.',
      fr: 'Les prix augmentent régulièrement cette année.',
    },
    {
      en: 'Sorry, I’m out of breath: I’ve been running.',
      fr: 'Désolé, je suis essoufflé : j’ai couru.',
    },
    {
      en: 'How long have you been working in data science?',
      fr: 'Depuis combien de temps travailles-tu dans la data science ?',
    },
  ],
};
