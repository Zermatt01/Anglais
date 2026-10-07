import type { NotionContentInput } from '../../schema.ts';
import { EXERCISES } from './exercises.ts';
import { LESSON } from './lesson.ts';
import { PLACEMENT } from './placement.ts';
import { THEME } from './theme.ts';

export const CONTENT: NotionContentInput = {
  notionId: 'tense-review',
  lesson: LESSON,
  exercises: EXERCISES,
  placement: PLACEMENT,
  producePrompts: [
    'Présente-toi comme au début d’un entretien : ta situation actuelle, ton parcours passé et tes projets.',
    'Raconte une journée de travail récente et imprévue : ce qui se passait, ce qui est arrivé, ce qui s’était passé avant.',
    'Écris un court e-mail de suivi : ce que tu as déjà fait, ce que tu fais en ce moment, et ce que tu feras ensuite.',
  ],
  theme: THEME,
};
