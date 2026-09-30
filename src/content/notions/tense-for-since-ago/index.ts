import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-for-since-ago',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Présente ta situation actuelle avec des durées : depuis quand tu étudies ou travailles, depuis combien de temps tu vis où tu vis.',
    'Raconte deux moments clés de ton parcours avec _ago_ (il y a…).',
    'Réponds à la question d’un recruteur : _How long have you been interested in finance?_',
  ],
};
