# ADR-002: Qdrant Dedicated Vector Engine for Episodic Memory

## Status
Approved

## Date
2026-07-02

## Context
To power the Gabriel Chief of Staff AI and dynamic Digital Twin projections, the platform must ingest chronological audio memos, daily voice reflections, and domestic chat logs, transforming them into high-dimensional vector embeddings. These embeddings enable context-aware semantic retrieval so that Gabriel can synthesize strategic, personalized recommendations.

## Decision
We adopt Qdrant as the dedicated vector search engine, integrated via the official Qdrant Node.js SDK, to store and query all episodic memory indexes.

## Alternatives Considered
- **pgvector Extension (Rejected)**: While pgvector allows storing embeddings directly within PostgreSQL, pgvector shares CPU and memory pools with transactional relational tables. A dedicated Qdrant instance provides superior indexing speed (HNSW), isolated hardware scaling, and optimized payloads for high-throughput multi-tenant SaaS scaling.
- **Pinecone / Cloud NoSQL Vector (Rejected)**: Pinecone is a fully-managed proprietary service. Qdrant is open-source, highly performant, can be self-hosted within single-node container layers, and supports precise boolean payload filtering directly during vector matching.

## Consequences
- **Sub-10ms Queries**: Fast semantic search across millions of memory points.
- **Payload Filtering**: Allows querying memories scoped strictly by user identity, date ranges, or domain context tags without loading vectors into the application layer.
- **Network Decoupling**: Adds a separate vector storage network node that must be monitored for pool starvation.
