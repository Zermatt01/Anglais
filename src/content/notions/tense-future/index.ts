import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';
import { THEME } from './theme.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-future',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Décris tes projets pour l’année prochaine : ce que tu as décidé (_going to_) et un rendez-vous déjà fixé (présent continu).',
    'Donne ton avis sur l’évolution de ton domaine dans les prochaines années (_I think… will…_).',
    'Écris à un collègue ce que tu feras quand tu auras terminé une tâche (_when…_, _as soon as…_).',
  ],
  theme: THEME,
};
