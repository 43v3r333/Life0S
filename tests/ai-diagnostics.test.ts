import assert from "node:assert/strict";
import test from "node:test";
import { buildAiDiagnostics, excludeMemoriesSupersededByCurrentRecords } from "../server/aiDiagnostics.js";

test("authoritative current records exclude stale linked memories", () => {
  const state: any = { bankAccounts: [{ id: "a1", balance: 200, updatedAt: "2026-07-20T10:00:00Z" }], financeEntries: [], debts: [], goals: [], tasks: [], workTasks: [], workShifts: [], habits: [], aiActionProposals: [], aiMemories: [{ id: "m1", entityType: "account", entityId: "a1", content: "Balance is 100", lifecycleStatus: "active", verificationStatus: "user-confirmed", updatedAt: "2026-07-19T10:00:00Z" }, { id: "m2", category: "preference", content: "Compact layout", lifecycleStatus: "active", verificationStatus: "user-confirmed", updatedAt: "2026-07-20T11:00:00Z" }] };
  assert.deepEqual(excludeMemoriesSupersededByCurrentRecords(state, state.aiMemories).map(item => item.id), ["m2"]);
  const diagnostics = buildAiDiagnostics(state, { connected: false, provider: "Local", model: null });
  assert.equal(diagnostics.memory.excludedStale, 1);
  assert.equal(diagnostics.memory.conflicts, 1);
  assert.equal(diagnostics.provider.deterministicFallback, true);
  assert.equal(diagnostics.coverage.find(item => item.domain === "finance")?.covered, true);
});
