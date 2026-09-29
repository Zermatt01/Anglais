// @vitest-environment node
/**
 * JWT verification (D-062) with a key set generated for the test: the real
 * SDK code runs, only the key set is supplied inline instead of being
 * fetched from the project.
 */
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey, type JWK } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { createAuthenticator, type Authenticate } from './auth.ts';

const PROJECT = 'https://abcdefghijklmnopqrst.supabase.co';
const USER_ID = '6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f';

let privateKey: CryptoKey;
let otherKey: CryptoKey;
let authenticate: Authenticate;

beforeAll(async () => {
  const pair = await generateKeyPair('ES256', { extractable: true });
  privateKey = pair.privateKey;
  otherKey = (await generateKeyPair('ES256')).privateKey;
  const publicJwk: JWK = { ...(await exportJWK(pair.publicKey)), kid: 'test-key', alg: 'ES256' };
  authenticate = createAuthenticator(PROJECT, { jwks: { keys: [publicJwk] } });
});

interface TokenOptions {
  readonly key?: CryptoKey;
  readonly issuer?: string;
  readonly audience?: string;
  readonly expiresIn?: string;
  readonly claims?: Record<string, unknown>;
}

function token(options: TokenOptions = {}): Promise<string> {
  return new SignJWT({ role: 'authenticated', email: 'Learner@Example.test', ...options.claims })
    .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
    .setSubject(USER_ID)
    .setIssuer(options.issuer ?? `${PROJECT}/auth/v1`)
    .setAudience(options.audience ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime(options.expiresIn ?? '1h')
    .sign(options.key ?? privateKey);
}

function requestWith(authorization: string | null): Request {
  return new Request(`${PROJECT}/functions/v1/ai`, {
    method: 'POST',
    headers: authorization === null ? {} : { authorization },
  });
}

describe('createAuthenticator', () => {
  it('returns the user of a valid token, e-mail in lower case', async () => {
    expect(await authenticate(requestWith(`Bearer ${await token()}`))).toEqual({
      id: USER_ID,
      email: 'learner@example.test',
    });
  });

  // Options are built lazily: the keys only exist once beforeAll has run.
  it.each<[string, () => TokenOptions]>([
    ['signed with another key', () => ({ key: otherKey })],
    [
      'issued by another project',
      () => ({ issuer: 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co/auth/v1' }),
    ],
    ['meant for another audience', () => ({ audience: 'anon' })],
    ['expired', () => ({ expiresIn: '-1m' })],
    ['of another role', () => ({ claims: { role: 'anon' } })],
    ['without an e-mail', () => ({ claims: { email: undefined } })],
  ])('refuses a token %s', async (_label, options) => {
    const built = options();
    if (built.key !== undefined) expect(built.key).not.toBe(privateKey);
    expect(await authenticate(requestWith(`Bearer ${await token(built)}`))).toBeNull();
  });

  it('refuses a request without a token, or with the publishable key only', async () => {
    expect(await authenticate(requestWith(null))).toBeNull();
    expect(await authenticate(requestWith('Bearer sb_publishable_test'))).toBeNull();
  });
});
