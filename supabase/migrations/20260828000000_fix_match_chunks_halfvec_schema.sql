-- The vector extension is installed in the extensions schema.
-- Qualify halfvec so the RPC works with its public-only search_path.
create or replace function public.match_chunks(
  query_embedding vector(3072),
  match_count int default 6,
  filter_document_id uuid default null
)
returns table (id uuid, document_id uuid, chunk_index int, content text, similarity float)
language sql stable
set search_path = public
as $$
  select c.id, c.document_id, c.chunk_index, c.content,
    1 - (c.embedding::extensions.halfvec(3072) OPERATOR(extensions.<=>) query_embedding::extensions.halfvec(3072)) as similarity
  from public.chunks c
  where (filter_document_id is null or c.document_id = filter_document_id)
  order by c.embedding::extensions.halfvec(3072) OPERATOR(extensions.<=>) query_embedding::extensions.halfvec(3072)
  limit match_count;
$$;
