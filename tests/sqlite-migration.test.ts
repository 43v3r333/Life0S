import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { initializeSqlite, loadPersistentSessions, savePersistentSession, sessionTokenHash, sqliteStorageStatus, verifySqliteState, writeSqliteState } from "../server/sqliteStore.js";

test("JSON migrates to verified SQLite and sessions survive reload reads", async () => {
  const directory = path.resolve(process.cwd(), ".test-data", "migration-fixture");
  await fs.rm(directory, { recursive: true, force: true });
  await fs.mkdir(directory, { recursive: true });
  const source: any = {
    currentUser: "Migration test", vault: {},
    bankAccounts: [{ id: "bank-1", balance: 1250.25, updatedAt: "2026-07-20T10:00:00Z" }],
    bankTransactions: [{ id: "tx-1", fingerprint: "unique-1", amount: 50, date: "2026-07-20" }],
    financeEntries: [{ id: "entry-1", amount: 50, date: "2026-07-20" }],
    debts: [{ id: "debt-1", balance: 500 }], liabilityPayments: [], goals: [], tasks: [], habits: [], workShifts: [], workTasks: [], aiConversations: [], aiMemories: [], aiActionProposals: [], operationAudit: [], bankStatementDocuments: [], balanceScreenshotDocuments: []
  };
  const jsonPath = path.join(directory, "db.json");
  await fs.writeFile(jsonPath, JSON.stringify(source));
  const loaded = await initializeSqlite(directory, {}, jsonPath);
  assert.equal(loaded.currentUser, source.currentUser);
  assert.equal(sqliteStorageStatus().authoritative, true);
  assert.equal(verifySqliteState(source).ok, true);
  savePersistentSession({ id: "session-1", tokenHash: sessionTokenHash("secret"), createdAt: Date.now(), expiresAt: Date.now() + 60_000, ipAddress: "127.0.0.1", userAgent: "test" });
  assert.equal(loadPersistentSessions()[0]?.id, "session-1");
  loaded.bankAccounts[0].balance = 1300.25;
  writeSqliteState(loaded);
  assert.equal(verifySqliteState(loaded).totals.sqliteBankBalance, 1300.25);
  const rollbackFiles = await fs.readdir(path.join(directory, "migration-backups"));
  assert.ok(rollbackFiles.some(name => name.endsWith(".json")));
  assert.ok(rollbackFiles.some(name => name.endsWith(".sha256")));
});
