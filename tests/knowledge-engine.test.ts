import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKnowledgeGraph,
  createKnowledgeEngine,
  ensureKnowledgeState,
  analyzeFinanceDeterministically,
  sanitizeKnowledgePayload,
} from "../server/knowledgeEngine";

const fixture = (): any => ({
  vault: { openai: { value: "secret" } },
  sessions: [{ token: "session-secret" }],
  bankAccounts: [{ id: "a1", name: "Cheque", balance: 100, balanceUpdatedAt: "2025-01-01T00:00:00.000Z" }],
  debts: [{ id: "d1", name: "Loan", balance: 50 }],
  bankTransactions: [
    { id: "t1", bankAccountId: "a1", amount: -10, date: "2026-07-01", description: "Shop", status: "pending" },
    { id: "t2", bankAccountId: "a1", amount: -10, date: "2026-07-01", description: "Shop", status: "pending" },
  ],
  goals: [{ id: "g1", title: "Graduate" }],
  tasks: [{ id: "task1", title: "Assignment", contextTags: ["school", "school:module:enterprise-analysis"] }],
  aiMemories: [],
  aiActionProposals: [],
});

test("knowledge provider payloads exclude secrets, sessions, and binary content", () => {
  const sanitized = sanitizeKnowledgePayload({
    email: "allowed@example.test",
    passwordHash: "forbidden",
    sessions: [{ token: "forbidden" }],
    vault: { value: "forbidden" },
    note: "allowed",
    rawBinary: "forbidden",
  });
  assert.deepEqual(sanitized, { email: "allowed@example.test", note: "allowed" });
});

test("deterministic finance review reports discrepancies without inventing corrections", () => {
  const findings = analyzeFinanceDeterministically(fixture());
  assert.ok(findings.some((finding) => finding.kind === "stale-balance"));
  assert.ok(findings.some((finding) => finding.kind === "missing-field"));
  assert.ok(findings.some((finding) => finding.kind === "reconciliation-gap"));
  assert.ok(findings.some((finding) => finding.kind === "possible-duplicate"));
  assert.ok(findings.every((finding) => !("proposedValue" in finding)));
});

test("knowledge graph links school, finance, goals, claims, and evidence", () => {
  const state = fixture();
  ensureKnowledgeState(state);
  state.knowledgeClaims.push({
    id: "claim1", domain: "finance", claimType: "observation", content: "Evidence-backed claim", status: "confirmed",
    confidence: 0.8, truthStatus: "confirmed", evidenceRefs: ["e1"], createdAt: new Date().toISOString(),
  });
  state.knowledgeEvidence.push({ id: "e1", domain: "finance", recordType: "account", recordId: "a1", authorityLevel: 2 });
  const graph = buildKnowledgeGraph(state);
  assert.ok(graph.nodes.some((node) => node.type === "school-module"));
  assert.ok(graph.edges.some((edge) => edge.type === "belongs-to"));
  assert.ok(graph.edges.some((edge) => edge.type === "coursework-for"));
});

test("analysis queue deduplicates events and provider output stays pending", async () => {
  const state = fixture();
  let providerPayload = "";
  const engine = createKnowledgeEngine({
    state,
    save: async () => undefined,
    audit: () => undefined,
    provider: async (payload) => {
      providerPayload = JSON.stringify(payload);
      return {
        usage: { inputTokens: 10, outputTokens: 5 },
        claims: [{ domain: "finance", claimType: "inference", content: "Candidate", confidence: 0.99, evidenceRefs: [] }],
        proposals: [{ domain: "finance", type: "amount_change", explanation: "Candidate only", confidence: 0.99 }],
      };
    },
  });
  const dueAt = new Date(Date.now() - 1_000).toISOString();
  const first = await engine.enqueue(["finance"], "event", dueAt);
  const second = await engine.enqueue(["finance"], "event", dueAt);
  assert.ok(first && second);
  assert.equal(first.id, second.id);
  await engine.tick();
  assert.equal(state.knowledgeClaims[0].truthStatus, "proposed");
  assert.equal(state.knowledgeClaims[0].freshnessStatus, "unverified");
  assert.equal(state.knowledgeClaims[0].originatingRunId, state.knowledgeAnalysisRuns[0].id);
  assert.equal(state.aiActionProposals[0].status, "pending");
  assert.ok(state.knowledgeClaims[0].confidence <= 0.89);
  assert.doesNotMatch(providerPayload, /secret|session-secret/);
});

test("an interrupted durable run is recovered after restart", () => {
  const state = fixture();
  state.knowledgeAnalysisQueue = [{ id: "q1", status: "processing", dueAt: "2099-01-01T00:00:00.000Z" }];
  ensureKnowledgeState(state);
  assert.equal(state.knowledgeAnalysisQueue[0].status, "pending");
  assert.equal(state.knowledgeAnalysisQueue[0].recoveredAfterRestart, true);
});

test("legacy memories gain additive authoritative provenance", () => {
  const state = fixture();
  state.aiMemories.push({ id: "m1", content: "Confirmed preference", verificationStatus: "user-confirmed", sourceType: "user-confirmed", createdAt: new Date().toISOString() });
  ensureKnowledgeState(state);
  assert.equal(state.aiMemories[0].truthStatus, "confirmed");
  assert.equal(state.aiMemories[0].sourcePriority, 100);
  assert.deepEqual(state.aiMemories[0].evidenceRefs, []);
});
