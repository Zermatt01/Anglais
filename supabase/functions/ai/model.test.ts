// @vitest-environment node
/**
 * The Anthropic adapter: parameters sent (model, ceiling, thinking, caching,
 * structured output) and reading of the answer, with a fake API.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages/messages';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { MODELS, TASK_SETTINGS, type TaskSettings } from '../_shared/ai/models.ts';
import { TASK_CONTRACTS } from '../_shared/ai/tasks.ts';
import { createModelCaller, type MessageLike } from './model.ts';

const USAGE = {
  input_tokens: 120,
  output_tokens: 8,
  cache_creation_input_tokens: null,
  cache_read_input_tokens: null,
};

function answer(text: string | null, stopReason: MessageLike['stop_reason'] = 'end_turn') {
  return {
    content: text === null ? [] : [{ type: 'text' as const, text, citations: null }],
    stop_reason: stopReason,
    usage: USAGE,
  } satisfies MessageLike;
}

/** A fake API that records the parameters it receives. */
function fakeApi(result: MessageLike | Error) {
  const received: MessageCreateParamsNonStreaming[] = [];
  const caller = createModelCaller((params) => {
    received.push(params);
    return result instanceof Error ? Promise.reject(result) : Promise.resolve(result);
  });
  return { caller, received };
}

const outputSchema = TASK_CONTRACTS['connection-check'].output;

function request(settings: TaskSettings = TASK_SETTINGS['connection-check']) {
  return { settings, system: 'Stable prefix.', userMessage: 'Variable part.', outputSchema };
}

describe('parameters sent to the API', () => {
  it('use the task settings, the system prompt first, and a structured output format', async () => {
    const { caller, received } = fakeApi(answer('{"status":"ok"}'));
    await caller.call(request());
    const params = received[0];
    expect(params).toMatchObject({
      model: MODELS.fast,
      max_tokens: 64,
      system: [{ type: 'text', text: 'Stable prefix.' }],
      messages: [{ role: 'user', content: 'Variable part.' }],
      // Sent explicitly: Sonnet 5 would otherwise think by default (D-012).
      thinking: { type: 'disabled' },
    });
    expect(JSON.stringify(params?.system)).not.toContain('cache_control');
    // The output schema, as the API receives it (functions are not serialized).
    // The SDK keeps the structure and moves `enum` into the description: the
    // answer is therefore always validated again with the Zod schema (D-066).
    const format: unknown = JSON.parse(JSON.stringify(params?.output_config?.format));
    expect(format).toMatchObject({
      type: 'json_schema',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['status'],
        properties: { status: { type: 'string', description: '{enum: ["ok"]}' } },
      },
    });
    expect(params?.output_config).not.toHaveProperty('effort');
  });

  it('cache the stable prefix and set the effort when a task asks for it', async () => {
    const { caller, received } = fakeApi(answer('{"status":"ok"}'));
    await caller.call(
      request({
        model: MODELS.capable,
        maxTokens: 2_000,
        thinking: { effort: 'low' },
        cachePrefix: true,
      }),
    );
    expect(received[0]).toMatchObject({
      model: MODELS.capable,
      system: [{ type: 'text', text: 'Stable prefix.', cache_control: { type: 'ephemeral' } }],
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
    });
  });
});

describe('reading of the answer', () => {
  it('returns the validated output and the token counts', async () => {
    const { caller } = fakeApi(answer('{"status":"ok"}'));
    expect(await caller.call(request())).toEqual({
      kind: 'ok',
      output: { status: 'ok' },
      usage: {
        inputTokens: 120,
        outputTokens: 8,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
      },
    });
  });

  it.each([
    ['text that is not JSON', answer('ok')],
    ['JSON that does not match the schema', answer('{"status":"ko"}')],
    ['no text block', answer(null)],
  ])('reports %s as an invalid output, with its token counts', async (_label, message) => {
    const { caller } = fakeApi(message);
    expect(await caller.call(request())).toMatchObject({
      kind: 'invalid_output',
      usage: { inputTokens: 120 },
    });
  });

  it('reports an answer cut off by max_tokens, and a refusal', async () => {
    expect(await fakeApi(answer('{"sta', 'max_tokens')).caller.call(request())).toMatchObject({
      kind: 'truncated',
    });
    expect(await fakeApi(answer('', 'refusal')).caller.call(request())).toMatchObject({
      kind: 'refusal',
    });
  });

  it('counts cache tokens when the API reports them', async () => {
    const { caller } = fakeApi({
      ...answer('{"status":"ok"}'),
      usage: { ...USAGE, cache_creation_input_tokens: 10, cache_read_input_tokens: 3_500 },
    });
    expect(await caller.call(request())).toMatchObject({
      usage: { cacheCreationInputTokens: 10, cacheReadInputTokens: 3_500 },
    });
  });
});

describe('errors of the API', () => {
  it('treat an error answer as not billed', async () => {
    const overloaded = new Anthropic.InternalServerError(529, {}, 'Overloaded', new Headers());
    expect(await fakeApi(overloaded).caller.call(request())).toEqual({
      kind: 'error',
      errorCode: 'anthropic_529',
      billed: 'none',
    });
    const limited = new Anthropic.RateLimitError(429, {}, 'Rate limited', new Headers());
    expect(await fakeApi(limited).caller.call(request())).toMatchObject({
      errorCode: 'anthropic_429',
      billed: 'none',
    });
  });

  it('keep the explanation of the API, for the logs', async () => {
    const refused = new Anthropic.BadRequestError(
      400,
      {
        type: 'error',
        error: { type: 'invalid_request_error', message: 'Your credit balance is too low.' },
      },
      'Bad request',
      new Headers(),
    );
    expect(await fakeApi(refused).caller.call(request())).toEqual({
      kind: 'error',
      errorCode: 'anthropic_400',
      billed: 'none',
      detail: 'invalid_request_error: Your credit balance is too low.',
    });
  });

  it('treat a timeout or a lost connection as possibly billed', async () => {
    expect(await fakeApi(new Anthropic.APIConnectionTimeoutError()).caller.call(request())).toEqual(
      { kind: 'error', errorCode: 'anthropic_timeout', billed: 'unknown' },
    );
    expect(
      await fakeApi(new Anthropic.APIConnectionError({ message: 'reset' })).caller.call(request()),
    ).toEqual({ kind: 'error', errorCode: 'anthropic_connection', billed: 'unknown' });
    expect(await fakeApi(new Error('unexpected')).caller.call(request())).toMatchObject({
      billed: 'unknown',
    });
  });

  it('validate with the schema of the request, not a looser one', async () => {
    const strict = z.strictObject({ status: z.literal('ok') });
    const { caller } = fakeApi(answer('{"status":"ok","extra":1}'));
    expect((await caller.call({ ...request(), outputSchema: strict })).kind).toBe('invalid_output');
  });
});
