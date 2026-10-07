import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-present-continuous', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'En ce moment, je prépare la présentation de demain.',
    situationFr:
      'Une collègue te propose un café, mais tu n’as pas le temps : tu es en train de préparer la présentation de demain. Explique-le-lui en une phrase.',
    instructionEn:
      'A colleague offers you a coffee, but you have no time: tomorrow’s presentation needs your full attention right now. Explain this in one sentence.',
    hint: 'Une action en cours au moment où tu parles.',
    accepted: [
      'I’m preparing tomorrow’s presentation at the moment.',
      'At the moment I’m preparing tomorrow’s presentation.',
      'I’m preparing tomorrow’s presentation right now.',
      'Right now I’m preparing tomorrow’s presentation.',
      'I’m preparing tomorrow’s presentation now.',
      'I’m currently preparing tomorrow’s presentation.',
      'I’m preparing the presentation for tomorrow at the moment.',
      'At the moment I’m preparing the presentation for tomorrow.',
      'I’m working on tomorrow’s presentation at the moment.',
      'I’m working on tomorrow’s presentation right now.',
    ],
    knownErrors: [
      'I prepare tomorrow’s presentation at the moment.',
      'At the moment I prepare tomorrow’s presentation.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Une action en cours maintenant : présent continu, _I’m preparing_.',
  }),
  item(2, {
    sentenceFr: 'En ce moment, les prix de l’immobilier baissent dans notre ville.',
    situationFr:
      'Un ami pense acheter un appartement. Explique-lui qu’en ce moment, les prix de l’immobilier sont en baisse dans votre ville.',
    instructionEn:
      'A friend wants to buy a flat. In one sentence, tell them about the current fall in property prices in your city.',
    hint: 'Une évolution en cours, qui se produit en ce moment.',
    accepted: [
      'Property prices are falling in our city at the moment.',
      'At the moment property prices are falling in our city.',
      'House prices are falling in our city at the moment.',
      'At the moment house prices are falling in our city.',
      'Housing prices are falling in our city at the moment.',
      'Real estate prices are falling in our city at the moment.',
      'Property prices are going down in our city at the moment.',
      'Property prices are dropping in our city at the moment.',
      'House prices are going down in our city at the moment.',
      'Property prices in our city are falling at the moment.',
      'Property prices are currently falling in our city.',
    ],
    knownErrors: [
      'At the moment property prices fall in our city.',
      'Property prices fall in our city at the moment.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une évolution en cours (_at the moment_) : présent continu, _are falling_. Le présent simple décrirait une vérité générale.',
  }),
  item(3, {
    sentenceFr: 'Pourquoi est-ce que tu souris ?',
    situationFr:
      'Pendant la réunion, ta collègue sourit en lisant ses messages. Demande-lui pourquoi, en une phrase.',
    instructionEn:
      'During the meeting, your colleague keeps smiling at her phone. Ask her the reason, in one short question.',
    hint: 'Une question sur ce qui se passe maintenant, sous tes yeux.',
    accepted: [
      'Why are you smiling?',
      'What are you smiling about?',
      'What are you smiling at?',
      'Why are you smiling at your phone?',
    ],
    knownErrors: ['Why you are smiling?'],
    knownErrorCategory: 'auxiliaires_questions_negations',
    explanation:
      'Elle sourit en ce moment : présent continu. Dans la question, _are_ passe devant le sujet : _Why are you smiling?_',
  }),
  item(4, {
    sentenceFr: 'Cette semaine, je travaille à la maison.',
    situationFr:
      'Ton manager te demande si tu seras au bureau demain. Explique que, pour cette semaine seulement, tu travailles à la maison.',
    instructionEn:
      'Your manager asks whether you will be at the office tomorrow. Explain that home is your workplace for this week only.',
    hint: 'Une situation temporaire, limitée à cette semaine.',
    accepted: [
      'This week I’m working from home.',
      'I’m working from home this week.',
      'This week I’m working at home.',
      'I’m working at home this week.',
      'I’m working from home this week only.',
      'This week only, I’m working from home.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une situation temporaire (_this week_) : présent continu, _I’m working from home_.',
  }),
  item(5, {
    sentenceFr: 'Les ventes n’augmentent pas en ce moment.',
    situationFr:
      'Un investisseur te demande si les ventes progressent. Réponds que, pour l’instant, elles ne sont pas en hausse.',
    instructionEn:
      'An investor asks about sales growth. Answer, in one sentence, that there is no increase at the moment.',
    hint: 'Une négation sur ce qui se passe en ce moment.',
    accepted: [
      'Sales aren’t increasing at the moment.',
      'At the moment sales aren’t increasing.',
      'Sales aren’t rising at the moment.',
      'Sales aren’t going up at the moment.',
      'Sales aren’t growing at the moment.',
      'Sales aren’t increasing right now.',
      'Sales aren’t currently increasing.',
    ],
    knownErrors: ['Sales don’t increase at the moment.', 'At the moment sales don’t increase.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Négation du présent continu : _aren’t_ + verbe en _-ing_, pour une évolution en cours.',
  }),
  item(6, {
    sentenceFr: 'Qu’est-ce que tu lis en ce moment ?',
    situationFr:
      'À la pause, tu remarques un livre sur le bureau de ton collègue. Demande-lui quel livre il a en cours de lecture ces temps-ci.',
    instructionEn:
      'During the break, you notice a book on your colleague’s desk. Ask him about the book he is in the middle of these days.',
    hint: 'Une activité en cours ces temps-ci, pas une habitude.',
    accepted: [
      'What are you reading at the moment?',
      'What are you reading right now?',
      'What are you reading these days?',
      'What book are you reading at the moment?',
      'What book are you reading?',
      'What are you reading?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une lecture en cours ces temps-ci (_at the moment_) : présent continu, _What are you reading?_',
  }),
];
