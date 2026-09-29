/**
 * CORS (docs/ARCHITECTURE.md §9): only the production front end and local
 * development origins may call the function from a browser.
 */

/** Headers sent by the client (src/services/ai-client): nothing else is allowed. */
const ALLOWED_HEADERS = 'authorization, apikey, content-type, x-client-info';

/**
 * CORS headers for a request from `origin`: none for a request without an
 * Origin header (not a browser), `null` for an origin that is not allowed.
 */
export function corsHeadersFor(
  origin: string | null,
  allowedOrigins: ReadonlySet<string>,
): Record<string, string> | null {
  if (origin === null) return {};
  if (!allowedOrigins.has(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
