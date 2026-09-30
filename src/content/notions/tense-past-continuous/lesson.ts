import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le passé continu (_was_ ou _were_ + verbe en _-ing_) décrit une action en cours à un moment du passé : ce qui était en train de se passer.',
  usage: [
    'Une action en cours à un moment précis du passé : _At 10 a.m. I was presenting the results._',
    'Le décor d’un récit, interrompu par une action courte au prétérit : _I was writing the report when the server crashed._',
    'Deux actions en cours en même temps : _While I was analysing the data, my colleague was preparing the slides._',
    'Mots fréquents : _when_, _while_, _at that time_, _at 3 p.m. yesterday_, _all morning_.',
  ],
  form: {
    caption: 'Forme du passé continu',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      ['Affirmation', 'sujet + _was_ ou _were_ + verbe en _-ing_', '_We were waiting._'],
      ['Négation', 'sujet + _wasn’t_ ou _weren’t_ + verbe en _-ing_', '_She wasn’t listening._'],
      ['Question', '_Was_ ou _Were_ + sujet + verbe en _-ing_ ?', '_What were you doing?_'],
      [
        '_Was_ ou _were_',
        '_was_ : _I_, _he_, _she_, _it_ ; _were_ : _you_, _we_, _they_',
        '_They were working._',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : dans le passé, une action longue est en cours (passé continu) quand une action courte l’interrompt (prétérit).',
    marks: [
      { type: 'span', from: -3.2, to: -1, label: 'I was writing the report' },
      { type: 'point', at: -2, label: 'the server crashed' },
    ],
  },
  contrast: {
    title: 'Passé continu ou prétérit ?',
    points: [
      'Passé continu : l’action longue, en cours, le décor. Prétérit : l’action courte, terminée, l’événement.',
      '_When the manager arrived, we were discussing the budget_ : la discussion avait commencé avant son arrivée. _When the manager arrived, we discussed the budget_ : on en a parlé après son arrivée.',
      'Les verbes d’état restent au prétérit : _I knew the answer_, et non _I was knowing the answer_.',
    ],
  },
  pitfalls: [
    'L’imparfait français ne se traduit pas toujours par le passé continu : pour une habitude passée, on emploie le prétérit ou _used to_. « Je travaillais le samedi » → _I worked on Saturdays._',
    '_While_ introduit souvent l’action longue (passé continu), _when_ l’action courte : _While I was driving, my phone rang._',
    'Attention à l’accord : _we were_, _they were_, et non _we was_.',
  ],
  examples: [
    {
      en: 'I was preparing the slides when the client called.',
      fr: 'Je préparais les diapositives quand le client a appelé.',
    },
    {
      en: 'At 9 a.m. yesterday, the markets were already falling.',
      fr: 'Hier à 9 heures, les marchés baissaient déjà.',
    },
    {
      en: 'While she was studying for her master’s, she was working part-time in a bank.',
      fr: 'Pendant son master, elle travaillait à temps partiel dans une banque.',
    },
    {
      en: 'What were you doing when the fire alarm went off?',
      fr: 'Que faisais-tu quand l’alarme incendie s’est déclenchée ?',
    },
    {
      en: 'We weren’t expecting such good results.',
      fr: 'Nous ne nous attendions pas à de si bons résultats.',
    },
  ],
};
