import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-for-since-ago', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'J’habite à Lausanne depuis 2019.',
    situationFr:
      'Un recruteur te demande si tu connais bien la région. Réponds que oui : tu as emménagé à Lausanne en 2019 et tu y habites toujours.',
    instructionEn:
      'A recruiter asks whether you know the region well. Say yes: you moved to Lausanne in 2019 and your home is still there.',
    hint: 'Une situation qui a commencé à une date passée et qui dure encore.',
    accepted: [
      'I have lived in Lausanne since 2019.',
      'I’ve lived in Lausanne since 2019.',
      'I have been living in Lausanne since 2019.',
      'I’ve been living in Lausanne since 2019.',
      'Yes, I have lived in Lausanne since 2019.',
      'Yes, I’ve been living in Lausanne since 2019.',
    ],
    knownErrors: [
      'I live in Lausanne since 2019.',
      'I am living in Lausanne since 2019.',
      'I have lived in Lausanne for 2019.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Depuis » + une date, pour une situation qui dure encore : present perfect et _since_, _I have lived here since 2019_.',
  }),
  item(2, {
    sentenceFr: 'Nous attendons la livraison depuis trois semaines.',
    situationFr:
      'Tu écris au fournisseur : la livraison promise n’est toujours pas arrivée, et cela fait trois semaines que vous l’attendez.',
    instructionEn:
      'Write to the supplier: the promised delivery is now three weeks late, and your team is losing patience.',
    hint: 'Une attente qui dure depuis une certaine durée, jusqu’à maintenant.',
    accepted: [
      'We have been waiting for the delivery for three weeks.',
      'We’ve been waiting for the delivery for three weeks.',
      'We have waited for the delivery for three weeks.',
      'We’ve been waiting three weeks for the delivery.',
      'We have been waiting three weeks for the delivery.',
      'We have been waiting for the delivery for three weeks now.',
    ],
    knownErrors: [
      'We wait for the delivery since three weeks.',
      'We are waiting for the delivery since three weeks.',
      'We have been waiting for the delivery since three weeks.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Depuis » + une durée : _for_, avec le present perfect (continu) : _We have been waiting for three weeks_.',
  }),
  item(3, {
    sentenceFr: 'Paul a quitté l’entreprise il y a deux ans.',
    situationFr:
      'Un client veut parler à Paul, un ancien collègue. Explique que Paul n’est plus là : son départ remonte à deux ans.',
    instructionEn:
      'A client wants to speak to Paul, a former colleague. Explain that Paul is no longer with the company: his departure was two years back.',
    hint: 'Une action terminée, située par rapport à aujourd’hui.',
    accepted: [
      'Paul left the company two years ago.',
      'Paul left the firm two years ago.',
      'Paul left two years ago.',
      'He left the company two years ago.',
      'He left two years ago.',
    ],
    knownErrors: [
      'Paul has left the company two years ago.',
      'Paul left the company since two years.',
      'Paul left the company before two years.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Il y a » + une durée : _ago_, placé après la durée, avec le prétérit : _two years ago_.',
  }),
  item(4, {
    sentenceFr: 'Depuis combien de temps est-ce que tu apprends l’anglais ?',
    situationFr:
      'À un cours du soir, tu discutes avec un autre élève. Demande-lui depuis combien de temps dure son apprentissage de l’anglais.',
    instructionEn:
      'At an evening class, you chat with another student. Ask about the length of his English studies so far.',
    hint: 'Une question sur une durée, jusqu’à maintenant.',
    accepted: [
      'How long have you been learning English?',
      'For how long have you been learning English?',
      'How long have you been studying English?',
    ],
    knownErrors: [
      'Since when do you learn English?',
      'Since how long do you learn English?',
      'Since how long are you learning English?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Depuis combien de temps » : _How long…?_, avec le present perfect continu, _How long have you been learning…?_',
  }),
  item(5, {
    sentenceFr: 'J’ai vu ce film il y a longtemps.',
    situationFr:
      'Des amis te proposent un film au cinéma. Explique que tu l’as déjà vu, mais il y a très longtemps.',
    instructionEn:
      'Friends suggest a film at the cinema. Explain that you know it, but your memory of it is very old.',
    hint: 'Une action terminée, située loin dans le passé par rapport à aujourd’hui.',
    accepted: [
      'I saw this film a long time ago.',
      'I saw that film a long time ago.',
      'I saw this movie a long time ago.',
      'I saw that movie a long time ago.',
      'I saw it a long time ago.',
      'I saw this film ages ago.',
      'I saw it ages ago.',
    ],
    knownErrors: [
      'I have seen this film a long time ago.',
      'I saw this film since a long time.',
      'I have seen it a long time ago.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_Ago_ situe une action terminée : prétérit, jamais present perfect, _I saw it a long time ago_.',
  }),
  item(6, {
    sentenceFr: 'J’ai vécu à Londres pendant cinq ans, puis j’ai déménagé en Suisse.',
    situationFr:
      'En entretien, on te demande ton parcours. Résume-le : cinq années à Londres, une période terminée, puis ton installation en Suisse.',
    instructionEn:
      'In an interview, you are asked about your background. Sum it up: five years in London, now over, then a move to Switzerland.',
    hint: 'Une durée dans une période passée et terminée.',
    accepted: [
      'I lived in London for five years, then I moved to Switzerland.',
      'I lived in London for five years and then moved to Switzerland.',
      'I lived in London for five years, and then I moved to Switzerland.',
      'I lived in London for five years before moving to Switzerland.',
      'I lived in London for five years, then moved to Switzerland.',
      'I lived in London for five years before I moved to Switzerland.',
    ],
    knownErrors: [
      'I have lived in London for five years, then I moved to Switzerland.',
      'I lived in London since five years, then I moved to Switzerland.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une durée dans une période terminée : _for_ + prétérit, _I lived there for five years_. Avec _for_, le present perfect décrit une situation qui dure encore ; ici, elle est terminée.',
  }),
];
