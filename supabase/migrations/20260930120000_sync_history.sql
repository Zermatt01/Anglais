-- Counter-review of phase 2 (D-070): the server keeps the versions of a
-- document that a push replaces.
--
-- "Latest wins" compares device clocks. A version already sent can therefore
-- be replaced by one written later on a device whose clock runs ahead, and
-- the first device then adopts it: its version was on no device any more.
-- Every replaced version is now copied here, before being overwritten, so
-- that nothing sent is ever lost (NO-06). The learner can read their copies
-- (Supabase dashboard, Table Editor); nothing else can write or delete them.
--
-- Retention: the last 10 replaced versions of each document. A version lost
-- in a conflict is found there as long as its document has not been
-- replaced ten more times.

create table public.sync_document_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  collection text not null,
  id text not null,
  doc jsonb not null,
  schema_version integer not null,
  updated_at bigint not null,
  deleted boolean not null,
  -- Sequence number of the replaced version.
  server_seq bigint not null,
  replaced_at timestamptz not null default now(),
  primary key (user_id, collection, id, server_seq)
);

alter table public.sync_document_history enable row level security;

create policy "sync_document_history: owner reads" on public.sync_document_history
for select to authenticated using ((select auth.uid()) = user_id);

-- Explicit privileges (D-064): read only for the owner, nothing for anon.
revoke all on table public.sync_document_history from anon, authenticated;
grant select on table public.sync_document_history to authenticated;

-- The copy is made by a trigger that runs with the rights of its owner: the
-- client has no right to write the history. It lives in a schema that the
-- API does not expose, and a trigger function cannot be called directly.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.sync_keep_replaced_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sync_document_history (
    user_id, collection, id, doc, schema_version, updated_at, deleted, server_seq
  )
  values (
    old.user_id, old.collection, old.id, old.doc, old.schema_version, old.updated_at,
    old.deleted, old.server_seq
  )
  on conflict do nothing;

  delete from public.sync_document_history as h
  where h.user_id = old.user_id
    and h.collection = old.collection
    and h.id = old.id
    and h.server_seq < (
      select min(recent.server_seq)
      from (
        select k.server_seq
        from public.sync_document_history as k
        where k.user_id = old.user_id and k.collection = old.collection and k.id = old.id
        order by k.server_seq desc
        limit 10
      ) as recent
    );
  return new;
end;
$$;

revoke execute on function private.sync_keep_replaced_version() from public, anon, authenticated;

create trigger sync_documents_keep_history
before update on public.sync_documents
for each row
when (old.doc is distinct from new.doc)
execute function private.sync_keep_replaced_version();
