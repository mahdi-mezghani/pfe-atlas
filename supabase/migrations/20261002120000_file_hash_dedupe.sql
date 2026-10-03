alter table public.documents
  add column if not exists file_hash text;

create index if not exists documents_uploader_file_hash_idx
  on public.documents (uploader_id, file_hash);

create unique index if not exists documents_uploader_file_hash_unique_idx
  on public.documents (uploader_id, file_hash)
  where file_hash is not null;
