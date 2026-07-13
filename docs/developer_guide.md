# StrategyOS Goals Domain - Developer & Architecture Guide

Welcome to the canonical developer guide for StrategyOS **Goals Domain**. This module is constructed as the premier Vertical Slice template for all other systems within LifeOS (Project Jannah). 

---

## 1. Architectural Summary

StrategyOS follows **Clean Architecture** combined with **Vertical Slice Architecture**, **CQRS (Command Query Responsibility Segregation)**, and **Domain-Driven Design (DDD)**.

```
                    +-----------------------------+
                    |    React Client Workspace   |
                    +--------------+--------------+
                                   |
                         [REST Gateway Router]
                                   v
                    +--------------+--------------+
                    |       server.ts (API)       |
                    +-------+--------------+------+
                            |              |
           [Command Handler]|              |[Query Handler]
                            v              v
               +------------+----+    +----+------------+
               |  Postgres DB     |    |  Redis Cache    |
               |  (Primary Store) |    |  (Dashboard)    |
               +------------+-----+    +----+------------+
                            |               |
               [Event Bus]  |               | [Query Embeddings]
                            v               v
               +------------+----+    +-----+-----------+
               |   AI Pipeline   |    | Qdrant Semantic |
               | (PAS Forecast)  |    |     Memory      |
               +-----------------+    +-----------------+
```

### Core Technologies
- **Postgres DB Layer**: Atomic reads and writes representing the canonical database truth.
- **Redis Cache Store**: High-performance caching for heavy analytical aggregates (e.g. Dashboard stats).
- **Qdrant Vector Database**: Neural text embeddings facilitating semantic match context queries.
- **In-Process Event Bus**: Synchronous/Asynchronous event dispatcher handling domain triggers.
- **Google GenAI Integration**: Modern Gemini API SDK proxy calculates Purpose Alignment Scores (PAS) and risk predictions.

---

## 2. Bounded Context & Aggregates

The core entity is the **Goal** aggregate root:

```typescript
export interface Goal {
  id: string;
  title: string;
  type: string;                  // e.g. Business, Spiritual, Waqf
  priority: string;              // Low, Medium, High, Highest, Critical
  status: string;                // Active, Paused, Completed, Archived
  progress: number;              // 0 to 100%
  targetDate: string;            // ISO Date
  smartDefinition: string;
  okrObjective: string;
  kpis: string[];
  northStar: string;
  risk: string;
  dependencies: string[];        // Array of dependent Goal IDs
  parentGoal?: string;           // Optional link to parent goal
  purpose: string;
  tags: string[];
  notes: string;
  milestones: Milestone[];
  purposeAlignmentScore?: number; // Calculated dynamically by Gemini API
  aiForecast?: string;
  aiRecommendations?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  mandatory: boolean;            // Completion block rule if true
}
```

---

## 3. Strict Domain Invariants

To keep the domain highly cohesive and robust, the following business logic rules are evaluated strictly:

1. **Completion Prerequisite**: Toggling a Goal to `Completed` is rejected by the transaction boundary if there are any `mandatory` Milestones that remain uncompleted.
2. **Dependency Deletion Block**: A Goal cannot be deleted if there are other goals in the system that explicitly list it in their `dependencies` array.
3. **Parent-Child Progress Sync**: When a child goal updates its progress or is completed, the parent goal's progress is automatically recalculated as the arithmetic mean of all child goal nodes.
4. **Active Archive Block**: Archiving a goal is blocked unless its current status is either `Completed` or has been explicitly `Paused`.

---

## 4. CQRS Routing Map

### Queries (Read Models)
- `GET /api/goals`: Retrieves list with filters. Invalidates cache appropriately.
- `GET /api/goals/dashboard`: Aggregated metrics. Hydrated by the fast Redis cache store if hit.
- `GET /api/goals/search`: Passes embedding queries to Qdrant vector store.

### Commands (State Mutators)
- `POST /api/goals`: Creates new aggregate, raises `GoalCreatedEvent`.
- `POST /api/goals/:id/complete`: Executes milestone invariant checks, fires completions.
- `DELETE /api/goals/:id`: Checks active dependents, removes record.

---

## 5. Observability & Tracing

Our vertical slice integrates full **Structured Logging** and **Audit Trails**:
- Every command logs its transactional lifecycle.
- Changes to critical goal parameters append records directly to the retrospective audit log.
- Cache misses and hits are recorded in real-time, displaying caching efficiency metrics.
