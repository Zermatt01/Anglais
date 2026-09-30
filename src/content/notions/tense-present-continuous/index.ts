import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-present-continuous',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Décris ce que tu es en train de faire en ce moment, ou ce que font les personnes autour de toi.',
    'Explique sur quoi tu travailles ou ce que tu étudies ces temps-ci, pour une période limitée.',
    'Décris une évolution en cours dans ton domaine (marchés, données, enseignement…).',
  ],
};
