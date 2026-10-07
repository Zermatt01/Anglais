import type { AnswerResult, Grader } from '../../../domain/taxonomy.ts';

/** What an exercise reports once the learner's answer is final. */
export interface ExerciseAnswer {
  readonly answer: string;
  readonly result: AnswerResult;
  readonly grader: Grader;
  readonly hintUsed: boolean;
}

/** Stores an answer: resolves once it is stored, rejects when it could not be. */
export type SaveAnswer = (answer: ExerciseAnswer) => Promise<void>;
