export type FieldError = { field: string; message: string };

export class ValidationError extends Error {
  status = 400; code = "VALIDATION_FAILED"; fieldErrors: FieldError[]; recovery?: string;
  constructor(fieldErrors: FieldError[], message = "The request contains invalid data.", recovery?: string) { super(message); this.fieldErrors = fieldErrors; this.recovery = recovery; }
}

export const isIsoDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
export const finiteNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);
export const nonEmptyString = (value: unknown) => typeof value === "string" && value.trim().length > 0;
export const enumValue = <T extends string>(value: unknown, allowed: readonly T[]): value is T => typeof value === "string" && allowed.includes(value as T);

export function validateStateEnvelope(value: unknown) {
  const errors: FieldError[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) errors.push({ field: "state", message: "Backup state must be an object." });
  const state = value as Record<string, unknown>;
  for (const key of ["bankAccounts", "bankTransactions", "financeEntries", "debts", "goals", "tasks", "aiMemories"]) if (state && state[key] !== undefined && !Array.isArray(state[key])) errors.push({ field: key, message: "Must be an array." });
  if (errors.length) throw new ValidationError(errors, "The backup contains an invalid LifeOS state.", "Choose another verified backup; the current database was not changed.");
  return state;
}

export function parseProviderJson<T extends Record<string, unknown>>(content: unknown, requiredKeys: string[]): T {
  const clean = String(content || "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let parsed: unknown;
  try { parsed = JSON.parse(clean); } catch { throw new ValidationError([{ field: "providerResponse", message: "Provider returned malformed JSON." }], "AI output could not be validated.", "No changes were applied. Retry or use the deterministic local result."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new ValidationError([{ field: "providerResponse", message: "Expected a JSON object." }]);
  const missing = requiredKeys.filter(key => !(key in parsed));
  if (missing.length) throw new ValidationError(missing.map(field => ({ field, message: "Required provider output is missing." })), "AI output did not match the required schema.", "No changes were applied.");
  return parsed as T;
}
