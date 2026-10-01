# Migrating PFE Atlas to Self-Managed Infrastructure

This guide describes moving PFE Atlas to a separately managed Supabase project and deployment environment.

---

## 1. Get the code

Clone the project repository, then install and run it locally:

```bash
git clone <repository-url>
cd <repository-directory>
npm install
npm run dev     # http://127.0.0.1:8081
```

## 2. Stand up your own backend

Create a project on [supabase.com](https://supabase.com) (self-hosted Supabase or any Postgres 15+ with `pgvector` also works).

### 2.1 Schema

The full schema lives in `supabase/migrations/*.sql`, in order. Apply them with the Supabase CLI:

```bash
supabase link --project-ref <your-new-ref>
supabase db push
```

Or paste them into the SQL editor in order. They create:

- extension `vector` (in an `extensions` schema)
- tables `documents`, `technologies`, `keywords`, `chunks` (3072-dim embeddings, HNSW cosine index)
- `match_chunks(query_embedding, match_count, filter_document_id)` for semantic search
- RLS policies + GRANTs (shared-library model: any signed-in user reads, only the uploader writes/deletes)

### 2.2 Storage

Create a **private** bucket named `pfe-reports`, then re-apply the storage policies from the migrations (upload/read/update/delete on `storage.objects` scoped to the owner folder).

### 2.3 Auth

In Authentication → Providers: enable Email, enable Google (paste your own Google Cloud OAuth client ID/secret), and add your production URL + `http://localhost:8080` to the redirect allow-list. In Authentication → Settings: disable anonymous sign-ins and turn on the leaked-password (HIBP) check to match the current config.

### 2.4 Data

Export data from the source backend and import it into the new tables (`documents` first, then `technologies`, `keywords`, `chunks`). Files in the `pfe-reports` bucket must be downloaded and re-uploaded to the new bucket at the same paths (`<user_id>/<file>.pdf`), otherwise re-upload the PDFs through the app and let it re-process them.

## 3. Configure the AI provider

`src/lib/ai.server.ts` supports Google Gemini and OpenAI-compatible providers. For an OpenAI-compatible provider, set:

```bash
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_CHAT_MODEL=gpt-4o
AI_EMBEDDING_MODEL=text-embedding-3-large     # must be 3072 dims
```

⚠️ If you pick an embedding model with a different dimension, change `vector(3072)` in the schema (and the halfvec index/`match_chunks` casts) to match, and re-embed all chunks.

## 4. Environment variables

Create `.env` (local) and set the same in your host's dashboard:

```bash
# client (bundled into the browser build)
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
# server only
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
AI_BASE_URL=...
AI_API_KEY=...
```

Never expose the service-role key to the client.

## 5. Deploy

The app SSRs, so it needs a Node/edge host — not static hosting.

```bash
npm run build
```

- **Vercel / Netlify**: import the repo, framework "Vite", add the env vars. TanStack Start's Nitro output is detected automatically.
- **Cloudflare Workers**: the current build target already emits a Worker bundle — `wrangler deploy`.
- **VPS / Docker**: `node .output/server/index.mjs` behind nginx.

Add your deployed origin to the Supabase auth redirect allow-list and Google OAuth authorized origins.

---

After migration, verify that the application uses only the new Supabase project and the intended AI provider credentials.
