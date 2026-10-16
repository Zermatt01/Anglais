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
 *
 * Every wait is bounded (D-091): the session, then the answer. A call that
 * does not come back in time ends with the error `timeout`, never with an
 * endless "Correction en cours…".
 */
import {
  aiResponseSchema,
  aiUsageResponseSchema,
  PLATFORM_TIMEOUT_MS,
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
  | 'unreachable'
  /** No answer in time: the network, the server or the model is too slow. */
  | 'timeout';

export interface AiClientError {
  readonly code: AiClientErrorCode;
  readonly budget?: BudgetState;
  readonly retryAfterSeconds?: number;
}

export type AiRunResult<Task extends AiTaskName> =
  | {
      readonly ok: true;
      readonly output: AiTaskOutput<Task>;
      readonly costUsd: number;
      /** Kept with the result, so that it can be traced (D-017). */
      readonly model: string;
      readonly promptVersion: string;
    }
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

/** Longest wait for a valid session: Supabase Auth retries a refresh for at most 30 seconds. */
export const SESSION_TIMEOUT_MS = 30_000;

/**
 * Longest wait for the answer to a task. The function answers before
 * `REQUEST_DEADLINE_MS`, and the platform gives up at `PLATFORM_TIMEOUT_MS`:
 * past it, no answer can come any more, so waiting longer never saves a call.
 */
export const RUN_TIMEOUT_MS = PLATFORM_TIMEOUT_MS + 10_000;

/** Longest wait for the spending, which calls no model. */
export const USAGE_TIMEOUT_MS = 20_000;

const TIMED_OUT = Symbol('timed out');

function failure(code: AiClientErrorCode): { ok: false; error: AiClientError } {
  return { ok: false, error: { code } };
}

/** Runs `task`, giving up after `ms`: its signal is aborted and its result ignored. */
async function within<T>(
  ms: number,
  task: (signal: AbortSignal) => Promise<T>,
): Promise<T | typeof TIMED_OUT> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => {
      // Settled before the abort, so that the deadline wins the race.
      resolve(TIMED_OUT);
      controller.abort();
    }, ms);
  });
  try {
    return await Promise.race([task(controller.signal), deadline]);
  } finally {
    clearTimeout(timer);
  }
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
    timeoutMs: number,
  ): Promise<{ ok: true; json: unknown } | { ok: false; error: AiClientError }> {
    if (!isOnline()) return failure('offline');
    try {
      const token = await within(SESSION_TIMEOUT_MS, () => accessToken());
      if (token === TIMED_OUT) return failure(isOnline() ? 'timeout' : 'offline');
      if (token === null) return failure('signed_out');
      const headers = new Headers(init.headers);
      headers.set('authorization', `Bearer ${token}`);
      headers.set('apikey', publishableKey);
      const answer = await within(timeoutMs, async (signal) => {
        const response = await doFetch(url, { ...init, headers, signal });
        // The platform's own timeout: its body is not an answer of the function.
        if (response.status === 504) return TIMED_OUT;
        const json: unknown = await response.json();
        return { json };
      });
      if (answer === TIMED_OUT) return failure(isOnline() ? 'timeout' : 'offline');
      return { ok: true, json: answer.json };
    } catch {
      return failure(isOnline() ? 'unreachable' : 'offline');
    }
  }

  return {
    async run(task, input, requestId) {
      const sent = await send(
        functionUrl,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ task, input, requestId }),
        },
        RUN_TIMEOUT_MS,
      );
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
        model: answer.data.model,
        promptVersion: answer.data.promptVersion,
      };
    },

    async usage(timeZone) {
      const url = `${functionUrl}?${new URLSearchParams({ timeZone }).toString()}`;
      const sent = await send(url, { method: 'GET' }, USAGE_TIMEOUT_MS);
      if (!sent.ok) return sent;
      const answer = aiUsageResponseSchema.safeParse(sent.json);
      if (!answer.success) return { ok: false, error: { code: 'unreachable' } };
      return answer.data.ok
        ? { ok: true, usage: answer.data }
        : { ok: false, error: answer.data.error };
    },
  };
}
