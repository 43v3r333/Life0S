import assert from "node:assert/strict";
import test from "node:test";
import { buildCodebaseGuide } from "../server/codebaseService.js";

test("codebase guide connects real architecture to the 43v3r goal without secrets", async () => {
  const state = { goals: [{ id: "goal_43v3r", title: "Build 43v3r Technology", status: "Active", progress: 10 }], tasks: [{ id: "t1", goalId: "goal_43v3r", status: "pending" }] };
  const guide = await buildCodebaseGuide(process.cwd(), state);
  assert.equal(guide.businessDevelopment.goal?.id, "goal_43v3r");
  assert.ok(guide.architecture.some(item => item.id === "data"));
  assert.equal(guide.learningPath.length, 5);
  assert.ok(guide.metrics.sourceFiles > 0);
  assert.equal(JSON.stringify(guide).includes("API_KEY"), false);
});
