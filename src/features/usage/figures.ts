import type { AiUsage } from '../../../shared/ai/protocol.ts';
import type { UsageFigures } from '../../data/repositories/usage-repository.ts';

/** The figures of a usage answer, as kept for offline display. */
export function usageFigures(usage: AiUsage): UsageFigures {
  return {
    monthlyBudgetUsd: usage.monthlyBudgetUsd,
    monthStart: usage.monthStart,
    resetsOn: usage.resetsOn,
    monthUsd: usage.monthUsd,
    todayUsd: usage.todayUsd,
    timeZone: usage.timeZone,
    byTask: usage.byTask,
  };
}
