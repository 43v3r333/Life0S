# LifeOS Architecture & Development Log

## Core Architecture Decisions

### Data Architecture
- **Authoritative Store**: LIFEOS_DATA_DIR/lifeos.sqlite is the transactional source of truth
- **Vault Encryption**: Provider credentials encrypted with LIFEOS_VAULT_SECRET, never exposed in SQLite or AI prompts
- **Startup Validation**: Requires APP_URL, LIFEOS_DATA_DIR, and LIFEOS_AUTH_REQUIRED=true before write operations
- **Healthy Startup**: Read-only with respect to authoritative records; migrations handled via initDb with verification/rollback

### Security Requirements
- Environment variables for secrets: LIFEOS_VAULT_SECRET (min 32 chars), provider API keys
- Authentication: Persistent HttpOnly session via /api/auth/login when LIFEOS_AUTH_REQUIRED=true
- Vault System: Encrypted storage of integration secrets (nvidiaKey, openaiKey, geminiKey, anthropicKey, etc.)
- Request Protection: Rate limiting (100 req/min), security headers, CORS restrictions

### Technology Stack
- **Backend**: Node.js 22 with Express.js, TypeScript
- **Database**: SQLite with JSON serialization layer
- **AI Integration**: Google Gemini (primary), fallback providers via vault
- **Vector Storage**: Qdrant for embeddings and semantic search
- **Real-time**: EventBus for inter-service communication
- **Build**: Vite + ESBuild for production bundling

## API Schema Reference

See [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) for complete endpoint documentation.

Key API Groups:
- **Authentication**: `/api/auth/*` (login, session, logout)
- **Vault**: `/api/vault/*` (secure secret storage)
- **Scores**: `/api/scores`, `/api/deen/salah`, `/api/health/workout`, `/api/finance/expense`
- **Goals**: `/api/goals/*` (CRUD operations, search, timeline)
- **Tasks/Habits**: `/api/tasks/*`, `/api/habits/*`
- **Knowledge**: `/api/knowledge/*` (objects, graph, search, AI assistant)
- **FinanceOS**: `/api/finance/*` (ledgers, accounts, journals, zakat)
- **Personal Data**: `/api/personal/*` (overview, finance entries, work shifts)
- **AI Features**: `/api/ai/*` (memories, actions, decisions, conversations, diagnostics)
- **Integrations**: Google Workspace, GitHub (via encrypted vault tokens)
- **System**: `/api/system/*` (health, storage, backups, audit) including `/api/system/ping` for health checks
- **Business**: `/api/business/*` (codebase guide, code learning, career)

## Database Migration State

### Current Schema Version
As of 2026-08-19, the database schema includes:

**Core Tables** (from SQLite initialization in server/sqliteStore.js):
- goals, tasks, habits, knowledgeObjects, systemEvents
- vault (encrypted), scores, currentUser, sessions
- finance-specific: ledgers, accounts, journalEntries, statementImports, portfolio, zakahHistory, waqfRegistry
- transactional: financeEntries, incomeSources, monthlyBudgets, salaryBreakdowns
- banking: bankAccounts, debts, liabilityPayments, liabilityAdjustments, bankTransactions
- statement processing: bankStatementAnalyses, bankStatementDocuments, balanceScreenshotDocuments, balanceUpdateProposals
- rules: merchantCategoryRules, personalTransferRules, autoValidationRules, creditCardStatements
- work: workShifts, workTasks
- AI features: aiActionProposals, aiMemories, aiMemoryCandidates, aiConversations, aiDecisions, aiFinanceBriefings, aiRequestDiagnostics, operationAudit
- onboarding: onboarding (key-value store)
- knowledge analysis: knowledgeAnalysisQueue, knowledgeAnalysisRuns, knowledgeClaims, knowledgeEvidence, knowledgeFeedback, knowledgeMetrics, knowledgeCheckpoints, knowledgeSettings
- Additional tables from recent development: account_balance_history, google_sync_runs, google_email_reviews, google_calendar_ownership, google_drive_index, google_action_proposals, automation_runs, life_notifications, daily_briefings, google_task_mappings, google_task_reconciliations, google_managed_sheets, google_sheet_export_runs, google_crm_contacts, career_profiles, career_documents, code_learning_records, work_tasks, uploaded_documents

### Migration Tracking
Migration scripts should be added to server/sqliteStore.js with version tracking. The schema evolution is handled through careful SQLite initialization with backward compatibility, using SQLITE_SCHEMA_VERSION = 7 and schema_migrations table for tracking.

**Last verified state**: All tables present and compatible with current TypeScript interfaces in server/db.ts and server/domainTypes.js

### Integrity Checks
Startup verification includes:
- SQLite integrity check via verifyStorage()
- Table existence and basic structure validation
- Foreign key constraints enforcement
- Write-ahead log (WAL) mode verification
- Backup integrity via backupVerification.ts

## Development Guidelines

### TypeScript Standards
- Target: Node.js 22 (ES2022)
- Strict mode: enabled via tsconfig.json
- File organization: feature-based grouping in src/ and server/
- Interface reuse: domainTypes.js for shared types

### Validation Requirements
Before committing backend changes:
1. Run `npm run build` to ensure successful compilation
2. Run `npm run lint` (currently tsc --noEmit) for type checking
3. Verify API reference stays in sync with `npm run docs:check`
4. Test startup sequence validates required environment variables

### Environment Variables
**Required for production**:
- NODE_ENV=production
- APP_URL (public base URL)
- LIFEOS_DATA_DIR (absolute path for data storage)
- LIFEOS_AUTH_REQUIRED=true
- LIFEOS_AUTH_EMAIL
- LIFEOS_AUTH_PASSWORD_HASH (generated via npm run setup:auth)
- LIFEOS_VAULT_SECRET (minimum 32 characters)

**Optional integrations** (store encrypted in vault):
- NVIDIA_API_KEY, GEMINI_API_KEY, GITHUB_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (for OAuth flows)

### Testing Approach
- Unit tests: tests/ directory with .test.ts files
- Test data isolation: uses .test-data directory via LIFEOS_DATA_DIR override
- Test concurrency: limited to 1 for reliable SQLite access
- Test cleanup: automatic removal of .test-data after runs

## Recent Work Tracking
- [2026-08-16] Initialized architecture documentation in CLAUDE.md
- [2026-08-16] Verified server startup sequence and environment validation
- [2026-08-16] Confirmed API reference completeness via docs:check script
- [2026-08-19] Updated database migration state documentation and verified schema version 7
- Ongoing: Maintaining backward compatibility while extending features