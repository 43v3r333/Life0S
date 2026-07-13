# Project Jannah: Life Kernel & Cognitive Core Specifications

This specification details the enterprise architecture, operational pipelines, and design invariants of the **LifeOS Life Kernel & Cognitive Core**. 

All diagrams are fully rendered using **Mermaid**.

---

## 1. System Topology & Kernel Architecture

The Life Kernel serves as the central orchestration bus. All business modules—such as Islam, Health, Finance, and Marriage—interface exclusively via event subscription and command contracts.

```mermaid
graph TD
    subgraph Frontend [Presentation Layer - React UI]
        UI[App.tsx Dashboard]
        Sandbox[Chief of Staff Sandbox]
    end

    subgraph LifeKernel [Cognitive Core & Central Runtime]
        Registry[Module Registry]
        Bus[LifeKernelEventBus]
        Store[EventStore & DLQ]
        Context[Context Engine]
        Memory[Memory Engine]
        Graph[Life Graph Engine]
        Policy[Policy Engine]
        Decision[Decision Engine]
    end

    subgraph IndependentModules [Independent Business Modules]
        Islam[Deen/Salah Module]
        Marriage[Marriage & Family Module]
        Health[Athletic/Health Module]
        Finance[Halal Wealth Module]
    end

    UI -->|API Requests| Sandbox
    Sandbox -->|Orchestration Queries| LifeKernel
    IndependentModules -->|Publishes Events| Bus
    Bus -->|Routes to Consumers| IndependentModules
    Registry -->|Topological Loading| IndependentModules
    Context -->|Assembles Frames| Memory
    Decision -->|Queries Rules| Policy
    Graph -->|Maps Nodes| Memory
```

---

## 2. Event System Pipeline

The Event system implements a durable Event Store, exponential backoff retries, and a Dead Letter Queue (DLQ) for fault management.

```mermaid
sequenceDiagram
    autonumber
    participant Publisher as Business Module
    participant Bus as LifeKernelEventBus
    participant Store as EventStore
    participant Policy as RetryPolicy
    participant Consumer as Module Subscriber
    participant DLQ as DeadLetterQueue

    Publisher->>Bus: Publish(DomainEvent)
    Bus->>Store: AppendEvent(EventRecord)
    Note over Store: Global sequence incremented & persistent logging
    Bus->>Policy: DispatchToSubscriber(event)
    loop Retry Cycle (Max 3 attempts)
        Policy->>Consumer: HandleAsync()
        alt Handle Success
            Consumer-->>Policy: OK
            Note over Policy: Event successfully consumed
        else Handle Fails
            Consumer-->>Policy: Exception
            Note over Policy: Wait 2^attempt * baseDelay
        end
    end
    alt Max Attempts Exhausted
        Policy->>DLQ: Enqueue(FailedEvent, StackTrace)
        Note over DLQ: Log alert for offline human/AI remediation
    end
```

---

## 3. Cognitive Memory Engine

The Memory Engine splits historical records into multi-layer retrieval zones. A background lifecycle sweep decreases the recall probability of inactive short-term transactional memories over time.

```mermaid
graph TD
    Input[Incoming Event / Interaction] -->|Ingests| Manager[MemoryManager]
    Manager -->|Indexes metadata| Indexer[MemoryIndexer]
    Indexer -->|Store Vector| Qdrant[(Qdrant Vector Database)]
    Indexer -->|Store Relational| SQL[(Microsoft SQL Server)]

    subgraph MemoryLayers [Memory Layers]
        Working[Working Memory]
        ShortTerm[Short-Term Memory]
        LongTerm[Long-Term Memory]
        Semantic[Semantic Rules]
        Episodic[Episodic Log]
    end

    Manager --> Working
    Working -->|Consolidates after 24 hrs| ShortTerm
    ShortTerm -->|Decay sweeps / Low Recall| LongTerm
    LongTerm -->|Summarized via AI| Semantic

    subgraph Lifecycle [Memory Lifecycle Manager]
        Decay[Apply Linear Decay: RecallScore - 0.02 * Days]
        Pruning[Remove Expired Nodes]
        Consolidation[Run AI-Driven Compaction]
    end

    Decay --> ShortTerm
    Pruning --> ShortTerm
    Consolidation --> LongTerm
```

---

## 4. Context Engine & Prompt Assembler

The Context Engine aggregates scattered variables, filters out instructions injection, scores relevance, and minifies JSON payloads to fit the 4KB token budget of Gabriel CoS.

```mermaid
graph LR
    subgraph Aggregation [1. Context Gathering]
        Sensors[Biometrics Logs]
        Cal[Calendar Appointments]
        Faith[Deen/Salah Logs]
        Wealth[Savings Metrics]
    end

    subgraph Processing [2. Context Pipeline]
        Val[ContextValidator] -->|Sanitize prompt injection| Score[ContextScorer]
        Score -->|Rank by Relevance: Importance - Decay| Comp[ContextCompressor]
        Comp -->|JSON Minification under 4KB budget| Assembly[Prompt Token Injection]
    end

    Sensors --> Val
    Cal --> Val
    Faith --> Val
    Wealth --> Val
    Assembly -->|Gabriel CoS Input| Gemini[Gemini API]
```

---

## 5. Life Graph Topology

The Life Graph represents a mathematical model of Ethan’s life. All nodes and directional relationship arcs are validated against structural cycles.

```mermaid
graph TD
    subgraph Nodes [Graph Node Taxonomy]
        P[Person: Ethan]
        G[Goal: Halal SaaS Studio]
        H[Habit: Gym Routine]
        M[Meeting: Design Review]
        J[Journal: Morning Reflection]
        K[Knowledge: Clean Architecture]
    end

    subgraph Arcs [Relationship Taxonomy]
        P -->|Owns| G
        G -->|DependsOn| K
        P -->|Participated| M
        H -->|Supports| G
        J -->|ConnectedTo| K
    end
```

---

## 6. Goal Engine Cascade

Goals cascade down from high-level, long-term visions into monthly projects and daily execution habits, ensuring alignment.

```mermaid
graph TD
    Vision[Life Vision: Eternal Success] -->|Translates to| Mission[Mission: Build halaal high-impact tech]
    Mission -->|Milestones| TenYear[10-Year Goals: Financial Freedom]
    TenYear --> Annual[Annual Goals: Launch Core Runtime]
    Annual --> Quarterly[Quarterly Goals: Phase 2 Kernels]
    Quarterly --> Monthly[Monthly Sprints: Complete Event Bus]
    Monthly --> Weekly[Weekly Sprints: Code EventBus.cs]
    Weekly --> Habits[Daily Habits: Salah on Time & Gym]
    
    subgraph Forecaster [Goal Completion Forecaster]
        Calc[Velocity: % progress per week] --> Project[Project completion date]
    end

    Weekly --> Calc
```

---

## 7. Decision Engine Pipeline

Strategic decisions undergo a robust, multi-stage assessment before being approved and logged.

```mermaid
graph TD
    Question[Receive Strategic Question] --> Context[Gather Active Context]
    Context --> Retrieval[Retrieve RAG Vector Memories]
    Retrieval --> Policy[Evaluate Policy Invariants]
    Policy --> Cost[Analyze Costs: Opportunity, Time, Energy]
    Cost --> Impact[Analyze Halal Financial Impact]
    Impact --> Risk[Quantify Risk Factors]
    Risk --> Alignment{Is Islamic Aligned?}
    
    Alignment -->|No| Reject[REJECT: Absolute Non-Compliance]
    Alignment -->|Yes| Score[Calculate Alignment Score]
    
    Score --> Recommendation[Formulate Recommendation]
    Recommendation --> Confidence[Calculate Confidence Score]
    Confidence --> Store[Store Outcome in Audit Ledger]
```

---

## 8. AI Orchestrator Core

Gabriel is supported by specialized sub-agents. Agentic requests that violate financial limits are escalated to the Chief of Staff.

```mermaid
graph TD
    subgraph GabrielCoS [Chief of Staff - Gabriel]
        G[Gabriel Orchestrator Runtime]
    end

    subgraph Specialists [Specialist Agent Clones]
        A1[IslamicAdvisor / Deen Coach]
        A2[FinanceAdvisor / Halal Wealth]
        A3[MarriageAdvisor / Family]
        A4[HealthAdvisor / Vitality]
        A5[StrategicPlanner / Sprints]
        A6[SoftwareArchitect / Code Invariants]
    end

    A1 -->|Escalate on Conflict| G
    A2 -->|Escalate on >$0 Expense| G
    A3 -->|Escalate on Schedule Overlap| G
    
    subgraph Telemetry [Agent Telemetry Logs]
        T1[Token Volume Trackers]
        T2[Latency Benchmarks]
        T3[Failure Alarms]
    end

    G --> Telemetry
```

---

## 9. Policy Invariant Checks

The Policy Engine checks proposed schedule changes or actions against immutable life constraints.

```mermaid
graph TD
    Action[Proposed Schedule Slot / Financial Expense] --> Registry[PolicyRegistry]
    
    subgraph Rules [Immutable Life Rules]
        R1[Never miss Salah - Blocking]
        R2[No meetings during prayer times - Critical]
        R3[Gym 4 times weekly - Warning]
        R4[Save minimum 20% - Critical]
        R5[Evening family bonding hours - Warning]
    end

    Registry --> R1
    Registry --> R2
    Registry --> R3
    Registry --> R4
    Registry --> R5

    R1 --> Evaluator[PolicyEvaluator]
    R2 --> Evaluator
    R3 --> Evaluator
    R4 --> Evaluator
    R5 --> Evaluator

    Evaluator --> Audit[Write to PolicyAudit Logs]
    Evaluator --> Enforce{Is Blocked?}
    Enforce -->|Yes| Alert[Trigger Correction / Notify Gabriel]
    Enforce -->|No| Commit[Commit Proposed Slot]
```

---

## 10. Plugin Loader (Topological Sort)

Modules are registered dynamically at startup and ordered based on their dependency declarations.

```mermaid
graph TD
    Scan[Scan Assemblies for IModule] --> Build[Build Dependency Directed Graph]
    Build --> Loop{Topological Sort Loop}
    Loop -->|Detect Cycle| Cycle[Throw InvalidOperationException]
    Loop -->|Success| Load[Initialize Modules sequentially]
    
    subgraph ActiveRegistry [Active Module Registry]
        Database[Database Module: loaded first] --> Faith[Faith Module: loaded second]
        Faith --> Health[Health Module: loaded third]
    end

    Load --> ActiveRegistry
```

---

## 11. Spiritual-First Scheduler Resolving

The Enterprise Scheduler treats congregational prayer blocks as absolute, immutable constants during conflicts.

```mermaid
graph TD
    SlotA[Prayer Block: Priority 10] --> Overlap{Check Overlap?}
    SlotB[Work Meeting: Priority 3] --> Overlap

    Overlap -->|Yes| Match{Is Slot A Prayer?}
    Match -->|Yes| MoveB[Push Work Meeting forward to finish after Prayer block + 5 min buffer]
    Match -->|No| Compare[Compare Priority Tiers]
    
    Compare -->|A > B| MoveB
    Compare -->|B > A| MoveA[Relocate Slot A]

    MoveB --> Commit[Commit Slots to Calendar Ledger]
    MoveA --> Commit
```

---

## 12. Telemetry Tracker

The diagnostics pipeline monitors latency and compiles performance statistics.

```mermaid
graph LR
    System[Life Kernel Pipeline] -->|Log Event Latency| Telemetry[PerformanceMonitor]
    System -->|Increment Metric Count| Collector[MetricsCollector]

    subgraph Metrics [Compiled Dashboard Aggregates]
        P1[Average Latency per Operation]
        P2[Daily Salah Completeness Ratio]
        P3[Weekly Gym Session Count]
    }

    Telemetry --> P1
    Collector --> P2
    Collector --> P3
```
