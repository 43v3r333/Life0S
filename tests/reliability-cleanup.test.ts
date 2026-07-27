import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { REQUIRED_BACKUP_ARTIFACTS, verifyBackup } from "../server/backupVerification.js";
import { restoreBundleAtomically } from "../server/backupRestore.js";
import { parseProviderJson, ValidationError, validateStateEnvelope } from "../server/validation.js";

const root = path.resolve(process.cwd(), ".test-data", "backup-verification");
const fixture = async () => {
  await fs.rm(root, { recursive: true, force: true }); await fs.mkdir(root, { recursive: true });
  const state = { bankAccounts: [], bankTransactions: [], financeEntries: [], debts: [], goals: [], tasks: [], aiMemories: [] };
  const stateBytes = Buffer.from(JSON.stringify({ version: 2, state }));
  await fs.writeFile(path.join(root, "state.json"), stateBytes);
  const sqlite = new DatabaseSync(path.join(root, "lifeos.sqlite"));
  sqlite.exec("CREATE TABLE app_state (id INTEGER PRIMARY KEY CHECK (id = 1), json TEXT NOT NULL)");
  sqlite.prepare("INSERT INTO app_state (id, json) VALUES (1, ?)").run(JSON.stringify(state));
  sqlite.close();
  await fs.writeFile(path.join(root, "qdrant.json"), "[]");
  await fs.mkdir(path.join(root, "statements"));
  await fs.writeFile(path.join(root, "statements", "statement.txt"), "statement");
  await fs.mkdir(path.join(root, "balance-screenshots"));
  await fs.writeFile(path.join(root, "balance-screenshots", "balance.png"), "screenshot");
  const files: Array<{ path: string; size: number; sha256: string }> = [];
  const visit = async (directory: string) => {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.name !== "manifest.json") {
        const bytes = await fs.readFile(absolute);
        files.push({ path: path.relative(root, absolute), size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
      }
    }
  };
  await visit(root);
  await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify({ version: 2, createdAt: "2026-07-20T00:00:00Z", requiredArtifacts: REQUIRED_BACKUP_ARTIFACTS, files }));
  return state;
};

test("verified backup accepts checksummed state and rejects corruption", async () => {
  const state = await fixture(); const valid = await verifyBackup(root); assert.equal(valid.ok, true); assert.deepEqual(valid.state, state);
  await fs.appendFile(path.join(root, "state.json"), "corrupt");
  await assert.rejects(() => verifyBackup(root), (error: any) => error.code === "BACKUP_CHECKSUM_FAILED" && error.status === 409);
});

test("backup manifest cannot read outside its bundle", async () => {
  await fixture(); await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify({ version: 2, requiredArtifacts: REQUIRED_BACKUP_ARTIFACTS, files: [{ path: "../secret", size: 1, sha256: "x" }] }));
  await assert.rejects(() => verifyBackup(root), (error: any) => error.code === "BACKUP_CHECKSUM_FAILED");
});

test("current backup verification requires and includes balance screenshots", async () => {
  await fixture();
  const valid = await verifyBackup(root);
  assert.equal(valid.requiredArtifacts.includes("balance-screenshots"), true);
  assert.equal(await fs.readFile(path.join(root, "balance-screenshots", "balance.png"), "utf8"), "screenshot");
  await fs.rm(path.join(root, "balance-screenshots"), { recursive: true });
  await assert.rejects(() => verifyBackup(root), (error: any) => error.code === "BACKUP_CHECKSUM_FAILED" && error.details.includes("balance-screenshots"));
});

test("restore rolls back every live file after a simulated activation failure", async () => {
  await fixture();
  const liveRoot = path.resolve(process.cwd(), ".test-data", "restore-rollback");
  await fs.rm(liveRoot, { recursive: true, force: true });
  await fs.mkdir(path.join(liveRoot, "statements"), { recursive: true });
  await fs.mkdir(path.join(liveRoot, "balance-screenshots"), { recursive: true });
  await fs.writeFile(path.join(liveRoot, "qdrant.json"), "live-vectors");
  await fs.writeFile(path.join(liveRoot, "statements", "live.txt"), "live-statement");
  await fs.writeFile(path.join(liveRoot, "balance-screenshots", "live.png"), "live-screenshot");

  await assert.rejects(() => restoreBundleAtomically({
    backupPath: root,
    dataDirectory: liveRoot,
    createSafetyBackup: async () => "pre-restore-safety",
    activateState: async () => undefined,
    rollbackState: async () => undefined,
    verifyActivatedState: () => ({ ok: true }),
    afterArtifactActivated: (artifact) => { if (artifact === "statements") throw new Error("simulated file activation failure"); },
  }), /simulated file activation failure/);

  assert.equal(await fs.readFile(path.join(liveRoot, "qdrant.json"), "utf8"), "live-vectors");
  assert.equal(await fs.readFile(path.join(liveRoot, "statements", "live.txt"), "utf8"), "live-statement");
  assert.equal(await fs.readFile(path.join(liveRoot, "balance-screenshots", "live.png"), "utf8"), "live-screenshot");
  const leftovers = (await fs.readdir(liveRoot)).filter((name) => name.startsWith(".restore-"));
  assert.deepEqual(leftovers, []);
});

test("provider JSON and restored state require their declared schemas", () => {
  assert.deepEqual(parseProviderJson<{ actions: any[] }>('```json\n{"actions":[]}\n```', ["actions"]).actions, []);
  assert.throws(() => parseProviderJson("not-json", ["actions"]), ValidationError);
  assert.throws(() => validateStateEnvelope({ bankAccounts: {} }), ValidationError);
});
