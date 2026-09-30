import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'L’anglais a plusieurs façons de parler du futur. Le choix dépend de ce que l’on exprime : une décision prise sur le moment, un projet déjà décidé, un rendez-vous fixé ou une prévision.',
  usage: [
    '_Will_ : décision prise au moment où l’on parle, promesse, offre, prévision. _I’ll call you back._ ; _I think rates will fall._',
    '_Be going to_ : intention déjà décidée, ou prédiction fondée sur un indice présent. _I’m going to apply for the job._ ; _Look at the traffic: we’re going to be late._',
    'Présent continu : rendez-vous ou arrangement fixé avec d’autres personnes. _I’m meeting the client tomorrow._',
    'Présent simple : horaires et programmes officiels. _The train leaves at 7:32._',
    'Après _when_, _if_, _as soon as_, _before_, _after_ et _until_, on emploie le présent pour parler du futur : _I’ll call you when I arrive._',
  ],
  form: {
    caption: 'Formes du futur',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      ['_Will_', 'sujet + _will_ (_’ll_) + base verbale ; négation _won’t_', '_She won’t come._'],
      [
        '_Be going to_',
        'sujet + _am_, _is_ ou _are_ + _going to_ + base verbale',
        '_We’re going to hire two analysts._',
      ],
      [
        'Présent continu',
        'sujet + _am_, _is_ ou _are_ + verbe en _-ing_ + moment futur',
        '_I’m flying to Rome on Friday._',
      ],
      ['Présent simple', 'horaires : base verbale (+ _-s_)', '_The meeting starts at nine._'],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : maintenant, une décision ou un projet ; plus tard, l’action future qui en découle.',
    marks: [
      { type: 'point', at: 0.3, label: 'I’ve decided' },
      { type: 'point', at: 2.5, label: 'I’m going to apply' },
    ],
  },
  contrast: {
    title: 'Plusieurs formes souvent possibles',
    points: [
      'Souvent, deux formes sont justes, avec une nuance : _I’m meeting her tomorrow_ (c’est arrangé) ; _I’m going to meet her tomorrow_ (c’est mon intention).',
      '_Will_ pour une décision sur le moment : « Le téléphone sonne. — _I’ll get it._ » ; _going to_ pour une décision déjà prise.',
      'Pour un projet personnel, on n’emploie normalement pas le présent simple, réservé aux horaires : on dit _I’m going to apply for the job next week_ ou _I’m applying for the job next week_.',
    ],
  },
  pitfalls: [
    '« Quand j’arriverai » → _when I arrive_, et non _when I will arrive_ : pas de _will_ dans une subordonnée introduite par _when_, _if_ ou _as soon as_.',
    '« Il va pleuvoir » → _It’s going to rain_, et non _It goes to rain_.',
    'Après _will_, base verbale sans _to_ : _I will call_, et non _I will to call_.',
    '« Je ne pourrai pas » → _I won’t be able to_, et non _I won’t can_.',
  ],
  examples: [
    {
      en: 'I’m meeting the recruiter on Thursday afternoon.',
      fr: 'Je rencontre la recruteuse jeudi après-midi.',
    },
    {
      en: 'We’re going to open an office in Singapore next year.',
      fr: 'Nous allons ouvrir un bureau à Singapour l’année prochaine.',
    },
    {
      en: 'I think the central bank will cut rates in December.',
      fr: 'Je pense que la banque centrale baissera ses taux en décembre.',
    },
    {
      en: 'I’ll send you the slides as soon as I finish them.',
      fr: 'Je t’enverrai les diapositives dès que je les aurai terminées.',
    },
    {
      en: 'The course starts on 4 October.',
      fr: 'Le cours commence le 4 octobre.',
    },
  ],
};
