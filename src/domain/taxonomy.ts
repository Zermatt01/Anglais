/**
 * Fixed error taxonomy (TAX-01, docs/PEDAGOGY.md §7) and the related scales.
 */
import { z } from 'zod';

/** The 15 error categories. The list is fixed: never add, remove or rename one. */
export const ERROR_CATEGORIES = [
  'temps_verbaux',
  'accord_sujet_verbe',
  'auxiliaires_questions_negations',
  'articles',
  'indenombrables_pluriels',
  'prepositions',
  'ordre_des_mots',
  'faux_amis',
  'calques_du_francais',
  'choix_lexical_collocations',
  'registre_ton',
  'connecteurs_structure',
  'orthographe',
  'ponctuation',
  'prononciation',
] as const;
export const errorCategorySchema = z.enum(ERROR_CATEGORIES);
export type ErrorCategory = z.infer<typeof errorCategorySchema>;

/** Sound categories of the `prononciation` category (docs/PEDAGOGY.md §7.2). */
export const SOUND_CATEGORIES = [
  'th',
  'h_aspire',
  'voyelles_longues_courtes',
  'terminaison_ed',
  'terminaison_s',
  'accent_tonique',
  'schwa',
  'autre',
] as const;
export const soundCategorySchema = z.enum(SOUND_CATEGORIES);
export type SoundCategory = z.infer<typeof soundCategorySchema>;

/** Severity of an error (docs/PEDAGOGY.md §5.1). */
export const severitySchema = z.enum(['minor', 'medium', 'major']);
export type Severity = z.infer<typeof severitySchema>;

/** Confidence of the model in an error it reports (AI-05, D-024). */
export const confidenceSchema = z.enum(['low', 'medium', 'high']);
export type Confidence = z.infer<typeof confidenceSchema>;

/** Result of an answer, whoever graded it (CARD-05). */
export const answerResultSchema = z.enum(['correct', 'acceptable', 'incorrect']);
export type AnswerResult = z.infer<typeof answerResultSchema>;

/** Who graded an answer. */
export const graderSchema = z.enum(['local', 'ai', 'user']);
export type Grader = z.infer<typeof graderSchema>;
