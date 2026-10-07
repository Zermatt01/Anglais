/**
 * The daily session (MOD-02, PED-12, docs/PEDAGOGY.md §10.1): Reprises, then
 * one step of the path, then the Thème, then the journal (the oral module
 * comes in phase 6, and the guided e-mail in phase 7, D-084).
 *
 * Nothing is stored for the session itself: where it stands is read from what
 * the learner did today, so that an interrupted session resumes where it
 * stopped, on any device, and a module done on its own counts too.
 */
export type SessionStepId = 'review' | 'path' | 'theme' | 'journal';

export const SESSION_STEPS: readonly SessionStepId[] = ['review', 'path', 'theme', 'journal'];

/** Daily targets: 5 to 8 minutes of path, 4 to 6 Thème sentences, one journal entry. */
export const SESSION_TARGETS = { pathAnswers: 8, themeSentences: 5, journalEntries: 1 } as const;

export interface TodayActivity {
  /** Cards still due now, within the daily caps. */
  readonly dueCards: number;
  readonly cardsReviewed: number;
  readonly pathAnswers: number;
  /** Productions of step 5 corrected today: one is a step of the path. */
  readonly pathProductions: number;
  readonly themeSentences: number;
  readonly journalEntries: number;
}

export interface SessionStep {
  readonly id: SessionStepId;
  /** False when the module cannot be done yet (no studied notion for the Thème). */
  readonly available: boolean;
  readonly done: boolean;
  readonly count: number;
  readonly target: number;
}

export interface DailySession {
  readonly steps: readonly SessionStep[];
  /** The first available step not done yet, or `null` when the session is complete. */
  readonly next: SessionStepId | null;
}

export function dailySession(
  today: TodayActivity,
  availability: { readonly theme: boolean; readonly journal: boolean },
): DailySession {
  const steps: SessionStep[] = [
    {
      id: 'review',
      available: true,
      done: today.dueCards === 0,
      count: today.cardsReviewed,
      target: today.cardsReviewed + today.dueCards,
    },
    {
      id: 'path',
      available: true,
      done: today.pathAnswers >= SESSION_TARGETS.pathAnswers || today.pathProductions > 0,
      count: Math.min(today.pathAnswers, SESSION_TARGETS.pathAnswers),
      target: SESSION_TARGETS.pathAnswers,
    },
    {
      id: 'theme',
      available: availability.theme,
      done: today.themeSentences >= SESSION_TARGETS.themeSentences,
      count: Math.min(today.themeSentences, SESSION_TARGETS.themeSentences),
      target: SESSION_TARGETS.themeSentences,
    },
    {
      id: 'journal',
      available: availability.journal,
      done: today.journalEntries >= SESSION_TARGETS.journalEntries,
      count: Math.min(today.journalEntries, SESSION_TARGETS.journalEntries),
      target: SESSION_TARGETS.journalEntries,
    },
  ];
  return { steps, next: steps.find((step) => step.available && !step.done)?.id ?? null };
}
