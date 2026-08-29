# Deployment and Setup Guide

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
