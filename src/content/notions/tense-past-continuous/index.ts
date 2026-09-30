import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-past-continuous',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Raconte un moment où quelque chose d’inattendu t’a interrompu : que faisais-tu, et que s’est-il passé ?',
    'Décris ce que tu faisais hier à une heure précise, et ce que faisaient les personnes autour de toi.',
    'Décris le contexte d’un événement de ton domaine : ce qui se passait quand il est arrivé.',
  ],
};
