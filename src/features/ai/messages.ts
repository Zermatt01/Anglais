/**
 * What the learner reads when an AI call does not go through (UI-03: clear
 * and actionable). Shared by every screen that calls the AI.
 */
import type { AiClientError, AiClientErrorCode } from '../../services/ai-client/ai-client.ts';
import { formatCap, formatDay, formatUsd } from './format.ts';

const MESSAGES: Readonly<Record<Exclude<AiClientErrorCode, 'budget_exceeded'>, string>> = {
  offline: 'Connexion nécessaire pour utiliser l’IA. Tout le reste fonctionne sans réseau.',
  signed_out: 'Connecte-toi dans les Réglages pour utiliser l’IA.',
  unauthenticated: 'Ta session a expiré : reconnecte-toi dans les Réglages.',
  forbidden:
    'Ce compte n’est pas autorisé à utiliser l’IA. Ajoute son adresse au secret AI_ALLOWED_EMAILS de la fonction (voir le guide de déploiement).',
  invalid_request: 'La demande n’a pas été acceptée par le serveur. Mets l’application à jour.',
  duplicate_request: 'Cette demande a déjà été envoyée : elle n’est pas comptée deux fois.',
  rate_limited: 'Trop de demandes en une minute. Réessaie dans une minute.',
  model_refusal: 'Le modèle n’a pas voulu répondre à cette demande. Rien d’autre n’est touché.',
  output_truncated: 'La réponse du modèle a été coupée avant la fin. Réessaie.',
  invalid_output: 'Le modèle a répondu de façon inattendue. Réessaie.',
  upstream_error:
    'Le service d’IA n’a pas répondu. S’il continue, vérifie la clé et le crédit dans la console Anthropic.',
  server_error:
    'Le serveur IA n’est pas prêt : vérifie ses secrets (voir le guide de déploiement).',
  unreachable: 'Le serveur IA n’a pas pu être joint. Réessaie dans un moment.',
};

export function aiErrorMessage(error: AiClientError): string {
  if (error.code !== 'budget_exceeded') return MESSAGES[error.code];
  if (error.budget === undefined) {
    return 'Plafond mensuel atteint. Les fonctions IA reprendront le mois prochain. Tout le reste de l’app fonctionne.';
  }
  const { usedUsd, limitUsd, resetsOn } = error.budget;
  return `Plafond mensuel de ${formatCap(limitUsd)} atteint (${formatUsd(usedUsd)} utilisés). Les fonctions IA reprendront le ${formatDay(resetsOn)}. Tout le reste de l’app fonctionne.`;
}
