alter table public.documents
  add column if not exists metadata_review jsonb;
