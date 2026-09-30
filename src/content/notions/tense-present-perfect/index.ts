import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-present-perfect',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Présente deux ou trois expériences professionnelles ou personnelles, sans donner de date (_I’ve worked…_, _I’ve never…_).',
    'Fais le bilan de ta semaine ou de ton mois, qui n’est pas terminé : ce que tu as déjà fait, ce que tu as appris.',
    'Décris une action récente dont le résultat compte maintenant (un problème, un changement, une bonne nouvelle).',
  ],
};
