import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Une même traduction en français (« j’ai travaillé »), deux temps en anglais : le prétérit pour un moment passé précis et terminé, le present perfect pour un lien avec maintenant.',
  usage: [
    'Prétérit : le moment est précis ou la période terminée (_yesterday_, _last year_, _in 2019_, _ago_, _when…_). _I worked in London in 2020._',
    'Present perfect : pas de moment précis, ou une période qui continue jusqu’à maintenant (_ever_, _never_, _since_, _for_, _so far_, _this year_). _I’ve worked in three countries._',
    'Une question sur le moment (_When…?_, _What time…?_) appelle le prétérit : _When did you arrive?_',
    'On commence souvent au present perfect, puis on passe au prétérit pour les détails : _I’ve been to Japan. I went there in 2022._',
  ],
  form: {
    caption: 'Les questions à se poser',
    columns: ['Question', 'Prétérit', 'Present perfect'],
    rows: [
      ['Moment précis ?', 'oui : _yesterday_, _in 2019_, _ago_', 'non : _ever_, _never_, _before_'],
      [
        'Période terminée ?',
        'oui : _last year_, _when I was a student_',
        'non : _this year_, et _since_ ou _for_ jusqu’à maintenant',
      ],
      [
        'Lien avec maintenant ?',
        'non, c’est de l’histoire',
        'oui : expérience, résultat, situation qui dure',
      ],
      ['Exemple', '_I lost my keys yesterday._', '_I’ve lost my keys._'],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : à gauche, un moment passé coupé de maintenant (prétérit) ; à droite, une période qui arrive jusqu’à maintenant (present perfect).',
    marks: [
      { type: 'point', at: -3, label: 'I worked in London in 2020' },
      { type: 'span', from: -1.8, to: 0, label: 'I’ve worked here since 2021' },
    ],
  },
  contrast: {
    title: 'Et en anglais américain ?',
    points: [
      'L’anglais américain courant emploie volontiers le prétérit avec _just_, _already_, _yet_ et _ever_ : _Did you eat yet?_',
      'En revanche, avec un moment passé précis, le present perfect est faux partout : _I have seen him yesterday_ est une erreur.',
      'Une situation qui dure jusqu’à maintenant demande le present perfect partout : _I’ve known her since 2019._',
    ],
  },
  pitfalls: [
    '« J’ai fini le rapport hier » → _I finished the report yesterday_, jamais _I have finished the report yesterday_.',
    '« Quand as-tu commencé ? » → _When did you start?_, et non _When have you started?_',
    '« C’est la première fois que je… » → _This is the first time I’ve…_ : _This is the first time I’ve given a presentation in English._',
    'Un CV raconte au prétérit les postes terminés (_I worked at X from 2019 to 2021_) et au present perfect ce qui continue.',
  ],
  examples: [
    {
      en: 'I’ve had three job interviews this month. The last one went very well.',
      fr: 'J’ai eu trois entretiens d’embauche ce mois-ci. Le dernier s’est très bien passé.',
    },
    {
      en: 'The bank opened its Geneva office in 2015.',
      fr: 'La banque a ouvert son bureau de Genève en 2015.',
    },
    {
      en: 'We’ve worked with this client since 2020.',
      fr: 'Nous travaillons avec ce client depuis 2020.',
    },
    { en: 'When did you finish your degree?', fr: 'Quand as-tu terminé tes études ?' },
    {
      en: 'This is the first time I’ve used this software.',
      fr: 'C’est la première fois que j’utilise ce logiciel.',
    },
  ],
};
