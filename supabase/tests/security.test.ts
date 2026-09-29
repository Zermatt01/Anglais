// @vitest-environment node
/**
 * Rules that every migration must respect, present and future (SEC-02,
 * AGENTS.md): Row Level Security on every table, nothing for the anonymous
 * role, and a fixed search path in every function.
 */
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMigratedDatabase, migrationFiles } from './database.ts';

let db: PGlite;

beforeAll(async () => {
  db = await createMigratedDatabase();
});

describe('migrations', () => {
  it('are named <timestamp>_<name>.sql and applied in that order', () => {
    const files = migrationFiles();
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(file).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/);
  });

  it('enable Row Level Security on every table of the public schema', async () => {
    const { rows } = await db.query<{ table: string; rls: boolean }>(
      `select c.relname as table, c.relrowsecurity as rls
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind in ('r', 'p')`,
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter((row) => !row.rls)).toEqual([]);
  });

  it('give the anonymous role no access to any table, sequence or function', async () => {
    const tables = await db.query<{ name: string }>(
      `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'S')
         and (has_table_privilege('anon', c.oid, 'select, insert, update, delete')
           or (c.relkind = 'S' and has_sequence_privilege('anon', c.oid, 'usage')))`,
    );
    expect(tables.rows).toEqual([]);
    const functions = await db.query<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')`,
    );
    expect(functions.rows).toEqual([]);
  });

  it('fix the search path of every function', async () => {
    const { rows } = await db.query<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and not coalesce(p.proconfig @> array['search_path=""'], false)`,
    );
    expect(rows).toEqual([]);
  });

  it('create no security definer function, which would bypass Row Level Security', async () => {
    const { rows } = await db.query<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.prosecdef`,
    );
    expect(rows).toEqual([]);
  });
});
