import type { AnswerResult, Grader } from '../../../domain/taxonomy.ts';

/** What an exercise reports once the learner's answer is final. */
export interface ExerciseAnswer {
  readonly answer: string;
  readonly result: AnswerResult;
  readonly grader: Grader;
  readonly hintUsed: boolean;
}
