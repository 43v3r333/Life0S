import test from "node:test";
import assert from "node:assert/strict";
import { calendarFingerprint, emailSelectionReason, nextRetry, reconcileCalendar, searchDriveIndex } from "../server/googleAutomation.js";

test("Google retry backoff is bounded and fingerprints are stable", () => {
  const start = Date.parse("2026-07-22T10:00:00Z");
  assert.equal(nextRetry(1, start), "2026-07-22T10:02:00.000Z");
  assert.equal(nextRetry(20, start), "2026-07-22T11:00:00.000Z");
  assert.equal(calendarFingerprint("2026-07-22:health:1"), calendarFingerprint("2026-07-22:health:1"));
});

test("important email reasons prefer approved rules then Gmail labels", () => {
  assert.match(emailSelectionReason({ from: "Customer <lead@example.com>", subject: "Pilot", labelIds: [] }, [{ name: "Customers", sender: "example.com" }])!, /approved rule/);
  assert.equal(emailSelectionReason({ labelIds: ["IMPORTANT"] }), "Gmail important");
  assert.equal(emailSelectionReason({ labelIds: [] }), null);
});

test("calendar reconciliation never proposes changing external events", () => {
  const desired = [{ sourceKey: "a", title: "LifeOS · Study", start: "2026-07-22T10:00", end: "2026-07-22T11:00" }];
  const existing = [{ id: "personal", title: "Doctor", start: "2026-07-22T10:30", end: "2026-07-22T11:30", owned: false }];
  const diff = reconcileCalendar(desired, existing);
  assert.equal(diff.creates.length, 1); assert.equal(diff.removals.length, 0); assert.equal(diff.conflicts.length, 1);
});

test("Drive search returns excerpts without exposing complete indexed content", () => {
  const results = searchDriveIndex([{ id: "1", name: "Business Plan", extractedText: "customer validation roadmap" }], "customer roadmap");
  assert.equal(results[0].score, 2); assert.equal("extractedText" in results[0], false); assert.match(results[0].excerpt, /validation/);
});
