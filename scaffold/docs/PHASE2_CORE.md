# Phase 2: Life Kernel & Cognitive Core Blueprint
Version: 0.2.0-Core
Status: Implementation-Ready

This document provides complete architectural documentation and structural diagrams for Phase 2: **Life Kernel & Cognitive Core**.

---

## 1. Technical Design and Flow Diagrams

### Event Broker Pipeline (Event-Driven Core)
```
[External Sensor / Domain Controller]
                 │
                 ▼ (Dispatches Event)
     ┌───────────────────────┐
     │  ILifeKernelEventBus  │
     └───────────┬───────────┘
                 │
                 ├─► [Pre-Publish Interceptor: Audit & Validation]
                 │
                 ├─► [Dispatch Parallel Consumers via Task.Run()]
                 │     ├─► [Deen Tracker (Salah logs, habit trends)]
                 │     ├─► [Ledger Bookkeeping (Double-entry check)]
                 │     └─► [AI Memory Auto-Indexer (Qdrant Sync)]
                 │
                 └─► [Post-Publish Interceptor: Cognitive Telemetry Logs]
```

### Cognitive Context Injection & Compaction
```
  [Raw SQL Server DB Logs]            [Local HRV / Fitbit Streams]
             │                                     │
             └──────────────────┬──────────────────┘
                                ▼
              ┌───────────────────────────────────┐
              │    Cognitive Compaction Service   │
              │  (Triggers daily / weekly loops)  │
              └─────────────────┬─────────────────┘
                                ▼ (Feeds to Gemini summarizer prompt)
              ┌───────────────────────────────────┐
              │    Qdrant Dense Vector Store      │
              │  (Saves weighted, decaying nodes) │
              └─────────────────┬─────────────────┘
                                ▼
              ┌───────────────────────────────────┐
              │    Context Aggregation Engine     │
              │  (Priority-Weighted Context Frame)│
              └─────────────────┬─────────────────┘
                                ▼ (Minified JSON Context Payload)
               [Gabriel CoS AI Agent Prompt Input]
```

---

## 2. Dynamic Memory Decay Equation

To ensure that the 4KB Context Frame is never cluttered with obsolete details, memory nodes decay automatically according to their configured decay type:

1. **Linear Decay**:
   $$\text{Weight}_t = \max(0, \text{Weight}_0 - 0.05 \times \Delta t_{\text{days}})$$

2. **Exponential Decay**:
   $$\text{Weight}_t = \text{Weight}_0 \times e^{-0.15 \times \Delta t_{\text{days}}}$$

3. **Static Anchor**:
   $$\text{Weight}_t = \text{Weight}_0$$

---

## 3. Configuration Reference (`appsettings.json`)

```json
{
  "LifeKernel": {
    "TelemetryLimitDays": 14,
    "CognitiveContextBudgetKb": 4.0,
    "DefaultDecayRate": "linear"
  },
  "Qdrant": {
    "Host": "localhost",
    "Port": 6333,
    "CollectionName": "project_jannah_memories"
  },
  "AiEngine": {
    "EmbeddingModel": "text-embedding-004",
    "ChatModel": "gemini-3.5-flash"
  }
}
```
This foundation acts as the robust, standardized internal operating system upon which all subsequent business features are mounted.
