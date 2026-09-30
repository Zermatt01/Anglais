import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    'Le past perfect (_had_ + participe passé) situe une action avant un autre moment du passé : c’est le « passé du passé », comme le plus-que-parfait français.',
  usage: [
    'Une action antérieure à un autre moment passé : _When I arrived, the meeting had already started._',
    'Dans un récit, pour revenir en arrière : _She was nervous because she had never given a presentation before._',
    'Avec _by the time_, et souvent avec _already_, _just_ ou _never… before_ : _By the time we called, they had signed with a competitor._',
    'Au discours rapporté, pour une action antérieure : _He said he had sent the file._',
  ],
  form: {
    caption: 'Forme du past perfect',
    columns: ['Forme', 'Construction', 'Exemple'],
    rows: [
      ['Affirmation', 'sujet + _had_ (_’d_) + participe passé', '_They had left._'],
      ['Négation', 'sujet + _hadn’t_ + participe passé', '_I hadn’t seen the email._'],
      ['Question', '_Had_ + sujet + participe passé ?', '_Had you met her before?_'],
      ['Toutes les personnes', '_had_, jamais _has_', '_She had finished._'],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : deux moments du passé ; le plus ancien (past perfect) précède l’autre (prétérit).',
    marks: [
      { type: 'point', at: -3.2, label: 'the meeting had started' },
      { type: 'point', at: -1.5, label: 'I arrived' },
    ],
  },
  contrast: {
    title: 'Past perfect ou prétérit ?',
    points: [
      'Quand les actions sont racontées dans l’ordre, le prétérit suffit : _I arrived and the meeting started._',
      'Le past perfect marque qu’une action était déjà accomplie : _When I arrived, the meeting had started_ (elle avait commencé avant) ; _When I arrived, the meeting started_ (elle a commencé à mon arrivée).',
      'Avec _before_ ou _after_, qui indiquent déjà l’ordre, le prétérit reste souvent possible : _After she left, I called him._',
    ],
  },
  pitfalls: [
    'Le plus-que-parfait français (« j’avais fini ») correspond au past perfect : _I had finished._',
    '_Had_ ne change pas avec la personne : _He had left_, et non _He has left_, dans un récit au passé.',
    'Sans autre moment passé de référence, le prétérit suffit : « Hier, j’ai vu le client » → _Yesterday I saw the client._',
    '_’d_ peut valoir _had_ ou _would_ : _I’d finished_ = _I had finished_ ; _I’d finish_ = _I would finish_.',
  ],
  examples: [
    {
      en: 'When I got to the station, the train had already left.',
      fr: 'Quand je suis arrivé à la gare, le train était déjà parti.',
    },
    {
      en: 'She had worked in Tokyo before she joined our team.',
      fr: 'Elle avait travaillé à Tokyo avant de rejoindre notre équipe.',
    },
    {
      en: 'By the time the market opened, investors had sold most of their shares.',
      fr: 'Au moment de l’ouverture du marché, les investisseurs avaient vendu la plupart de leurs actions.',
    },
    {
      en: 'I hadn’t read the report, so I couldn’t answer.',
      fr: 'Je n’avais pas lu le rapport, donc je n’ai pas pu répondre.',
    },
    { en: 'He told me he had lost his badge.', fr: 'Il m’a dit qu’il avait perdu son badge.' },
  ],
};
