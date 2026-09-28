import type { TableName } from '../../data/tables.ts';
import type { EnvelopeError } from '../../data/transfer/envelope.ts';

/** Name of each table as shown to the learner. */
export const TABLE_LABELS: Readonly<Record<TableName, string>> = {
  settings: 'Réglages',
  notionProgress: 'Progression dans le parcours',
  exerciseAttempts: 'Réponses aux exercices',
  generatedExercises: 'Exercices générés',
  cards: 'Cartes',
  reviewLogs: 'Historique des révisions',
  productions: 'Productions écrites',
  errors: 'Erreurs relevées',
  lexicon: 'Mon lexique',
  ruleNotes: 'Carnet de règles',
  activity: 'Activité',
  levelEstimates: 'Estimations du niveau',
  reports: 'Signalements',
  diagnosticRuns: 'Diagnostics',
  pronunciationAttempts: 'Exercices de prononciation',
  emailSessions: 'E-mails guidés',
  drafts: 'Brouillons',
  syncOutbox: 'File de synchronisation',
  syncMeta: 'État de la synchronisation',
  usageSnapshot: 'Consommation',
  quarantine: 'Éléments illisibles mis de côté',
};

export const ENVELOPE_ERRORS: Readonly<Record<EnvelopeError, string>> = {
  'not-json': 'Ce fichier n’est pas un fichier JSON lisible.',
  'not-an-export': 'Ce fichier n’est pas un export de cette application.',
  'newer-format':
    'Ce fichier vient d’une version plus récente de l’application. Mets l’application à jour, puis recommence.',
};
