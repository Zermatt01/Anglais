import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le présent simple décrit ce qui est habituel, permanent ou toujours vrai : les routines, les faits, les goûts, les horaires.',
  usage: [
    'Une habitude, une routine : _I check the markets every morning._',
    'Un fait permanent ou une situation stable : _She works for a central bank._',
    'Une vérité générale : _Higher rates make loans more expensive._',
    'Les verbes d’état, qui décrivent un état et non une action : _I know_, _I need_, _it depends_, _this belongs to…_',
    'Mots fréquents : _always_, _usually_, _often_, _sometimes_, _never_, _every day_, _on Mondays_, _once a week_.',
  ],
  form: {
    caption: 'Forme du présent simple',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      [
        'Affirmation',
        'sujet + base verbale ; _-s_ à la 3e personne du singulier (_he_, _she_, _it_)',
        '_She works in Geneva._',
      ],
      ['Négation', 'sujet + _don’t_ ou _doesn’t_ + base verbale', '_He doesn’t work on Fridays._'],
      ['Question', '_Do_ ou _Does_ + sujet + base verbale ?', '_Do you speak German?_'],
      [
        'Orthographe du _-s_',
        '_-es_ après _-s_, _-sh_, _-ch_, _-x_ et _-o_ ; consonne + _y_ devient _-ies_',
        '_watches_, _goes_, _studies_',
      ],
      ['Irréguliers', '_have_ devient _has_ ; _be_ : _am_, _is_, _are_', '_She has two meetings._'],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : la même action revient régulièrement, dans le passé, maintenant et dans le futur.',
    marks: [{ type: 'repeat', from: -3.5, to: 3.5, label: 'I check the markets every morning' }],
  },
  contrast: {
    title: 'Présent simple ou présent continu ?',
    points: [
      'Présent simple : habitude, fait permanent, vérité générale. Présent continu : action en cours ou situation temporaire.',
      '_I work in a bank_ (mon emploi) ; _I’m working on a report_ (en ce moment).',
      'Après _does_ ou _doesn’t_, le verbe perd son _-s_ : _Does she work?_, _She doesn’t work._',
    ],
  },
  pitfalls: [
    'Le _-s_ de la 3e personne est obligatoire et souvent oublié : _The model predicts prices well_, et non _The model predict prices well_.',
    'Pas de _-s_ après _does_ ou _doesn’t_ : _Does he know?_, et non _Does he knows?_',
    'La question standard se construit avec _do_ ou _does_ : « Tu parles allemand ? » → _Do you speak German?_',
    'L’adverbe de fréquence se place avant le verbe, mais après _be_ : _I often work late_, _She is always on time._',
    '« Je suis d’accord » se dit avec un verbe, sans _be_ : _I agree._',
  ],
  examples: [
    {
      en: 'The central bank meets every six weeks.',
      fr: 'La banque centrale se réunit toutes les six semaines.',
    },
    {
      en: 'She works as a data analyst for an insurance company.',
      fr: 'Elle travaille comme analyste de données pour une compagnie d’assurance.',
    },
    {
      en: 'Higher interest rates make loans more expensive.',
      fr: 'Des taux d’intérêt plus élevés rendent les prêts plus chers.',
    },
    {
      en: 'I don’t usually check my emails at weekends.',
      fr: 'D’habitude, je ne consulte pas mes e-mails le week-end.',
    },
    {
      en: 'How often do you meet your manager?',
      fr: 'À quelle fréquence est-ce que tu vois ta responsable ?',
    },
  ],
};
