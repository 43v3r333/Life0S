# Project Jannah: LifeOS Architecture Blueprint
Version: 0.1.0-Foundation

This document outlines the enterprise-grade technical architecture for **LifeOS (Project Jannah)**, a complete, highly-cohesive, and modular AI-powered Life Operating System.

---

## 1. Architectural Principles

Project Jannah is designed as an enterprise system adhering to the following paradigms:
- **Clean Architecture**: Strong isolation of business logic from external concerns (database, presentation, AI models).
- **Domain-Driven Design (DDD)**: Logic organized around rich business domains and subdomains representing aspects of the user's life.
- **CQRS (Command Query Responsibility Segregation)**: Segregation of read (Queries) and write (Commands) operations for optimal scalability, auditability, and modularity.
- **AI-Native & Context-Aware**: Designed from the core to leverage Local LLMs (Ollama) and Cloud LLMs (Gemini, Anthropic, OpenAI) with a structured hierarchical memory system.
- **Offline-First & Local-First**: Core services must run offline locally with SQLite/Local Vector DB, with seamless cloud/multi-user synchronization.

---

## 2. Global Architecture Map

```
                     ┌────────────────────────────────────────┐
                     │           Presentation Layer           │
                     │  - NextJS (React 19, Tailwind, Motion)  │
                     │  - Future Mobile Apps (React Native)   │
                     └───────────────────┬────────────────────┘
                                         │ HTTPS / WebSockets (JWT)
                                         ▼
                     ┌────────────────────────────────────────┐
                     │          ASP.NET Core Web API          │
                     │  - Controllers & SignalR Hubs          │
                     │  - JWT & OAuth Authentication          │
                     └───────────────────┬────────────────────┘
                                         │ MediatR Send
                                         ▼
                     ┌────────────────────────────────────────┐
                     │           Application Layer            │
                     │  - CQRS Commands & Queries             │
                     │  - Use Cases & Validation              │
                     └───────────────────┬────────────────────┘
                                         │ Uses Interfaces
                                         ▼
                     ┌────────────────────────────────────────┐
                     │             Domain Layer               │
                     │  - Pure Domain Entities & Value Objects│
                     │  - Domain Events & Rules               │
                     └───────────────────┬────────────────────┘
                                         │ Implemented by
                                         ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                          Infrastructure Layer                           │
 ├────────────────────┬───────────────────┬────────────────────────────────┤
 │   Data Access      │   Vector Store    │           AI Services          │
 │ - EF Core          │ - Qdrant Client   │ - Ollama Client (Local)        │
 │ - MS SQL Server    │ - Semantic Search │ - Gemini / OpenAI Clients      │
 │ - SQLite (Local)   │ - Hybrid Search   │ - MCP Server Integration       │
 └────────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 3. Core Life Domains

The system is split into distinct bounded contexts (subdomains), each operating with its own domain entities, value objects, and application use cases:

### A. Personal Life & Execution
- **Entities**: `User`, `VisionGoal`, `Habit`, `Task`, `DailyExecutionLog`, `JournalEntry`
- **Focus**: Strategic life mapping, daily scheduling, progress metrics.

### B. Islamic Life (Deen-First)
- **Entities**: `SalahLog`, `QuranProgress`, `DuaList`, `IslamicHabit`, `ZakatCalculation`
- **Value Objects**: `PrayerTime`, `HijriDate`
- **Focus**: Tracking daily prayers, Quran memorization, supplications, Islamic calendar synchronization, and optimizing daily routines around the five daily prayers.

### C. Family & Marriage
- **Entities**: `FamilyMember`, `MarriageGoal`, `Chore`, `SharedEvent`, `LoveLanguageAudit`
- **Focus**: Promoting marital harmony, coordinating household responsibilities, nurturing parenting strategies, and tracking family milestones.

### D. Health & Vitality
- **Entities**: `BiometricLog`, `SleepRecord`, `WorkoutSession`, `MealPlan`, `MentalStateLog`
- **Focus**: Integrated bio-tracking, sleep optimization, nutritional analysis, and emotional/cognitive tracking.

### E. Finance & Wealth
- **Entities**: `Account`, `Transaction`, `Budget`, `InvestmentAsset`, `FinancialGoal`
- **Focus**: Automated double-entry ledger bookkeeping, budgeting, tracking net worth, long-term wealth planning, and halal investment tracking.

### F. Career, Business & Projects
- **Entities**: `Project`, `Milestone`, `Invoice`, `BusinessMetric`, `SkillTree`
- **Focus**: Professional portfolio, entrepreneurial business dashboards, product milestones, and skills development tracking.

### G. AI Knowledge & Documents
- **Entities**: `Document`, `TextChunk`, `KnowledgeVector`, `MemoryNode`, `Tag`
- **Focus**: Ingestion of personal journals, PDFs, articles, and chats into a multi-tiered context engine for retrieval-augmented generation (RAG).

---

## 4. Backend Clean Architecture Layers

### Domain Layer (`LifeOS.Domain`)
- **No external dependencies** (pure C#).
- Contains Domain Entities, Aggregates, Value Objects, Domain Events, and Custom Domain Exceptions.
- Enforces invariant rules (e.g., `ZakatCalculation` logic, `SalahLog` status).

### Application Layer (`LifeOS.Application`)
- Depends **only** on the Domain layer.
- Defines interfaces for outer services (e.g., `IApplicationDbContext`, `IVectorStore`, `IAiService`).
- Uses **MediatR** for CQRS:
  - **Commands**: Modify state (e.g., `LogDailySalahCommand`, `AddTransactionCommand`).
  - **Queries**: Retrieve state (e.g., `GetSalahStatisticsQuery`, `GetFinancialHealthReportQuery`).
- Implements validation behavior (FluentValidation) and transactional pipeline behaviors.

### Infrastructure Layer (`LifeOS.Infrastructure`)
- Implements interfaces defined in the Application layer.
- **EF Core DB Context**: Configures mapping to MS SQL Server (production) or SQLite (offline/local development).
- **Qdrant Vector DB Integration**: Connects to the Qdrant service, manages collections, handles text vectorization, and performs hybrid search.
- **AI Integrations**: Implements clients for Ollama (local) and Gemini/OpenAI (cloud), as well as Model Context Protocol (MCP) servers.
- **Identity & Security**: Implements JWT authentication, OAuth, and external SSO mechanisms.

### Presentation Layer (`LifeOS.WebApi`)
- ASP.NET Core 9 Minimal APIs or Controllers.
- Handles HTTP requests, maps incoming DTOs to Commands/Queries, and dispatches them via MediatR.
- Configures middleware (Error Handling, JWT Validation, Logging, Rate Limiting).
- Implements SignalR hubs for real-time WebSocket communication (e.g., live AI streaming, notification push).

---

## 5. Storage and Database Strategy

- **Relational Data**: Microsoft SQL Server for transactional consistency, rich relations, and reporting queries. Uses Entity Framework Core with Migrations.
- **Vector Data**: Qdrant Vector Database. Stores dense vectors of personal documents, journals, and chat logs for semantic and cognitive retrieval.
- **Local SQLite Cache**: A synchronized local database for mobile and offline clients, implementing a conflict-free replicated data type (CRDT) sync protocol to merge local changes back to SQL Server when connectivity is restored.
