# PDF Document Analysis Chatbot

Version 1.0

## Internship Project Summary

This project was developed during an internship as an intelligent document analysis and question-answering system. The application allows users to upload PDF documents, extract their text content, prepare the information for semantic search, and ask questions in natural language. The system then retrieves the most relevant document segments and generates a context-aware answer using an AI model.

The goal of the project was to build a practical proof-of-concept for document intelligence, combining modern web development, database search, and AI-powered reasoning in a single workflow.

Lovable was used only during the initial scaffolding and early UI prototyping phase to help accelerate the project’s launch. The final application was then developed and refined independently, with custom implementation across PDF processing, AI integration, semantic retrieval, database design, and runtime debugging. As a result, the project is fully independent from Lovable in its current form and does not rely on Lovable-specific code, tooling, or runtime configuration.

## Project Objective

The main objective was to create a full-stack application capable of:

- Uploading and storing PDF documents
- Extracting text from uploaded files
- Splitting content into meaningful chunks
- Generating vector embeddings for semantic retrieval
- Searching relevant information using similarity-based matching
- Answering user questions through an AI chatbot with contextual grounding

## Technologies Used

- Frontend: React, TypeScript, TanStack Start
- Backend: Node.js server functions
- Database: Supabase + PostgreSQL
- Search: pgvector with halfvec embeddings
- AI: Google Gemini or an OpenAI-compatible API
- PDF parsing: PDF.js
- Styling: Tailwind CSS and custom UI components

## Core Features

- User authentication and protected access
- PDF upload and document management
- PDF text extraction with PDF.js, followed by metadata and overview generation
- Validation of AI-generated metadata against report text, with explicit PDF labels used to fill missing fields
- Review notices when AI fields are rejected or a model is unavailable or rate-limited
- Text chunking and embedding generation for semantic search
- Vector similarity search across indexed report chunks
- AI answers grounded in retrieved passages, with links back to the relevant reports
- Duplicate-upload detection per user using a SHA-256 file hash
- Document detail pages and dashboard overview

## What Happens When a Report Is Uploaded

1. The signed-in user's PDF is stored in Supabase Storage and its text is extracted in the browser with PDF.js.
2. The extracted text is sent to an authenticated server function. The server checks document ownership before processing it.
3. AI models propose report metadata and a short overview. Proposed values are validated against the report text; unsupported values are rejected. If AI metadata is incomplete or unavailable, deterministic extraction fills only fields found under explicit labels in the PDF, and the document is marked for review when appropriate.
4. The report text is split into chunks, embedded, and indexed in PostgreSQL with pgvector. Processing is capped at 200 chunks per report.
5. The library displays the analyzed report. Semantic search and question answering retrieve relevant chunks from indexed reports to ground their results.

AI model and endpoint settings are configurable through server environment variables. Gemini is supported directly; other providers can be used through an OpenAI-compatible endpoint. Ollama can optionally provide local embeddings independently of the chat provider; its embedding model unloads after a configurable idle timeout, and CPU threads can be capped with `AI_OLLAMA_NUM_THREADS`. Provider quotas and availability still apply. See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup and environment configuration.

## Architecture

The application follows a full-stack architecture:

1. The frontend provides the user interface for uploading files and interacting with the chatbot.
2. PDF.js extracts report text; authenticated server functions validate ownership, generate metadata, create embeddings, and run retrieval.
3. Supabase stores metadata and document chunk data.
4. pgvector enables similarity-based retrieval over embedded content.
5. A configured AI provider generates embeddings, metadata, summaries, and context-grounded answers.

## Key Challenges Solved

During implementation, several technical issues were addressed, including:

- SSR compatibility problems in the frontend build pipeline
- PDF worker configuration issues when extracting text
- JSON parsing errors from AI responses wrapped in Markdown fences
- PostgreSQL vector type issues related to schema-qualified pgvector usage

These challenges were resolved through targeted configuration updates and database migration fixes, enabling the application to function reliably end-to-end.

## Project Outcome

The final solution successfully demonstrates an AI-driven document analysis workflow that transforms uploaded PDFs into searchable knowledge. It gives users a practical interface for retrieving information from documents using natural language queries, which highlights the value of combining retrieval systems with modern language models.

## Future Improvements

- Batch upload support for multiple documents
- Better document summarization features
- More advanced ranking and filtering for search results
- Improved dashboard analytics
- Support for additional file formats beyond PDF

## Internship Reflection

This project helped strengthen understanding of:

- Full-stack application development
- AI integration in real-world systems
- Vector databases and semantic search
- Debugging production-level issues in software pipelines
- Building practical solutions from research concepts into usable products

---

Prepared as part of an internship project.
