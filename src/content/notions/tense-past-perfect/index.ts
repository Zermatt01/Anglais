import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';
import { THEME } from './theme.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-past-perfect',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Raconte un moment où tu es arrivé trop tard : que s’était-il déjà passé ?',
    'Explique ce que tu avais fait avant de commencer tes études actuelles ou ton poste actuel.',
    'Raconte une première fois marquante (_It was the first time I had…_).',
  ],
  theme: THEME,
};
