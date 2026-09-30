import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le présent continu (_be_ + verbe en _-ing_) décrit ce qui est en train de se passer : au moment où l’on parle, ou en ce moment, pour une période limitée.',
  usage: [
    'Une action en cours au moment où l’on parle : _I’m writing the report right now._',
    'Une situation temporaire, vraie ces jours-ci, même si l’action n’a pas lieu à cette seconde : _She’s working from home this week._',
    'Une évolution en cours, qui change peu à peu : _Prices are rising._',
    'Mots qui l’accompagnent souvent : _now_, _right now_, _at the moment_, _currently_, _this week_, _Look!_, _Listen!_',
  ],
  form: {
    caption: 'Forme du présent continu',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      ['Affirmation', 'sujet + _am_, _is_ ou _are_ + verbe en _-ing_', '_I’m reading the data._'],
      [
        'Négation',
        'sujet + _am not_, _isn’t_ ou _aren’t_ + verbe en _-ing_',
        '_She isn’t working today._',
      ],
      ['Question', '_Am_, _Is_ ou _Are_ + sujet + verbe en _-ing_ ?', '_Are you listening?_'],
      [
        'Orthographe',
        '_e_ muet supprimé ; consonne finale doublée après une voyelle courte accentuée ; _ie_ devient _y_',
        '_make_ → _making_, _plan_ → _planning_, _lie_ → _lying_',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : une action a commencé un peu avant maintenant et continue un peu après ; maintenant se trouve au milieu de l’action.',
    marks: [{ type: 'span', from: -1.5, to: 1.5, label: 'I’m working' }],
  },
  contrast: {
    title: 'Présent continu ou présent simple ?',
    points: [
      'Présent continu : ce qui se passe maintenant ou en ce moment, de façon temporaire. Présent simple : ce qui est habituel, permanent ou toujours vrai.',
      '_I’m working on a new model this month_ (temporaire) ; _I work in a bank_ (situation stable).',
      'La notion « Présent simple ou continu » approfondit ce choix, notamment avec les verbes d’état.',
    ],
  },
  pitfalls: [
    'Le français dit « je travaille » dans les deux cas. Pour une action en cours, l’anglais emploie le présent continu : « je travaille sur un projet en ce moment » → _I’m working on a project at the moment._',
    'Ne jamais oublier _be_ : _I working_ est faux, il faut _I’m working_.',
    '« Être en train de » se traduit simplement par le présent continu : « elle est en train d’écrire » → _she’s writing_.',
    'Les verbes d’état (_know_, _understand_, _belong_, _need_) restent en principe au présent simple : _I know the answer_, et non _I’m knowing the answer_.',
  ],
  examples: [
    {
      en: 'The team is testing the new credit model this week.',
      fr: 'L’équipe teste le nouveau modèle de crédit cette semaine.',
    },
    {
      en: 'I’m preparing for a job interview at the moment.',
      fr: 'Je prépare un entretien d’embauche en ce moment.',
    },
    {
      en: 'Inflation is falling across the euro area.',
      fr: 'L’inflation baisse dans toute la zone euro.',
    },
    {
      en: 'Could you call back later? She’s talking to a client.',
      fr: 'Pourriez-vous rappeler plus tard ? Elle parle avec un client.',
    },
    {
      en: 'My students are working on their final projects.',
      fr: 'Mes élèves travaillent sur leurs projets de fin d’année.',
    },
  ],
};
