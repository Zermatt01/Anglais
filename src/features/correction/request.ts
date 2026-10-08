/**
 * What a correction sends to the model (AI-02, D-083): the learner's profile
 * from the settings and their recent errors, the instruction, the reviewed
 * reference and the text. Nothing else leaves the device.
 */
import { TASK_SETTINGS } from '../../../shared/ai/models.ts';
import { maxCostOfRequest } from '../../../shared/ai/pricing.ts';
import {
  CORRECT_PRODUCTION_MAX_INPUT_TOKENS,
  MAX_INSTRUCTION_TEXT,
  MAX_PROFILE_REMARKS_SENT,
  MAX_REFERENCE_ANSWER,
  MAX_REFERENCE_ANSWERS,
  MAX_WEAK_ITEMS,
  type AiTaskInput,
} from '../../../shared/ai/tasks.ts';
import type { ErrorDocument } from '../../data/schemas/errors.ts';
import { weakSpots, type ErrorRecord } from '../../domain/errors/statistics.ts';
import type { SettingsValues } from '../../domain/settings.ts';

export type CorrectionInput = AiTaskInput<'correct-production'>;

const SETTINGS = TASK_SETTINGS['correct-production'];

/** Shown before "Corriger": the highest cost of a correction, the new attempt included (COST-10). */
export const CORRECTION_MAX_COST_USD = maxCostOfRequest(SETTINGS.model, {
  inputTokens: CORRECT_PRODUCTION_MAX_INPUT_TOKENS,
  maxTokens: SETTINGS.maxTokens,
  cachePrefix: SETTINGS.cachePrefix,
});

/** An error document, as the statistics read it. */
export function errorRecordOf(error: ErrorDocument): ErrorRecord {
  return {
    productionId: error.productionId,
    at: error.at,
    category: error.category,
    notionId: error.notionId,
    segment: error.segment.text,
    correction: error.correction,
    rule: error.rule,
    severity: error.severity,
    confidence: error.confidence,
    diagnosis: error.diagnosis,
    reported: error.reported,
  };
}

/** Who the learner is, for the model, which has no memory (AI-02). */
export function learnerOf(
  settings: SettingsValues,
  errors: readonly ErrorDocument[],
  now: number,
): CorrectionInput['learner'] {
  const spots = weakSpots(errors.map(errorRecordOf), now, MAX_WEAK_ITEMS);
  return {
    englishVariant: settings.englishVariant,
    domains: [...settings.learnerProfile.domains],
    // The level is estimated from phase 5 on (LVL).
    level: null,
    weakCategories: [...spots.categories],
    weakNotions: [...spots.notions],
    remarks: settings.learnerProfile.remarks.slice(0, MAX_PROFILE_REMARKS_SENT),
  };
}

/** A reviewed reference, within the limits of the request. */
export function referenceOf(
  meaningFr: string,
  answers: readonly string[],
): NonNullable<CorrectionInput['reference']> {
  return {
    meaningFr: meaningFr.slice(0, MAX_INSTRUCTION_TEXT),
    answers: answers
      .filter((answer) => answer.length <= MAX_REFERENCE_ANSWER)
      .slice(0, MAX_REFERENCE_ANSWERS),
  };
}
