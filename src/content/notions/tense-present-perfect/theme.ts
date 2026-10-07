import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

// The American past simple of the same meaning is accepted (D-074).
const { item } = themeOf('tense-present-perfect', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Tu as déjà vu ce graphique ?',
    situationFr:
      'Tu montres un graphique à une collègue en réunion. Demande-lui si elle l’a déjà eu sous les yeux, à un moment ou à un autre.',
    instructionEn:
      'You show a chart to a colleague in a meeting. Ask whether it is familiar to her from some earlier occasion.',
    hint: 'Une question sur une expérience, sans moment précis.',
    accepted: [
      'Have you ever seen this chart?',
      'Have you seen this chart before?',
      'Have you already seen this chart?',
      'Have you ever seen this graph?',
      'Have you seen this graph before?',
      'Did you ever see this chart?',
      'Have you seen this chart?',
    ],
    knownErrors: ['Have you ever saw this chart?', 'Have you ever seed this chart?'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une expérience, sans moment précis : present perfect, _have_ + participe passé. _See_ est irrégulier : _see_, _saw_, _seen_.',
  }),
  item(2, {
    sentenceFr: 'Je n’ai jamais travaillé à l’étranger.',
    situationFr:
      'En entretien, on te demande si tu as une expérience à l’international. Réponds honnêtement que toute ta carrière s’est déroulée dans ton pays.',
    instructionEn:
      'In an interview, you are asked about international experience. Answer honestly that your whole career so far has been in your own country.',
    hint: 'Une expérience de vie, jusqu’à maintenant, à la forme négative.',
    accepted: [
      'I have never worked abroad.',
      'I’ve never worked abroad.',
      'I have never worked in another country.',
      'I’ve never worked in another country.',
      'I never worked abroad.',
      'I have not worked abroad.',
    ],
    knownErrors: ['I have never work abroad.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une expérience, de toute ta vie jusqu’à maintenant : present perfect, _I have never worked_.',
  }),
  item(3, {
    sentenceFr: 'J’ai perdu mes clés.',
    situationFr:
      'Tu arrives en retard et tu ne peux pas ouvrir ton bureau. Explique ton problème à l’accueil : tes clés ont disparu, tu ne les retrouves plus.',
    instructionEn:
      'You arrive late and cannot open your office. Explain your problem at reception: your keys are missing.',
    hint: 'Une action passée dont le résultat compte maintenant.',
    accepted: [
      'I’ve lost my keys.',
      'I have lost my keys.',
      'I lost my keys.',
      'I’ve lost my office keys.',
      'I have lost my office keys.',
    ],
    knownErrors: ['I have losed my keys.', 'I have lose my keys.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Le résultat compte maintenant (tu n’as plus tes clés) : present perfect, _I’ve lost_. _Lose_ est irrégulier : _lose_, _lost_, _lost_.',
  }),
  item(4, {
    sentenceFr: 'Nous avons signé trois nouveaux clients cette année.',
    situationFr:
      'Le directeur te demande le bilan commercial depuis janvier. Annonce-lui le chiffre : trois nouveaux clients signés, et l’année n’est pas finie.',
    instructionEn:
      'The director asks for your sales figures since January. Give the number: three new clients, with the year still in progress.',
    hint: 'Une période qui n’est pas terminée.',
    accepted: [
      'We have signed three new clients this year.',
      'We’ve signed three new clients this year.',
      'This year we have signed three new clients.',
      'We have won three new clients this year.',
      'We have signed 3 new clients this year.',
      'We signed three new clients this year.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une période pas encore terminée (_this year_) : present perfect, _we have signed_.',
  }),
  item(5, {
    sentenceFr: 'Elle a écrit trois articles sur l’inflation.',
    situationFr:
      'Tu recommandes une économiste pour une conférence. Mets en avant son expérience : trois articles sur l’inflation à son actif.',
    instructionEn:
      'You recommend an economist for a conference. Highlight her experience: three articles on inflation so far in her career.',
    hint: 'Une expérience, sans moment précis ; le verbe « écrire » est irrégulier.',
    accepted: [
      'She has written three articles on inflation.',
      'She’s written three articles on inflation.',
      'She has written three articles about inflation.',
      'She’s written three articles about inflation.',
      'She wrote three articles on inflation.',
    ],
    knownErrors: [
      'She has wrote three articles on inflation.',
      'She has writed three articles on inflation.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une expérience, sans moment précis : present perfect, _she has written_. _Write_ est irrégulier : _write_, _wrote_, _written_.',
  }),
  item(6, {
    sentenceFr: 'L’abonnement a augmenté : il coûte maintenant 50 francs.',
    situationFr:
      'Un client remarque que l’abonnement est plus cher. Confirme la hausse et donne le nouveau prix : 50 francs.',
    instructionEn:
      'A client notices that the subscription is more expensive. Confirm the change and give the new price: 50 francs.',
    hint: 'Un changement passé, dont le résultat se voit aujourd’hui.',
    accepted: [
      'The subscription has gone up: it now costs 50 francs.',
      'The subscription has gone up: it costs 50 francs now.',
      'The subscription has gone up, and it now costs 50 francs.',
      'The price of the subscription has gone up: it now costs 50 francs.',
      'The subscription price has gone up: it now costs 50 francs.',
      'The subscription has increased: it now costs 50 francs.',
      'The subscription went up: it now costs 50 francs.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Le résultat est visible maintenant (le nouveau prix) : present perfect, _has gone up_.',
  }),
];
