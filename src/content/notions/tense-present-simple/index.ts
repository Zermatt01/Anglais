import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-present-simple',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Décris ta routine de travail ou d’études : ce que tu fais chaque jour ou chaque semaine.',
    'Présente ton poste ou ta formation, et ce que fait ton entreprise ou ton école.',
    'Énonce deux ou trois faits généraux de ton domaine (finance, données, enseignement…).',
  ],
};
