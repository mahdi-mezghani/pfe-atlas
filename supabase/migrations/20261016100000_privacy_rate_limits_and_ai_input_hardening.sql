update public.documents
set raw_text = null
where raw_text is not null;

alter table public.documents
  drop column if exists raw_text;

create table if not exists public.user_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, action)
);

alter table public.user_rate_limits enable row level security;
revoke all on public.user_rate_limits from public, anon, authenticated;
grant all on public.user_rate_limits to service_role;

create or replace function public.consume_user_rate_limit(p_action text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  request_limit integer;
  window_seconds integer := 3600;
  allowed boolean;
  request_time timestamptz := statement_timestamp();
begin
  if auth.role() = 'service_role' then
    return true;
  end if;

  if current_user_id is null then
    return false;
  end if;

  request_limit := case p_action
    when 'storage_upload' then 10
    when 'document_create' then 10
    when 'document_process' then 5
    when 'ask_question' then 30
    when 'semantic_search' then 60
    else null
  end;

  if request_limit is null then
    raise exception 'Unsupported rate-limit action'
      using errcode = '22023';
  end if;

  insert into public.user_rate_limits (user_id, action, window_started_at, request_count)
  values (current_user_id, p_action, request_time, 1)
  on conflict (user_id, action) do update
  set
    window_started_at = case
      when public.user_rate_limits.window_started_at <= request_time - window_seconds * interval '1 second'
        then request_time
      else public.user_rate_limits.window_started_at
    end,
    request_count = case
      when public.user_rate_limits.window_started_at <= request_time - window_seconds * interval '1 second'
        then 1
      else least(public.user_rate_limits.request_count + 1, request_limit + 1)
    end
  returning request_count <= request_limit into allowed;

  return allowed;
end;
$$;

revoke all on function public.consume_user_rate_limit(text) from public, anon;
grant execute on function public.consume_user_rate_limit(text) to authenticated, service_role;

create or replace function public.enforce_document_create_rate_limit()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if not public.consume_user_rate_limit('document_create') then
    raise exception 'RATE_LIMIT_DOCUMENT_CREATE'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists documents_rate_limit_before_insert on public.documents;
create trigger documents_rate_limit_before_insert
before insert on public.documents
for each row execute function public.enforce_document_create_rate_limit();

drop policy if exists "pfe upload own" on storage.objects;
create policy "pfe upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pfe-reports'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.consume_user_rate_limit('storage_upload')
  );
