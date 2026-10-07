import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

// Several future forms are often right: every correct one is accepted (D-035).
const { item } = themeOf('tense-future', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Ne t’inquiète pas, je t’envoie le fichier tout de suite.',
    situationFr:
      'Un collègue panique : il lui manque un fichier pour sa présentation. Tu décides sur-le-champ de le lui envoyer. Dis-le-lui.',
    instructionEn:
      'A colleague is panicking: a file is missing for his presentation. You decide on the spot to deal with it. Tell him, in one sentence.',
    hint: 'Une décision prise à l’instant où l’on parle.',
    accepted: [
      'Don’t worry, I’ll send you the file right away.',
      'Don’t worry, I’ll send you the file straight away.',
      'Don’t worry, I’ll send you the file right now.',
      'Don’t worry, I’ll send you the file immediately.',
      'Don’t worry, I’ll send the file to you right away.',
      'Don’t worry, I’ll send it to you right away.',
      'Don’t worry, I’ll send it right away.',
      'Don’t worry, I’m sending you the file right away.',
      'Don’t worry, I’m sending you the file right now.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une décision prise sur le moment, une offre : _will_, _I’ll send it_. Le présent continu, _I’m sending it_, décrit l’action déjà lancée.',
  }),
  item(2, {
    sentenceFr: 'Je vais postuler à ce stage.',
    situationFr:
      'Tu y as réfléchi tout le week-end et ta décision est prise : ce stage en finance, tu vas tenter ta chance. Annonce-le à un ami.',
    instructionEn:
      'You thought about it all weekend and your mind is made up about this finance internship. Tell a friend about your plan to send an application.',
    hint: 'Une intention déjà décidée avant de parler.',
    accepted: [
      'I’m going to apply for this internship.',
      'I’m going to apply for that internship.',
      'I’m going to apply for this finance internship.',
      'I’m applying for this internship.',
      'I’m going to apply for it.',
      'I’ve decided to apply for this internship.',
      'I’ll apply for this internship.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une intention déjà décidée : _be going to_, _I’m going to apply_. On postule _for_ un poste.',
  }),
  item(3, {
    sentenceFr: 'Je déjeune avec le directeur jeudi.',
    situationFr:
      'Une collègue te propose de déjeuner ensemble jeudi. Décline : ce jour-là, ton déjeuner avec le directeur est déjà prévu.',
    instructionEn:
      'A colleague suggests lunch together on Thursday. Decline: that day, your lunch with the director is already arranged.',
    hint: 'Un rendez-vous déjà fixé, avec une date.',
    accepted: [
      'I’m having lunch with the director on Thursday.',
      'I’m having lunch with the director this Thursday.',
      'On Thursday I’m having lunch with the director.',
      'I’m meeting the director for lunch on Thursday.',
      'I’m going to have lunch with the director on Thursday.',
      'I’ll be having lunch with the director on Thursday.',
      'I have lunch with the director on Thursday.',
      'Sorry, I’m having lunch with the director on Thursday.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Un rendez-vous déjà fixé : présent continu, _I’m having lunch on Thursday_.',
  }),
  item(4, {
    sentenceFr: 'Je t’appellerai quand j’aurai les résultats.',
    situationFr:
      'Un client attend des chiffres que tu n’as pas encore. Promets-lui un appel, dès que les résultats seront entre tes mains.',
    instructionEn:
      'A client is waiting for figures you do not have yet. Promise a phone call, at the moment the results reach you.',
    hint: 'Après « quand », pour l’avenir, l’anglais n’emploie pas le futur.',
    accepted: [
      'I’ll call you when I have the results.',
      'I’ll call you when I get the results.',
      'I’ll call you when I’ve got the results.',
      'I’ll call you as soon as I have the results.',
      'I’ll call you as soon as I get the results.',
      'I’ll phone you when I have the results.',
      'I’ll ring you when I have the results.',
      'When I have the results, I’ll call you.',
      'When I get the results, I’ll call you.',
      'I’ll call you once I have the results.',
    ],
    knownErrors: [
      'I’ll call you when I will have the results.',
      'I’ll call you when I will get the results.',
      'When I will have the results, I’ll call you.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Après _when_ (ou _as soon as_), le futur s’exprime au présent : _when I have the results_. _Will_ reste dans la principale.',
  }),
  item(5, {
    sentenceFr: 'Regarde ces nuages : il va pleuvoir.',
    situationFr:
      'Avant de partir, tu vois le ciel devenir très sombre. Préviens tes collègues : la pluie arrive, c’est évident.',
    instructionEn:
      'Before leaving, you see the sky getting very dark. Warn your colleagues: rain is clearly on its way.',
    hint: 'Une prévision fondée sur ce que l’on voit maintenant.',
    accepted: [
      'Look at those clouds: it’s going to rain.',
      'Look at these clouds: it’s going to rain.',
      'Look at the clouds: it’s going to rain.',
      'Look at those clouds, it’s going to rain.',
      'Look at those clouds: it will rain.',
      'Look at the sky: it’s going to rain.',
      'It’s going to rain, look at those clouds.',
    ],
    knownErrors: [
      'Look at those clouds: it rains.',
      'Look at those clouds: it goes to rain.',
      'Look at these clouds: it goes to rain.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Une prévision fondée sur un signe visible : _be going to_, _it’s going to rain_.',
  }),
  item(6, {
    sentenceFr: 'Le train part à 7 h 15 demain matin.',
    situationFr:
      'Tu organises un déplacement pour ton équipe. Rappelle l’horaire de départ du train demain matin : 7 h 15.',
    instructionEn:
      'You are organising a business trip for your team. Remind everyone of the train’s departure time tomorrow morning: 7:15.',
    hint: 'Un horaire officiel, comme sur un tableau de départs.',
    accepted: [
      'The train leaves at 7:15 tomorrow morning.',
      'The train leaves at 7.15 tomorrow morning.',
      'The train departs at 7:15 tomorrow morning.',
      'Tomorrow morning the train leaves at 7:15.',
      'The train leaves tomorrow morning at 7:15.',
      'The train is leaving at 7:15 tomorrow morning.',
      'The train will leave at 7:15 tomorrow morning.',
      'Our train leaves at 7:15 tomorrow morning.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Un horaire officiel (train, avion, cours) : présent simple, _The train leaves at 7:15_.',
  }),
];
