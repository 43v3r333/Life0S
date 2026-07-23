import assert from "node:assert/strict";
import test from "node:test";
import { buildShiftContext, enforceScheduleRules, isSunday, localDate, SUNDAY_OFF_NOTE } from "../server/workSchedule.js";

test("Sunday is always normalized to a non-working day", () => {
  assert.equal(isSunday("2026-07-19"), true);
  assert.deepEqual(enforceScheduleRules({ date: "2026-07-19", type: "day", start: "06:00", end: "18:00" }), {
    date: "2026-07-19", type: "off", start: "", end: "", notes: SUNDAY_OFF_NOTE,
  });
});

test("weekday assignments are preserved", () => {
  const shift = { date: "2026-07-20", type: "night" as const, start: "18:00", end: "06:00" };
  assert.deepEqual(enforceScheduleRules(shift), shift);
});

test("AI schedule context distinguishes today from the next working shift", () => {
  const context = buildShiftContext([
    { date: "2026-07-17", type: "off" },
    { date: "2026-07-18", type: "day" },
    { date: "2026-07-19", type: "off" },
  ], "2026-07-17");
  assert.equal(context.currentShift?.type, "off");
  assert.equal(context.nextWorkShift?.date, "2026-07-18");
  assert.equal(context.upcomingShifts.length, 3);
});

test("local date uses the configured South African timezone", () => {
  assert.equal(localDate("Africa/Johannesburg", new Date("2026-07-16T22:30:00Z")), "2026-07-17");
});
