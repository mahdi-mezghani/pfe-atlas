# Migrating PFE Atlas off Lovable

This app is a plain TanStack Start (React 19 + Vite 7) project talking to a Postgres/Supabase backend. Nothing in the app logic is Lovable-specific except three things: the managed backend, the AI gateway, and the Google OAuth broker. Below is the full move.

---

## 1. Get the code

Connect GitHub in the Lovable project (Settings → GitHub) and push, or download the project as a zip. Then locally:

```bash
npm install
npm run dev     # http://localhost:8080
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

Export your current data from Lovable: **Cloud → Advanced settings → Export data**. Import the CSVs into the new tables (`documents` first, then `technologies`, `keywords`, `chunks`). Files in the `pfe-reports` bucket must be downloaded and re-uploaded to the new bucket at the same paths (`<user_id>/<file>.pdf`), otherwise re-upload the PDFs through the app and let it re-process them.

## 3. Replace the AI gateway

`src/lib/ai.server.ts` now supports any OpenAI-compatible provider. Set:

```bash
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_CHAT_MODEL=gpt-4o
AI_EMBEDDING_MODEL=text-embedding-3-large     # must be 3072 dims
```

⚠️ If you pick an embedding model with a different dimension, change `vector(3072)` in the schema (and the halfvec index/`match_chunks` casts) to match, and re-embed all chunks.

If `AI_API_KEY` is unset the code falls back to `LOVABLE_API_KEY` + the Lovable gateway.

## 4. Environment variables

Create `.env` (local) and set the same in your host's dashboard:

```bash
# client (bundled into the browser build)
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
VITE_SELF_HOSTED=true          # uses Supabase Google OAuth instead of the Lovable broker

# server only
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
AI_BASE_URL=...
AI_API_KEY=...
```

Never expose the service-role key to the client.

## 5. Optional cleanup

Once `VITE_SELF_HOSTED=true` works you can delete `src/integrations/lovable/`, `src/lib/lovable-error-reporting.ts` (and its import in `src/routes/__root.tsx`), and `npm remove @lovable.dev/cloud-auth-js`.

## 6. Deploy

The app SSRs, so it needs a Node/edge host — not static hosting.

```bash
npm run build
```

- **Vercel / Netlify**: import the repo, framework "Vite", add the env vars. TanStack Start's Nitro output is detected automatically.
- **Cloudflare Workers**: the current build target already emits a Worker bundle — `wrangler deploy`.
- **VPS / Docker**: `node .output/server/index.mjs` behind nginx.

Add your deployed origin to the Supabase auth redirect allow-list and Google OAuth authorized origins.

---

Note: the Lovable Cloud backend attached to the original project cannot be detached — after migrating, just stop pointing the app at it.
