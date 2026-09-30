/** Words of the path, as the learner reads them (CUR-12, PEDAGOGY §3). */
import type { ProgressEvent } from '../../domain/curriculum/engine.ts';
import type { NotionProgressValues, Step } from '../../domain/curriculum/progress.ts';

export const STEP_NAMES: Readonly<Record<Step, string>> = {
  1: 'Comprendre',
  2: 'Reconnaître',
  3: 'Pratiquer',
  4: 'Traduire',
  5: 'Produire',
};

export function stepName(step: Step): string {
  return STEP_NAMES[step] ?? `Étape ${String(step)}`;
}

/** "Non commencée", "Étape 3 sur 5 : Pratiquer", "À consolider : étape 4 sur 5", "Acquise". */
export function describeProgress(progress: NotionProgressValues | null | undefined): string {
  if (progress === null || progress === undefined || progress.status === 'not_started') {
    return 'Non commencée';
  }
  const step = `étape ${String(progress.step)} sur 5 : ${stepName(progress.step)}`;
  switch (progress.status) {
    case 'in_progress':
      return step.charAt(0).toUpperCase() + step.slice(1);
    case 'to_consolidate':
      return `À consolider : ${step}`;
    case 'acquired':
      return 'Acquise';
  }
}

/** Short, encouraging message after a change of step (PEDAGOGY §3.3, PED-13). */
export function eventMessage(event: ProgressEvent): { title: string; body: string } | null {
  switch (event.type) {
    case 'step-passed':
      return {
        title: `Étape suivante : ${stepName(event.to)}`,
        body:
          event.to === 5
            ? 'Bravo, tu maîtrises la traduction guidée. Place à tes propres phrases.'
            : 'Tu as atteint le critère de l’étape. On continue avec un peu moins d’aide.',
      };
    case 'recall-started':
      return {
        title: 'Petit rappel',
        body: `Cette forme résiste encore, c’est normal à ce stade. On revoit l’étape « ${stepName(event.step)} » quelques minutes, puis tu reviens.`,
      };
    case 'recall-passed':
      return {
        title: 'Rappel réussi',
        body: `C’est reparti pour l’étape « ${stepName(event.step)} », avec un compteur remis à zéro.`,
      };
    case 'recall-continued':
      return {
        title: 'Encore une petite série',
        body: 'Pas encore tout à fait : cinq exercices de plus, et tu y seras.',
      };
    case 'lesson-suggested':
      return {
        title: 'Un coup d’œil à la leçon ?',
        body: 'Relire la leçon deux minutes aide souvent à débloquer ces exercices.',
      };
    case 'acquired':
      return { title: 'Notion acquise', body: 'Elle entre dans tes révisions.' };
    case 'placed':
    case 'started':
      return null;
  }
}
