import assert from "node:assert/strict";
import test from "node:test";
import { buildAiContextRegistry, workspaceAiContext } from "../server/aiContextRegistry";

const state = {
  bankAccounts: [{ id: "account-1", updatedAt: "2026-07-21T08:00:00.000Z" }],
  financeEntries: [{ id: "entry-1", date: "2026-07-21" }],
  debts: [],
  bankTransactions: [{ id: "transaction-1", status: "pending", date: "2026-07-21" }],
  goals: [{ id: "goal_43v3r", title: "Build 43v3r", status: "Active" }],
  tasks: [{ id: "task-1", goalId: "goal_43v3r", status: "pending", dueDate: "2026-01-01" }],
  projects: [{ id: "project_43v3r", title: "LifeOS", status: "Active" }],
  habits: [{ id: "habit-1", updatedAt: "2026-07-20" }],
  focusSessions: [],
  workShifts: [{ id: "shift-1", date: "2026-07-22" }],
  workTasks: [],
  careerProfiles: [{ id: "career-1", updatedAt: "2026-07-23", headline: "IT and AI builder" }],
  careerDocuments: [{ id: "resume-1", type: "resume", status: "verified" }],
  aiMemories: [{ id: "memory-1", lifecycleStatus: "active", content: "Preference" }],
  aiMemoryCandidates: [{ id: "candidate-1", status: "pending" }],
  googleWorkspace: { calendarEvents: [], gmailMessages: [], driveFiles: [] },
  vault: { nvidiaKey: "must-never-be-returned" }
};

test("AI context registry covers every active LifeOS domain without secrets", () => {
  const registry = buildAiContextRegistry(state);
  assert.deepEqual(registry.domains.map((domain) => domain.id), ["finance", "goals", "tasks", "daily", "work", "career", "business", "google", "memory"]);
  assert.equal(registry.policy.writesRequireApproval, true);
  assert.equal(registry.domains.find((domain) => domain.id === "finance")?.attention, 1);
  assert.equal(registry.domains.find((domain) => domain.id === "memory")?.attention, 1);
  assert.equal(JSON.stringify(registry).includes("must-never-be-returned"), false);
});

test("page-aware context includes business and work on the Work screen", () => {
  const context = workspaceAiContext(buildAiContextRegistry(state), "work");
  assert.deepEqual(context.domains.map((domain) => domain.id), ["work", "career", "business", "tasks", "google"]);
  assert.ok(context.prompts.some((prompt) => prompt.includes("customer problem")));
});

test("assistant modes use one shared registry with relevant authoritative domains", () => {
  const registry=buildAiContextRegistry(state);
  assert.deepEqual(workspaceAiContext(registry,"finance").domains.map(item=>item.id),["finance"]);
  assert.deepEqual(workspaceAiContext(registry,"debt").domains.map(item=>item.id),["finance"]);
  assert.ok(workspaceAiContext(registry,"today").domains.some(item=>item.id==="daily"));
  assert.ok(workspaceAiContext(registry,"business").domains.some(item=>item.id==="business"));
});
