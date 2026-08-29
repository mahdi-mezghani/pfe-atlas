# Implementation Details

## Overview

This document describes the technical implementation of the PDF document analysis chatbot and the main engineering decisions behind it.

## 1. System Architecture

The system is structured around a typical AI document retrieval pipeline:

- The user uploads a PDF document through the frontend interface.
- The uploaded file is processed in the server layer.
- PDF text is extracted page by page.
- Text is cleaned and segmented into smaller chunks.
- Each chunk is converted into an embedding vector.
- The vectors are stored in PostgreSQL using pgvector.
- Users ask natural-language questions.
- Relevant chunks are retrieved using similarity matching.
- The AI model generates a contextual response based on those chunks.

## 2. Frontend

The frontend was implemented in React and TypeScript with TanStack Start. It provides the user-facing flow:

- Authentication
- Dashboard
- Document viewing
- Chat interaction
- Upload and processing workflow

This ensures a clean user experience while keeping the business logic in a server layer.

## 3. Backend Processing

The backend is responsible for the heavy logic:

- Reading uploaded files
- Extracting text from PDFs
- Cleaning and normalizing content
- Chunking large documents into manageable segments
- Generating embeddings
- Querying the vector database
- Sending the retrieved context to Gemini for final answer generation

The server-side logic is organized to keep processing steps explicit and maintainable.

## 4. PDF Extraction

The project uses PDF.js for extracting text from PDF files. This required careful configuration because the library depends on a worker file, and the worker URL had to be configured correctly to avoid runtime failures.

This was one of the first major technical fixes in the project and was essential for reliable document upload handling.

## 5. AI and Embeddings

The system uses Google Gemini for two purposes:

- Embedding generation for document chunks
- Final answer generation based on retrieved context

Gemini integration required handling response formatting carefully because AI outputs were occasionally wrapped in Markdown code fences. A parsing layer was added to clean these outputs before converting them into JSON objects.

## 6. Vector Search with pgvector

To support semantic retrieval, document chunks were embedded and stored in PostgreSQL using pgvector. The similarity search uses vector distance calculations to identify the most relevant chunks for a given question.

A key challenge was ensuring proper database compatibility with the vector extension and schema configuration. The project resolved this by updating the SQL function and using the correct schema-qualified vector type/operator references.

## 7. Data Flow

The complete workflow can be summarized as follows:

1. User uploads PDF
2. Text is extracted
3. Content is cleaned and chunked
4. Chunks are embedded
5. Embeddings stored in database
6. User asks a question
7. Question is embedded and matched against stored vectors
8. Relevant passages are retrieved
9. Retrieved context is sent to Gemini
10. Response is returned to the user

## 8. Challenges and Fixes

### SSR Build Issue
A compatibility issue occurred between the project's Vite configuration and React during SSR evaluation. This was resolved by adjusting the build configuration and externalizing React-related modules appropriately.

### PDF Worker Error
The PDF.js library initially failed because the worker source was not configured. This was fixed by explicitly setting the worker URL from the installed package.

### AI Response Parsing
Model outputs were not consistently valid JSON; some were wrapped in markdown fences. A parsing utility was added to strip the fences and parse the remaining JSON safely.

### Database Vector Type Issue
The vector search function initially failed because the halfvec type was not being referenced with the correct schema qualification. A migration was added to ensure that the database function used the correct PostgreSQL extension types and operators.

## 9. Engineering Learnings

This project provided valuable experience in:

- Integrating AI with retrieval systems
- Managing end-to-end data flow in a full-stack app
- Handling runtime issues during integration
- Debugging database schema and extension compatibility
- Creating robust parsing and validation layers around AI output

## 10. Result

The project successfully demonstrates a working AI-based document search system that connects user interaction, PDF processing, semantic retrieval, and language model reasoning in one coherent application.
