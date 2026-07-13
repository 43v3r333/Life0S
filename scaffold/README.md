# Project Jannah: LifeOS Foundation Scaffold
Version: 0.1.0-Foundation
Author: 43v3r Technology

Welcome to the foundation codebase of **LifeOS (Project Jannah)**. This directory contains the complete modular enterprise scaffold representing a Domain-Driven Design (DDD), Clean Architecture backend (ASP.NET Core 9) and modular Next.js frontend, along with AI configurations (MCP, Memory schemas, Agent prompts).

---

## 📂 Directory Structure

```
/scaffold
├── docs/                      # Architectural & Coding Guidelines
│   ├── ARCHITECTURE.md        # High-level architecture, DDD & CQRS maps
│   ├── CODING_STANDARDS.md    # C# & TypeScript style guides
│   ├── PROMPT_STANDARDS.md    # System instructions, LLM memory & schemas
│   └── CONTEXT_ENGINEERING.md # Dynamic telemetry aggregation pipelines
│
├── backend/                   # Clean Architecture ASP.NET Core 9 Service
│   ├── LifeOS.sln             # Visual Studio Solution File
│   ├── src/
│   │   ├── LifeOS.Domain/     # Pure entities, value objects, domain events
│   │   ├── LifeOS.Application/# CQRS Commands, Queries, MediatR Pipeline, Interfaces
│   │   ├── LifeOS.Infrastructure/ # EF Core, Qdrant Client, Ollama & OAuth
│   │   └── LifeOS.WebApi/     # Controllers, Endpoints, Middleware, Program.cs
│   └── docker-compose.yml     # Local services (MSSQL Server, Qdrant, Ollama)
│
├── frontend/                  # Modern Next.js App Router Presentation
│   ├── package.json           # Dependencies (React 19, Motion, React Query)
│   ├── tsconfig.json          # Strict TypeScript configurations
│   ├── next.config.ts         # Next.js specific configuration
│   └── src/
│       ├── app/               # App Router pages (Dashboard, Salah, Wealth)
│       ├── components/        # Reusable visual modules
│       ├── hooks/             # Custom state & data fetching hooks
│       └── lib/               # Utility scripts & API client setups
│
└── ai-engine/                 # AI, Memory, and Model Context configs
    ├── memory-system/         # Hierarchical memory storage formats
    ├── agents/                # Prompts for Gabriel (CoS), Salah, and Finance
    └── mcp/                   # Model Context Protocol schemas
```

---

## 🛠️ Getting Started & Dependencies

This scaffold acts as the core blueprint before writing specific business features. To run the full local cluster:

1. **Spin up Infrastructure Containers**:
   ```bash
   cd scaffold/backend
   docker-compose up -d
   ```
   This launches **MS SQL Server** on port 1433, **Qdrant Vector DB** on port 6333, and **Ollama** on port 11434.

2. **Initialize Database Schema**:
   The backend uses Entity Framework Core. Apply migration schemas:
   ```bash
   dotnet ef database update --project src/LifeOS.Infrastructure --startup-project src/LifeOS.WebApi
   ```

3. **Install Frontend Packages**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🧠 Core System Modules

### 1. Gabriel (AI Chief of Staff Agent)
Gabriel represents the primary orchestration agent. He communicates via Model Context Protocol (MCP) to read databases, execute vector search in Qdrant, and pull biometric logs. He translates raw user interactions into formal CQRS Command and Query payloads.

### 2. Cognitive Memory & Context Engineering
Instead of packing months of chat history, the context engineering layer queries Qdrant for semantic similarity, aggregates recent logs from MS SQL, and dynamically compresses a 4KB "Context Frame" to pass into Gabriel's system prompt during active queries.

---

## 📌 Development Roadmap

- [x] **Phase 1: Foundation (Current)** - Generate enterprise architecture, domain models, folders, configuration templates, and coding standards.
- [ ] **Phase 2: Core Deen & Personal** - Implement pure C# entities for Salah tracker, Vision Goal mapping, and Qdrant cognitive memory.
- [ ] **Phase 3: Wealth & Health** - Hook up double-entry ledger database tables, halal investment analysis, and Fitbit/sleep trackers.
- [ ] **Phase 4: CoS Intelligence** - Deploy local Ollama + cloud Gemini models executing MCP search tools over aggregated life data.
- [ ] **Phase 5: Multi-Client Sync** - Implement React Native mobile apps with full offline SQLite storage syncing seamlessly back to MS SQL.
