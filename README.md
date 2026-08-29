# PDF Document Analysis Chatbot

Version 1.0

## Internship Project Summary

This project was developed during an internship as an intelligent document analysis and question-answering system. The application allows users to upload PDF documents, extract their text content, prepare the information for semantic search, and ask questions in natural language. The system then retrieves the most relevant document segments and generates a context-aware answer using an AI model.

The goal of the project was to build a practical proof-of-concept for document intelligence, combining modern web development, database search, and AI-powered reasoning in a single workflow.

Lovable was used to accelerate the initial development of the application by generating the project scaffold, interface structure, and key frontend components, allowing the concept to move quickly from idea to a functional prototype. However, the core technical development of the project—including PDF processing, AI integration, semantic retrieval, database design, and debugging of runtime issues—was completed through custom implementation in the application itself. This combination enabled a rapid and efficient development workflow while ensuring the final solution was technically robust and aligned with the project’s AI-driven document analysis goals.

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
- AI: Google Gemini API
- PDF parsing: PDF.js
- Styling: Tailwind CSS and custom UI components

## Core Features

- User authentication and protected access
- PDF upload and document management
- Text extraction from PDF pages
- Automated document chunking
- Embedding generation for semantic search
- Vector similarity search over document chunks
- AI chat interface grounded in uploaded documents
- Document detail pages and dashboard overview

## Architecture

The application follows a full-stack architecture:

1. The frontend provides the user interface for uploading files and interacting with the chatbot.
2. Server functions process documents, extract text, generate embeddings, and run retrieval.
3. Supabase stores metadata and document chunk data.
4. pgvector enables similarity-based retrieval over embedded content.
5. Gemini is used for both embedding generation and final response generation.

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
