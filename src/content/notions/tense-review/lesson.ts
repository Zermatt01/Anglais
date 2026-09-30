import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Ce récapitulatif mélange les temps déjà étudiés. Pour chaque phrase, pose-toi trois questions : quand ? est-ce terminé, en cours ou habituel ? y a-t-il un lien avec maintenant, ou avec un autre moment du passé ?',
  usage: [
    'Maintenant ou temporaire : présent continu. Habitude, fait ou verbe d’état : présent simple.',
    'Moment passé précis : prétérit. Action en cours à un moment passé : passé continu. Action antérieure à un autre moment passé : past perfect.',
    'Lien avec maintenant (expérience, résultat, durée jusqu’à maintenant) : present perfect, simple ou continu.',
    'Futur : _will_ (décision, prévision), _going to_ (intention, indice), présent continu (rendez-vous) ; présent après _when_ et _if_.',
  ],
  form: {
    caption: 'Les temps étudiés',
    columns: ['Temps', 'Forme', 'Exemple'],
    rows: [
      ['Présent simple', 'base verbale (+ _-s_)', '_She works in a bank._'],
      ['Présent continu', '_am_, _is_, _are_ + _-ing_', '_She’s working from home today._'],
      ['Prétérit', '_-ed_ ou forme irrégulière', '_She joined the bank in 2020._'],
      ['Passé continu', '_was_, _were_ + _-ing_', '_She was working when I called._'],
      ['Present perfect', '_have_, _has_ + participe', '_She has worked in three countries._'],
      [
        'Present perfect continu',
        '_have been_, _has been_ + _-ing_',
        '_She has been working here for two years._',
      ],
      ['Past perfect', '_had_ + participe', '_She had left when I arrived._'],
      [
        'Futur',
        '_will_, _be going to_, présent continu',
        '_She’s going to apply for a promotion._',
      ],
    ],
  },
  contrast: {
    title: 'Les trois questions à se poser',
    points: [
      'Quand ? Passé, présent ou futur, et à quel moment précis ?',
      'Est-ce terminé, en cours, ou habituel ?',
      'Y a-t-il un lien avec maintenant (present perfect), ou avec un autre moment du passé (past perfect) ?',
    ],
  },
  pitfalls: [
    '« Depuis » : present perfect (_I’ve lived here since 2020_), jamais le présent seul.',
    'Avec un moment passé précis (_yesterday_, _in 2019_, _ago_) : prétérit, jamais le present perfect.',
    'Verbes d’état (_know_, _believe_, _belong_) : pas de forme continue.',
    'Après _when_, _if_ ou _as soon as_, pour parler du futur : présent, jamais _will_.',
  ],
  examples: [
    {
      en: 'I’ve worked in finance for three years; before that, I studied economics.',
      fr: 'Je travaille dans la finance depuis trois ans ; avant, j’ai étudié l’économie.',
    },
    {
      en: 'I was preparing the slides when my manager called.',
      fr: 'Je préparais les diapositives quand ma responsable a appelé.',
    },
    {
      en: 'When I arrived, the client had already left.',
      fr: 'Quand je suis arrivé, le client était déjà parti.',
    },
    {
      en: 'I’m meeting the recruiter tomorrow, and I think it will go well.',
      fr: 'Je rencontre le recruteur demain, et je pense que ça se passera bien.',
    },
    {
      en: 'She usually works in Geneva, but this month she’s working in London.',
      fr: 'D’habitude, elle travaille à Genève, mais ce mois-ci elle travaille à Londres.',
    },
  ],
};
