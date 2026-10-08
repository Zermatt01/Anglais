import { Notice } from '../../ui/Notice.tsx';

/**
 * A failure on an exercise created by the model: its expected answer is not
 * reviewed, so the failure is a point to check, never counted (D-089). The
 * expected answer is shown above, and the exercise can be reported.
 */
export function GeneratedFailureNotice() {
  return (
    <Notice title="Point à vérifier">
      <p>
        Cet exercice a été créé par l’IA, sans relecture : cette réponse ne compte pas contre toi.
        Compare-la à la réponse attendue ; si celle-ci te semble fausse, signale l’exercice.
      </p>
    </Notice>
  );
}
