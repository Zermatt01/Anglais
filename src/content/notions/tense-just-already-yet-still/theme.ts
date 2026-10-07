import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

// The American past simple with just, already and yet is accepted (D-074, D-081).
const { item } = themeOf('tense-just-already-yet-still', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Je n’ai pas encore reçu les résultats trimestriels.',
    situationFr:
      'Tu écris à ton manager : tu attends toujours les résultats trimestriels, qui auraient dû arriver hier. Dis-le-lui en une phrase.',
    instructionEn:
      'Tell your manager, in one sentence, that the quarterly results you expected yesterday are still missing.',
    hint: 'Une action attendue, pas encore faite.',
    accepted: [
      'I haven’t received the quarterly results yet.',
      'I haven’t yet received the quarterly results.',
      'I still haven’t received the quarterly results.',
      'I haven’t got the quarterly results yet.',
      'I still haven’t got the quarterly results.',
      'I haven’t gotten the quarterly results yet.',
      'I still haven’t gotten the quarterly results.',
      'I didn’t receive the quarterly results yet.',
      'I haven’t received the quarterly figures yet.',
      'I still haven’t received the quarterly figures.',
    ],
    knownErrors: [
      'I haven’t received yet the quarterly results.',
      'I have received not yet the quarterly results.',
      'I haven’t still received the quarterly results.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Pas encore » : _not… yet_, avec _yet_ en fin de phrase (ou _haven’t yet_ + participe, plus soutenu). _Still haven’t_ ajoute l’impatience.',
  }),
  item(2, {
    sentenceFr: 'Le client vient d’appeler.',
    situationFr:
      'Ton manager revient de réunion et te demande s’il y a du nouveau. Annonce-lui que le client a téléphoné il y a une minute à peine.',
    instructionEn:
      'Your manager is back from a meeting and asks for news. Tell him about the client’s phone call, barely a minute ago.',
    hint: 'Une action qui vient tout juste de se produire.',
    accepted: [
      'The client has just called.',
      'The client has just phoned.',
      'The client has just rung.',
      'The customer has just called.',
      'The client just called.',
    ],
    knownErrors: ['The client has called just.', 'The client called just.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Venir de » : _have just_ + participe passé. _Just_ se place entre _has_ et le participe : _has just called_.',
  }),
  item(3, {
    sentenceFr: 'Nous avons déjà atteint notre objectif annuel.',
    situationFr:
      'On n’est qu’en octobre, et ton équipe a fait mieux que prévu. Annonce à la direction que l’objectif de l’année est atteint, plus tôt qu’attendu.',
    instructionEn:
      'It is only October, and your team is ahead of plan. Announce to management that the target for the year is reached, earlier than expected.',
    hint: 'Une action faite plus tôt que prévu.',
    accepted: [
      'We have already reached our annual target.',
      'We’ve already reached our annual target.',
      'We have already met our annual target.',
      'We have already hit our annual target.',
      'We have reached our annual target already.',
      'We have already reached our target for the year.',
      'We already reached our annual target.',
      'We have already reached our yearly target.',
      'We have already achieved our annual target.',
    ],
    knownErrors: [
      'We have reached already our annual target.',
      'We have met already our annual target.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Déjà », plus tôt que prévu : _already_, entre _have_ et le participe, ou en fin de phrase, jamais entre le verbe et son complément.',
  }),
  item(4, {
    sentenceFr: 'Il n’a toujours pas répondu à mon e-mail.',
    situationFr:
      'Tu attends la réponse d’un fournisseur depuis une semaine. Dis à ta collègue, avec une pointe d’impatience, qu’il ne t’a toujours pas répondu.',
    instructionEn:
      'You have been waiting a week for an answer from a supplier. Tell your colleague, with a hint of impatience, that his silence continues.',
    hint: 'Un retard qui agace : la réponse se fait toujours attendre.',
    accepted: [
      'He still hasn’t answered my email.',
      'He still hasn’t replied to my email.',
      'He still hasn’t responded to my email.',
      'He hasn’t answered my email yet.',
      'He hasn’t replied to my email yet.',
      'He still hasn’t answered me.',
      'He still hasn’t replied.',
      'He still hasn’t got back to me.',
      'He still hasn’t gotten back to me.',
      'He still didn’t answer my email.',
    ],
    knownErrors: ['He hasn’t still answered my email.', 'He hasn’t still replied to my email.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Toujours pas », avec impatience : _still_ se place avant l’auxiliaire négatif, _He still hasn’t answered_.',
  }),
  item(5, {
    sentenceFr: 'Tu as déjà lu le rapport ?',
    situationFr:
      'La réunion sur le rapport commence dans dix minutes. Demande à ton collègue s’il a eu le temps de le lire.',
    instructionEn:
      'The meeting about the report starts in ten minutes. Check with your colleague about the report: is his reading done?',
    hint: 'Une question sur une action attendue, avant la réunion.',
    accepted: [
      'Have you read the report yet?',
      'Have you read the report already?',
      'Have you already read the report?',
      'Did you read the report yet?',
      'Did you read the report already?',
      'Have you had time to read the report?',
      'Have you had time to read the report yet?',
    ],
    knownErrors: ['Have you read yet the report?'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une question sur une action attendue : _Have you… yet?_, avec _yet_ en fin de phrase. _Already_ marquerait la surprise que ce soit déjà fait.',
  }),
  item(6, {
    sentenceFr: 'Elle travaille toujours pour la même banque.',
    situationFr:
      'Un ancien camarade de promotion te demande des nouvelles de Julie. Réponds que rien n’a changé : son employeur est la même banque qu’avant.',
    instructionEn:
      'A former classmate asks for news of Julie. Answer that nothing has changed: her employer is the same bank as before.',
    hint: 'Une situation qui continue encore maintenant.',
    accepted: [
      'She still works for the same bank.',
      'She still works at the same bank.',
      'She still works in the same bank.',
      'She is still working for the same bank.',
      'She’s still working at the same bank.',
      'Julie still works for the same bank.',
      'Julie still works at the same bank.',
    ],
    knownErrors: ['She works still for the same bank.', 'She works still at the same bank.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une situation qui continue : _still_, placé avant le verbe principal, _She still works_.',
  }),
];
