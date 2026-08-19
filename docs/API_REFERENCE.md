# LifeOS HTTP API reference

LifeOS exposes an Express JSON API alongside the Vite application. Unless stated otherwise, send `Content-Type: application/json`; successful responses are JSON. Local development defaults to `http://127.0.0.1:3001` unless configured otherwise.

## Conventions and current constraints

- The server binds to `127.0.0.1` by default. Do not expose it through `HOST=0.0.0.0` without production authentication and private-network firewall controls.
- Production refuses to start unless `LIFEOS_AUTH_REQUIRED=true`, a valid login email/password hash, an explicit `LIFEOS_DATA_DIR`, and a persistent `LIFEOS_VAULT_SECRET` are configured.
- `/api/auth/login` creates a persistent, expiring HttpOnly session. Except for login/session checks and liveness endpoints, API requests require the authenticated session when authentication is enabled.
- Secrets submitted to `/api/vault/save` are encrypted under `LIFEOS_DATA_DIR/.secrets.json`; raw values are excluded from SQLite, API status responses, logs, backups, and AI prompts.
- SQLite under `LIFEOS_DATA_DIR` is authoritative. Healthy startup does not seed, recover, reconcile, classify, or rewrite application records.
- AI-backed endpoints use configured providers and deterministic fallbacks where documented; AI proposals never become authoritative without approval.
- `tenantId` defaults to `system-default` on FinanceOS queries. FinanceOS commands accept it in the JSON body.
- Errors are JSON, usually `{ "error": "message" }`; FinanceOS can return SDK problem details with a `status` field.
- The server contains both legacy action-style goal routes and newer REST-style goal routes. Because Express evaluates handlers in registration order, duplicate `GET /api/goals` and `POST /api/goals` registrations are compatibility debt; clients should prefer the REST-style routes described under Goals.

## Health and metadata

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/healthz` | Liveness, uptime, and simulated database-overload status. |
| GET | `/api/readyz` | Readiness of database, memory, cache, and messaging components. |
| GET | `/api/health` | Product codename, phase, and version. |
| GET | `/api/personalization` | Local profile, goals, routines, consent-gated integration preferences, and privacy defaults. |
| GET | `/api/openapi-spec` | Runtime-generated OpenAPI 3.0.3 document (currently partial). |
| GET | `/api/scaffold-files` | List readable files in the bundled scaffold tree. |

## Identity, vault, scores, and assistant

| Method | Path | Input / purpose |
| --- | --- | --- |
| GET | `/api/auth/session` | Return current authentication state and session expiry. |
| POST | `/api/auth/login` | Authenticate with the configured private email and password. |
| POST | `/api/auth/logout` | Revoke the current session and clear its cookie. |
| GET | `/api/auth/sessions` | List known sessions. |
| POST | `/api/auth/sessions/revoke` | Revoke a session by body `id`. |
| GET | `/api/vault` | Return configured-secret presence flags, never raw secrets. |
| POST | `/api/vault/save` | Load supported integration secrets into process memory; values are cleared at shutdown. |
| GET | `/api/scores` | Return the holistic scorecard. |
| POST | `/api/deen/salah` | Log Salah and update faith/consistency scores. |
| POST | `/api/health/workout` | Log a workout and update health scores. |
| POST | `/api/finance/expense` | Log an expense and update finance scores. |
| POST | `/api/chat` | Body: `messages[]`, optional `userProfile` and `activeAgent`; returns `{ content }`. |

## Planning, work, and habits

| Method | Path | Purpose / principal input |
| --- | --- | --- |
| GET | `/api/projects` | List projects. |
| POST | `/api/projects` | Create a project; `title` required. |
| POST | `/api/projects/delete` | Delete by body `id`. |
| GET | `/api/tasks` | List tasks. |
| POST | `/api/tasks` | Create a task; `title` required. |
| POST | `/api/tasks/toggle` | Toggle task by `id`; optional `actualTime`. |
| POST | `/api/tasks/delete` | Delete by body `id`. |
| GET | `/api/habits` | List habits. |
| POST | `/api/habits` | Create a habit; `name` required. |
| POST | `/api/habits/log` | Increment the streak for body `id`. |
| GET | `/api/focus` | List focus sessions. |
| POST | `/api/focus/start` | Start a session with optional `title`, `category`. |
| POST | `/api/focus/end` | End by `id`; accepts `duration`, `interrupts`, `flowScore`. |
| POST | `/api/planning/briefing` | Generate an AI daily briefing. |
| POST | `/api/planning/review` | Generate an AI review. |
| GET | `/api/planning/analytics` | Planning and execution metrics. |

## Goals

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/goals` | List goals; newer handler supports `type` and `priority` filters. |
| POST | `/api/goals` | Create a goal; `title` required. |
| GET | `/api/goals/search` | Semantic search; query parameter `query` required. |
| GET | `/api/goals/dashboard` | Aggregate goal metrics. |
| GET | `/api/goals/timeline` | Goals ordered by target date. |
| GET | `/api/goals/:id` | Fetch a goal or return `404`. |
| PUT | `/api/goals/:id` | Update goal fields. |
| DELETE | `/api/goals/:id` | Delete a goal when dependency rules allow it. |
| POST | `/api/goals/:id/complete` | Complete after mandatory milestone validation. |
| POST | `/api/goals/:id/pause` | Pause an active goal. |
| POST | `/api/goals/:id/resume` | Resume a paused goal. |
| POST | `/api/goals/:id/archive` | Archive a goal. |
| POST | `/api/goals/update` | Legacy update action; body contains `id` and mutable AI/progress fields. |
| POST | `/api/goals/delete` | Legacy delete action; body contains `id`. |
| GET | `/api/legacy/goals` | Deprecated compatibility list route. Prefer `GET /api/goals`. |
| POST | `/api/legacy/goals` | Deprecated compatibility create route. Prefer `POST /api/goals`. |

## Knowledge and simulation

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/knowledge` | List/filter knowledge objects. |
| POST | `/api/knowledge` | Create a knowledge object. |
| POST | `/api/knowledge/ingest` | AI-assisted text/document ingestion. |
| POST | `/api/knowledge/whatsapp` | Parse and ingest a WhatsApp export. |
| POST | `/api/knowledge/email` | Parse and ingest email content. |
| GET | `/api/knowledge/graph` | Return graph nodes and edges. |
| POST | `/api/knowledge/graph/edge` | Create a relationship edge. |
| POST | `/api/knowledge/review` | Record review/learning metadata. |
| GET | `/api/knowledge/search` | Search with query parameters. |
| GET | `/api/knowledge/analytics` | Knowledge-base metrics. |
| POST | `/api/knowledge/ai-assistant` | Ask the knowledge assistant a question. |
| GET | `/api/knowledge/events` | List domain/system events. |
| Any | `/api/v1/simulation/*` | Retired; returns `501 not_configured`. |

## Cognitive, PMO, and integrations

The former `/api/v2/*` demonstration routes are retired and return `501 not_configured`. They are listed below only as migration history and do not return fabricated telemetry.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v2/cognitive/learning` | Learning observations and derived insights. |
| GET | `/api/v2/cognitive/evolution` | Evolution proposals. |
| GET | `/api/v2/cognitive/manual` | Cognitive operating principles. |
| GET | `/api/v2/cognitive/quality` | Metacognition and skill benchmarks. |
| GET | `/api/v2/pmo/missions` | Mission portfolio. |
| GET | `/api/v2/pmo/execution` | Execution telemetry. |
| GET | `/api/v2/pmo/approvals` | Approval queue. |
| GET | `/api/v2/pmo/dependencies` | Dependency map. |
| GET | `/api/v2/integration/connectors` | Connector registry. |
| GET | `/api/v2/integration/manufacturing` | Manufacturing integration status. |
| GET | `/api/v2/integration/communication` | Communication integrations. |
| GET | `/api/v2/integration/devices` | Device integrations. |

## Enterprise platform

The former `/api/v3/*` demonstration routes are retired and return `501 not_configured`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v3/tenant/list` | Tenant registry and isolation metadata. |
| GET | `/api/v3/organization/departments` | Department registry. |
| POST | `/api/v3/identity/sso/token` | Return a simulated federated SSO token. |
| GET | `/api/v3/marketplace/license` | Application licensing snapshot. |
| GET | `/api/v3/billing/ledger` | Billing ledger snapshot. |
| GET | `/api/v3/governance/policies` | Governance policies. |
| GET | `/api/v3/platform/health` | Enterprise platform health. |
| GET | `/api/v3/developer/swagger` | Embedded enterprise Swagger-style document. |

## LifeOS Intelligence Network (LIN)

The former `/api/v4/*` demonstration routes are retired and return `501 not_configured`.

| Method | Path | Purpose / input |
| --- | --- | --- |
| GET | `/api/v4/lin/memory` | Federated memory status. |
| GET | `/api/v4/lin/router` | Model-routing configuration. |
| GET | `/api/v4/lin/skills` | Certified skill packages. |
| GET | `/api/v4/lin/observability` | Mesh metrics. |
| GET | `/api/v4/lin/swagger` | Embedded LIN Swagger 2.0 subset. |
| GET | `/api/v4/lin/chaos/state` | Current simulated failure flags. |
| POST | `/api/v4/lin/chaos/simulate` | Body `action`, `value`; changes chaos state. |
| GET | `/api/v4/lin/security/audit-logs` | In-memory security audit log. |
| GET | `/api/v4/lin/rate-limit-config` | Current request-per-minute threshold. |
| POST | `/api/v4/lin/rate-limit-config` | Set positive numeric body `threshold`. |
| POST | `/api/v4/lin/security/scan` | Run the simulated ASVS scan. |
| POST | `/api/v4/lin/performance/benchmark` | Run benchmark under current chaos flags. |
| POST | `/api/v4/lin/runbook/execute` | Body `runbookId`; execute a supported operations runbook. |

## Personal finance, work, onboarding, and backup

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/personal/overview` | Return recorded finance totals, debts, shifts, work tasks, and onboarding answers. |
| POST | `/api/personal/finance/entries` | Record verified income or expense data in ZAR. |
| PATCH | `/api/personal/finance/entries/:id` | Edit date, type, amount, category, description, recurrence, or income-source link. |
| POST | `/api/personal/finance/income-sources` | Create a fixed or variable recurring income source. |
| POST | `/api/personal/finance/bank-accounts` | Store a safe manual bank-balance snapshot without account numbers or credentials. |
| PATCH | `/api/personal/finance/bank-accounts/:id` | Update the account label, institution, type, notes, active state, or current balance. |
| DELETE | `/api/personal/finance/bank-accounts/:id` | Remove a stored bank-account balance record. |
| PATCH | `/api/personal/finance/income-sources/:id` | Update or deactivate an income source. |
| POST | `/api/personal/finance/salary-breakdowns` | Record base pay, overtime, allowances and deductions; creates the actual net salary entry. |
| PUT | `/api/personal/finance/budgets/:month` | Create or replace a YYYY-MM category budget. |
| GET | `/api/personal/finance/payday-plan` | Allocate current-month recorded income against active commitments. |
| GET | `/api/personal/finance/debt-strategies` | Compare snowball and avalanche repayment order using recorded balances and rates. |
| POST | `/api/personal/finance/ai-advice` | Return grounded local debt guidance; external AI is opt-in and requires a configured provider. |
| DELETE | `/api/personal/finance/entries/:id` | Remove an income or expense record after user confirmation. |
| POST | `/api/personal/finance/debts` | Record a debt balance and repayment terms. |
| PATCH | `/api/personal/finance/debts/:id` | Update a debt or liability's schedule, priority, or status. |
| POST | `/api/personal/finance/debts/:id/payments` | Record a payment and reduce the outstanding balance. |
| POST | `/api/personal/finance/debts/:id/adjustments` | Add a card charge, interest, fee, or signed balance correction. |
| DELETE | `/api/personal/finance/debts/:id` | Remove a debt or recurring bill and its payment history. |
| POST | `/api/personal/work/shifts` | Record a day, night, off, or leave shift. |
| POST | `/api/personal/work/tasks` | Create a work task. |
| PATCH | `/api/personal/work/tasks/:id` | Update work-task status and planning fields. |
| PUT | `/api/personal/onboarding` | Save finance and work setup answers; blank values remain unknown. |
| GET | `/api/workbook/snapshot` | Export structured LifeOS data for explicit workbook reconciliation. |
| GET | `/api/backups` | List checksum-manifest SQLite backup bundles and legacy JSON backups. |
| POST | `/api/backups` | Create a local bundle containing a consistent session-free SQLite snapshot, statements, balance screenshots, vector index, sanitized state, and checksum manifest. |

### Personal intelligence and finance analysis

Authentication endpoints used by private web and ngrok access:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/auth/session` | Return whether the current HttpOnly-cookie session is authenticated. |
| POST | `/api/auth/login` | Authenticate the configured user and create an expiring session. |
| POST | `/api/auth/logout` | Revoke the current session and clear its cookie. |
| GET | `/api/auth/sessions` | List active sessions without exposing tokens. |
| POST | `/api/auth/sessions/revoke` | Revoke a selected authenticated session. |

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/ai/status` | Return configured AI provider, model, and connection readiness without exposing credentials. |
| GET | `/api/ai/diagnostics` | Return provider health, domain coverage, stale-memory exclusions, conflicts, retrieval policy, and pending AI actions. |
| POST | `/api/ai/memories/sync-system` | Refresh authoritative domain snapshots used by AI grounding. |
| GET | `/api/personal/daily-state` | Return the deterministic daily finance, task, alert, and shift-planning snapshot. |
| GET | `/api/personal/command-center` | Return the combined daily state, AI actions, memories, and recent audit activity. |
| GET | `/api/personal/finance/insights` | Calculate spending, income, account, debt, and statement insights from saved records. |
| GET | `/api/personal/finance/forecast` | Return the saved-data cash-flow and liability forecast. |
| POST | `/api/personal/finance/balance-screenshots/analyze` | Save and analyze an account-balance screenshot into reviewable proposals. |
| POST | `/api/personal/finance/balance-screenshots/:id/confirm` | Confirm selected balance proposals and update their authoritative accounts. |
| DELETE | `/api/personal/finance/balance-screenshots/:id` | Delete an incorrect saved balance screenshot and its unconfirmed proposals. |
| PATCH | `/api/personal/finance/bank-transactions/:id` | Correct an imported transaction before reconciliation. |
| POST | `/api/personal/finance/bank-statement-documents/:id/confirm-balance` | Confirm a recognized statement or screenshot balance for its linked account. |
| POST | `/api/personal/finance/ai-briefing` | Generate a grounded finance briefing using current saved financial context. |
| POST | `/api/personal/finance/classify-pending` | Classify pending imported transactions using deterministic and AI-assisted rules. |
| GET | `/api/personal/finance/merchant-rules` | List learned merchant classification rules. |
| POST | `/api/personal/finance/merchant-intelligence/refresh` | Rebuild merchant intelligence from approved transaction history. |
| DELETE | `/api/personal/finance/merchant-rules/:id` | Remove a learned merchant classification rule. |
| POST | `/api/personal/finance/transfer-rules` | Save and apply a user-confirmed internal-transfer rule. |
| POST | `/api/personal/finance/auto-validation-rules` | Save and apply an automatic transaction-validation rule. |
| POST | `/api/personal/finance/commitments/confirm` | Confirm that a month's recurring commitments were paid. |
| POST | `/api/personal/finance/card-statements` | Save a credit-card statement snapshot. |
| POST | `/api/personal/finance/bank-statements/import` | Upload, locally OCR, parse, permanently save, and analyze a transaction screenshot, CSV, or PDF for a selected account. |
| POST | `/api/personal/finance/bank-transactions/:id/reconcile` | Approve or update one imported transaction and its ledger entry. |
| POST | `/api/personal/finance/bank-transactions/bulk-reconcile` | Approve selected imported transactions in one operation. |
| POST | `/api/personal/finance/validate-rule-classifications` | Validate pending transactions matched by confirmed rules. |
| POST | `/api/personal/finance/statement-integrity-repair` | Repair verified credit-statement dates or missing transaction rows. |
| POST | `/api/personal/finance/statement-analyses/:id/ai-review` | Generate a saved AI review for one statement analysis. |

### AI memory, decisions, actions, and conversations

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/ai/life-context` | Return the safe, structured LifeOS context available to the assistant. |
| GET | `/api/ai/actions` | List saved AI action proposals. |
| POST | `/api/ai/actions/refresh` | Regenerate grounded action proposals from current LifeOS state. |
| POST | `/api/ai/actions/propose` | Create an explicitly reviewable AI action proposal. |
| GET | `/api/ai/context-map` | Inspect authoritative AI coverage and page-aware prompt context; accepts an optional `workspace` query. |
| GET | `/api/ai/knowledge/overview` | Return knowledge health, finance intelligence, queue depth, learning metrics, and recent runs. |
| GET | `/api/ai/knowledge/graph` | Return the evidence-backed relationship graph; accepts an optional `domain` filter. |
| GET | `/api/ai/knowledge/runs` | List durable targeted, nightly, catch-up, and manual analysis runs. |
| GET | `/api/ai/knowledge/claims` | List claims with truth status, confidence, provenance, and supersession data. |
| GET | `/api/ai/knowledge/proposals` | List guarded AI proposals awaiting an explicit decision. |
| GET | `/api/ai/knowledge/settings` | Return continuous-analysis privacy, schedule, domain, budget, and retention controls. |
| PATCH | `/api/ai/knowledge/settings` | Update guarded analysis controls without exposing provider credentials. |
| POST | `/api/ai/knowledge/analyze` | Queue and begin an idempotent guarded analysis for selected domains. |
| POST | `/api/ai/knowledge/feedback` | Record feedback for local confidence calibration. |
| PATCH | `/api/ai/knowledge/proposals/:id` | Approve or reject a proposal; unsupported domain mutations remain unapplied. |
| GET | `/api/ai/integration-briefing` | Return cross-domain AI coverage, attention totals, safety policy and the current recommended action. |
| GET | `/api/personal/daily-state` | Return an authoritative dated daily timeline; accepts a `date=YYYY-MM-DD` query. |
| GET | `/api/personal/day-plan` | Return a gap-free 1,440-minute sleep-, shift-, health-, study-, task-, and relaxation-aware plan for a date. |
| POST | `/api/personal/daily-review` | Save an end-of-day review and approved task carry-forward choices. |
| POST | `/api/personal/alerts/:id/dismiss` | Persist resolution of an item in the Today attention inbox. |
| POST | `/api/goals/:id/milestones` | Add a measurable milestone to an existing goal. |
| PATCH | `/api/goals/:id/milestones/:milestoneId` | Update milestone completion or measured value. |
| POST | `/api/goals/:id/progress` | Save authoritative goal progress history. |
| POST | `/api/personal/alerts/{id}/dismiss` | Dismiss a personal attention item through the selected date. |
| PATCH | `/api/ai/actions/:id` | Approve, reject, or update an AI action proposal. |
| GET | `/api/ai/memories` | List active, reviewable, and expired AI memories with provenance. |
| POST | `/api/ai/memories` | Save an explicit user-confirmed memory. |
| PATCH | `/api/ai/memories/:id` | Correct or change the lifecycle of a saved memory. |
| DELETE | `/api/ai/memories/:id` | Permanently remove a saved AI memory. |
| PATCH | `/api/ai/memory-candidates/:id` | Approve or reject a memory candidate extracted from conversation. |
| GET | `/api/ai/decisions` | List decisions captured from confirmed memories. |
| POST | `/api/ai/decisions/:id/create-task` | Turn a saved decision into an actionable task. |
| GET | `/api/ai/data-quality` | Return memory and saved-data quality findings. |
| POST | `/api/ai/privacy/forget-topic` | Archive memories and remove conversations for an explicitly confirmed topic. |
| GET | `/api/ai/conversations` | List saved assistant conversations. |
| POST | `/api/ai/conversations` | Create a persistent assistant conversation. |
| GET | `/api/ai/conversations/:id` | Retrieve one saved conversation and its messages. |
| PATCH | `/api/ai/conversations/:id` | Rename or update a saved conversation. |
| DELETE | `/api/ai/conversations/:id` | Soft-delete a saved conversation. |

### Work, vision, goals, and planning

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/personal/work/shifts/import` | Import an idempotent annual team shift calendar and create linked AI memory. |
| PATCH | `/api/personal/work/shifts/:id` | Edit a saved shift while enforcing company-wide Sunday-off rules. |
| DELETE | `/api/personal/work/shifts/:id` | Delete a saved shift. |
| POST | `/api/personal/work/shifts/apply-sunday-rule` | Normalize all Sundays to off days and persist the rule in AI memory. |
| GET | `/api/personal/vision` | Return the unified personal vision and alignment data. |
| PUT | `/api/personal/vision` | Update the unified personal vision. |
| PATCH | `/api/projects/:id` | Update a project and its planning metadata. |
| GET | `/api/personal/goals/intelligence` | Return integrated goal progress, task, risk, and alignment intelligence. |
| POST | `/api/personal/goals/:id/ai-task-plan` | Generate a reviewable task plan for one saved goal. |
| PATCH | `/api/tasks/:id` | Update a task's execution fields. |
| GET | `/api/tasks/:id/history` | Return completion, rescheduling, recurrence, and dependency history. |
| POST | `/api/tasks/:id/reschedule` | Reschedule a task with a dated reason and audit history. |
| PATCH | `/api/habits/:id` | Update or log a habit. |
| DELETE | `/api/habits/:id` | Delete a habit. |
| GET | `/api/planning/reviews` | List saved planning reviews. |
| POST | `/api/planning/ai-review` | Generate and save an AI-assisted planning review. |
| POST | `/api/backups/:filename/restore` | Stage and verify all database and file artifacts, create a pre-restore safety backup, activate the selected bundle, reconcile SQLite, and roll back database/uploads together on failure. |
| POST | `/api/backups/:filename/verify` | Validate backup schema, paths, file sizes, and SHA-256 checksums without changing current data. |

### Storage and global search

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/system/storage-status` | Return authoritative store, schema, WAL, foreign-key, migration, and verification status. |
| POST | `/api/system/storage-migrate` | Run the idempotent storage migration command. Existing verified SQLite remains unchanged. |
| POST | `/api/system/storage-verify` | Reconcile table counts, balances, debt totals, and finance totals against authoritative application state. |
| GET | `/api/system/integrity` | Run SQLite integrity checks and report database size, upload checksums, backup recency, and failed-operation counts. |
| GET | `/api/system/audit` | Return bounded persisted operational audit events; optional `limit` is capped at 500. |
| GET | `/api/system/ping` | Lightweight liveness check returning status and timestamp. |
| GET | `/api/personal/finance/accounts/:id/balance-history` | Return source-labelled authoritative balance history for a debit or credit account. |
| GET | `/api/ai/diagnostics/requests` | Return bounded provider-request diagnostics without prompts or sensitive records. |
| GET | `/api/preferences` | Return server-persisted non-sensitive preferences. |
| PUT | `/api/preferences` | Save appearance, notification, privacy, and accessibility preferences. |
| GET | `/api/search` | Search active goals, tasks, work tasks, accounts, transactions, and memories for the command palette. |
| GET | `/api/business/codebase` | Return a current, secret-free LifeOS architecture guide, learning path, and 43v3r business-development opportunities. |
| GET | `/api/business/code-learning` | Return Code Understanding Coach coverage, stages, confidence, and persistent learning records. |
| GET | `/api/business/code-learning/:featureId` | Return a safe guided feature trace, concepts, risks, and knowledge-check questions. |
| PATCH | `/api/business/code-learning/:featureId` | Save notes, confidence, and ordered Generated → Owned stage progress. |
| POST | `/api/business/code-learning/:featureId/check` | Grade a knowledge check, retain the attempt, and return teaching explanations. |
| GET | `/api/personal/career` | Return the verified career profile, résumé metadata, readiness gaps, and linked career tasks. |
| PATCH | `/api/personal/career` | Update editable career direction and preferences without altering verified résumé facts. |
| GET | `/api/personal/career/resume` | Download the private verified résumé stored by LifeOS. |
| POST | `/api/personal/career/task-pack` | Add the idempotent résumé, LinkedIn, portfolio, and interview development task pack. |
| GET | `/api/personal/career/github-evidence` | Return honest per-repository maturity, public signals, and user-verified proof. |
| POST | `/api/personal/career/github-evidence/refresh` | Refresh read-only public GitHub repository signals without treating claims as proof. |
| PATCH | `/api/personal/career/github-evidence/:repo` | Record explicit evidence links and verified proof types for one repository. |
| POST | `/api/personal/career/github-evidence/task-pack` | Add an idempotent flagship completion and proof task pack. |
| GET | `/api/google/status` | Return Google Calendar, Gmail, and Drive connection and sync status without credentials. |
| POST | `/api/google/oauth/start` | Start Google OAuth using the exact registered callback and least-privilege Calendar, Gmail, and Drive scopes. |
| GET | `/api/google/oauth/callback` | Exchange Google's authorization code and retain the refresh grant in the encrypted local vault. |
| POST | `/api/google/sync` | Sync upcoming Calendar events, recent Gmail metadata, and recent Drive file metadata. |
| GET | `/api/google/services/status` | Return separate Calendar, Gmail, and Drive health, retry, latency, and cursor state. |
| GET | `/api/google/sync-history` | Return bounded persistent startup, scheduled, and manual synchronization history. |
| POST | `/api/google/automation/sync` | Run the partial-failure-safe Google synchronizer manually. |
| GET | `/api/google/inbox` | List only important, starred, unread, or approved-rule email metadata and review state. |
| POST | `/api/google/inbox/:id/analyse` | Fetch an email body ephemerally, retain only its summary and source reference. |
| POST | `/api/google/inbox/:id/proposals` | Prepare an approval-only task, commitment, business lead, or ignore-rule proposal. |
| POST | `/api/google/calendar/reconcile-preview` | Compare a day, shift cycle, or seven-day LifeOS plan with owned and read-only Google events. |
| GET | `/api/google/drive/workspace` | Return the managed workspace, folder plan, resources, and safe index metadata. |
| POST | `/api/google/drive/structure-proposal` | Prepare the standard managed subfolder structure for approval. |
| POST | `/api/google/drive/upload-proposal` | Prepare an explicit local-file upload for approval (5 MB limit). |
| GET | `/api/google/drive/index` | List indexed managed files without extracted raw text. |
| POST | `/api/google/drive/index/:fileId` | Index an eligible LifeOS-created or explicitly uploaded Drive file. |
| GET | `/api/google/drive/search` | Search approved indexed Drive knowledge and return bounded excerpts with source links. |
| GET | `/api/google/business/status` | Return Tasks, Sheets, and Contacts service state and LifeOS authority policy. |
| POST | `/api/google/business/sync` | Synchronize Google Tasks and selected contact metadata with partial-service failure isolation. |
| GET | `/api/google/tasks` | List synchronized Google Tasks and durable LifeOS mappings. |
| POST | `/api/google/tasks/reconcile-preview` | Compare Google Tasks with authoritative LifeOS tasks without applying changes. |
| POST | `/api/google/tasks/:lifeTaskId/publish-proposal` | Prepare approval-only publication to the dedicated LifeOS Google Tasks list. |
| POST | `/api/google/tasks/:googleTaskId/import-proposal` | Prepare an external Google Task as a LifeOS task suggestion. |
| GET | `/api/google/sheets` | List managed reporting spreadsheets and export history. |
| POST | `/api/google/sheets/workspace-proposal` | Prepare the six managed business and finance spreadsheets. |
| POST | `/api/google/sheets/:sheetId/export-preview` | Prepare a row-level export into a LifeOS-owned range. |
| GET | `/api/google/contacts` | Search synchronized contact metadata and selected CRM links. |
| POST | `/api/google/contacts/:resource/import-proposal` | Prepare a selected contact for approval-only CRM linking. |
| POST | `/api/google/contacts/create-proposal` | Prepare approval-only creation of a Google contact. |
| POST | `/api/google/calendar/freebusy` | Read busy intervals for approved calendars without modifying external events. |
| GET | `/api/google/drive/:fileId/revisions` | List revision metadata for a managed LifeOS Drive file. |
| GET | `/api/automation/status` | Return scheduler state, interval, last run, and current attention counts. |
| GET | `/api/automation/rules` | Return shift-adaptive reminder categories and timing preferences. |
| PUT | `/api/automation/rules` | Update non-sensitive automation rules and per-day timing overrides. |
| POST | `/api/automation/evaluate` | Evaluate current authoritative records and persist idempotent in-app reminders. |
| GET | `/api/automation/history` | Return bounded persistent automation evaluation history. |
| GET | `/api/notifications` | List active, non-snoozed LifeOS attention records. |
| PATCH | `/api/notifications/:id` | Mark read, snooze, dismiss, or resolve one notification. |
| GET | `/api/personal/briefings/:date` | Return deterministic morning/evening briefings and shift-aware timing for a date. |
| POST | `/api/google/proposals/calendar-plan` | Prepare an approval-only proposal to publish a dated LifeOS plan to Google Calendar. |
| POST | `/api/google/proposals/business-pack` | Prepare an approval-only 43v3r Drive workspace proposal. |
| PATCH | `/api/google/proposals/:id` | Approve or reject a pending external Google change. |
| POST | `/api/google/disconnect` | Revoke the Google grant and remove its locally retained tokens and synchronized metadata. |
| POST | `/api/v1/simulation/slice` | Retired simulation endpoint; returns `501 not_configured`. |

## FinanceOS

FinanceOS uses CQRS handlers and is mounted at `/api/finance`.

| Method | Path | Principal input / result |
| --- | --- | --- |
| POST | `/api/finance/ledgers` | `name`, `currency`, `tenantId` → `201 { ledgerId }`. |
| POST | `/api/finance/accounts` | `ledgerId`, `code`, `name`, `type`, optional `parentId`, `isHalal`, `tenantId` → `201 { accountId }`. |
| POST | `/api/finance/journals` | `ledgerId`, `description`, `lines[]`, `isPurified`, `tenantId` → `201 { journalEntryId }`. Debits and credits must balance. |
| POST | `/api/finance/statements/import` | `ledgerId`, `csvContent`, `tenantId` → `{ importedIds }`. |
| POST | `/api/finance/statements/reconcile` | `ledgerId`, `statementLineId`, `journalEntryId`, `tenantId` → `{ success }`. |
| GET | `/api/finance/ledgers/:ledgerId/summary` | Optional query `tenantId`; returns ledger summary. |
| GET | `/api/finance/ledgers/:ledgerId/zakah/preview` | Optional `goldPrice`, `silverPrice`, `tenantId`; pure calculation. |
| GET | `/api/finance/ledgers/:ledgerId/zakah` | Deprecated preview alias; emits `Deprecation` and successor `Link` headers. |
| POST | `/api/finance/ledgers/:ledgerId/zakah/calculations` | Prices, tenant and `idempotencyKey` (or `Idempotency-Key` header); persists the calculation. |
| GET | `/api/finance/portfolio` | Optional query `tenantId`; returns portfolio valuation. |

Example:

```bash
curl -X POST http://localhost:3000/api/finance/ledgers \
  -H 'Content-Type: application/json' \
  -d '{"name":"Household","currency":"GBP","tenantId":"family"}'
```

## Keeping the reference complete

Run:

```bash
npm run docs:check
```

The checker extracts every literal Express route from `server.ts` and the FinanceOS controller, then fails if its public path is absent from this document. It checks route coverage; maintainers must still keep descriptions, inputs, outputs, and deprecation notes accurate.
