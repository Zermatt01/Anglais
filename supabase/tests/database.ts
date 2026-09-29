/**
 * A Postgres database for the tests of the migrations (PGlite: Postgres
 * compiled to WebAssembly, no server needed).
 *
 * It reproduces what the migrations rely on in a Supabase project: the roles
 * `anon`, `authenticated` and `service_role` (which bypasses RLS), the table
 * `auth.users`, and `auth.uid()`, which reads the `sub` claim of the request's
 * JWT exactly as Supabase does. Then every file of supabase/migrations is
 * applied in order.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { PGlite, type Transaction } from '@electric-sql/pglite';

const MIGRATIONS = new URL('../migrations/', import.meta.url);

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
`;

export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

export async function createMigratedDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of migrationFiles()) {
    await db.exec(readFileSync(new URL(file, MIGRATIONS), 'utf8'));
  }
  return db;
}

/** Creates a user of `auth.users` and returns its identifier. */
export async function createUser(db: PGlite): Promise<string> {
  const id = crypto.randomUUID();
  await db.query('insert into auth.users (id, email) values ($1, $2)', [id, `${id}@example.test`]);
  return id;
}

export type Role = 'anon' | 'authenticated' | 'service_role';

/**
 * Runs `work` in a transaction under `role`, as PostgREST does for a request:
 * `sub` is the signed-in user, if any. The transaction is rolled back if
 * `work` throws.
 */
export async function asRole<T>(
  db: PGlite,
  role: Role,
  sub: string | null,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(sub === null ? { role } : { sub, role }),
    ]);
    await tx.exec(`set local role ${role}`);
    return work(tx);
  });
}

/** Runs `work` as the signed-in user `userId`. */
export function asUser<T>(
  db: PGlite,
  userId: string,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return asRole(db, 'authenticated', userId, work);
}
