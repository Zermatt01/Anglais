// Generated from shared/ai/reasons.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * Reasons of step 2 (D-081). For each notion, the reason sets of its reviewed
 * core: the right reason first, then the wrong reasons shown with it. A
 * generated exercise must use one of these sets, copied exactly, so that no
 * reason can be reworded into a second right reason in an exercise nobody has
 * reviewed (NO-05). The core test checks that these sets are exactly those of
 * the core (src/content).
 */
import { GENERATABLE_NOTION_IDS, type GeneratableNotionId } from './tasks.ts';

/** The right reason, then the wrong reasons shown with it. */
export type ReasonSet = readonly [string, ...string[]];

export const REASON_SETS: Readonly<Record<GeneratableNotionId, readonly ReasonSet[]>> = {
  'tense-present-continuous': [
    [
      'Action en cours au moment où l’on parle',
      'Action terminée dans le passé',
      'Habitude ou fait permanent',
    ],
    [
      'Évolution en cours, qui change peu à peu',
      'Action terminée dans le passé',
      'Habitude ou fait permanent',
    ],
    [
      'Situation temporaire, vraie en ce moment',
      'Action terminée dans le passé',
      'Habitude ou fait permanent',
    ],
    [
      'Question sur une activité en cours en ce moment',
      'Question sur le passé',
      'Question sur une habitude',
    ],
  ],
  'tense-present-simple': [
    [
      'Habitude, routine ou horaire régulier',
      'Action en cours au moment où l’on parle',
      'Vérité générale',
    ],
    [
      'Fait permanent ou situation stable',
      'Action en cours au moment où l’on parle',
      'Vérité générale',
    ],
    [
      'Vérité générale',
      'Action en cours au moment où l’on parle',
      'Habitude, routine ou horaire régulier',
    ],
    [
      'Question au présent simple, sujet à la 3e personne du singulier',
      'Question au présent simple, sujet au pluriel ou _you_',
      'Question sur une action en cours',
    ],
    [
      'Verbe d’état (savoir, appartenir, dépendre…)',
      'Action en cours au moment où l’on parle',
      'Habitude, routine ou horaire régulier',
    ],
    [
      'Habitude, routine ou horaire régulier',
      'Action en cours au moment où l’on parle',
      'Action terminée dans le passé',
    ],
  ],
  'tense-present-simple-vs-continuous': [
    ['Habitude ou routine', 'Action en cours au moment où l’on parle', 'Situation temporaire'],
    [
      'Action en cours au moment où l’on parle',
      'Habitude ou routine',
      'Verbe d’état : opinion, connaissance, possession…',
    ],
    [
      'Verbe d’état : opinion, connaissance, possession…',
      'Action en cours au moment où l’on parle',
      'Habitude ou routine',
    ],
    [
      'Situation stable ou permanente',
      'Action en cours au moment où l’on parle',
      'Situation temporaire',
    ],
    [
      'Situation temporaire',
      'Habitude ou routine',
      'Verbe d’état : opinion, connaissance, possession…',
    ],
    [
      'Verbe d’état : opinion, connaissance, possession…',
      'Action en cours au moment où l’on parle',
      'Situation temporaire',
    ],
    [
      'Question sur le métier, une situation stable',
      'Question sur une action en cours',
      'Question sur une situation temporaire',
    ],
    ['Vérité générale', 'Action en cours au moment où l’on parle', 'Situation temporaire'],
  ],
  'tense-past-simple': [
    [
      'Action terminée à un moment précis du passé',
      'Action en cours maintenant',
      'Habitude présente',
    ],
    [
      'Suite d’actions dans un récit au passé',
      'Action en cours maintenant',
      'Habitude passée, qui n’existe plus',
    ],
    ['Habitude passée, qui n’existe plus', 'Action en cours maintenant', 'Habitude présente'],
    [
      'Question sur un moment précis du passé',
      'Question sur une expérience, sans moment précis',
      'Question sur une habitude présente',
    ],
    ['État ou situation dans le passé', 'Action en cours maintenant', 'Habitude présente'],
  ],
  'tense-past-continuous': [
    [
      'Action longue en cours, interrompue par une autre',
      'Action courte qui interrompt une action en cours',
      'Action en cours maintenant',
    ],
    [
      'Action courte qui interrompt une action en cours',
      'Action en cours maintenant',
      'Action longue en cours, interrompue par une autre',
    ],
    [
      'Action en cours à un moment précis du passé',
      'Action courte qui interrompt une action en cours',
      'Action en cours maintenant',
    ],
    [
      'Deux actions en cours en même temps',
      'Action courte qui interrompt une action en cours',
      'Action en cours maintenant',
    ],
    [
      'Question sur une action en cours à un moment passé',
      'Question sur une action en cours maintenant',
      'Question sur une action terminée',
    ],
    [
      'Verbe d’état : pas de forme continue',
      'Action en cours maintenant',
      'Action longue en cours, interrompue par une autre',
    ],
    [
      'Situation en cours pendant une période passée',
      'Action courte qui interrompt une action en cours',
      'Action en cours maintenant',
    ],
  ],
  'tense-present-perfect': [
    [
      'Expérience, à un moment non précisé',
      'Action en cours maintenant',
      'Action à un moment passé précis',
    ],
    [
      'Résultat présent d’une action passée',
      'Action en cours maintenant',
      'Expérience, à un moment non précisé',
    ],
    [
      'Question sur une expérience de la vie',
      'Question sur un moment passé précis',
      'Question sur une action en cours',
    ],
    [
      'Action dans une période pas encore terminée',
      'Action en cours maintenant',
      'Action à un moment passé précis',
    ],
    [
      'Résultat présent d’une action passée',
      'Action à un moment passé précis',
      'Expérience, à un moment non précisé',
    ],
    [
      'Expérience, à un moment non précisé',
      'Action à un moment passé précis',
      'Résultat présent d’une action passée',
    ],
    [
      'Expérience, à un moment non précisé',
      'Action en cours maintenant',
      'Résultat présent d’une action passée',
    ],
    [
      'Question sur une période pas encore terminée',
      'Question sur un moment passé précis',
      'Question sur une action en cours',
    ],
  ],
  'tense-just-already-yet-still': [
    [
      'Action attendue, pas encore faite (négation ou question)',
      'Action déjà faite, souvent plus tôt que prévu',
      'Action qui vient tout juste de se produire',
    ],
    [
      'Action qui vient tout juste de se produire',
      'Action attendue, pas encore faite (négation ou question)',
      'Situation qui continue encore maintenant',
    ],
    [
      'Action déjà faite, souvent plus tôt que prévu',
      'Action attendue, pas encore faite (négation ou question)',
      'Situation qui continue encore maintenant',
    ],
    [
      'Retard ou impatience : toujours pas',
      'Action attendue, pas encore faite (négation ou question)',
      'Action déjà faite, souvent plus tôt que prévu',
    ],
    [
      'Situation qui continue encore maintenant',
      'Action attendue, pas encore faite (négation ou question)',
      'Action déjà faite, souvent plus tôt que prévu',
    ],
    [
      'Action attendue, pas encore faite (négation ou question)',
      'Action qui vient tout juste de se produire',
      'Situation qui continue encore maintenant',
    ],
    [
      'Situation qui continue encore maintenant',
      'Action attendue, pas encore faite (négation ou question)',
    ],
  ],
  'tense-for-since-ago': [
    [
      'Un point de départ : depuis quand ?',
      'Un moment passé, compté à partir de maintenant : il y a',
      'Une durée : combien de temps ?',
    ],
    [
      'Une durée : combien de temps ?',
      'Un moment passé, compté à partir de maintenant : il y a',
      'Un point de départ : depuis quand ?',
    ],
    [
      'Un moment passé, compté à partir de maintenant : il y a',
      'Un point de départ : depuis quand ?',
      'Une durée : combien de temps ?',
    ],
    [
      'Situation commencée dans le passé, qui continue maintenant',
      'Action en cours maintenant, sans lien avec le passé',
      'Habitude présente',
    ],
    [
      'Question sur une durée qui continue jusqu’à maintenant',
      'Question sur un moment passé précis',
      'Question sur une habitude',
    ],
    [
      'Avec _ago_ : un moment passé précis, donc le prétérit',
      'Action en cours maintenant, sans lien avec le passé',
      'Situation commencée dans le passé, qui continue maintenant',
    ],
  ],
  'tense-present-perfect-vs-past-simple': [
    [
      'Moment passé précis ou période terminée : prétérit',
      'Expérience, sans moment précis : present perfect',
    ],
    [
      'Situation qui dure jusqu’à maintenant : present perfect',
      'Moment passé précis ou période terminée : prétérit',
    ],
    ['Question sur le moment : prétérit', 'Expérience, sans moment précis : present perfect'],
    [
      'Première fois, jusqu’à maintenant : present perfect',
      'Moment passé précis ou période terminée : prétérit',
    ],
    [
      'Moment passé précis ou période terminée : prétérit',
      'Situation qui dure jusqu’à maintenant : present perfect',
    ],
  ],
  'tense-future': [
    [
      'Après _when_, _if_ ou _as soon as_ : présent pour un futur',
      'Intention déjà décidée',
      'Prévision ou opinion sur l’avenir',
    ],
    [
      'Décision prise au moment où l’on parle',
      'Intention déjà décidée',
      'Rendez-vous ou arrangement déjà fixé',
    ],
    [
      'Intention déjà décidée',
      'Décision prise au moment où l’on parle',
      'Prédiction fondée sur un indice présent',
    ],
    [
      'Prédiction fondée sur un indice présent',
      'Décision prise au moment où l’on parle',
      'Rendez-vous ou arrangement déjà fixé',
    ],
    [
      'Rendez-vous ou arrangement déjà fixé',
      'Décision prise au moment où l’on parle',
      'Prédiction fondée sur un indice présent',
    ],
    [
      'Prévision ou opinion sur l’avenir',
      'Après _when_, _if_ ou _as soon as_ : présent pour un futur',
      'Rendez-vous ou arrangement déjà fixé',
    ],
    ['Promesse', 'Intention déjà décidée', 'Rendez-vous ou arrangement déjà fixé'],
    [
      'Après _when_, _if_ ou _as soon as_ : présent pour un futur',
      'Prévision ou opinion sur l’avenir',
      'Rendez-vous ou arrangement déjà fixé',
    ],
    [
      'Rendez-vous ou arrangement déjà fixé',
      'Décision prise au moment où l’on parle',
      'Prévision ou opinion sur l’avenir',
    ],
    [
      'Décision prise au moment où l’on parle',
      'Horaire ou programme officiel',
      'Rendez-vous ou arrangement déjà fixé',
    ],
    [
      'Horaire ou programme officiel',
      'Décision prise au moment où l’on parle',
      'Intention déjà décidée',
    ],
  ],
  'tense-present-perfect-continuous': [
    [
      'Activité qui dure jusqu’à maintenant (accent sur la durée)',
      'Activité récente dont on voit encore la conséquence',
      'Résultat ou quantité : present perfect simple',
    ],
    [
      'Activité récente dont on voit encore la conséquence',
      'Résultat ou quantité : present perfect simple',
      'Verbe d’état : pas de forme continue',
    ],
    [
      'Résultat ou quantité : present perfect simple',
      'Activité qui dure jusqu’à maintenant (accent sur la durée)',
      'Activité récente dont on voit encore la conséquence',
    ],
    [
      'Question sur une activité qui dure jusqu’à maintenant',
      'Question sur un résultat ou une quantité',
      'Question sur une habitude',
    ],
    [
      'Verbe d’état : pas de forme continue',
      'Activité qui dure jusqu’à maintenant (accent sur la durée)',
      'Activité récente dont on voit encore la conséquence',
    ],
    [
      'Activité qui dure jusqu’à maintenant (accent sur la durée)',
      'Résultat ou quantité : present perfect simple',
      'Verbe d’état : pas de forme continue',
    ],
    [
      'Question sur un résultat ou une quantité',
      'Question sur une activité qui dure jusqu’à maintenant',
      'Question sur une habitude',
    ],
  ],
  'tense-past-perfect': [
    [
      'Action antérieure à un autre moment du passé',
      'Actions passées racontées dans l’ordre',
      'Lien avec le présent',
    ],
    [
      'Discours rapporté au passé',
      'Actions passées racontées dans l’ordre',
      'Lien avec le présent',
    ],
    [
      'Question sur une action antérieure à un moment passé',
      'Question sur une action en cours',
      'Question sur une expérience jusqu’à maintenant',
    ],
    [
      'Actions passées racontées dans l’ordre',
      'Action antérieure à un autre moment du passé',
      'Lien avec le présent',
    ],
    [
      'Première fois, vue depuis un moment du passé',
      'Actions passées racontées dans l’ordre',
      'Lien avec le présent',
    ],
  ],
  'tense-review': [
    [
      'Durée jusqu’à maintenant : present perfect',
      'Habitude ou fait : présent simple',
      'Moment passé précis : prétérit',
    ],
    [
      'Moment passé précis : prétérit',
      'Habitude ou fait : présent simple',
      'Lien avec maintenant : present perfect',
    ],
    [
      'En cours maintenant : présent continu',
      'Habitude ou fait : présent simple',
      'Moment passé précis : prétérit',
    ],
    [
      'En cours à un moment passé : passé continu',
      'En cours maintenant : présent continu',
      'Lien avec maintenant : present perfect',
    ],
    [
      'Verbe d’état : présent simple',
      'En cours maintenant : présent continu',
      'Lien avec maintenant : present perfect',
    ],
    [
      'Futur après _when_ ou _if_ : présent',
      'Lien avec maintenant : present perfect',
      'Moment passé précis : prétérit',
    ],
    [
      'Antérieur à un autre moment passé : past perfect',
      'Habitude ou fait : présent simple',
      'Lien avec maintenant : present perfect',
    ],
    [
      'Lien avec maintenant : present perfect',
      'Habitude ou fait : présent simple',
      'Moment passé précis : prétérit',
    ],
    [
      'Durée jusqu’à maintenant : present perfect',
      'En cours maintenant : présent continu',
      'Habitude ou fait : présent simple',
    ],
    [
      'Rendez-vous fixé : présent continu',
      'Lien avec maintenant : present perfect',
      'Moment passé précis : prétérit',
    ],
  ],
};

/** Reviewed reason sets of a notion; none for a notion without generation. */
export function reasonSetsOf(notionId: string): readonly ReasonSet[] {
  const id = GENERATABLE_NOTION_IDS.find((generatable) => generatable === notionId);
  return id === undefined ? [] : REASON_SETS[id];
}
