export const WORK_TIMEZONE = "Africa/Johannesburg";
export const SUNDAY_OFF_NOTE = "Sunday — company-wide non-working day";

export type WorkShift = {
  id?: string;
  date: string;
  type: "day" | "night" | "off" | "leave";
  start?: string;
  end?: string;
  notes?: string;
  [key: string]: unknown;
};

export function localDate(timeZone = WORK_TIMEZONE, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function isSunday(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
}

export function enforceScheduleRules<T extends WorkShift>(shift: T): T {
  if (!isSunday(shift.date)) return { ...shift };
  return { ...shift, type: "off", start: "", end: "", notes: SUNDAY_OFF_NOTE };
}

export function buildShiftContext(shifts: WorkShift[], today = localDate()) {
  const ordered = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
  const currentShift = ordered.find((shift) => shift.date === today) || null;
  const upcomingShifts = ordered.filter((shift) => shift.date >= today).slice(0, 14);
  const nextWorkShift = ordered.find((shift) => shift.date >= today && ["day", "night"].includes(shift.type)) || null;
  return { currentShift, nextWorkShift, upcomingShifts };
}
