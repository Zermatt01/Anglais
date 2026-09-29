-- Synchronization store (docs/ARCHITECTURE.md §4.3 and §7, D-014, D-015).
--
-- The device is the source of truth; the server is its mirror. Two generic
-- tables, whatever the local model: documents merged "latest wins", and
-- append-only events merged by union. The client validates every record with
-- Zod; the server only checks the envelope.
--
-- A shared sequence gives each change a server_seq: the read cursor of
-- sync_pull, independent of the device clocks.

create sequence public.sync_server_seq as bigint;

-- Documents (sync class D), merged "latest wins" on updated_at.
create table public.sync_documents (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Name of the local table.
  collection text not null check (collection ~ '^[a-z][A-Za-z0-9]{0,63}$'),
  -- UUID, or natural key for settings, notionProgress and ruleNotes (D-044).
  id text not null check (char_length(id) between 1 and 200),
  doc jsonb not null check (jsonb_typeof(doc) = 'object' and octet_length(doc::text) <= 1000000),
  schema_version integer not null check (schema_version >= 1),
  -- updatedAt of the client (epoch ms).
  updated_at bigint not null check (updated_at >= 0),
  -- Logical deletion (tombstone): nothing is ever deleted.
  deleted boolean not null default false,
  server_seq bigint not null,
  primary key (user_id, collection, id)
);

create index sync_documents_pull on public.sync_documents (user_id, server_seq);

-- Events (sync class E), append-only.
create table public.sync_events (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  collection text not null check (collection ~ '^[a-z][A-Za-z0-9]{0,63}$'),
  id uuid not null,
  doc jsonb not null check (jsonb_typeof(doc) = 'object' and octet_length(doc::text) <= 1000000),
  schema_version integer not null check (schema_version >= 1),
  occurred_at bigint not null check (occurred_at >= 0),
  server_seq bigint not null,
  primary key (user_id, collection, id)
);

create index sync_events_pull on public.sync_events (user_id, server_seq);

-- Every insertion and update takes the next number of the shared sequence.
create function public.sync_assign_server_seq()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.server_seq := nextval('public.sync_server_seq');
  return new;
end;
$$;

create trigger sync_documents_server_seq
before insert or update on public.sync_documents
for each row execute function public.sync_assign_server_seq();

create trigger sync_events_server_seq
before insert on public.sync_events
for each row execute function public.sync_assign_server_seq();

-- Row Level Security (SEC-02): each user reads and writes their own rows only.
-- No delete policy: deletions travel as tombstones.
alter table public.sync_documents enable row level security;
alter table public.sync_events enable row level security;

create policy "sync_documents: owner reads" on public.sync_documents
for select to authenticated using ((select auth.uid()) = user_id);

create policy "sync_documents: owner inserts" on public.sync_documents
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "sync_documents: owner updates" on public.sync_documents
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "sync_events: owner reads" on public.sync_events
for select to authenticated using ((select auth.uid()) = user_id);

create policy "sync_events: owner inserts" on public.sync_events
for insert to authenticated with check ((select auth.uid()) = user_id);

-- Explicit privileges (D-064): recent Supabase projects no longer grant them
-- by default, and older ones grant too much (anon, delete).
revoke all on table public.sync_documents, public.sync_events from anon, authenticated;
grant select, insert, update on table public.sync_documents to authenticated;
grant select, insert on table public.sync_events to authenticated;
revoke all on sequence public.sync_server_seq from anon, authenticated;
grant usage on sequence public.sync_server_seq to authenticated;
revoke execute on function public.sync_assign_server_seq() from public, anon, authenticated;

-- sync_push: stores a batch of the device's changes.
--
-- - Documents: the incoming version replaces the stored one if it is more
--   recent; at equal updated_at, a deterministic comparison of the serialized
--   documents decides (D-015). The server is the only arbiter: the versions
--   that did not win come back as `stale`, and the device adopts them.
-- - Events: inserted unless already present, never overwritten.
--
-- The pushes of one user run one at a time (advisory lock held until the end
-- of the transaction): their sequence numbers are therefore given in commit
-- order, and a pull that reads up to number n never misses a smaller one.
create function public.sync_push(p_documents jsonb, p_events jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_stale jsonb;
begin
  if v_user is null then
    raise exception 'sync_push: not authenticated' using errcode = '28000';
  end if;
  if jsonb_typeof(p_documents) is distinct from 'array'
    or jsonb_typeof(p_events) is distinct from 'array'
    or jsonb_array_length(p_documents) > 500
    or jsonb_array_length(p_events) > 500 then
    raise exception 'sync_push: invalid batch' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('sync:' || v_user::text, 0));

  with incoming as (
    -- A key repeated in the batch counts once, with its latest version.
    select distinct on (d.collection, d.id)
      d.collection, d.id, d.doc, d.schema_version, d.updated_at, d.deleted
    from jsonb_to_recordset(p_documents) as d (
      collection text, id text, doc jsonb, schema_version integer, updated_at bigint, deleted boolean
    )
    order by d.collection, d.id, d.updated_at desc, (d.doc::text) collate "C" desc
  ),
  written as (
    insert into public.sync_documents as stored (collection, id, doc, schema_version, updated_at, deleted)
    select i.collection, i.id, i.doc, i.schema_version, i.updated_at, i.deleted
    from incoming as i
    on conflict (user_id, collection, id) do update
    set doc = excluded.doc,
      schema_version = excluded.schema_version,
      updated_at = excluded.updated_at,
      deleted = excluded.deleted
    where excluded.updated_at > stored.updated_at
      or (
        excluded.updated_at = stored.updated_at
        and (excluded.doc::text) collate "C" > (stored.doc::text) collate "C"
      )
    returning stored.collection, stored.id
  )
  -- The other statements of this query see the table as it was before it:
  -- for the documents that were not written, that is the stored version.
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'kind', 'document',
        'collection', s.collection,
        'id', s.id,
        'doc', s.doc,
        'schema_version', s.schema_version,
        'updated_at', s.updated_at,
        'deleted', s.deleted,
        'server_seq', s.server_seq
      )
      order by s.server_seq
    ),
    '[]'::jsonb
  )
  into v_stale
  from incoming as i
  join public.sync_documents as s
    on s.user_id = v_user and s.collection = i.collection and s.id = i.id
  where not exists (
    select 1 from written as w where w.collection = i.collection and w.id = i.id
  );

  insert into public.sync_events (collection, id, doc, schema_version, occurred_at)
  select e.collection, e.id, e.doc, e.schema_version, e.occurred_at
  from jsonb_to_recordset(p_events) as e (
    collection text, id uuid, doc jsonb, schema_version integer, occurred_at bigint
  )
  on conflict (user_id, collection, id) do nothing;

  return jsonb_build_object('stale', v_stale);
end;
$$;

-- sync_pull: the changes of the user after the cursor, in sequence order.
create function public.sync_pull(p_cursor bigint, p_limit integer)
returns table (
  kind text,
  collection text,
  id text,
  doc jsonb,
  schema_version integer,
  updated_at bigint,
  deleted boolean,
  server_seq bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select changes.*
  from (
    select 'document' as kind, d.collection, d.id, d.doc, d.schema_version, d.updated_at,
      d.deleted, d.server_seq
    from public.sync_documents as d
    where d.user_id = (select auth.uid()) and d.server_seq > p_cursor
    union all
    select 'event', e.collection, e.id::text, e.doc, e.schema_version, e.occurred_at,
      false, e.server_seq
    from public.sync_events as e
    where e.user_id = (select auth.uid()) and e.server_seq > p_cursor
  ) as changes
  order by changes.server_seq
  limit least(greatest(p_limit, 1), 1000);
$$;

revoke execute on function public.sync_push(jsonb, jsonb) from public, anon;
revoke execute on function public.sync_pull(bigint, integer) from public, anon;
grant execute on function public.sync_push(jsonb, jsonb) to authenticated;
grant execute on function public.sync_pull(bigint, integer) to authenticated;
