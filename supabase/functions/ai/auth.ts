/**
 * Who is calling (SEC-05, D-062). The platform check (`verify_jwt`) also
 * accepts the publishable key, which identifies no one: the function
 * therefore verifies the user's JWT itself, with the official server SDK
 * (signature against the project's JWKS, issuer and audience pinned).
 */
import type { SupabaseEnv } from '@supabase/server';
import { verifyAuth } from '@supabase/server/core';

export interface AuthenticatedUser {
  readonly id: string;
  /** In lower case. */
  readonly email: string;
}

export type Authenticate = (request: Request) => Promise<AuthenticatedUser | null>;

/**
 * `env` overrides the environment read by the SDK (tests only: an inline key
 * set). In production the JWKS is derived from `SUPABASE_URL`.
 */
export function createAuthenticator(
  supabaseUrl: string,
  env: Partial<SupabaseEnv> = {},
): Authenticate {
  return async (request) => {
    const { data, error } = await verifyAuth(request, {
      auth: 'user',
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
      env: { url: supabaseUrl, ...env },
    });
    if (error !== null) return null;
    const claims = data.userClaims;
    if (claims?.role !== 'authenticated' || claims.email === undefined) return null;
    return { id: claims.id, email: claims.email.toLowerCase() };
  };
}
