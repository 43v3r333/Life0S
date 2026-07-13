# ADR-001: PostgreSQL as the Canonical Relational Store

## Status
Approved

## Date
2026-07-01

## Context
The LifeOS (Project Jannah) platform requires a highly robust, ACID-compliant database to enforce absolute transaction boundaries and strict relational integrity across core user accounts, double-entry financial ledgers, purified asset pools, and structured planning objectives. Relying on browser-based storage (e.g., `localStorage`, `IndexedDB`) lacks server-side validation, cross-device synchronization, secure query routing, and crash recovery.

## Decision
We select PostgreSQL as the canonical, absolute source-of-truth database for all structural relational tables across the modular monolith. Drizzle ORM will be utilized as the type-safe, lightweight database mapper.

## Alternatives Considered
- **SQLite / File-based (Rejected for Production)**: SQLite is highly efficient for single-user applications, but lacks the scalable multi-connection concurrency, fine-grained access control, and cloud clustering capabilities required for a commercial enterprise SaaS product.
- **NoSQL / MongoDB (Rejected)**: NoSQL databases do not enforce strict schema invariants, double-entry constraint rules, or cascading foreign key updates natively, pushing the transactional burden onto complex and error-prone application code.

## Consequences
- **Absolute Durability**: Ensures all critical financial and spiritual records are safely stored on disk with full transactional safety.
- **Type-Safe Schema Mapping**: Drizzle ORM enables compile-time type-safety for relational schemas.
- **Migration Overhead**: Requires deliberate and version-controlled migration files to adapt database tables as domain aggregate structures evolve.
