/**
 * The call log (table ai_calls), through the SQL functions of
 * supabase/migrations/…_ai_calls.sql: reservation before a call, outcome
 * after it, and usage summary (COST-05 to COST-08, D-016).
 */
import { z } from 'zod';
import type { Attempt, TokenUsage } from '../_shared/ai/pricing.ts';

/** Calls a SQL function as PostgREST does; throws on a database error. */
export type RpcCaller = (fn: string, args: Readonly<Record<string, unknown>>) => Promise<unknown>;

export interface CallToReserve {
  readonly userId: string;
  readonly requestId: string;
  readonly attempt: Attempt;
  readonly task: string;
  readonly model: string;
  readonly promptVersion: string;
  readonly reservedCostUsd: number;
  readonly monthlyBudgetUsd: number;
  readonly rateLimitPerMinute: number;
}

export type Reservation =
  | { readonly outcome: 'reserved'; readonly callId: string; readonly monthUsedUsd: number }
  | { readonly outcome: 'duplicate' }
  | { readonly outcome: 'rate_limited'; readonly monthUsedUsd: number }
  | { readonly outcome: 'budget_exceeded'; readonly monthUsedUsd: number };

export type FinalStatus = 'ok' | 'invalid_output' | 'truncated' | 'model_refusal' | 'error';

export interface CallOutcome {
  readonly status: FinalStatus;
  /** `null` when the API returned no usage (error before or during the call). */
  readonly usage: TokenUsage | null;
  readonly costUsd: number;
  readonly latencyMs: number;
  readonly errorCode: string | null;
}

export interface UsageSummary {
  readonly timeZone: string;
  readonly monthStart: string;
  readonly resetsOn: string;
  readonly monthUsd: number;
  readonly todayUsd: number;
  readonly byTask: readonly { task: string; calls: number; costUsd: number }[];
}

export interface AiCallLedger {
  reserve(call: CallToReserve): Promise<Reservation>;
  complete(callId: string, outcome: CallOutcome): Promise<void>;
  usage(userId: string, timeZone: string): Promise<UsageSummary>;
}

const reservationSchema = z.discriminatedUnion('outcome', [
  z.object({ outcome: z.literal('reserved'), call_id: z.uuid(), month_used_usd: z.number() }),
  z.object({ outcome: z.literal('duplicate') }),
  z.object({ outcome: z.literal('rate_limited'), month_used_usd: z.number() }),
  z.object({ outcome: z.literal('budget_exceeded'), month_used_usd: z.number() }),
]);

const usageSummarySchema = z.object({
  time_zone: z.string(),
  month_start: z.iso.date(),
  resets_on: z.iso.date(),
  month_usd: z.number(),
  today_usd: z.number(),
  by_task: z.array(z.object({ task: z.string(), calls: z.number(), cost_usd: z.number() })),
});

export function createLedger(rpc: RpcCaller): AiCallLedger {
  return {
    async reserve(call) {
      const result = reservationSchema.parse(
        await rpc('ai_reserve_call', {
          p_user_id: call.userId,
          p_request_id: call.requestId,
          p_attempt: call.attempt,
          p_task: call.task,
          p_model: call.model,
          p_prompt_version: call.promptVersion,
          p_reserved_cost_usd: call.reservedCostUsd,
          p_monthly_budget_usd: call.monthlyBudgetUsd,
          p_rate_limit_per_minute: call.rateLimitPerMinute,
        }),
      );
      switch (result.outcome) {
        case 'reserved':
          return {
            outcome: 'reserved',
            callId: result.call_id,
            monthUsedUsd: result.month_used_usd,
          };
        case 'duplicate':
          return { outcome: 'duplicate' };
        default:
          return { outcome: result.outcome, monthUsedUsd: result.month_used_usd };
      }
    },

    async complete(callId, outcome) {
      await rpc('ai_complete_call', {
        p_call_id: callId,
        p_status: outcome.status,
        p_input_tokens: outcome.usage?.inputTokens ?? null,
        p_output_tokens: outcome.usage?.outputTokens ?? null,
        p_cache_creation_input_tokens: outcome.usage?.cacheCreationInputTokens ?? null,
        p_cache_read_input_tokens: outcome.usage?.cacheReadInputTokens ?? null,
        p_cost_usd: outcome.costUsd,
        p_latency_ms: outcome.latencyMs,
        p_error_code: outcome.errorCode,
      });
    },

    async usage(userId, timeZone) {
      const summary = usageSummarySchema.parse(
        await rpc('ai_usage_summary', { p_user_id: userId, p_time_zone: timeZone }),
      );
      return {
        timeZone: summary.time_zone,
        monthStart: summary.month_start,
        resetsOn: summary.resets_on,
        monthUsd: summary.month_usd,
        todayUsd: summary.today_usd,
        byTask: summary.by_task.map(({ task, calls, cost_usd }) => ({
          task,
          calls,
          costUsd: cost_usd,
        })),
      };
    },
  };
}
