// Generated from shared/ai/prompts/index.ts by `npm run sync:shared`: do not edit (D-061).
/** Registry of the prompts, one per task (AI-01). */
import type { AiTaskInput, AiTaskName } from '../tasks.ts';
import { CONNECTION_CHECK_PROMPT } from './connection-check.ts';
import { GENERATE_EXERCISES_PROMPT } from './generate-exercises.ts';
import type { TaskPrompt } from './prompt.ts';

export const PROMPTS: { readonly [Task in AiTaskName]: TaskPrompt<AiTaskInput<Task>> } = {
  'connection-check': CONNECTION_CHECK_PROMPT,
  'generate-exercises': GENERATE_EXERCISES_PROMPT,
};
