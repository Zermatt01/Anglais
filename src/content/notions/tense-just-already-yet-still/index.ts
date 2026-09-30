import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-just-already-yet-still',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Fais le point sur un projet en cours : ce que tu viens de faire, ce que tu as déjà fait, ce que tu n’as pas encore fait.',
    'Écris à un collègue que tu attends toujours une réponse ou un document, poliment mais avec une pointe d’impatience.',
    'Décris ce qui n’a pas changé dans ta vie ou ton travail depuis longtemps (_still_), et ce qui vient de changer (_just_).',
  ],
};
