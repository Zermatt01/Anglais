/**
 * Corrections as the fake model answers them, in component tests. Each one is
 * a valid output of `correct-production` for the text it is built from.
 */
import type { AiTaskName, CorrectionOutput } from '../../shared/ai/tasks.ts';
import type { AiRunResult } from '../services/ai-client/ai-client.ts';

export function correctionOf(
  text: string,
  error: { readonly segment: string; readonly correction: string } | null,
  fields: Partial<CorrectionOutput> = {},
): CorrectionOutput {
  const corrected = error === null ? text : text.replace(error.segment, error.correction);
  return {
    intentFr: 'Ce que l’apprenant voulait dire.',
    errors:
      error === null
        ? []
        : [
            {
              segment: error.segment,
              start: text.indexOf(error.segment),
              category: 'temps_verbaux',
              notionId: 'tense-present-perfect-vs-past-simple',
              severity: 'medium',
              confidence: 'high',
              hintFr: 'Regarde le moment indiqué : la période est-elle terminée ?',
              correction: error.correction,
              ruleFr: 'Avec un moment passé terminé, on emploie le prétérit.',
            },
          ],
    unnatural: [],
    sentences:
      error === null
        ? []
        : [
            {
              original: text,
              corrected,
              meaningFr: 'Hier, j’ai rencontré le client.',
            },
          ],
    correctedText: corrected,
    naturalVersion: corrected,
    targetNotionUses: null,
    expressionOfTheDay: {
      expression: 'to follow up',
      meaningFr: 'relancer, donner suite',
      example: 'I will follow up with the client tomorrow.',
    },
    evaluation: {
      accuracy: 3,
      naturalness: 3,
      complexity: 2,
      level: 'A2',
      commentFr: 'Bon début.',
    },
    ...fields,
  };
}

/** A successful answer of the fake model to `correct-production`. */
export function answered(output: CorrectionOutput): AiRunResult<AiTaskName> {
  return {
    ok: true,
    output,
    costUsd: 0.012,
    model: 'claude-sonnet-5',
    promptVersion: 'correct-production@2',
  };
}
