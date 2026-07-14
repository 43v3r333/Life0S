# LifeOS HTTP API reference

LifeOS exposes an Express JSON API alongside the Vite application. Unless stated otherwise, send `Content-Type: application/json`; successful responses are JSON. Local development defaults to `http://localhost:3000` (or the port printed by `npm run dev`).

## Conventions and current constraints

- There is currently no global authentication middleware. The auth and SSO routes are prototypes and must not be treated as production identity controls.
- Most application data is process-local demo state. Restarting the server may reset it.
- AI-backed endpoints use `GEMINI_API_KEY`; `/api/chat` has an offline fallback, while planning and knowledge AI operations may return `500` when the key is absent.
- `tenantId` defaults to `system-default` on FinanceOS queries. FinanceOS commands accept it in the JSON body.
- Errors are JSON, usually `{ "error": "message" }`; FinanceOS can return SDK problem details with a `status` field.
- The server contains both legacy action-style goal routes and newer REST-style goal routes. Because Express evaluates handlers in registration order, duplicate `GET /api/goals` and `POST /api/goals` registrations are compatibility debt; clients should prefer the REST-style routes described under Goals.

## Health and metadata

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/healthz` | Liveness, uptime, and simulated database-overload status. |
| GET | `/api/readyz` | Readiness of database, memory, cache, and messaging components. |
| GET | `/api/health` | Product codename, phase, and version. |
| GET | `/api/openapi-spec` | Runtime-generated OpenAPI 3.0.3 document (currently partial). |
| GET | `/api/scaffold-files` | List readable files in the bundled scaffold tree. |

## Identity, vault, scores, and assistant

| Method | Path | Input / purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticate the demo user; JSON credentials. |
| POST | `/api/auth/register` | Register a demo user profile. |
| GET | `/api/auth/sessions` | List known sessions. |
| POST | `/api/auth/sessions/revoke` | Revoke a session by body `id`. |
| GET | `/api/vault` | Return configured-secret presence flags, never raw secrets. |
| POST | `/api/vault/save` | Update supported server-side integration secrets. |
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
| POST | `/api/v1/simulation/slice` | Execute the vertical-slice simulation payload. |

## Cognitive, PMO, and integrations

All routes in this section currently return demonstration telemetry and configuration snapshots.

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
