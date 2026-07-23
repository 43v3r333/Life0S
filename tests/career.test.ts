import test from "node:test";
import assert from "node:assert/strict";
import { careerReadiness, initialCareerProfile, projectEvidenceScore } from "../server/career.js";

test("career readiness is grounded in verified resume and portfolio evidence", () => {
  const result = careerReadiness(initialCareerProfile, []);
  assert.equal(result.score, 80);
  assert.equal(result.gaps.length, 3);
});

test("completed career work improves readiness without exceeding 100", () => {
  const tasks = Array.from({ length: 8 }, (_, index) => ({ title: `Career ${index}`, status: "completed", contextTags: ["career"] }));
  const result = careerReadiness(initialCareerProfile, tasks);
  assert.equal(result.score, 100);
  assert.equal(result.completedCareerTasks, 8);
});

test("source code and README do not make a project verified", () => {
  const score = projectEvidenceScore({ publicSignals: { sourceCode: true, hasReadme: true, repeatableSetup: true, hasTests: true, hasCi: false, hasRelease: false, hasLiveDemo: false }, verifiedEvidence: { reproducibleRun: false, automatedTestReport: false, demoMedia: false, caseStudy: false, userOutcome: false } });
  assert.ok(score < 50);
});

test("complete reproducible evidence reaches portfolio strength", () => {
  const score = projectEvidenceScore({ publicSignals: { sourceCode: true, hasReadme: true, repeatableSetup: true, hasTests: true, hasCi: true, hasRelease: true, hasLiveDemo: true }, verifiedEvidence: { reproducibleRun: true, automatedTestReport: true, demoMedia: true, caseStudy: true, userOutcome: true } });
  assert.equal(score, 100);
});
