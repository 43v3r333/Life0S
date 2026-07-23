import assert from "node:assert/strict";
import test from "node:test";
import { cacheStore } from "../server/cache.js";
import { toPersistedState, type DbState } from "../server/db.js";
import { syncGoalToGitHub } from "../server/github.js";

test("persistent state strips every runtime vault secret", () => {
  const state = {
    vault: { geminiKey: "secret-a", githubToken: "secret-b" },
    goals: [], tasks: [], habits: [], knowledgeObjects: [], systemEvents: [],
  } as unknown as DbState;

  const persisted = toPersistedState(state);
  assert.deepEqual(persisted.vault, { geminiKey: "", githubToken: "" });
  assert.equal(state.vault.geminiKey, "secret-a", "runtime state remains available in memory");
});

test("cache prefix invalidation clears all filtered variants", () => {
  cacheStore.clear();
  cacheStore.set("goals:all:q=:type=:status=", [1]);
  cacheStore.set("goals:all:q=finance:type=:status=", [2]);
  cacheStore.set("goals:dashboard", { total: 2 });

  assert.equal(cacheStore.deletePrefix("goals:all:"), 2);
  assert.equal(cacheStore.get("goals:all:q=:type=:status="), null);
  assert.deepEqual(cacheStore.get("goals:dashboard"), { total: 2 });
});

test("GitHub synchronization without credentials reports no external write", async () => {
  const result = await syncGoalToGitHub("Test goal", "Test definition", {});
  assert.equal(result.success, false);
  assert.equal(result.usingRealIntegration, false);
  assert.equal(result.issueNumber, undefined);
  assert.match(result.logs.join("\n"), /No external write was performed/);
});
