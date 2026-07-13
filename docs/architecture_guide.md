# StrategyOS / Project Jannah — Unified Enterprise Architecture Guide
This document serves as the canonical architectural guide for **Project Jannah (LifeOS) v6.1**. It outlines the structural design, boundaries, and components of the Modular Monolith powered by the **43v3r.SDK** platform framework.

---

## 1. High-Level Modular Monolith & Shared SDK Topology

Our platform is constructed as a **Modular Monolith** with a shared core infrastructure library (**43v3r.SDK**). Bounded contexts (such as `StrategyOS`, and future slices like `FinanceOS` or `IslamOS`) are strictly segregated from one another but depend directly on the SDK to access transactional system capabilities.

```mermaid
graph TD
    %% Clients
    Browser[React Browser SPA Client] -->|HTTP REST Routes| API[Express Gateway Router node]
    
    %% Bounded Contexts
    subgraph Bounded_Contexts [Bounded Contexts Domain Modules]
        StrategyOS[StrategyOS Goals Domain]
        FinanceOS[FinanceOS Accounting Domain]
        IslamOS[IslamOS Deen Domain]
    end
    
    %% API connections
    API --> StrategyOS
    API -.-> FinanceOS
    API -.-> IslamOS
    
    %% Shared SDK Layer
    subgraph SDK [43v3r.SDK Core Framework Layer]
        CQRS[CQRS Mediator]
        DB[Repository & Audit Layer]
        EventBus[Priority Event Bus]
        AI[AI Gateway Client]
        Search[Hybrid Search Engine]
        Jobs[Background Job Engine]
        Tenant[Tenant Context Scope]
    end

    %% Bounded context to SDK connections
    StrategyOS --> SDK
    FinanceOS -.-> SDK
    IslamOS -.-> SDK
    
    %% Infrastructure Dependencies
    subgraph Infra [Platform Infrastructure Services]
        Postgres[(PostgreSQL Canonical Store JSON)]
        Redis[(Redis Cache Map Store)]
        Qdrant[(Qdrant Vector DB Simulator)]
    end
    
    SDK --> Postgres
    SDK --> Redis
    SDK --> Qdrant
```

---

## 2. Generic MediatR-style CQRS Pipeline Architecture

The `Mediator` pattern decouples command/query triggers from state processors. Before reaching the actual `IRequestHandler`, requests pass through a sequence of sequential pipeline behaviors (decorators) to handle concerns like authorization screening, fluent schema checking, performance alerts, caching, transaction boundaries, and auditing.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client / API Router
    participant Mediator as Mediator Core
    participant Auth as AuthorizationBehavior
    participant Val as ValidationBehavior
    participant Perf as PerformanceBehavior
    participant Cache as CachingBehavior
    participant Tx as TransactionBehavior
    participant Handler as IRequestHandler

    Client->>Mediator: send(Command/Query)
    Mediator->>Auth: handle(request)
    note over Auth: Screen operator roles & clearance
    Auth->>Val: handle(request)
    note over Val: Run Fluent validations & assert rules
    Val->>Perf: handle(request)
    note over Perf: Start millisecond timer
    Perf->>Cache: handle(request)
    alt is Cacheable Query & cache hit
        Cache-->>Perf: return Cached Value
    else cache miss / mutating command
        Cache->>Tx: handle(request)
        note over Tx: Begin database transaction state frame
        Tx->>Handler: handle(request)
        note over Handler: Execute Domain Business Logic
        Handler-->>Tx: return Domain Result
        note over Tx: Commit changes to disk DB
        Tx-->>Cache: return Result
        note over Cache: Cache query response if applicable
        Cache-->>Perf: return Result
    end
    note over Perf: Log slow query alert if >500ms
    Perf-->>Val: return Result
    Val-->>Auth: return Result
    Auth-->>Mediator: return Result
    Mediator-->>Client: return Result / ProblemDetails
```

---

## 3. The 8-Stage AI Platform Gateway Routing Architecture

No features may directly call the Google Gemini API. Instead, all AI prompts must route through our unified, structured **AI Gateway Pipeline**.

```mermaid
graph TD
    Input[userInput Text Parameter] --> Stage1[Stage 1: Intent Detection]
    Stage1 --> Stage2[Stage 2: Context Memory Retrieval]
    Stage2 --> Stage3[Stage 3: Prompt Builder Construction]
    Stage3 --> Stage4[Stage 4: Model Router Allocation]
    Stage4 --> Stage5[Stage 5: Tool Execution Callback]
    Stage5 --> Stage6[Stage 6: Output Schema Validation]
    Stage6 --> Stage7[Stage 7: Structured Output Assembly]
    Stage7 --> Stage8[Stage 8: Final Pipeline Result Response]
    
    %% Connections to external systems
    Stage2 <-->|Database Reads| DB[(DbState Store Memory)]
    Stage4 <-->|Google GenAI SDK API| Gemini[Gemini 2.5/1.5 Models]
    Stage6 -->|Validation Fail| Problem[ProblemDetails Generator]
```

---

## 4. Multi-Tenant Logical Partitioning Invariant

Project Jannah is fundamentally multi-tenant. This constraint is guarded automatically by the system:
1. **Implicit Partitioning**: All tables/entities inherit from `Entity` which contains `tenantId`.
2. **Context Propagation**: `TenantContext` tracks active tenant scopes on every transaction.
3. **Automatic Filtering**: Queries executed through `IRepository` automatically append `TenantId === currentTenantId` logic, shielding customer data boundaries from leakage.
4. **Soft-Delete Shielding**: Deleted entities have `isDeleted = true` and are automatically omitted from standard queries unless specifically requested by an operator with administrator clearance levels.
