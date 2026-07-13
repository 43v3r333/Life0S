# ADR-004: In-Process Event Bus for Module Decoupling

## Status
Approved

## Date
2026-07-04

## Context
Core domain modules (such as IslamOS, StrategyOS, MemoryOS, and AutomationOS) must remain highly decoupled so that individual development workflows are isolated and easy to reason about. However, actions in one module frequently trigger downstream side-effects in other modules (e.g., creating a goal in StrategyOS must trigger vector index generation in MemoryOS, update the Purpose Alignment Score, and sync with GitHub).

## Decision
We implement a robust, lightweight in-process asynchronous Event Bus utilizing Node's native `EventEmitter`. This decouples publishers from direct dependency on subscriber classes.

## Alternatives Considered
- **Direct Service Injection (Rejected)**: Injecting MemoryOS services directly into StrategyOS controllers introduces tight coupling, violating SOLID principles, making independent unit testing highly complex and prone to circular dependency errors.
- **Distributed Brokers (e.g., Kafka / RabbitMQ) (Rejected)**: Distributed brokers introduce significant hosting costs, serialization latency, network partition failure modes, and operational complexity. At this scale, in-process event publishing is more than sufficient.

## Consequences
- **Strict Separation of Concerns**: StrategyOS publishers fire events (e.g., `GoalCreatedEvent`) and immediately return success without knowing or caring how many other modules handle that event.
- **Microsecond Speeds**: Event dispatch is incredibly fast, bypassing all network stack serialization.
- **Resilience Boundary**: Handlers must manage their own catch-blocks and retry policies, as a failing event handler should never interrupt or crash the primary database transaction.
