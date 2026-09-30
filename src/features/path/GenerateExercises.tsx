import { useState } from 'react';
import { Link } from 'react-router';
import { TASK_SETTINGS } from '../../../shared/ai/models.ts';
import { maxCostOfCall } from '../../../shared/ai/pricing.ts';
import { GENERATED_EXERCISES_PER_CALL } from '../../../shared/ai/tasks.ts';
import type { Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { Step } from '../../domain/curriculum/progress.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import type { AiClientError } from '../../services/ai-client/ai-client.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Sheet } from '../../ui/Page.tsx';
import { formatUsd } from '../ai/format.ts';
import { aiErrorMessage } from '../ai/messages.ts';
import { useAppServices } from '../app-services.ts';
import { PATHS } from '../paths.ts';
import { useSettings } from '../settings/use-settings.ts';
import { useOnline } from '../use-online.ts';
import { checkGeneratedExercises, generationInput, isGeneratable } from './generation.ts';

/**
 * Upper estimate of the input of one call, for the cost shown before it: the
 * stable prompt (about 2 000 tokens) and the sentences to avoid, generously.
 */
const INPUT_TOKENS_UPPER_ESTIMATE = 8_000;

const SETTINGS = TASK_SETTINGS['generate-exercises'];
const MAX_COST_USD = maxCostOfCall(SETTINGS.model, {
  inputTokens: INPUT_TOKENS_UPPER_ESTIMATE,
  maxTokens: SETTINGS.maxTokens,
  cachePrefix: SETTINGS.cachePrefix,
});

type Generation =
  | { readonly state: 'idle' | 'running' }
  | {
      readonly state: 'done';
      readonly added: number;
      readonly dropped: number;
      readonly costUsd: number;
    }
  | { readonly state: 'failed'; readonly error: AiClientError }
  | { readonly state: 'not-saved' };

interface GenerateExercisesProps {
  readonly notionId: NotionId;
  readonly step: Step;
  /** Exercises the learner already has at this step, not to be repeated. */
  readonly existing: readonly Exercise[];
}

/**
 * Once the core of a step is done, the AI can write new exercises, on request
 * only (COST-01, CUR-07). They are checked, stored and reused (COST-09).
 */
export function GenerateExercises({ notionId, step, existing }: GenerateExercisesProps) {
  const { server, generatedExercises } = useAppServices();
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const online = useOnline();
  const [generation, setGeneration] = useState<Generation>({ state: 'idle' });

  const generatedStep = step === 2 || step === 3 || step === 4 ? step : null;
  if (!isGeneratable(notionId) || generatedStep === null) return null;

  const intro = (
    <p>
      Tu as fait tous les exercices de cette étape. Ils reviennent maintenant, en commençant par
      ceux que tu as vus il y a le plus longtemps.
    </p>
  );

  if (server === null) {
    return (
      <Sheet title="Plus d’exercices">
        {intro}
        <p className="muted">
          Avec un compte connecté, l’IA peut en créer de nouveaux (voir les{' '}
          <Link to={PATHS.settings}>Réglages</Link>).
        </p>
      </Sheet>
    );
  }

  const generate = () => {
    setGeneration({ state: 'running' });
    const input = generationInput(notionId, generatedStep, settings, existing);
    void (async () => {
      const result = await server.ai.run('generate-exercises', input, crypto.randomUUID());
      if (!result.ok) {
        setGeneration({ state: 'failed', error: result.error });
        return;
      }
      const checked = checkGeneratedExercises(result.output.exercises, generatedStep, existing);
      try {
        const stored = await generatedExercises.add({
          notionId,
          exercises: checked.exercises,
          model: result.model,
          promptVersion: result.promptVersion,
        });
        setGeneration({
          state: 'done',
          added: stored.length,
          dropped: result.output.exercises.length - stored.length,
          costUsd: result.costUsd,
        });
      } catch {
        setGeneration({ state: 'not-saved' });
      }
    })();
  };

  return (
    <Sheet title="Plus d’exercices">
      {intro}
      <p>
        {`L’IA peut en créer ${String(GENERATED_EXERCISES_PER_CALL)} nouveaux. Chacun est vérifié automatiquement, puis conservé sur ce téléphone : il ne sera jamais recréé. Coût : au plus ${formatUsd(MAX_COST_USD)} environ.`}
      </p>
      <p className="muted">
        Contrairement aux autres exercices, ceux-ci n’ont pas été relus par une personne : tu
        pourras signaler ceux qui te semblent faux.
      </p>
      {generation.state === 'done' ? (
        <Notice tone={generation.added > 0 ? 'success' : 'info'} title="Exercices créés">
          <p>
            {generation.added > 0
              ? `${String(generation.added)} exercice(s) ajouté(s) à cette étape.`
              : 'Aucun exercice n’a passé les vérifications : rien n’a été ajouté.'}
            {generation.dropped > 0
              ? ` ${String(generation.dropped)} écarté(s) par les vérifications.`
              : ''}
            {` Coût : ${formatUsd(generation.costUsd)}.`}
          </p>
        </Notice>
      ) : null}
      {generation.state === 'failed' ? (
        <Notice tone="error" title="Création impossible">
          <p>{aiErrorMessage(generation.error)}</p>
        </Notice>
      ) : null}
      {generation.state === 'not-saved' ? (
        <Notice tone="error" title="Exercices non enregistrés">
          <p>Le stockage du téléphone est peut-être plein. Libère de la place, puis réessaie.</p>
        </Notice>
      ) : null}
      {online ? null : <p className="muted">Connexion nécessaire pour créer des exercices.</p>}
      <div className="button-row">
        <Button disabled={!online || generation.state === 'running'} onClick={generate}>
          {generation.state === 'running'
            ? 'Création en cours…'
            : `Créer ${String(GENERATED_EXERCISES_PER_CALL)} exercices avec l’IA`}
        </Button>
      </div>
    </Sheet>
  );
}
