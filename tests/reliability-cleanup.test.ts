import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { verifyBackup } from "../server/backupVerification.js";
import { parseProviderJson, ValidationError, validateStateEnvelope } from "../server/validation.js";

const root = path.resolve(process.cwd(), ".test-data", "backup-verification");
const fixture = async () => {
  await fs.rm(root, { recursive: true, force: true }); await fs.mkdir(root, { recursive: true });
  const state = { bankAccounts: [], bankTransactions: [], financeEntries: [], debts: [], goals: [], tasks: [], aiMemories: [] };
  const stateBytes = Buffer.from(JSON.stringify({ version: 2, state }));
  await fs.writeFile(path.join(root, "state.json"), stateBytes);
  await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify({ version: 2, createdAt: "2026-07-20T00:00:00Z", files: [{ path: "state.json", size: stateBytes.length, sha256: createHash("sha256").update(stateBytes).digest("hex") }] }));
  return state;
};

test("verified backup accepts checksummed state and rejects corruption", async () => {
  const state = await fixture(); const valid = await verifyBackup(root); assert.equal(valid.ok, true); assert.deepEqual(valid.state, state);
  await fs.appendFile(path.join(root, "state.json"), "corrupt");
  await assert.rejects(() => verifyBackup(root), (error: any) => error.code === "BACKUP_CHECKSUM_FAILED" && error.status === 409);
});

test("backup manifest cannot read outside its bundle", async () => {
  await fixture(); await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify({ version: 2, files: [{ path: "../secret", size: 1, sha256: "x" }] }));
  await assert.rejects(() => verifyBackup(root), (error: any) => error.code === "BACKUP_CHECKSUM_FAILED");
});

test("provider JSON and restored state require their declared schemas", () => {
  assert.deepEqual(parseProviderJson<{ actions: any[] }>('```json\n{"actions":[]}\n```', ["actions"]).actions, []);
  assert.throws(() => parseProviderJson("not-json", ["actions"]), ValidationError);
  assert.throws(() => validateStateEnvelope({ bankAccounts: {} }), ValidationError);
});
