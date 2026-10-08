import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { TASK_SETTINGS } from '../../../shared/ai/models.ts';
import { maxCostOfRequest } from '../../../shared/ai/pricing.ts';
import {
  GENERATE_EXERCISES_MAX_INPUT_TOKENS,
  GENERATED_EXERCISES_PER_CALL,
} from '../../../shared/ai/tasks.ts';
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

const SETTINGS = TASK_SETTINGS['generate-exercises'];
/** Shown before the request: its highest cost, the new attempt included (D-081). */
const MAX_COST_USD = maxCostOfRequest(SETTINGS.model, {
  inputTokens: GENERATE_EXERCISES_MAX_INPUT_TOKENS,
  maxTokens: SETTINGS.maxTokens,
  cachePrefix: SETTINGS.cachePrefix,
});

/** "2 exercice(s) ajouté(s)… Coût : 0,02 USD." */
function generationMessage({
  added,
  dropped,
  costUsd,
}: {
  readonly added: number;
  readonly dropped: number;
  readonly costUsd: number;
}): string {
  const result =
    added > 0
      ? `${String(added)} exercice(s) ajouté(s) à cette étape.`
      : 'Aucun exercice n’a passé les vérifications : rien n’a été ajouté.';
  const discarded = dropped > 0 ? ` ${String(dropped)} écarté(s) par les vérifications.` : '';
  return `${result}${discarded} Coût : ${formatUsd(costUsd)}.`;
}

type Generation =
  | { readonly state: 'idle' | 'running' }
  | {
      readonly state: 'done';
      readonly added: number;
      readonly dropped: number;
      readonly costUsd: number;
    }
  | { readonly state: 'failed'; readonly error: AiClientError }
  /** The exercises came, but could not be stored: they are kept, to store them again for free. */
  | { readonly state: 'not-saved'; readonly received: Received };

/** Exercises received and checked, before they are stored. */
interface Received {
  readonly exercises: readonly Exercise[];
  readonly dropped: number;
  readonly model: string;
  readonly promptVersion: string;
  readonly costUsd: number;
}

interface GenerateExercisesProps {
  readonly notionId: NotionId;
  readonly step: Step;
  /** Exercises the learner already has at this step, not to be repeated. */
  readonly existing: readonly Exercise[];
  /**
   * Once stored, the new exercises make the step no longer "done", and this
   * block disappears: the parent keeps the message visible.
   */
  readonly onGenerated?: (message: string) => void;
}

/**
 * Once the core of a step is done, the AI can write new exercises, on request
 * only (COST-01, CUR-07). They are checked, stored and reused (COST-09).
 */
export function GenerateExercises({
  notionId,
  step,
  existing,
  onGenerated,
}: GenerateExercisesProps) {
  const { server, generatedExercises } = useAppServices();
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const online = useOnline();
  const [generation, setGeneration] = useState<Generation>({ state: 'idle' });
  // Set synchronously: a second tap on "Réessayer" never stores the exercises twice.
  const storing = useRef(false);

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
      const checked = checkGeneratedExercises(
        result.output.exercises,
        notionId,
        generatedStep,
        existing,
      );
      await store({
        exercises: checked.exercises,
        dropped: result.output.exercises.length - checked.exercises.length,
        model: result.model,
        promptVersion: result.promptVersion,
        costUsd: result.costUsd,
      });
    })();
  };

  /** Stores received exercises; after a failure they are kept, never asked for again. */
  const store = async (received: Received) => {
    if (storing.current) return;
    storing.current = true;
    try {
      const stored = await generatedExercises.add({
        notionId,
        exercises: received.exercises,
        model: received.model,
        promptVersion: received.promptVersion,
      });
      const done = {
        state: 'done',
        added: stored.length,
        dropped: received.dropped + received.exercises.length - stored.length,
        costUsd: received.costUsd,
      } as const;
      setGeneration(done);
      onGenerated?.(generationMessage(done));
    } catch {
      setGeneration({ state: 'not-saved', received });
    } finally {
      storing.current = false;
    }
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
          <p>{generationMessage(generation)}</p>
        </Notice>
      ) : null}
      {generation.state === 'failed' ? (
        <Notice tone="error" title="Création impossible">
          <p>{aiErrorMessage(generation.error)}</p>
        </Notice>
      ) : null}
      {generation.state === 'not-saved' ? (
        <Notice tone="error" title="Exercices non enregistrés">
          <p>
            Les exercices sont arrivés, mais le stockage du téléphone est peut-être plein. Libère de
            la place, puis réessaie : ils sont gardés tant que cette page reste ouverte, et ne
            seront pas redemandés.
          </p>
        </Notice>
      ) : null}
      {online || generation.state === 'not-saved' ? null : (
        <p className="muted">Connexion nécessaire pour créer des exercices.</p>
      )}
      <div className="button-row">
        {generation.state === 'not-saved' ? (
          <Button
            onClick={() => {
              void store(generation.received);
            }}
          >
            Réessayer l’enregistrement, sans nouveau coût
          </Button>
        ) : (
          <Button disabled={!online || generation.state === 'running'} onClick={generate}>
            {generation.state === 'running'
              ? 'Création en cours…'
              : `Créer ${String(GENERATED_EXERCISES_PER_CALL)} exercices avec l’IA`}
          </Button>
        )}
      </div>
    </Sheet>
  );
}
