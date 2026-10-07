/**
 * The Edge Function "ai", the only path to Anthropic (docs/ARCHITECTURE.md §8).
 *
 * `POST { task, input, requestId }`:
 * CORS → user's JWT → allowed e-mail → Zod validation of the request →
 * reservation (idempotence, rate limit, monthly cap) → versioned prompt, stable
 * prefix first → model → validation of the output, one new attempt if it is
 * invalid or refused (not if it is cut off) → actual cost logged → answer.
 *
 * `GET ?timeZone=…`: the learner's spending and the cap; no model is called.
 *
 * Dependencies are injected: the tests replace the model, the log and the JWT
 * check. Nothing of the learner's text is ever logged (SEC-03).
 */
import type { z } from 'zod';
import { TASK_SETTINGS, type ModelId } from '../_shared/ai/models.ts';
import {
  ATTEMPTS,
  costOfUsage,
  estimateInputTokens,
  maxCostOfCall,
  sumUsd,
} from '../_shared/ai/pricing.ts';
import { PROMPTS } from '../_shared/ai/prompts/index.ts';
import {
  aiRequestSchema,
  MAX_REQUEST_BYTES,
  timeZoneSchema,
  type AiErrorCode,
  type AiFailure,
  type AiRequest,
  type AiSuccess,
  type AiUsage,
  type BudgetState,
} from '../_shared/ai/protocol.ts';
import { TASK_CONTRACTS } from '../_shared/ai/tasks.ts';
import type { Authenticate, AuthenticatedUser } from './auth.ts';
import type { FunctionConfig } from './config.ts';
import { corsHeadersFor } from './cors.ts';
import type { AiCallLedger, CallOutcome } from './ledger.ts';
import type { ModelCaller, ModelResult } from './model.ts';

/** A log line: identifiers, counters and codes only. */
export interface LogEntry {
  readonly event: 'ai_call' | 'ai_refused' | 'server_error';
  readonly task?: string;
  readonly attempt?: number;
  readonly status?: string;
  readonly costUsd?: number;
  readonly latencyMs?: number;
  readonly errorCode?: string;
  /** Explanation given by the API with an error (logs only, never stored). */
  readonly detail?: string;
}

export interface Dependencies {
  readonly config: FunctionConfig;
  readonly authenticate: Authenticate;
  readonly ledger: AiCallLedger;
  readonly model: ModelCaller;
  readonly now: () => number;
  readonly log: (entry: LogEntry) => void;
}

const HTTP_STATUS: Readonly<Record<AiErrorCode, number>> = {
  unauthenticated: 401,
  forbidden: 403,
  invalid_request: 400,
  duplicate_request: 409,
  rate_limited: 429,
  budget_exceeded: 402,
  model_refusal: 502,
  output_truncated: 502,
  invalid_output: 502,
  upstream_error: 502,
  server_error: 500,
};

/** Seconds to wait after a rate-limit refusal: the window is one minute. */
const RETRY_AFTER_SECONDS = 60;

type Failure = AiFailure['error'];
type Outcome = { readonly ok: true; readonly body: AiSuccess } | Failure;

/** First day of the next UTC month, `YYYY-MM-DD`: when the cap starts again. */
export function nextMonthStart(now: number): string {
  const date = new Date(now);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
    .toISOString()
    .slice(0, 10);
}

function budgetState(usedUsd: number, config: FunctionConfig, now: number): BudgetState {
  return { usedUsd, limitUsd: config.monthlyBudgetUsd, resetsOn: nextMonthStart(now) };
}

/** Cost recorded for a finished call (D-016). */
function costOf(result: ModelResult<unknown>, model: ModelId, reservedCostUsd: number): number {
  if (result.kind !== 'error') return costOfUsage(model, result.usage);
  // Unknown outcome (timeout, lost connection): counted at its maximum.
  return result.billed === 'none' ? 0 : reservedCostUsd;
}

const FINAL_STATUS = {
  ok: 'ok',
  invalid_output: 'invalid_output',
  truncated: 'truncated',
  refusal: 'model_refusal',
  error: 'error',
} as const satisfies Record<ModelResult<unknown>['kind'], CallOutcome['status']>;

/** The variable part of the prompt, for the task of the request (D-017). */
function userMessageOf(request: AiRequest): string {
  switch (request.task) {
    case 'connection-check':
      return PROMPTS['connection-check'].userMessage(request.input);
    case 'generate-exercises':
      return PROMPTS['generate-exercises'].userMessage(request.input);
  }
}

async function runTask(
  request: AiRequest,
  user: AuthenticatedUser,
  deps: Dependencies,
): Promise<Outcome> {
  const { config, ledger, model, now, log } = deps;
  const { task } = request;
  const settings = TASK_SETTINGS[task];
  const prompt = PROMPTS[task];
  const userMessage = userMessageOf(request);
  // Each task has its own output schema; the model's answer is validated with it.
  const outputSchema: z.ZodType = TASK_CONTRACTS[task].output;
  const reservedCostUsd = maxCostOfCall(settings.model, {
    inputTokens: estimateInputTokens(prompt.system + userMessage),
    maxTokens: settings.maxTokens,
    cachePrefix: settings.cachePrefix,
  });

  // Every attempt is billed: the learner is told the cost of the whole request.
  const costs: number[] = [];
  for (const attempt of ATTEMPTS) {
    const reservation = await ledger.reserve({
      userId: user.id,
      requestId: request.requestId,
      attempt,
      task,
      model: settings.model,
      promptVersion: prompt.version,
      reservedCostUsd,
      monthlyBudgetUsd: config.monthlyBudgetUsd,
      rateLimitPerMinute: config.rateLimitPerMinute,
    });
    if (reservation.outcome !== 'reserved') {
      log({ event: 'ai_refused', task, attempt, status: reservation.outcome });
      switch (reservation.outcome) {
        case 'duplicate':
          return { code: 'duplicate_request' };
        case 'rate_limited':
          return { code: 'rate_limited', retryAfterSeconds: RETRY_AFTER_SECONDS };
        case 'budget_exceeded':
          return {
            code: 'budget_exceeded',
            budget: budgetState(reservation.monthUsedUsd, config, now()),
          };
      }
    }

    const started = now();
    const result = await model.call({
      settings,
      system: prompt.system,
      userMessage,
      outputSchema,
    });
    const outcome: CallOutcome = {
      status: FINAL_STATUS[result.kind],
      usage: result.kind === 'error' ? null : result.usage,
      costUsd: costOf(result, settings.model, reservedCostUsd),
      latencyMs: Math.max(0, now() - started),
      errorCode: result.kind === 'error' ? result.errorCode : null,
    };
    costs.push(outcome.costUsd);
    try {
      await ledger.complete(reservation.callId, outcome);
    } catch {
      // The reservation stays, at the maximum cost: the cap still holds.
      log({ event: 'server_error', task, attempt, errorCode: 'complete_failed' });
    }
    log({
      event: 'ai_call',
      task,
      attempt,
      status: outcome.status,
      costUsd: outcome.costUsd,
      latencyMs: outcome.latencyMs,
      ...(outcome.errorCode === null ? {} : { errorCode: outcome.errorCode }),
      ...(result.kind === 'error' && result.detail !== undefined ? { detail: result.detail } : {}),
    });

    switch (result.kind) {
      case 'ok':
        return {
          ok: true,
          body: {
            ok: true,
            requestId: request.requestId,
            task,
            model: settings.model,
            promptVersion: prompt.version,
            costUsd: sumUsd(costs),
            output: result.output,
          },
        };
      case 'invalid_output':
      case 'refusal':
        // A single new attempt (AI-07, D-016).
        if (attempt < ATTEMPTS.length) continue;
        return { code: result.kind === 'refusal' ? 'model_refusal' : 'invalid_output' };
      case 'truncated':
        // The same request would be cut off again.
        return { code: 'output_truncated' };
      case 'error':
        return { code: 'upstream_error' };
    }
  }
  return { code: 'invalid_output' };
}

type BodyResult =
  { readonly ok: true; readonly json: unknown } | { readonly ok: false; readonly status: number };

async function readJsonBody(request: Request): Promise<BodyResult> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_REQUEST_BYTES) return { ok: false, status: 413 };
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > MAX_REQUEST_BYTES) return { ok: false, status: 413 };
  try {
    return { ok: true, json: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, status: 400 };
  }
}

export async function handleRequest(request: Request, deps: Dependencies): Promise<Response> {
  const cors = corsHeadersFor(request.headers.get('origin'), deps.config.allowedOrigins);
  if (cors === null) return new Response(null, { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const fail = (error: Failure, status = HTTP_STATUS[error.code]): Response =>
    Response.json({ ok: false, error } satisfies AiFailure, {
      status,
      headers: {
        ...cors,
        ...(error.retryAfterSeconds === undefined
          ? {}
          : { 'Retry-After': String(error.retryAfterSeconds) }),
      },
    });

  if (request.method !== 'GET' && request.method !== 'POST') {
    return fail({ code: 'invalid_request' }, 405);
  }

  try {
    const user = await deps.authenticate(request);
    if (user === null) return fail({ code: 'unauthenticated' });
    if (!deps.config.allowedEmails.has(user.email)) return fail({ code: 'forbidden' });

    if (request.method === 'GET') {
      const zone = timeZoneSchema.safeParse(new URL(request.url).searchParams.get('timeZone'));
      const summary = await deps.ledger.usage(user.id, zone.success ? zone.data : 'UTC');
      const body: AiUsage = {
        ok: true,
        monthlyBudgetUsd: deps.config.monthlyBudgetUsd,
        ...summary,
        byTask: [...summary.byTask],
      };
      return Response.json(body, { headers: cors });
    }

    const body = await readJsonBody(request);
    if (!body.ok) return fail({ code: 'invalid_request' }, body.status);
    const parsed = aiRequestSchema.safeParse(body.json);
    if (!parsed.success) return fail({ code: 'invalid_request' });

    const outcome = await runTask(parsed.data, user, deps);
    return 'ok' in outcome ? Response.json(outcome.body, { headers: cors }) : fail(outcome);
  } catch (error) {
    deps.log({
      event: 'server_error',
      errorCode: error instanceof Error ? error.name : 'unknown',
    });
    return fail({ code: 'server_error' });
  }
}
