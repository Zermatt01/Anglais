// Generated from shared/ai/prompts/connection-check.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * `connection-check`: the smallest possible call, made only when the learner
 * touches "Tester la connexion à l'IA". It checks the whole chain (session,
 * key, credit, budget, structured output, cost log) for a fraction of a cent.
 */
import type { AiTaskInput } from '../tasks.ts';
import type { TaskPrompt } from './prompt.ts';

export const CONNECTION_CHECK_PROMPT: TaskPrompt<AiTaskInput<'connection-check'>> = {
  version: 'connection-check@1',
  system:
    'You are the connectivity check of a language-learning application. ' +
    'Answer with the JSON object required by the output format, with "status" set to "ok". ' +
    'Do not add anything else.',
  userMessage: () => 'Connectivity check.',
};
