import type { EnglishVariant, LearnerDomain, ThemePreference } from '../../domain/settings.ts';
import type { Choice } from '../../ui/fields.tsx';

export const VARIANT_CHOICES: readonly Choice<EnglishVariant>[] = [
  {
    value: 'en-GB',
    label: 'Britannique',
    description: 'Orthographe et voix de référence britanniques',
  },
  {
    value: 'en-US',
    label: 'Américain',
    description: 'Orthographe et voix de référence américaines',
  },
];

export const THEME_CHOICES: readonly Choice<ThemePreference>[] = [
  { value: 'system', label: 'Automatique', description: 'Suit le réglage du téléphone' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
];

/** Domains of USR-05, in the order of the specification. */
export const DOMAIN_CHOICES: readonly Choice<LearnerDomain>[] = [
  { value: 'finance', label: 'Finance (marchés, banque, banques centrales)' },
  { value: 'data-ai', label: 'Data science et IA' },
  { value: 'teaching', label: 'Enseignement' },
  { value: 'job-interviews', label: 'Entretiens d’embauche' },
  { value: 'workplace-communication', label: 'E-mails et réunions professionnels' },
  { value: 'daily-life', label: 'Vie quotidienne' },
];
