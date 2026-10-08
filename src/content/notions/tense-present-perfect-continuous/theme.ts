import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

// With for or since, the simple form of an action verb is also right (D-035).
const { item } = themeOf('tense-present-perfect-continuous', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Je travaille sur ce bug depuis ce matin.',
    situationFr:
      'Ton manager demande pourquoi tu n’as pas répondu à ses messages. Explique que ce bug t’occupe depuis ce matin, sans interruption.',
    instructionEn:
      'Your manager asks why you did not answer his messages. Explain that this bug has kept you busy since this morning, non-stop.',
    hint: 'Une activité commencée ce matin et qui dure encore.',
    accepted: [
      'I’ve been working on this bug since this morning.',
      'I have been working on this bug since this morning.',
      'I’ve worked on this bug since this morning.',
      'I’ve been working on this bug all morning.',
      'I have been working on this bug all morning.',
      'Since this morning I’ve been working on this bug.',
    ],
    knownErrors: [
      'I work on this bug since this morning.',
      'I am working on this bug since this morning.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une activité qui dure jusqu’à maintenant (« depuis ») : present perfect continu, _I’ve been working since this morning_.',
  }),
  item(2, {
    sentenceFr: 'Il pleut depuis deux heures.',
    situationFr:
      'Tu expliques à un client pourquoi ton équipe arrive en retard : la pluie ne s’arrête pas, cela fait deux heures qu’elle tombe.',
    instructionEn:
      'You explain to a client why your team is late: the rain has not stopped for two hours.',
    hint: 'Une action qui dure depuis une certaine durée, jusqu’à maintenant.',
    accepted: [
      'It’s been raining for two hours.',
      'It has been raining for two hours.',
      'It’s been raining for two hours now.',
      'It has been raining for two hours now.',
    ],
    knownErrors: [
      'It rains since two hours.',
      'It is raining since two hours.',
      'It has been raining since two hours.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Depuis » + une durée : _for_, avec le present perfect continu, _It’s been raining for two hours_.',
  }),
  item(3, {
    sentenceFr: 'Le sol est mouillé : il a plu.',
    situationFr:
      'En arrivant, une collègue s’étonne que le trottoir soit trempé. Explique-lui la cause : il a plu juste avant son arrivée.',
    instructionEn:
      'When she arrives, a colleague is surprised that the pavement is soaking wet. Explain why: rain, just before she came.',
    hint: 'Une activité récente, dont on voit le résultat maintenant.',
    accepted: [
      'The ground is wet: it’s been raining.',
      'The ground is wet: it has been raining.',
      'The ground is wet because it’s been raining.',
      'The ground is wet because it has been raining.',
      'The ground is wet: it has rained.',
      'The ground is wet: it rained.',
      'The ground is wet: it’s just been raining.',
    ],
    knownErrors: ['The ground is wet: it rains.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une activité récente dont on voit le résultat : present perfect continu, _it’s been raining_.',
  }),
  item(4, {
    sentenceFr: 'Depuis combien de temps attendez-vous ?',
    situationFr:
      'Un candidat est assis dans le hall avant son entretien. Demande-lui la durée de son attente jusqu’ici.',
    instructionEn:
      'A candidate is sitting in the lobby before his interview. Ask about the length of his wait so far.',
    hint: 'Une question sur la durée d’une activité, jusqu’à maintenant.',
    accepted: [
      'How long have you been waiting?',
      'For how long have you been waiting?',
      'How long have you waited?',
      'Have you been waiting long?',
    ],
    knownErrors: ['Since when are you waiting?', 'Since how long are you waiting?'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Depuis combien de temps » : _How long…?_ avec le present perfect continu, _How long have you been waiting?_',
  }),
  item(5, {
    sentenceFr: 'J’écris des rapports depuis ce matin, et j’en ai fini trois.',
    situationFr:
      'Ta responsable te demande où tu en es. Explique que tu rédiges des rapports depuis le début de la matinée, et que trois sont terminés.',
    instructionEn:
      'Your manager asks how things are going. Explain that report writing has filled your morning since it started, and that three of the reports are complete.',
    hint: 'Une activité qui dure, puis un résultat que l’on compte.',
    accepted: [
      'I’ve been writing reports since this morning, and I’ve finished three.',
      'I have been writing reports since this morning, and I have finished three.',
      'I’ve been writing reports since this morning and I’ve finished three of them.',
      'I’ve been writing reports since this morning, and I’ve finished three of them.',
      'I’ve been writing reports since this morning, and I’ve completed three.',
      'I’ve been writing reports all morning, and I’ve finished three.',
      'I’ve been writing reports all morning and I’ve finished three of them.',
    ],
    knownErrors: [
      'I’ve been writing reports since this morning, and I’ve been finishing three.',
      'I write reports since this morning, and I’ve finished three.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'L’activité qui dure : present perfect continu, _I’ve been writing_. Le résultat compté (_three_) : present perfect simple, _I’ve finished three_.',
  }),
  item(6, {
    sentenceFr: 'Je connais Marc depuis dix ans.',
    situationFr:
      'Un recruteur te demande de recommander quelqu’un. Tu proposes Marc, et tu précises que vous vous connaissez depuis dix ans.',
    instructionEn:
      'A recruiter asks you to recommend someone. You suggest Marc and add that your acquaintance with him started ten years ago and continues today.',
    hint: '« Connaître » est un verbe d’état : il n’a pas de forme en _-ing_.',
    accepted: [
      'I’ve known Marc for ten years.',
      'I have known Marc for ten years.',
      'I’ve known Marc for 10 years.',
      'I’ve known him for ten years.',
      'I have known him for ten years.',
    ],
    knownErrors: [
      'I know Marc since ten years.',
      'I know Marc for ten years.',
      'I’ve been knowing Marc for ten years.',
      'I have known Marc since ten years.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_Know_ est un verbe d’état : present perfect simple, _I’ve known Marc for ten years_, jamais _been knowing_.',
  }),
];
