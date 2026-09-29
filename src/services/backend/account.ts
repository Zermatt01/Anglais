/**
 * The learner's account (ARC-03, D-013): sign-in with a code received by
 * e-mail, never with a link, which would open outside the installed app.
 * Accounts are never created from the app: the single account is created in
 * the Supabase dashboard and sign-ups are closed (D-060).
 */
import { isAuthApiError, isAuthRetryableFetchError, type Session } from '@supabase/supabase-js';
import type { AppSupabaseClient } from './client.ts';

export interface Account {
  readonly userId: string;
  readonly email: string;
}

export type AccountError =
  /** No network. */
  | 'offline'
  /** Too many codes asked for: wait before asking again. */
  | 'rate_limited'
  /** Wrong or expired code. */
  | 'invalid_code'
  /** No account for this address (sign-ups are closed). */
  | 'unknown_account'
  | 'unexpected';

export type AccountResult =
  { readonly ok: true } | { readonly ok: false; readonly error: AccountError };

export interface AccountService {
  /** The signed-in account, from the stored session (no network needed). */
  current(): Promise<Account | null>;
  /** Called at each sign-in, sign-out or session change. */
  subscribe(listener: (account: Account | null) => void): () => void;
  sendCode(email: string): Promise<AccountResult>;
  verifyCode(email: string, code: string): Promise<AccountResult>;
  /** Signs out on this device; the local data stays. */
  signOut(): Promise<void>;
  /** A valid access token (refreshed if needed), or `null` when signed out. */
  accessToken(): Promise<string | null>;
}

function accountOf(session: Session | null): Account | null {
  const user = session?.user;
  if (user?.email === undefined) return null;
  return { userId: user.id, email: user.email };
}

/** Reads an error of Supabase Auth. */
export function accountErrorOf(error: unknown): AccountError {
  if (isAuthRetryableFetchError(error)) return 'offline';
  if (isAuthApiError(error)) {
    if (error.status === 429) return 'rate_limited';
    switch (error.code) {
      case 'otp_expired':
      case 'invalid_credentials':
        return 'invalid_code';
      case 'otp_disabled':
      case 'signup_disabled':
      case 'user_not_found':
        return 'unknown_account';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'rate_limited';
    }
    // An unknown or expired code is answered 403 without a precise code.
    if (error.status === 403) return 'invalid_code';
  }
  return 'unexpected';
}

export function createAccountService(client: AppSupabaseClient): AccountService {
  const { auth } = client;
  return {
    async current() {
      const { data } = await auth.getSession();
      return accountOf(data.session);
    },

    subscribe(listener) {
      const { data } = auth.onAuthStateChange((_event, session) => {
        listener(accountOf(session));
      });
      return () => {
        data.subscription.unsubscribe();
      };
    },

    async sendCode(email) {
      const { error } = await auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      return error === null ? { ok: true } : { ok: false, error: accountErrorOf(error) };
    },

    async verifyCode(email, code) {
      const { error } = await auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      return error === null ? { ok: true } : { ok: false, error: accountErrorOf(error) };
    },

    async signOut() {
      // Only this device; the session is removed even without network.
      await auth.signOut({ scope: 'local' });
    },

    async accessToken() {
      const { data } = await auth.getSession();
      return data.session?.access_token ?? null;
    },
  };
}
