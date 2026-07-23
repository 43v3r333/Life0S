import test from "node:test";
import assert from "node:assert/strict";
import { CODE_FEATURES, learningSummary } from "../server/codeLearning.js";

test("code coach covers core LifeOS architecture paths", () => {
  assert.ok(CODE_FEATURES.length >= 5);
  assert.ok(CODE_FEATURES.every(feature => feature.flow.length >= 4 && feature.questions.length >= 3));
  assert.equal(JSON.stringify(CODE_FEATURES).includes("API_KEY"), false);
});

test("learning summary distinguishes tested code from owned understanding", () => {
  const records = [
    { featureId: CODE_FEATURES[0].id, stage: "tested", confidence: 50 },
    { featureId: CODE_FEATURES[1].id, stage: "owned", confidence: 90 },
  ];
  const summary = learningSummary(records);
  assert.equal(summary.tested, 2);
  assert.equal(summary.owned, 1);
  assert.ok(summary.averageConfidence < 50);
});
