import type { Express } from "express";
import { randomUUID } from "crypto";

export const LEARNING_STAGES = ["generated", "reviewed", "tested", "explained", "owned"] as const;
type Stage = typeof LEARNING_STAGES[number];

export const CODE_FEATURES = [
  {
    id: "finance-transaction-flow",
    title: "Finance transaction flow",
    problem: "Turn a confirmed bank transaction into trustworthy balances, spending analytics, and AI context without double counting.",
    concepts: ["React state", "HTTP APIs", "validation", "SQLite transactions", "derived analytics"],
    durationMinutes: 90,
    flow: [
      { layer: "UI", file: "src/components/PersonalOperationsView.tsx", explanation: "The user reviews or records the transaction." },
      { layer: "API", file: "server.ts", explanation: "The route validates the request and coordinates the update." },
      { layer: "Domain", file: "server/balanceHistory.ts", explanation: "Shared rules preserve authoritative balance history and source metadata." },
      { layer: "Storage", file: "server/sqliteStore.ts", explanation: "The complete state change is committed transactionally to SQLite." },
      { layer: "Read model", file: "src/components/FinanceInsightsPanel.tsx", explanation: "Dashboards recompute from the saved transaction records." },
    ],
    risks: ["Counting transfers as spending", "Overwriting a balance without an authoritative source", "Showing stale analytics after confirmation"],
    questions: [
      { prompt: "Which layer is authoritative for persisted LifeOS records?", options: ["React component state", "SQLite state", "AI memory"], answer: 1, explanation: "SQLite is authoritative; UI and AI consume its records." },
      { prompt: "Why is balance history separate from a current balance?", options: ["For decoration", "To retain source, previous value, and effective date", "To avoid validation"], answer: 1, explanation: "History makes changes auditable and prevents unexplained overwrites." },
      { prompt: "Should an internal transfer increase spending?", options: ["Yes", "Only when AI says so", "No"], answer: 2, explanation: "Money moving between owned accounts is not consumption." },
    ],
  },
  {
    id: "grounded-ai-context",
    title: "Grounded AI and memory",
    problem: "Answer personal questions using current LifeOS records while preventing stale memories or AI observations from becoming facts.",
    concepts: ["context retrieval", "source precedence", "RAG", "structured prompts", "approval boundaries"],
    durationMinutes: 75,
    flow: [
      { layer: "Registry", file: "server/aiContextRegistry.ts", explanation: "Declares which domains are available and which records are authoritative." },
      { layer: "Retrieval", file: "server/aiDiagnostics.ts", explanation: "Excludes stale memories superseded by current records." },
      { layer: "Prompt", file: "server.ts", explanation: "Builds a compact, question-relevant snapshot without secrets or raw documents." },
      { layer: "Provider", file: "server.ts", explanation: "Calls NVIDIA or a configured provider and validates the response." },
      { layer: "Approval", file: "src/components/AiActionCenter.tsx", explanation: "Keeps proposed writes pending until the user approves them." },
    ],
    risks: ["Sending unrelated private data", "Using stale memory over current records", "Presenting generated text as an authoritative write"],
    questions: [
      { prompt: "Which source wins when memory conflicts with a newer account record?", options: ["Memory", "Current account record", "Whichever is longer"], answer: 1, explanation: "Current authoritative records outrank memory." },
      { prompt: "Can an AI observation directly change finance data?", options: ["Yes", "Only at night", "No, it requires an approved proposal"], answer: 2, explanation: "AI writes remain approval-only." },
      { prompt: "Why is context selected by question?", options: ["To reduce unrelated private data and improve relevance", "To hide errors", "To replace SQLite"], answer: 0, explanation: "Context isolation improves privacy and grounding." },
    ],
  },
  {
    id: "daily-shift-planning",
    title: "Shift-adaptive daily planning",
    problem: "Account for every minute while protecting sleep, recovery, health, study, responsibilities, and relaxation around Team C shifts.",
    concepts: ["pure functions", "time zones", "schedule constraints", "deterministic aggregation", "recurrence"],
    durationMinutes: 60,
    flow: [
      { layer: "Shift rules", file: "server/workSchedule.ts", explanation: "Normalizes Team C assignments and enforces Sundays off." },
      { layer: "Planning", file: "server/dayPlanner.ts", explanation: "Builds a full 1,440-minute plan from shift and task constraints." },
      { layer: "Daily state", file: "server.ts", explanation: "Aggregates tasks, habits, finance commitments, prayers, and focus sessions." },
      { layer: "UI", file: "src/components/PlannerCalendarView.tsx", explanation: "Shows the authoritative day and supports recorded actions." },
    ],
    risks: ["Planning work during protected sleep", "Using the wrong timezone", "Fabricating schedule entries"],
    questions: [
      { prompt: "How many minutes must a complete day plan account for?", options: ["720", "1,440", "2,400"], answer: 1, explanation: "A full day contains 1,440 minutes." },
      { prompt: "What happens on Sundays?", options: ["Team C always works", "The saved Sunday-off rule wins", "AI decides"], answer: 1, explanation: "Sunday is deterministically normalized as off." },
      { prompt: "Can AI silently reschedule authoritative tasks?", options: ["Yes", "No, it proposes changes for approval", "Only finance tasks"], answer: 1, explanation: "Rescheduling is approval-only." },
    ],
  },
  {
    id: "google-approval-bridge",
    title: "Google approval bridge",
    problem: "Use Calendar, Gmail, Drive, Tasks, Sheets, and Contacts without allowing uncontrolled external writes.",
    concepts: ["OAuth", "scopes", "sync cursors", "idempotency", "external ownership", "proposal queues"],
    durationMinutes: 75,
    flow: [
      { layer: "OAuth", file: "server/googleWorkspace.ts", explanation: "Requests defined Google scopes and stores refresh credentials in the encrypted vault." },
      { layer: "Sync", file: "server/googleAutomation.ts", explanation: "Imports bounded metadata with retry and service-specific status." },
      { layer: "Business bridge", file: "server/googleBusiness.ts", explanation: "Reconciles Tasks, Sheets, and selected Contacts while LifeOS remains authoritative." },
      { layer: "Proposal UI", file: "src/components/GoogleWorkspaceView.tsx", explanation: "Shows external changes before approval." },
    ],
    risks: ["Changing non-LifeOS events", "Exposing OAuth credentials", "Treating Google Tasks as authoritative LifeOS work"],
    questions: [
      { prompt: "Which system remains authoritative for tasks?", options: ["Google", "LifeOS", "Email"], answer: 1, explanation: "Google Tasks is an execution bridge; LifeOS remains authoritative." },
      { prompt: "Can LifeOS modify personal Google events it did not create?", options: ["Yes", "No", "Only on Sunday"], answer: 1, explanation: "Non-LifeOS events remain read-only constraints." },
      { prompt: "Where are OAuth credentials allowed?", options: ["Ordinary AI prompts", "Encrypted local vault", "README"], answer: 1, explanation: "Credentials stay in the encrypted vault." },
    ],
  },
  {
    id: "sqlite-reliability",
    title: "SQLite persistence and recovery",
    problem: "Preserve personal records across restarts and make migrations, backups, and restoration verifiable.",
    concepts: ["SQLite", "transactions", "schema migrations", "checksums", "rollback", "integrity checks"],
    durationMinutes: 75,
    flow: [
      { layer: "Initialization", file: "server/db.ts", explanation: "Loads the authoritative SQLite state and refuses unsafe startup." },
      { layer: "Schema", file: "server/sqliteStore.ts", explanation: "Creates versioned normalized tables and transactionally mirrors application state." },
      { layer: "Verification", file: "server/sqliteStore.ts", explanation: "Compares counts and financial totals before accepting migration." },
      { layer: "Recovery", file: "server/backupVerification.ts", explanation: "Checks manifests and file hashes before restoration." },
    ],
    risks: ["Partial writes", "Migrating with mismatched totals", "Restoring corrupt or path-traversing backup files"],
    questions: [
      { prompt: "What happens when migration reconciliation fails?", options: ["Continue anyway", "Startup stops to protect data", "Delete the old data"], answer: 1, explanation: "LifeOS fails safely and retains rollback artifacts." },
      { prompt: "Why use a database transaction?", options: ["To make related changes all succeed or all fail", "To improve font size", "To bypass validation"], answer: 0, explanation: "Transactions prevent partial multi-record writes." },
      { prompt: "What verifies backup files were not altered?", options: ["Their filename", "Checksums", "AI confidence"], answer: 1, explanation: "The manifest and checksums verify file integrity." },
    ],
  },
];

const stageIndex = (stage: unknown) => LEARNING_STAGES.indexOf(stage as Stage);

export function learningSummary(records: any[]) {
  const normalized = CODE_FEATURES.map(feature => records.find(record => record.featureId === feature.id) || { featureId: feature.id, stage: "generated", confidence: 0, attempts: [] });
  return {
    total: normalized.length,
    reviewed: normalized.filter(record => stageIndex(record.stage) >= 1).length,
    tested: normalized.filter(record => stageIndex(record.stage) >= 2).length,
    explained: normalized.filter(record => stageIndex(record.stage) >= 3).length,
    owned: normalized.filter(record => record.stage === "owned").length,
    averageConfidence: normalized.length ? Math.round(normalized.reduce((sum, record) => sum + Number(record.confidence || 0), 0) / normalized.length) : 0,
  };
}

export function registerCodeLearningRoutes(app: Express, dependencies: { state: Record<string, any>; saveState: () => Promise<void>; audit: (action: string, details?: any) => unknown }) {
  const { state, saveState, audit } = dependencies;
  state.codeLearningRecords ||= [];
  const recordFor = (featureId: string) => {
    let record = state.codeLearningRecords.find((item: any) => item.featureId === featureId);
    if (!record) {
      record = { id: randomUUID(), featureId, stage: "generated", confidence: 0, notes: "", attempts: [], history: [{ stage: "generated", at: new Date().toISOString(), source: "AI-generated code baseline" }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      state.codeLearningRecords.push(record);
    }
    return record;
  };

  app.get("/api/business/code-learning", (_req, res) => {
    const records = CODE_FEATURES.map(feature => ({ ...recordFor(feature.id), feature: { id: feature.id, title: feature.title, problem: feature.problem, concepts: feature.concepts, durationMinutes: feature.durationMinutes } }));
    res.json({ stages: LEARNING_STAGES, summary: learningSummary(records), records, policy: "A passing build proves software quality, not personal understanding. Owned requires review, testing, explanation, and a passed knowledge check." });
  });

  app.get("/api/business/code-learning/:featureId", (req, res) => {
    const feature = CODE_FEATURES.find(item => item.id === req.params.featureId);
    if (!feature) return res.status(404).json({ error: { code: "LEARNING_FEATURE_NOT_FOUND", message: "Learning feature not found.", fieldErrors: [] } });
    const { questions, ...safeFeature } = feature;
    res.json({ feature: { ...safeFeature, questions: questions.map(({ answer, ...question }) => question) }, record: recordFor(feature.id), stages: LEARNING_STAGES });
  });

  app.patch("/api/business/code-learning/:featureId", async (req, res) => {
    const feature = CODE_FEATURES.find(item => item.id === req.params.featureId);
    if (!feature) return res.status(404).json({ error: { code: "LEARNING_FEATURE_NOT_FOUND", message: "Learning feature not found.", fieldErrors: [] } });
    const record = recordFor(feature.id);
    if (req.body.notes !== undefined) record.notes = String(req.body.notes).slice(0, 4000);
    if (req.body.confidence !== undefined) record.confidence = Math.max(0, Math.min(100, Number(req.body.confidence) || 0));
    if (req.body.stage !== undefined) {
      const requested = stageIndex(req.body.stage), current = stageIndex(record.stage);
      if (requested < 0 || requested > current + 1) return res.status(400).json({ error: { code: "LEARNING_STAGE_INVALID", message: "Complete understanding stages in order.", fieldErrors: [{ field: "stage", message: `Next allowed stage is ${LEARNING_STAGES[current + 1] || record.stage}.` }] } });
      if (req.body.stage === "explained" && !(record.attempts || []).some((attempt: any) => attempt.passed)) return res.status(409).json({ error: { code: "KNOWLEDGE_CHECK_REQUIRED", message: "Pass the knowledge check before marking this feature explained.", fieldErrors: [] } });
      if (req.body.stage === "owned" && (record.confidence < 70 || !(record.attempts || []).some((attempt: any) => attempt.passed))) return res.status(409).json({ error: { code: "OWNERSHIP_EVIDENCE_REQUIRED", message: "Owned requires a passed knowledge check and at least 70% confidence.", fieldErrors: [] } });
      if (requested !== current) {
        record.stage = req.body.stage;
        record.history.push({ stage: record.stage, at: new Date().toISOString(), source: "user-confirmed" });
      }
    }
    record.updatedAt = new Date().toISOString();
    audit("code_learning_updated", { featureId: feature.id, stage: record.stage, confidence: record.confidence });
    await saveState();
    res.json(record);
  });

  app.post("/api/business/code-learning/:featureId/check", async (req, res) => {
    const feature = CODE_FEATURES.find(item => item.id === req.params.featureId);
    if (!feature) return res.status(404).json({ error: { code: "LEARNING_FEATURE_NOT_FOUND", message: "Learning feature not found.", fieldErrors: [] } });
    const answers = Array.isArray(req.body.answers) ? req.body.answers.map(Number) : [];
    if (answers.length !== feature.questions.length) return res.status(400).json({ error: { code: "KNOWLEDGE_CHECK_INCOMPLETE", message: "Answer every knowledge-check question.", fieldErrors: [] } });
    const results = feature.questions.map((question, index) => ({ index, correct: answers[index] === question.answer, explanation: question.explanation }));
    const score = Math.round((results.filter(result => result.correct).length / results.length) * 100), passed = score >= 80;
    const record = recordFor(feature.id);
    record.attempts = [{ id: randomUUID(), score, passed, createdAt: new Date().toISOString() }, ...(record.attempts || [])].slice(0, 20);
    record.updatedAt = new Date().toISOString();
    audit("code_learning_check_completed", { featureId: feature.id, score, passed });
    await saveState();
    res.json({ score, passed, results, next: passed ? "You may mark this feature Explained after reviewing the result." : "Review the explanations and try again." });
  });
}
