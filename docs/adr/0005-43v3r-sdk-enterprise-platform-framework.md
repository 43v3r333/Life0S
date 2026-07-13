# ADR 0005: 43v3r.SDK Enterprise Platform Framework Adoption

## Status
Accepted

## Context
As Project Jannah (LifeOS) scales across multiple functional domains (including StrategyOS, FinanceOS, IslamOS, KnowledgeOS, and AutomationOS), duplicating structural components (such as caching strategies, vector indexing logic, event handlers, security screening, logging wrappers, and database writers) poses a severe maintainability threat. We need a standardized core infrastructure layer to guarantee consistency, zero duplicated code, strict type-safety, and uniform API compliance across all bounded contexts.

## Decision
We adopted the **43v3r.SDK** as the universal internal platform framework for Project Jannah. The SDK provides:
1. **DDD Primitives**: Standardized `Entity`, `AggregateRoot`, and `ValueObject` base classes ensuring uniform domain logic.
2. **MediatR-like Pipeline**: An extensible, synchronous/asynchronous `Mediator` that runs commands/queries through robust decorators (Logging, Authorization, Fluent Validation, Performance checks, Caching, and Transaction boundaries).
3. **Multi-Tenant Isolation**: Automated `TenantContext` propagation that scopes queries and prevents multi-customer database leakage.
4. **Generalized Repositories**: Concrete `Repository<T>`, `CachedRepository<T>` (Redis-backed), `VectorRepository<T>` (Qdrant-backed), and `AuditRepository<T>` classes.
5. **Robust Event Bus**: An integration event dispatcher supporting prioritization, exponential-backoff retries, and dead-letter queue routing.
6. **AI Pipeline Gateway**: A strict 8-stage execution client routing model queries cleanly while hiding secret API keys.
7. **Consolidated OpenAPI Compiler**: An endpoint metadata register that compiles the full system specification dynamically on the fly.

## Consequences
* **Extensibility**: Adding a new bounded context (like `FinanceOS` or `IslamOS`) can now be done in minutes with zero structural friction.
* **Consistency**: All domains share the exact same error models, logging formats, transaction guarantees, and caching algorithms.
* **Performance**: Performance bottlenecks are caught immediately at the mediator level via centralized metric logging.
* **Coupling**: Domains are decoupled from individual databases and integrations, depending solely on the SDK interfaces.
