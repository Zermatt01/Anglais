// Generated from shared/ai/prompts/prompt.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * Shape of a versioned prompt (AI-01). Prompts are assembled by the Edge
 * Function only; the client never imports this folder (D-017).
 */

export interface TaskPrompt<Input> {
  /** `<task>@<n>`, recorded with each call and each stored result. */
  readonly version: string;
  /**
   * Stable prefix, placed first so that it can be cached (COST-03). It never
   * contains request data, dates or identifiers, which would defeat the cache.
   */
  readonly system: string;
  /** Variable part, placed after the stable prefix. */
  userMessage(input: Input): string;
}
