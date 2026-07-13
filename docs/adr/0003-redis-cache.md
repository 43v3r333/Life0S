# ADR-003: Redis as the High-Performance Hot-Key Cache

## Status
Approved

## Date
2026-07-03

## Context
Frequently read parameters, such as the active user's current Digital Twin vitality scores, active session tokens, and temporary rate-limiting counters, create redundant database read workloads. Hitting PostgreSQL for ephemeral or heavy read-heavy values introduces unnecessary query latency and degrades overall transaction throughput.

## Decision
We deploy Redis as the standard high-performance hot-key in-memory cache and session state provider.

## Alternatives Considered
- **In-Memory Cache (e.g., node-cache) (Rejected)**: Local Node process caches are ephemeral, cannot survive container restarts, and prevent horizontal scalability across multiple application server instances.
- **Memcached (Rejected)**: Memcached is a simple string cache. Redis was selected for its advanced data structures (hashes, lists, sorted sets), built-in PubSub, and optional persistence features.

## Consequences
- **Ultra-low Latency**: Ephemeral states, session lookups, and rate-limiting flags are retrieved in sub-millisecond ranges.
- **Resource Relief**: Offloads high-frequency read traffic from the relational PostgreSQL layer.
- **Additional Node**: Requires configuring Redis connection pools and fallback handling to maintain system resilience during cache node restarts.
