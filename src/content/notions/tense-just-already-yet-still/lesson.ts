import type { NotionContentInput } from '../../schema.ts';

export const LESSON: NotionContentInput['lesson'] = {
  intro:
    '_Just_, _already_, _yet_ et _still_ situent une action par rapport à maintenant. Ils s’emploient surtout avec le present perfect, et leur place dans la phrase compte.',
  usage: [
    '_Just_ : il y a très peu de temps. _I’ve just sent the email._',
    '_Already_ : déjà fait, souvent plus tôt que prévu. _She’s already signed the contract._',
    '_Yet_ : dans les négations et les questions, en fin de phrase. _I haven’t received the results yet._ ; _Have you finished yet?_',
    '_Still_ : la situation continue, elle n’est pas terminée. _I’m still waiting for the figures._ Avec une négation, _still_ souligne l’impatience : _I still haven’t received them._',
  ],
  form: {
    caption: 'Place de chaque mot',
    columns: ['Mot', 'Place', 'Exemple'],
    rows: [
      ['_just_', 'entre _have_ et le participe', '_I’ve just arrived._'],
      ['_already_', 'entre _have_ et le participe, ou en fin de phrase', '_We’ve already paid._'],
      [
        '_yet_',
        'en fin de phrase, dans une négation ou une question',
        '_Has the client replied yet?_',
      ],
      [
        '_still_',
        'avant le verbe, après _be_, et avant _haven’t_ dans une négation',
        '_He still works here._ ; _She’s still in the meeting._ ; _I still haven’t heard._',
      ],
    ],
  },
  timeline: {
    descriptionFr:
      'Frise : _just_ désigne un moment tout proche, juste avant maintenant ; _still_, une situation commencée avant et qui continue maintenant.',
    marks: [
      { type: 'point', at: -0.4, label: 'just: a moment ago' },
      { type: 'span', from: -2.8, to: 0.6, label: 'still: it continues' },
    ],
  },
  contrast: {
    title: '_Not yet_ ou _still not_ ?',
    points: [
      '_I haven’t finished yet_ : pas encore, sur un ton neutre.',
      '_I still haven’t finished_ : toujours pas, avec impatience ou pour s’excuser d’un retard.',
      'En anglais américain courant, on entend aussi le prétérit : _I just finished_, _Did you eat yet?_ Le present perfect reste correct partout.',
    ],
  },
  pitfalls: [
    '« Pas encore » : _not… yet_, avec _yet_ en fin de phrase. _I haven’t received the results yet_, et non _I haven’t received yet the results_. En style soutenu, _I haven’t yet received the results_ est aussi correct.',
    '« Toujours », au sens de « encore maintenant », se dit _still_, pas _always_ : « il travaille encore ici » → _He still works here._',
    '_Still_ se place avant l’auxiliaire négatif : _I still haven’t called him_, et non _I haven’t still called him_.',
    '« Déjà », dans une question sur une expérience de la vie, se dit plutôt _ever_ : « As-tu déjà travaillé à l’étranger ? » → _Have you ever worked abroad?_',
  ],
  examples: [
    {
      en: 'I’ve just received the quarterly figures.',
      fr: 'Je viens de recevoir les chiffres trimestriels.',
    },
    { en: 'The client has already signed the contract.', fr: 'Le client a déjà signé le contrat.' },
    { en: 'Have you sent the invoice yet?', fr: 'Est-ce que tu as déjà envoyé la facture ?' },
    {
      en: 'We still haven’t found a solution.',
      fr: 'Nous n’avons toujours pas trouvé de solution.',
    },
    {
      en: 'Is she still working for the central bank?',
      fr: 'Est-ce qu’elle travaille encore pour la banque centrale ?',
    },
  ],
};
