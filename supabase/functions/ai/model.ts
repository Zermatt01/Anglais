/**
 * Call to the Anthropic API (docs/ARCHITECTURE.md §8, step 8).
 *
 * The structured output format is built from the task's Zod schema
 * (`zodOutputFormat`, D-010), and the answer is validated here rather than by
 * `messages.parse()`: that method throws on an invalid answer and loses its
 * token counts, while every call must be logged at its actual cost (COST-05).
 */
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type {
  Message,
  MessageCreateParamsNonStreaming,
  TextBlock,
} from '@anthropic-ai/sdk/resources/messages/messages';
import type { z } from 'zod';
import type { TaskSettings } from '../_shared/ai/models.ts';
import type { TokenUsage } from '../_shared/ai/pricing.ts';

/** What the adapter reads from an API answer. */
export type MessageLike = Pick<Message, 'content' | 'stop_reason'> & {
  readonly usage: Pick<
    Message['usage'],
    'input_tokens' | 'output_tokens' | 'cache_creation_input_tokens' | 'cache_read_input_tokens'
  >;
};

export type CreateMessage = (params: MessageCreateParamsNonStreaming) => Promise<MessageLike>;

export interface ModelRequest<Output> {
  readonly settings: TaskSettings;
  /** Stable prefix (COST-03). */
  readonly system: string;
  /** Variable part. */
  readonly userMessage: string;
  readonly outputSchema: z.ZodType<Output>;
}

export type ModelResult<Output> =
  | { readonly kind: 'ok'; readonly output: Output; readonly usage: TokenUsage }
  | { readonly kind: 'invalid_output'; readonly usage: TokenUsage }
  | { readonly kind: 'truncated'; readonly usage: TokenUsage }
  | { readonly kind: 'refusal'; readonly usage: TokenUsage }
  /**
   * No answer. `billed`: `none` when the API answered with an error (nothing
   * is billed), `unknown` when the request may have been processed
   * (connection lost, timeout): the call is then counted at its maximum cost.
   */
  | { readonly kind: 'error'; readonly errorCode: string; readonly billed: 'none' | 'unknown' };

export interface ModelCaller {
  call<Output>(request: ModelRequest<Output>): Promise<ModelResult<Output>>;
}

/** Longest wait for an answer; well below the Edge Function's wall-clock limit. */
export const MODEL_TIMEOUT_MS = 90_000;

/**
 * The client used in production. No automatic retry: a retried request could
 * be billed twice without being logged; the learner retries by hand.
 */
export function createAnthropicClient(apiKey: string): CreateMessage {
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: MODEL_TIMEOUT_MS });
  return (params) => client.messages.create(params);
}

function usageOf(message: MessageLike): TokenUsage {
  return {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    cacheCreationInputTokens: message.usage.cache_creation_input_tokens ?? 0,
    cacheReadInputTokens: message.usage.cache_read_input_tokens ?? 0,
  };
}

function paramsOf<Output>(request: ModelRequest<Output>): MessageCreateParamsNonStreaming {
  const { settings } = request;
  const format = zodOutputFormat(request.outputSchema);
  return {
    model: settings.model,
    max_tokens: settings.maxTokens,
    system: [
      {
        type: 'text',
        text: request.system,
        ...(settings.cachePrefix ? { cache_control: { type: 'ephemeral' } } : {}),
      },
    ],
    messages: [{ role: 'user', content: request.userMessage }],
    ...(settings.thinking === 'off'
      ? { thinking: { type: 'disabled' }, output_config: { format } }
      : {
          thinking: { type: 'adaptive' },
          output_config: { format, effort: settings.thinking.effort },
        }),
  };
}

function errorOf(error: unknown): Extract<ModelResult<never>, { kind: 'error' }> {
  // Most specific first: a timeout is also a connection error.
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return { kind: 'error', errorCode: 'anthropic_timeout', billed: 'unknown' };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { kind: 'error', errorCode: 'anthropic_connection', billed: 'unknown' };
  }
  if (error instanceof Anthropic.APIError && typeof error.status === 'number') {
    return { kind: 'error', errorCode: `anthropic_${String(error.status)}`, billed: 'none' };
  }
  return { kind: 'error', errorCode: 'anthropic_unknown', billed: 'unknown' };
}

export function createModelCaller(create: CreateMessage): ModelCaller {
  return {
    async call(request) {
      const params = paramsOf(request);
      let message: MessageLike;
      try {
        message = await create(params);
      } catch (error) {
        return errorOf(error);
      }

      const usage = usageOf(message);
      if (message.stop_reason === 'refusal') return { kind: 'refusal', usage };
      if (
        message.stop_reason === 'max_tokens' ||
        message.stop_reason === 'model_context_window_exceeded'
      ) {
        return { kind: 'truncated', usage };
      }

      const text = message.content.find((block): block is TextBlock => block.type === 'text')?.text;
      if (text === undefined) return { kind: 'invalid_output', usage };
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        return { kind: 'invalid_output', usage };
      }
      const output = request.outputSchema.safeParse(json);
      return output.success
        ? { kind: 'ok', output: output.data, usage }
        : { kind: 'invalid_output', usage };
    },
  };
}
