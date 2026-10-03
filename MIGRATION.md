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

For Gemini, metadata extraction first tries low-cost models in order: `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3-flash-preview`, `gemini-2.5-flash`, then `gemini-2.5-flash-lite`. If metadata fails validation, correction attempts use `gemini-3.8-flash`, then `gemini-3.7-flash`, then `gemini-3.6-flash`, stopping as soon as validation passes. A model-specific Gemini quota (429) response causes that exact model to be skipped for 24 hours by the current server process; project-wide quota errors do not cool down individual models. This cooldown is in memory and resets when the server process restarts; deployments with multiple server processes need shared cooldown storage for cross-process enforcement. Summaries are intended to be self-contained overviews of roughly 140–200 words, drawing on the report's problem, approach, implementation, and reported findings; summaries that fall outside the broader length/sentence validation checks trigger model correction. If metadata still has validation issues, validated AI fields are preserved and deterministic values from explicitly labeled PDF text fill only missing fields. If no AI fields were accepted, the app falls back entirely to explicit PDF values, including keyword lines, technology lists, and technology/role tables. Technologies and keywords remain required; if the PDF provides no explicit evidence for either, the values are left empty and the document is flagged for review rather than populated with guesses. Set `AI_METADATA_INITIAL_MODELS` or `AI_METADATA_RETRY_MODELS` to override either comma-separated model order. The older singular `AI_METADATA_INITIAL_MODEL` and `AI_METADATA_RETRY_MODEL` settings are still accepted. Each call targets only its configured model, without silently falling through to other Gemini models. For non-Gemini providers, set the model variable(s) to provider-supported names to enable the same strategy. Older records may still contain values produced by the previous heuristic fallback behavior.

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
