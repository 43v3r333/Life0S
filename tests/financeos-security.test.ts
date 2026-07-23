import assert from "node:assert/strict";
import test from "node:test";
import { rm } from "node:fs/promises";
import path from "node:path";

import { createSafeVaultState, loadRuntimeConfiguration, toVaultStatus, validateRuntimeConfiguration } from "../server/config.js";
import { initDb, getDb } from "../server/db.js";
import { Ledger } from "../src/modules/FinanceOS/Domain/Entities/Ledger.js";
import { Account } from "../src/modules/FinanceOS/Domain/Entities/Account.js";
import { JournalEntry } from "../src/modules/FinanceOS/Domain/Entities/JournalEntry.js";
import { JournalLine } from "../src/modules/FinanceOS/Domain/ValueObjects/JournalLine.js";
import { LedgerRepository, JournalEntryRepository } from "../src/modules/FinanceOS/Infrastructure/Persistence/FinanceRepositories.js";
import { ImportBankStatementCommand } from "../src/modules/FinanceOS/Application/Commands/ImportBankStatement/ImportBankStatementCommand.js";
import { ImportBankStatementHandler } from "../src/modules/FinanceOS/Application/Commands/ImportBankStatement/ImportBankStatementHandler.js";
import { ReconcileTransactionsCommand } from "../src/modules/FinanceOS/Application/Commands/ReconcileTransactions/ReconcileTransactionsCommand.js";
import { ReconcileTransactionsHandler } from "../src/modules/FinanceOS/Application/Commands/ReconcileTransactions/ReconcileTransactionsHandler.js";
import { CalculateZakahQuery } from "../src/modules/FinanceOS/Application/Queries/CalculateZakah/CalculateZakahQuery.js";
import { CalculateZakahHandler } from "../src/modules/FinanceOS/Application/Queries/CalculateZakah/CalculateZakahHandler.js";
import { RecordZakahCalculationCommand } from "../src/modules/FinanceOS/Application/Commands/RecordZakahCalculation/RecordZakahCalculationCommand.js";
import { RecordZakahCalculationHandler } from "../src/modules/FinanceOS/Application/Commands/RecordZakahCalculation/RecordZakahCalculationHandler.js";

function baseState() {
  return {
    currentUser: "TestUser",
    sessions: [],
    vault: createSafeVaultState({ nodeEnv: "test" }),
    scores: {},
    salahCount: 0,
    workoutCount: 0,
    expenseCount: 0,
    goals: [],
    projects: [],
    tasks: [],
    habits: [],
    focusSessions: [],
    knowledgeObjects: [],
    graphNodes: [],
    graphEdges: [],
    systemEvents: [],
    ledgers: [],
    accounts: [],
    journalEntries: [],
    statementImports: [],
    portfolio: [],
    zakahHistory: [],
    waqfRegistry: []
  };
}

async function resetDb(): Promise<void> {
  const testDataDir = process.env.LIFEOS_DATA_DIR;
  assert.ok(testDataDir && testDataDir !== "data", "Tests require an isolated LIFEOS_DATA_DIR.");
  await rm(path.resolve(process.cwd(), testDataDir), { recursive: true, force: true });
  await initDb(baseState());
  const db = getDb();
  Object.assign(db, baseState());
}

async function saveLedgerWithAccounts(tenantId: string, ledgerId: string, accounts: Account[]): Promise<Ledger> {
  const ledger = new Ledger(ledgerId, tenantId, `${tenantId} Ledger`, "GBP", "Active", accounts);
  await new LedgerRepository(tenantId).saveLedger(ledger);
  return ledger;
}

test("safe vault defaults contain no seeded credentials and production config fails clearly", () => {
  const vault = createSafeVaultState({ nodeEnv: "development" });
  assert.deepEqual(vault, {
    openaiKey: "",
    nvidiaKey: "",
    geminiKey: "",
    anthropicKey: "",
    githubToken: "",
    microsoftToken: "",
    googleToken: "",
    googleClientId: "",
    googleClientSecret: "",
    googleRefreshToken: "",
    googleGrantedScopes: "",
    dbConnectionString: "",
    smtpConnectionString: ""
  });
  assert.deepEqual(toVaultStatus(vault), {
    openaiKey: false,
    nvidiaKey: false,
    geminiKey: false,
    anthropicKey: false,
    githubToken: false,
    microsoftToken: false,
    googleToken: false,
    googleClientId: false,
    googleClientSecret: false,
    googleRefreshToken: false,
    googleGrantedScopes: false,
    dbConnectionString: false,
    smtpConnectionString: false
  });
  assert.throws(() => validateRuntimeConfiguration(loadRuntimeConfiguration({ NODE_ENV: "production" })), /APP_URL/);
});

test("ledger and account loading are tenant-isolated", async () => {
  await resetDb();
  await saveLedgerWithAccounts("tenant-a", "ledger-shared", [
    new Account("acc-a", "tenant-a", "1000", "Cash", "Asset", undefined, 500)
  ]);
  await saveLedgerWithAccounts("tenant-b", "ledger-shared", [
    new Account("acc-b", "tenant-b", "1000", "Cash", "Asset", undefined, 900)
  ]);

  const tenantALedger = await new LedgerRepository("tenant-a").getLedgerById("ledger-shared");
  assert.equal(tenantALedger?.tenantId, "tenant-a");
  assert.deepEqual(tenantALedger?.accounts.map(account => account.id), ["acc-a"]);
  assert.equal(await new LedgerRepository("tenant-c").getLedgerById("ledger-shared"), null);
});

test("cross-tenant ledger and journal mutations are rejected", async () => {
  await resetDb();
  const ledger = await saveLedgerWithAccounts("tenant-a", "ledger-a", []);
  await assert.rejects(() => new LedgerRepository("tenant-b").saveLedger(ledger), /Tenant scope violation/);

  const journal = JournalEntry.rehydrate({
    id: "journal-a",
    tenantId: "tenant-a",
    ledgerId: "ledger-a",
    description: "Opening balance",
    lines: [new JournalLine("asset-a", "Debit", 100), new JournalLine("equity-a", "Credit", 100)],
    isPosted: true,
    postedUtc: "2026-07-13T00:00:00.000Z"
  });
  await new JournalEntryRepository("tenant-a").saveJournal(journal);
  assert.equal(await new JournalEntryRepository("tenant-b").getJournalById("journal-a"), null);
  await assert.rejects(() => new JournalEntryRepository("tenant-b").saveJournal(journal), /Tenant scope violation/);
});

test("journal posting state round trips and reloaded posted journals cannot be reposted", async () => {
  await resetDb();
  const postedUtc = "2026-07-13T12:00:00.000Z";
  const journal = JournalEntry.rehydrate({
    id: "journal-posted",
    tenantId: "tenant-a",
    ledgerId: "ledger-a",
    description: "Posted voucher",
    lines: [new JournalLine("asset-a", "Debit", 100), new JournalLine("equity-a", "Credit", 100)],
    isPosted: true,
    postedUtc,
    version: 7
  });
  await new JournalEntryRepository("tenant-a").saveJournal(journal);

  const reloaded = await new JournalEntryRepository("tenant-a").getJournalById("journal-posted");
  assert.equal(reloaded?.isPosted, true);
  assert.equal(reloaded?.postedUtc, postedUtc);
  assert.equal(reloaded?.version, 7);
  assert.throws(() => reloaded?.post(), /already been posted/);
});

test("bank imports are tenant and ledger scoped and duplicate rows are idempotent", async () => {
  await resetDb();
  await saveLedgerWithAccounts("tenant-a", "ledger-a", []);
  await saveLedgerWithAccounts("tenant-a", "ledger-b", []);
  await saveLedgerWithAccounts("tenant-b", "ledger-a", []);

  const handler = new ImportBankStatementHandler();
  const csv = "date,description,amount\n2026-07-13,Consulting invoice,125";
  const first = await handler.handle(new ImportBankStatementCommand("ledger-a", csv, "tenant-a", "corr-import-1"));
  const second = await handler.handle(new ImportBankStatementCommand("ledger-a", csv, "tenant-a", "corr-import-2"));
  const otherLedger = await handler.handle(new ImportBankStatementCommand("ledger-b", csv, "tenant-a", "corr-import-3"));

  assert.equal(first.isSuccess, true);
  assert.equal(second.isSuccess, true);
  assert.equal(otherLedger.isSuccess, true);
  assert.deepEqual(second.value, first.value);
  assert.notDeepEqual(otherLedger.value, first.value);
  const imports = getDb().statementImports ?? [];
  assert.equal(imports.length, 2);
  assert.equal(imports.every(record => record.tenantId === "tenant-a" && record.ledgerId), true);

  const wrongTenant = await handler.handle(new ImportBankStatementCommand("ledger-b", csv, "tenant-b", "corr-import-4"));
  assert.equal(wrongTenant.isFailure, true);
  assert.equal(wrongTenant.error?.status, 404);
});

test("reconciliation requires matching tenant, ledger, statement line, and journal", async () => {
  await resetDb();
  await saveLedgerWithAccounts("tenant-a", "ledger-a", []);
  await saveLedgerWithAccounts("tenant-a", "ledger-b", []);
  const journal = JournalEntry.rehydrate({
    id: "journal-a",
    tenantId: "tenant-a",
    ledgerId: "ledger-a",
    description: "Posted voucher",
    lines: [new JournalLine("asset-a", "Debit", 100), new JournalLine("equity-a", "Credit", 100)],
    isPosted: true,
    postedUtc: "2026-07-13T00:00:00.000Z"
  });
  await new JournalEntryRepository("tenant-a").saveJournal(journal);
  const imported = await new ImportBankStatementHandler().handle(new ImportBankStatementCommand("ledger-a", "date,description,amount\n2026-07-13,Consulting invoice,125", "tenant-a"));
  const statementLineId = imported.getValueOrThrow()[0];

  const reconcile = new ReconcileTransactionsHandler();
  const wrongLedger = await reconcile.handle(new ReconcileTransactionsCommand("ledger-b", statementLineId, "journal-a", "tenant-a"));
  const wrongTenant = await reconcile.handle(new ReconcileTransactionsCommand("ledger-a", statementLineId, "journal-a", "tenant-b"));
  const success = await reconcile.handle(new ReconcileTransactionsCommand("ledger-a", statementLineId, "journal-a", "tenant-a"));
  const duplicate = await reconcile.handle(new ReconcileTransactionsCommand("ledger-a", statementLineId, "journal-a", "tenant-a"));

  assert.equal(wrongLedger.isFailure, true);
  assert.equal(wrongTenant.isFailure, true);
  assert.equal(success.isSuccess, true);
  assert.equal(duplicate.error?.status, 409);
});

test("zakah preview is pure and record command is tenant-isolated and idempotent", async () => {
  await resetDb();
  await saveLedgerWithAccounts("tenant-a", "ledger-a", [
    new Account("cash-a", "tenant-a", "1000", "Operating Cash", "Asset", undefined, 10000),
    new Account("liability-a", "tenant-a", "2000", "Short Term Liability", "Liability", undefined, 1000)
  ]);

  const previewHandler = new CalculateZakahHandler();
  const previewOne = await previewHandler.handle(new CalculateZakahQuery("ledger-a", 77, 0.95, true, "tenant-a"));
  const previewTwo = await previewHandler.handle(new CalculateZakahQuery("ledger-a", 77, 0.95, true, "tenant-a"));
  assert.equal(previewOne.isSuccess, true);
  assert.equal(previewTwo.isSuccess, true);
  assert.equal(getDb().zakahHistory?.length, 0);
  assert.equal(getDb().systemEvents.length, 0);

  const recordHandler = new RecordZakahCalculationHandler();
  const recorded = await recordHandler.handle(new RecordZakahCalculationCommand("ledger-a", 77, 0.95, "idem-1", "tenant-a", "corr-zk-1"));
  const replay = await recordHandler.handle(new RecordZakahCalculationCommand("ledger-a", 77, 0.95, "idem-1", "tenant-a", "corr-zk-2"));
  const wrongTenant = await recordHandler.handle(new RecordZakahCalculationCommand("ledger-a", 77, 0.95, "idem-2", "tenant-b", "corr-zk-3"));

  assert.equal(recorded.isSuccess, true);
  assert.equal(replay.value?.id, recorded.value?.id);
  assert.equal(replay.value?.idempotentReplay, true);
  assert.equal(wrongTenant.isFailure, true);
  assert.equal(getDb().zakahHistory?.length, 1);
  assert.equal(getDb().systemEvents.length, 1);
});

test("FinanceOS API documents pure preview and persisted calculation route semantics", async () => {
  const controller = await import("../src/modules/FinanceOS/API/FinanceController.js");
  assert.ok(controller.financeRouter);
  const source = await import("node:fs/promises").then(fs => fs.readFile("src/modules/FinanceOS/API/FinanceController.ts", "utf-8"));
  assert.match(source, /\/ledgers\/:ledgerId\/zakah\/preview/);
  assert.match(source, /\/ledgers\/:ledgerId\/zakah\/calculations/);
  assert.match(source, /Deprecation/);
});
