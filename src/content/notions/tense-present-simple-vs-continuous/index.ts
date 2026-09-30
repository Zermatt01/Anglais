import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-present-simple-vs-continuous',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Compare ta routine habituelle avec ce que tu fais de différent cette semaine.',
    'Présente ton métier ou tes études (situation stable), puis un projet sur lequel tu travailles en ce moment.',
    'Donne ton avis sur une question de ton domaine avec un verbe d’état (_think_, _believe_, _know_…), puis décris ce qui change en ce moment.',
  ],
};
