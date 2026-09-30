import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Choisir entre présent simple et présent continu revient à se demander : est-ce habituel ou permanent, ou bien en cours et temporaire ?',
  usage: [
    'Présent simple : habitude, fait permanent, vérité générale, horaire. _I usually take the train._',
    'Présent continu : action en cours, situation temporaire, évolution. _Today I’m taking the bus._',
    'Même verbe, deux sens : _She works in Paris_ (c’est stable) ; _She’s working in Paris this month_ (c’est temporaire).',
    'Verbes d’état (_know_, _believe_, _want_, _need_, _belong_, _depend_, _mean_, _prefer_) : présent simple, même pour parler de maintenant. _I need a break now._',
    'Certains verbes changent de sens : _I think it’s risky_ (opinion) ; _I’m thinking about it_ (réflexion en cours). _We have two offices_ (possession) ; _We’re having lunch_ (action).',
  ],
  form: {
    caption: 'Les questions à se poser',
    columns: ['Question', 'Présent simple', 'Présent continu'],
    rows: [
      ['Quand ?', 'habituellement, toujours', 'maintenant, en ce moment'],
      ['Combien de temps ?', 'de façon stable ou permanente', 'pour une période limitée'],
      [
        'Quel verbe ?',
        'verbes d’état : _know_, _want_, _belong_',
        'verbes d’action : _work_, _write_, _talk_',
      ],
      ['Exemple', '_I work in finance._', '_I’m working on a new project._'],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : une habitude revient tout au long du temps (présent simple) ; autour de maintenant, une exception temporaire (présent continu).',
    marks: [
      { type: 'repeat', from: -3.5, to: 3.5, label: 'I usually take the train' },
      { type: 'span', from: -0.8, to: 0.8, label: 'today I’m taking the bus' },
    ],
  },
  contrast: {
    title: 'Verbes d’état ou verbes d’action ?',
    points: [
      'Un verbe d’état décrit ce que l’on sait, pense, possède ou ressent : il reste au présent simple, même pour maintenant.',
      '_I don’t know his name_, et non _I’m not knowing his name_.',
      '_Think_ et _have_ peuvent être l’un ou l’autre : _I think so_ (opinion) ; _What are you thinking about?_ (réflexion en cours).',
    ],
  },
  pitfalls: [
    'Le français ne marque pas la différence : « je travaille » peut être _I work_ ou _I’m working_. Cherche l’indice : habitude ou maintenant ?',
    '_Always_ va d’ordinaire avec le présent simple ; avec le présent continu, il exprime un agacement : _He’s always interrupting me!_',
    '_This report is belonging to the CFO_ est faux : _This report belongs to the CFO._',
    'Une situation temporaire peut durer plusieurs semaines : _I’m living with my parents until I find a flat._',
  ],
  examples: [
    {
      en: 'I usually work from the office, but this week I’m working from home.',
      fr: 'D’habitude, je travaille au bureau, mais cette semaine je travaille chez moi.',
    },
    {
      en: 'What do you do? — I’m a data analyst.',
      fr: 'Que fais-tu dans la vie ? — Je suis analyste de données.',
    },
    {
      en: 'What are you doing? — I’m cleaning the data.',
      fr: 'Qu’est-ce que tu fais ? — Je nettoie les données.',
    },
    {
      en: 'The bank employs 3,000 people, but it’s hiring more this year.',
      fr: 'La banque emploie 3 000 personnes, mais elle en recrute davantage cette année.',
    },
    {
      en: 'I don’t understand why the model is failing.',
      fr: 'Je ne comprends pas pourquoi le modèle échoue.',
    },
  ],
};
