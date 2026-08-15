import assert from "node:assert/strict";
import test from "node:test";
import { buildLocalAssistantFallback, safeProviderError } from "../server/aiFallback.js";
import { apiErrorMessage } from "../src/ui/apiError.js";

test("structured API errors render their useful message", () => {
  assert.equal(apiErrorMessage({ error: { code: "AI_PROVIDER_FAILED", message: "Provider timed out." } }, "fallback"), "Provider timed out.");
  assert.equal(apiErrorMessage({ error: "Simple error" }, "fallback"), "Simple error");
  assert.equal(apiErrorMessage({}, "fallback"), "fallback");
});

test("provider failures produce a grounded deterministic response", () => {
  const result = buildLocalAssistantFallback({ goals: [{}], tasks: [{ status: "completed" }, { status: "open" }], debts: [{}], habits: [{}, {}] }, "Ethan", "timeout");
  assert.match(result.content, /1 goals/);
  assert.match(result.content, /2 tasks/);
  assert.match(result.content, /No authoritative records were changed/);
  assert.equal(result.provider, "Deterministic local capability");
  assert.equal(result.fallbackReason, "timeout");
});

test("provider error metadata is bounded and never stringifies objects", () => {
  assert.equal(safeProviderError({ message: "network unavailable" }), "network unavailable");
  assert.ok(safeProviderError(new Error("x".repeat(500))).length <= 300);
});
