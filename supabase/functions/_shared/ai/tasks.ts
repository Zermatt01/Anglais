// Generated from shared/ai/tasks.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * AI tasks and their input and output contracts (AI-01, D-017).
 *
 * The client sends `{ task, input, requestId }`, never a prompt; the Edge
 * Function validates the input with the task's schema, builds the versioned
 * prompt and validates the model's output with the task's output schema.
 *
 * Each phase adds the tasks it needs (docs/ARCHITECTURE.md §10.2). Phase 2
 * delivers only `connection-check`, a minimal call that checks the whole chain
 * (DECISIONS D-066).
 *
 * Output schemas stay flat, without length or range constraints: structured
 * outputs do not support them (D-010).
 */
import { z } from 'zod';

export const AI_TASK_NAMES = ['connection-check'] as const;
export const aiTaskNameSchema = z.enum(AI_TASK_NAMES);
export type AiTaskName = z.infer<typeof aiTaskNameSchema>;

export const TASK_CONTRACTS = {
  'connection-check': {
    input: z.strictObject({}),
    output: z.strictObject({ status: z.enum(['ok']) }),
  },
} as const satisfies Record<AiTaskName, { input: z.ZodType; output: z.ZodType }>;

export type AiTaskInput<Task extends AiTaskName> = z.infer<(typeof TASK_CONTRACTS)[Task]['input']>;
export type AiTaskOutput<Task extends AiTaskName> = z.infer<
  (typeof TASK_CONTRACTS)[Task]['output']
>;
