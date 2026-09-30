import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-past-simple',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Raconte ce que tu as fait hier ou le week-end dernier, en trois actions.',
    'Présente une étape passée de ton parcours : tes études, un stage ou un premier emploi, avec des dates.',
    'Décris un événement récent de ton domaine (une décision, un lancement, une crise), à un moment précis du passé.',
  ],
};
