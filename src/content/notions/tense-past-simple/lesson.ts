import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le prétérit (_past simple_) raconte une action terminée à un moment précis du passé : hier, la semaine dernière, en 2019, quand j’étais étudiant.',
  usage: [
    'Une action terminée, à un moment passé connu ou précisé : _I sent the report yesterday._',
    'Une suite d’actions passées, dans un récit : _She opened the file, checked the figures and called the client._',
    'Une habitude passée : _When I was a student, I worked in a café._',
    'Mots fréquents : _yesterday_, _last week_, _last year_, _in 2020_, _two days ago_, _when…_',
  ],
  form: {
    caption: 'Forme du prétérit',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      [
        'Affirmation',
        'verbe régulier + _-ed_ ; verbe irrégulier : forme propre',
        '_I worked_, _I went_',
      ],
      ['Négation', 'sujet + _didn’t_ + base verbale', '_She didn’t call._'],
      ['Question', '_Did_ + sujet + base verbale ?', '_Did you finish the model?_'],
      [
        'Orthographe de _-ed_',
        '_-d_ après _e_ ; consonne + _y_ devient _-ied_ ; consonne doublée après une voyelle courte accentuée',
        '_saved_, _studied_, _stopped_, _planned_',
      ],
      ['_Be_', '_was_ (_I_, _he_, _she_, _it_) ; _were_ (_you_, _we_, _they_)', '_We were late._'],
      [
        'Irréguliers fréquents',
        'à apprendre par cœur',
        '_go_ → _went_, _buy_ → _bought_, _send_ → _sent_, _pay_ → _paid_',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : une action ponctuelle et terminée, à un moment précis du passé, séparé de maintenant.',
    marks: [{ type: 'point', at: -2, label: 'I sent the report yesterday' }],
  },
  contrast: {
    title: 'Prétérit ou present perfect ?',
    points: [
      'Le prétérit situe l’action à un moment passé précis et terminé : _I met her in 2019._',
      'Le present perfect relie le passé au présent, sans moment précis : _I’ve met her._',
      'Avec _yesterday_, _last week_, _in 2019_ ou _ago_, on emploie toujours le prétérit. La notion « Present perfect ou prétérit » approfondit ce choix.',
    ],
  },
  pitfalls: [
    'Le passé composé français se traduit souvent par le prétérit : « j’ai envoyé le rapport hier » → _I sent the report yesterday_, et non _I have sent the report yesterday_.',
    'Après _did_ ou _didn’t_, base verbale : _Did you go?_, _I didn’t go_, et non _I didn’t went_.',
    'Les verbes irréguliers fréquents sont à connaître : _buyed_, _sended_ et _payed_ sont faux ; on dit _bought_, _sent_, _paid_.',
    'Pas de _-s_ au prétérit, quelle que soit la personne : _she worked_.',
  ],
  examples: [
    {
      en: 'We launched the new product last spring.',
      fr: 'Nous avons lancé le nouveau produit au printemps dernier.',
    },
    {
      en: 'The central bank raised its rates in July.',
      fr: 'La banque centrale a relevé ses taux en juillet.',
    },
    {
      en: 'I studied economics in Lyon and then moved to Zurich.',
      fr: 'J’ai étudié l’économie à Lyon, puis j’ai déménagé à Zurich.',
    },
    { en: 'Did you send the invoice on Monday?', fr: 'As-tu envoyé la facture lundi ?' },
    {
      en: 'She didn’t get the job, but she learnt a lot from the interview.',
      fr: 'Elle n’a pas obtenu le poste, mais elle a beaucoup appris de l’entretien.',
    },
  ],
};
