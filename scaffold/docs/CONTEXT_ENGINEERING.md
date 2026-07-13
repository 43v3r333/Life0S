# Project Jannah: LifeOS Context Engineering & Aggregation
Version: 0.1.0-Foundation

This document details how **Project Jannah** aggregates personal life telemetry, schedules, goals, and logs from disparate data sources into an unified Context Frame. This context is what powers the AI Chief of Staff.

---

## 1. The Context Aggregation Pipeline

To provide hyper-personalized, contextualized decisions, the system implements a multi-stage **Context Aggregation Pipeline**:

```
 ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
 │ Relational DB Log    │  │  Qdrant Vector DB    │  │  External Sensors    │
 │ (Salah logs, Budgets)│  │ (Journals, Docs RAG) │  │ (Sleep tracking, Cal)│
 └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
                      ┌──────────────────────────────┐
                      │ Context Engineering Engine   │
                      │  - Windowing & Compaction    │
                      │  - Priority Scoring          │
                      │  - Conflict Resolution       │
                      └──────────────┬───────────────┘
                                     ▼
                      ┌──────────────────────────────┐
                      │    Standard Context Frame    │
                      │  - Compressed JSON Payload   │
                      └──────────────┬───────────────┘
                                     ▼
                      ┌──────────────────────────────┐
                      │     LLM Execution Phase      │
                      │   (Gabriel - Chief of Staff) │
                      └──────────────────────────────┘
```

---

## 2. Dynamic Sliding Window Context

Context is grouped into three distinct temporal windows, ensuring the AI is aware of immediate circumstances, weekly themes, and lifetime priorities:

### A. Immediate Window (T - 24 Hours)
- **Data Points**: Heart rate variability (HRV), sleep duration/quality, completed prayers (Salah), today's bank transactions, current calendar schedule, tasks checked off today.
- **Aggregator**: Redundant state cache (Redis or local memory buffer).
- **LLM Use**: Prompt adjustment for current stress levels, exhaustion, or timing restrictions.

### B. Tactical Window (T - 7 Days)
- **Data Points**: Weekly habit completion rates, budget variance, weekly business milestones, family dynamic surveys, journal sentiment analysis.
- **Aggregator**: Relational database queries grouped by date.
- **LLM Use**: Identifying weekly patterns (e.g., missing afternoon workout due to late corporate meetings) and suggesting mid-week micro-adjustments.

### C. Strategic Window (T - 30+ Days)
- **Data Points**: Long-term vision goals, yearly Zakat/charity targets, marriage objectives, project timelines, deep-knowledge documents.
- **Aggregator**: Hybrid relational queries + Semantic Search results (RAG) from Qdrant.
- **LLM Use**: Guiding the user back to their ultimate life roadmap when short-term demands cause derailment.

---

## 3. Priority Scoring & Conflict Resolution

When the Context Engineering Engine assembles a prompt payload, it ranks context chunks using a composite score based on:
1. **Recency**: Score decreases exponentially with time.
2. **Relevance**: Cosine similarity score of the semantic search query.
3. **Weight (Domain Priority)**: Domain weights are configurable. For example, during prayer windows, Deen context receives a multiplier; during business hours, Career context receives a multiplier.

### Rule-Based Conflict Resolution
If different sensors report conflicting data:
- **Sleep Data**: Biometric tracker wins over manually entered sleep times.
- **Financial Balance**: Live bank ledger sync wins over manually added offline ledger logs.
- **Calendar Schedule**: Real-time Google Calendar/Exchange API wins over static weekly planner presets.
- **Salah Times**: Calculated geographical astronomy (using GPS coordinates) wins over static time presets.
- **Habit Logs**: Manual checkboxes are treated as truth.

---

## 4. Developer API: Context Construction Interface

Below is the Application interface for injecting and retrieving the Context Frame:

```csharp
namespace LifeOS.Application.Common.Interfaces;

public interface IContextEngineeringService
{
    /// <summary>
    /// Constructs a fully populated Context Frame for a specific user.
    /// </summary>
    Task<ContextFrame> GetCurrentContextFrameAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Hydrates a Prompt Template with the current Context Frame.
    /// </summary>
    Task<string> HydratePromptAsync(string template, ContextFrame context, CancellationToken cancellationToken);
}

public class ContextFrame
{
    public DateTimeOffset Timestamp { get; set; }
    public UserProfileContext Profile { get; set; }
    public DeenContext Deen { get; set; }
    public HealthContext Health { get; set; }
    public FinanceContext Finance { get; set; }
    public List<ActiveProjectContext> Projects { get; set; }
    public List<string> RelevantMemories { get; set; }
}
```
This architecture guarantees that the AI Chief of Staff has high-fidelity, unified, and organized awareness of the user's life before making any decision.
