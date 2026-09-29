/**
 * Typed client of the Edge Function "ai" (docs/ARCHITECTURE.md §8).
 *
 * Rules (COST-01, NO-01, D-017):
 * - `run` is called only from the handler of an explicit user action (a
 *   button), never from an effect, a timer, a retry loop or the
 *   synchronization;
 * - the client sends `{ task, input, requestId }`, never a prompt;
 * - `requestId` identifies the user action: the same action sent twice
 *   (double tap, network retry) is refused by the server and costs nothing.
 *
 * Both the answer and the task output are validated with Zod.
 */
import {
  aiResponseSchema,
  aiUsageResponseSchema,
  type AiErrorCode,
  type AiUsage,
  type BudgetState,
} from '../../../shared/ai/protocol.ts';
import {
  TASK_CONTRACTS,
  type AiTaskInput,
  type AiTaskName,
  type AiTaskOutput,
} from '../../../shared/ai/tasks.ts';

export type AiClientErrorCode =
  | AiErrorCode
  /** The device has no network. */
  | 'offline'
  /** No session on this device. */
  | 'signed_out'
  /** The server could not be reached, or answered something unexpected. */
  | 'unreachable';

export interface AiClientError {
  readonly code: AiClientErrorCode;
  readonly budget?: BudgetState;
  readonly retryAfterSeconds?: number;
}

export type AiRunResult<Task extends AiTaskName> =
  | { readonly ok: true; readonly output: AiTaskOutput<Task>; readonly costUsd: number }
  | { readonly ok: false; readonly error: AiClientError };

export type AiUsageResult =
  | { readonly ok: true; readonly usage: AiUsage }
  | { readonly ok: false; readonly error: AiClientError };

export interface AiClient {
  run<Task extends AiTaskName>(
    task: Task,
    input: AiTaskInput<Task>,
    requestId: string,
  ): Promise<AiRunResult<Task>>;
  /** Spending and cap (COST-08): no model is called. */
  usage(timeZone: string): Promise<AiUsageResult>;
}

export interface AiClientOptions {
  readonly functionUrl: string;
  readonly publishableKey: string;
  readonly accessToken: () => Promise<string | null>;
  readonly isOnline?: () => boolean;
  readonly fetch?: typeof fetch;
}

export function createAiClient(options: AiClientOptions): AiClient {
  const {
    functionUrl,
    publishableKey,
    accessToken,
    isOnline = () => navigator.onLine,
    fetch: doFetch = (input, init) => fetch(input, init),
  } = options;

  /** Sends a request with the session; answers the JSON body, or an error. */
  async function send(
    url: string,
    init: RequestInit,
  ): Promise<{ ok: true; json: unknown } | { ok: false; error: AiClientError }> {
    if (!isOnline()) return { ok: false, error: { code: 'offline' } };
    const token = await accessToken();
    if (token === null) return { ok: false, error: { code: 'signed_out' } };
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);
    headers.set('apikey', publishableKey);
    try {
      const response = await doFetch(url, { ...init, headers });
      return { ok: true, json: await response.json() };
    } catch {
      return { ok: false, error: { code: isOnline() ? 'unreachable' : 'offline' } };
    }
  }

  return {
    async run(task, input, requestId) {
      const sent = await send(functionUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ task, input, requestId }),
      });
      if (!sent.ok) return sent;
      const answer = aiResponseSchema.safeParse(sent.json);
      if (!answer.success) return { ok: false, error: { code: 'unreachable' } };
      if (!answer.data.ok) return { ok: false, error: answer.data.error };
      if (answer.data.requestId !== requestId) return { ok: false, error: { code: 'unreachable' } };
      const output = TASK_CONTRACTS[task].output.safeParse(answer.data.output);
      if (!output.success) return { ok: false, error: { code: 'invalid_output' } };
      return {
        ok: true,
        // Safe: validated just above by the output schema of `task`.
        output: output.data as AiTaskOutput<typeof task>,
        costUsd: answer.data.costUsd,
      };
    },

    async usage(timeZone) {
      const url = `${functionUrl}?${new URLSearchParams({ timeZone }).toString()}`;
      const sent = await send(url, { method: 'GET' });
      if (!sent.ok) return sent;
      const answer = aiUsageResponseSchema.safeParse(sent.json);
      if (!answer.success) return { ok: false, error: { code: 'unreachable' } };
      return answer.data.ok
        ? { ok: true, usage: answer.data }
        : { ok: false, error: answer.data.error };
    },
  };
}
