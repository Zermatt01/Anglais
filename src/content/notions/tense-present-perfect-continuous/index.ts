import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-present-perfect-continuous',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Décris une activité que tu mènes depuis un moment (études, projet, sport) et depuis combien de temps.',
    'Explique à un recruteur ce sur quoi tu travailles ces derniers temps, en insistant sur la durée.',
    'Décris la trace visible d’une activité récente (fatigue, bureau en désordre…) et ce que tu as fait.',
  ],
};
