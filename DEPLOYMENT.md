# Deployment and Setup Guide

Version 1.0

## Requirements

Before running the project, make sure the following are available:

- Node.js and npm
- Access to a Supabase project
- A Google Gemini API key
- A working environment for local development or deployment

## Environment Variables

Create a `.env` file in the project root with the required values, including:

```env
AI_GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You may also need additional configuration depending on project use cases and deployment environment.

### Optional local Ollama embeddings

To keep Gemini for chat and summaries while generating embeddings locally with Ollama, install and run Ollama on the same machine as the app server, pull the embedding model, and add:

```env
AI_EMBEDDING_PROVIDER=ollama
AI_OLLAMA_BASE_URL=http://localhost:11434
AI_OLLAMA_EMBEDDING_MODEL=qwen3-embedding:latest
AI_OLLAMA_KEEP_ALIVE=60s
AI_OLLAMA_NUM_THREADS=4
```

Ollama keeps the model loaded for 60 seconds after its last embedding request, then unloads it. `AI_OLLAMA_KEEP_ALIVE` accepts an Ollama duration such as `30s` or `2m`. The default thread cap is four; lower `AI_OLLAMA_NUM_THREADS` to reduce CPU use further, or raise it if embedding speed is more important. The app requests 3,072 dimensions to match the current pgvector schema. Re-upload or reprocess every document after changing embedding models, and use the same configured model for document chunks and search queries. For a remote app server, `localhost` refers to that server, not your computer; configure a reachable Ollama URL and secure it appropriately.

### Document privacy and request limits

Apply all SQL migrations in `supabase/migrations` before deploying. Extracted full-document text is processed in memory and is not retained in the documents table; the migration removes any previously stored `raw_text` values and column. The original PDF and indexed chunks remain stored because they are needed for document viewing and search.

Authenticated users are limited per hour to 10 PDF uploads, 10 document records, 5 document-processing requests, 30 report questions, and 60 semantic searches. The upload and document-record limits are also enforced in Supabase Storage and the database, not only in the browser. Rate-limit records are maintained by the database.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Then open the application in the browser using the local port reported by the development server.

## Database Setup

1. Link the project to a Supabase instance.
2. Run the migration files located in the `supabase/migrations` directory.
3. Confirm that the pgvector extension is enabled.
4. Ensure the search function and vector schema are correctly configured.

## Building for Production

```bash
npm run build
```

## Production Notes

- Keep environment variables secure and never commit them to version control.
- Use proper secret management in deployment environments.
- Validate migrations before moving to a production database.
- Keep the AI API key and database credentials protected.

## Troubleshooting

### Build or Runtime Errors
- Check the installed dependency versions.
- Confirm the environment variables are present and valid.
- Retry database migrations after verifying the Postgres extension setup.

### PDF Upload Failures
- Confirm the PDF.js worker is correctly configured.
- Ensure the uploaded file is a valid PDF.

### Search or AI Response Failures
- Check database connectivity and vector table setup.
- Verify that the Gemini API key is valid and active.
- Confirm that the matching function is using the correct schema-qualified types.

---

This project is intended to be run in a secure environment with proper credentials and database configuration.
