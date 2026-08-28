
create extension if not exists vector;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  title text,
  authors text[] default '{}',
  supervisor text,
  field text,
  difficulty text,
  summary text,
  raw_text text,
  status text not null default 'pending',
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "auth read documents" on public.documents for select to authenticated using (true);
create policy "auth insert documents" on public.documents for insert to authenticated with check (auth.uid() = uploader_id);
create policy "owner update documents" on public.documents for update to authenticated using (auth.uid() = uploader_id) with check (auth.uid() = uploader_id);
create policy "owner delete documents" on public.documents for delete to authenticated using (auth.uid() = uploader_id);

create table public.technologies (
  id bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  name text not null
);
create index on public.technologies (document_id);
create index on public.technologies (lower(name));
grant select, insert, update, delete on public.technologies to authenticated;
grant all on public.technologies to service_role;
alter table public.technologies enable row level security;
create policy "auth read techs" on public.technologies for select to authenticated using (true);
create policy "owner write techs" on public.technologies for all to authenticated
  using (exists (select 1 from public.documents d where d.id = document_id and d.uploader_id = auth.uid()))
  with check (exists (select 1 from public.documents d where d.id = document_id and d.uploader_id = auth.uid()));

create table public.keywords (
  id bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  keyword text not null
);
create index on public.keywords (document_id);
create index on public.keywords (lower(keyword));
grant select, insert, update, delete on public.keywords to authenticated;
grant all on public.keywords to service_role;
alter table public.keywords enable row level security;
create policy "auth read kw" on public.keywords for select to authenticated using (true);
create policy "owner write kw" on public.keywords for all to authenticated
  using (exists (select 1 from public.documents d where d.id = document_id and d.uploader_id = auth.uid()))
  with check (exists (select 1 from public.documents d where d.id = document_id and d.uploader_id = auth.uid()));

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(3072) not null,
  created_at timestamptz not null default now()
);
create index on public.chunks (document_id);
create index chunks_embedding_idx on public.chunks using hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
grant select, insert, update, delete on public.chunks to authenticated;
grant all on public.chunks to service_role;
alter table public.chunks enable row level security;
create policy "auth read chunks" on public.chunks for select to authenticated using (true);
create policy "owner write chunks" on public.chunks for all to authenticated
  using (exists (select 1 from public.documents d where d.id = document_id and d.uploader_id = auth.uid()))
  with check (exists (select 1 from public.documents d where d.id = document_id and d.uploader_id = auth.uid()));

create or replace function public.match_chunks(query_embedding vector(3072), match_count int default 6, filter_document_id uuid default null)
returns table (id uuid, document_id uuid, chunk_index int, content text, similarity float)
language sql stable
set search_path = public
as $$
  select c.id, c.document_id, c.chunk_index, c.content,
    1 - (c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) as similarity
  from public.chunks c
  where (filter_document_id is null or c.document_id = filter_document_id)
  order by c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  limit match_count;
$$;

create or replace function public.trg_touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql set search_path = public;
create trigger documents_updated before update on public.documents for each row execute function public.trg_touch_updated_at();
