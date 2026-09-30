import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-present-perfect-vs-past-simple',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Présente ton parcours comme dans un entretien : une expérience générale (present perfect), puis deux détails datés (prétérit).',
    'Fais le bilan de ton année : ce que tu as accompli jusqu’ici, et un événement précis du mois dernier.',
    'Réponds à _What have you learned from your studies?_ en citant un exemple daté.',
  ],
};
