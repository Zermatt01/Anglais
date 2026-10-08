/**
 * Asking the model to correct a stored production (docs/ARCHITECTURE.md §8).
 *
 * `correct` is called only from the handler of a "Corriger" button (COST-01,
 * NO-01), never from an effect: each call is one explicit action, with its
 * own request identifier. The production is already stored, so a failed call
 * loses nothing; it is marked as such and can be tried again.
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import type {
  CorrectionContext,
  CorrectionOutcome,
} from '../../data/repositories/production-repository.ts';
import { RECENT_WINDOW_MS } from '../../domain/errors/statistics.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import type { AiClientError } from '../../services/ai-client/ai-client.ts';
import { useAppServices } from '../app-services.ts';
import { useSettings } from '../settings/use-settings.ts';
import { learnerOf, type CorrectionInput } from './request.ts';

export type CorrectionRun =
  | { readonly state: 'idle' | 'running' }
  | { readonly state: 'done'; readonly outcome: CorrectionOutcome; readonly costUsd: number }
  | { readonly state: 'failed'; readonly error: AiClientError }
  /** The answer came, but could not be stored: nothing was written. */
  | { readonly state: 'not-saved' };

export type CorrectionRequest = Omit<CorrectionInput, 'learner'>;

export function useCorrection() {
  const { server, productions, clock } = useAppServices();
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const [run, setRun] = useState<CorrectionRun>({ state: 'idle' });
  // Set synchronously: a second tap, before the screen updates, is ignored.
  const busy = useRef(false);
  const [sending, setSending] = useState(false);

  /**
   * Runs an action of the learner once at a time: storing the production then
   * asking for its correction. A double tap never stores two productions, nor
   * pays for two corrections.
   */
  async function once(action: () => Promise<unknown>): Promise<void> {
    if (busy.current) return;
    busy.current = true;
    setSending(true);
    try {
      await action();
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  /** Sends the production to the model, then stores the correction with everything it changes. */
  async function correct(
    productionId: string,
    request: CorrectionRequest,
    context: CorrectionContext,
  ): Promise<CorrectionRun> {
    let next: CorrectionRun;
    if (server === null) {
      next = { state: 'failed', error: { code: 'signed_out' } };
      setRun(next);
      return next;
    }
    setRun({ state: 'running' });
    try {
      const now = clock.now();
      const errors = await productions.errorsSince(now - RECENT_WINDOW_MS);
      const input: CorrectionInput = { ...request, learner: learnerOf(settings, errors, now) };
      const result = await server.ai.run('correct-production', input, crypto.randomUUID());
      if (result.ok) {
        const outcome = await productions.applyCorrection(
          productionId,
          {
            output: result.output,
            model: result.model,
            promptVersion: result.promptVersion,
            costUsd: result.costUsd,
          },
          context,
        );
        next = { state: 'done', outcome, costUsd: result.costUsd };
      } else {
        await productions.markFailed(productionId);
        next = { state: 'failed', error: result.error };
      }
    } catch {
      next = { state: 'not-saved' };
    }
    setRun(next);
    return next;
  }

  const reset = () => {
    setRun({ state: 'idle' });
  };

  return { run, correct, once, sending, available: server !== null, reset };
}

/** A stored production, its errors and the cards made from them, kept up to date. */
export function useProduction(productionId: string | null) {
  const { productions, cards } = useAppServices();
  return useLiveQuery(async () => {
    if (productionId === null) return null;
    const stored = await productions.get(productionId);
    if (stored === undefined) return null;
    if (!stored.ok) return { state: 'unreadable' } as const;
    const errors = await productions.errorsOf(productionId);
    const made = await cards.fromErrors(errors.map((error) => error.id));
    return { state: 'readable', production: stored.value, errors, cards: made } as const;
  }, [productions, cards, productionId]);
}
