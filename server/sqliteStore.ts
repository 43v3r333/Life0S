import { DatabaseSync } from "node:sqlite";
import fs from "fs/promises";
import path from "path";
import { createHash } from "crypto";

export const SQLITE_SCHEMA_VERSION = 7;

type JsonRecord = Record<string, any>;
type TableDefinition = { table: string; stateKey: string; uniqueFingerprint?: boolean };

const TABLES: TableDefinition[] = [
  { table: "accounts", stateKey: "bankAccounts" },
  { table: "transactions", stateKey: "bankTransactions", uniqueFingerprint: true },
  { table: "finance_entries", stateKey: "financeEntries" },
  { table: "debts", stateKey: "debts" },
  { table: "payments", stateKey: "liabilityPayments" },
  { table: "goals", stateKey: "goals" },
  { table: "tasks", stateKey: "tasks" },
  { table: "habits", stateKey: "habits" },
  { table: "shifts", stateKey: "workShifts" },
  { table: "conversations", stateKey: "aiConversations" },
  { table: "memories", stateKey: "aiMemories" },
  { table: "ai_proposals", stateKey: "aiActionProposals" },
  { table: "audit_events", stateKey: "operationAudit" },
  { table: "task_recurrence_instances", stateKey: "taskRecurrenceInstances", uniqueFingerprint: true },
  { table: "account_balance_history", stateKey: "accountBalanceHistory" },
  { table: "google_sync_runs", stateKey: "googleSyncRuns" },
  { table: "google_email_reviews", stateKey: "googleEmailReviews" },
  { table: "google_calendar_ownership", stateKey: "googleCalendarOwnership", uniqueFingerprint: true },
  { table: "google_drive_index", stateKey: "googleDriveIndex" },
  { table: "google_action_proposals", stateKey: "googleActionProposals" },
  { table: "automation_runs", stateKey: "automationRuns" },
  { table: "life_notifications", stateKey: "lifeNotifications", uniqueFingerprint: true },
  { table: "daily_briefings", stateKey: "dailyBriefings" },
  { table: "google_task_mappings", stateKey: "googleTaskMappings", uniqueFingerprint: true },
  { table: "google_task_reconciliations", stateKey: "googleTaskReconciliations" },
  { table: "google_managed_sheets", stateKey: "googleManagedSheets" },
  { table: "google_sheet_export_runs", stateKey: "googleSheetExportRuns" },
  { table: "google_crm_contacts", stateKey: "googleCrmContacts" },
  { table: "career_profiles", stateKey: "careerProfiles" },
  { table: "career_documents", stateKey: "careerDocuments" },
  { table: "code_learning_records", stateKey: "codeLearningRecords" },
];

let database: DatabaseSync | null = null;
let sqlitePath = "";
let migrationSource = "";
let lastVerification: VerificationResult | null = null;

export type PersistentSession = { id: string; tokenHash: string; createdAt: number; expiresAt: number; ipAddress: string; userAgent: string };
export type VerificationResult = { ok: boolean; checkedAt: string; schemaVersion: number; counts: Record<string, { source: number; sqlite: number }>; totals: { sourceBankBalance: number; sqliteBankBalance: number; sourceDebtBalance: number; sqliteDebtBalance: number; sourceFinanceTotal: number; sqliteFinanceTotal: number }; errors: string[] };

const json = (value: unknown) => JSON.stringify(value ?? null);
const parse = <T>(value: unknown, fallback: T): T => { try { return JSON.parse(String(value)) as T; } catch { return fallback; } };
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

function schema(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS system_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS auth_sessions (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, ip_address TEXT NOT NULL, user_agent TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiry ON auth_sessions(expires_at);
  `);
  for (const definition of TABLES) {
    const fingerprint = definition.uniqueFingerprint ? ", fingerprint TEXT" : "";
    db.exec(`CREATE TABLE IF NOT EXISTS ${definition.table} (id TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL${fingerprint});`);
    if (definition.uniqueFingerprint) db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_${definition.table}_fingerprint ON ${definition.table}(fingerprint) WHERE fingerprint IS NOT NULL AND fingerprint <> '';`);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS work_tasks (id TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS uploaded_documents (id TEXT PRIMARY KEY, document_type TEXT NOT NULL, file_path TEXT, sha256 TEXT, account_id TEXT, status TEXT, json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_uploaded_documents_sha ON uploaded_documents(sha256) WHERE sha256 IS NOT NULL AND sha256 <> '';
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(json_extract(json, '$.date'));
    CREATE INDEX IF NOT EXISTS idx_finance_entries_date ON finance_entries(json_extract(json, '$.date'));
    CREATE INDEX IF NOT EXISTS idx_memories_lifecycle ON memories(json_extract(json, '$.lifecycleStatus'));
  `);
  db.prepare("INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)").run(SQLITE_SCHEMA_VERSION, new Date().toISOString());
}

function rowsFor(state: JsonRecord, key: string) { return Array.isArray(state[key]) ? state[key] : []; }

function replaceRows(db: DatabaseSync, table: string, rows: any[], fingerprint = false) {
  db.exec(`DELETE FROM ${table}`);
  const statement = db.prepare(fingerprint ? `INSERT INTO ${table}(id,json,updated_at,fingerprint) VALUES (?,?,?,?)` : `INSERT INTO ${table}(id,json,updated_at) VALUES (?,?,?)`);
  const now = new Date().toISOString();
  const seenFingerprints = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const id = String(row?.id || `${table}-${index}`), updatedAt = String(row?.updatedAt || row?.createdAt || now);
    if (fingerprint) {
      const candidate = row?.fingerprint ? String(row.fingerprint) : "";
      // Historical imports may contain duplicate rows. Preserve every original
      // record in app_state and the normalized table, while indexing only the
      // first occurrence as the canonical fingerprint for future prevention.
      const canonical = candidate && !seenFingerprints.has(candidate) ? candidate : null;
      if (candidate) seenFingerprints.add(candidate);
      statement.run(id, json(row), updatedAt, canonical);
    }
    else statement.run(id, json(row), updatedAt);
  }
}

export function writeSqliteState(state: JsonRecord) {
  if (!database) throw new Error("SQLite has not been initialized.");
  const db = database, now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("INSERT INTO app_state(id,json,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET json=excluded.json,updated_at=excluded.updated_at").run(json(state), now);
    for (const definition of TABLES) replaceRows(db, definition.table, rowsFor(state, definition.stateKey), Boolean(definition.uniqueFingerprint));
    replaceRows(db, "work_tasks", rowsFor(state, "workTasks"));
    db.exec("DELETE FROM uploaded_documents");
    const documentStatement = db.prepare("INSERT INTO uploaded_documents(id,document_type,file_path,sha256,account_id,status,json,updated_at) VALUES (?,?,?,?,?,?,?,?)");
    for (const [type, key] of [["statement", "bankStatementDocuments"], ["balance-screenshot", "balanceScreenshotDocuments"]] as const) {
      for (const [index, document] of rowsFor(state, key).entries()) documentStatement.run(String(document.id || `${type}-${index}`), type, document.storagePath || document.filePath || null, document.sha256 || null, document.accountId || null, document.status || null, json(document), String(document.updatedAt || document.createdAt || now));
    }
    db.prepare("INSERT INTO system_meta(key,value) VALUES ('last_write_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(now);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}

function tableJson(db: DatabaseSync, table: string): any[] { return (db.prepare(`SELECT json FROM ${table}`).all() as any[]).map(row => parse<any>(row.json, {})); }

export function verifySqliteState(source: JsonRecord): VerificationResult {
  if (!database) throw new Error("SQLite has not been initialized.");
  const counts: VerificationResult["counts"] = {}, errors: string[] = [];
  for (const definition of TABLES) {
    const sourceCount = rowsFor(source, definition.stateKey).length;
    const sqliteCount = number((database.prepare(`SELECT COUNT(*) count FROM ${definition.table}`).get() as any)?.count);
    counts[definition.stateKey] = { source: sourceCount, sqlite: sqliteCount };
    if (sourceCount !== sqliteCount) errors.push(`${definition.stateKey}: expected ${sourceCount}, found ${sqliteCount}`);
  }
  const sourceBankBalance = rowsFor(source, "bankAccounts").reduce((sum, item) => sum + number(item.balance), 0);
  const sqliteBankBalance = tableJson(database, "accounts").reduce((sum, item) => sum + number(item.balance), 0);
  const sourceDebtBalance = rowsFor(source, "debts").reduce((sum, item) => sum + number(item.balance), 0);
  const sqliteDebtBalance = tableJson(database, "debts").reduce((sum, item) => sum + number(item.balance), 0);
  const sourceFinanceTotal = rowsFor(source, "financeEntries").reduce((sum, item) => sum + number(item.amount), 0);
  const sqliteFinanceTotal = tableJson(database, "finance_entries").reduce((sum, item) => sum + number(item.amount), 0);
  for (const [name, left, right] of [["bank balance", sourceBankBalance, sqliteBankBalance], ["debt balance", sourceDebtBalance, sqliteDebtBalance], ["finance total", sourceFinanceTotal, sqliteFinanceTotal]] as Array<[string, number, number]>) if (Math.abs(left - right) > .005) errors.push(`${name}: expected ${left}, found ${right}`);
  lastVerification = { ok: errors.length === 0, checkedAt: new Date().toISOString(), schemaVersion: SQLITE_SCHEMA_VERSION, counts, totals: { sourceBankBalance, sqliteBankBalance, sourceDebtBalance, sqliteDebtBalance, sourceFinanceTotal, sqliteFinanceTotal }, errors };
  return lastVerification;
}

export async function initializeSqlite(dataDirectory: string, initialState: JsonRecord, persistedJsonPath: string) {
  await fs.mkdir(dataDirectory, { recursive: true });
  sqlitePath = path.join(dataDirectory, "lifeos.sqlite");
  database = new DatabaseSync(sqlitePath);
  const hasMigrations=Boolean((database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get() as any)?.name);
  const previousVersion=hasMigrations?Number((database.prepare("SELECT MAX(version) version FROM schema_migrations").get() as any)?.version||0):0;
  if(previousVersion>0&&previousVersion<SQLITE_SCHEMA_VERSION){const backupDirectory=path.join(dataDirectory,"migration-backups"),backupPath=path.join(backupDirectory,`lifeos-v${previousVersion}-before-v${SQLITE_SCHEMA_VERSION}-${new Date().toISOString().replace(/[:.]/g,"-")}.sqlite`);await fs.mkdir(backupDirectory,{recursive:true});database.exec("PRAGMA wal_checkpoint(FULL)");database.exec(`VACUUM INTO '${backupPath.replaceAll("'","''")}'`);const digest=createHash("sha256").update(await fs.readFile(backupPath)).digest("hex");await fs.writeFile(`${backupPath}.sha256`,`${digest}  ${path.basename(backupPath)}\n`,"utf8");}
  schema(database);
  const existing = database.prepare("SELECT json FROM app_state WHERE id=1").get() as any;
  if (existing?.json) {
    const state = parse<JsonRecord>(existing.json, initialState);
    // New normalized tables are intentionally created empty by schema(). On a
    // version upgrade, backfill them transactionally from the authoritative
    // app_state snapshot before reconciliation. The pre-migration SQLite copy
    // above remains the untouched rollback artifact if this write fails.
    // Re-materialize normalized tables on every verified load. This also
    // repairs an interrupted migration where schema_migrations was recorded
    // but newly introduced tables were not yet backfilled.
    writeSqliteState(state);
    const verification = verifySqliteState(state);
    if (!verification.ok) throw new Error(`SQLite verification failed: ${verification.errors.join("; ")}`);
    migrationSource = "sqlite";
    return state;
  }
  let source = initialState;
  try {
    source = parse(await fs.readFile(persistedJsonPath, "utf8"), initialState);
    migrationSource = "json-migration";
    const rollbackPath = path.join(dataDirectory, "migration-backups", `db-json-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    await fs.mkdir(path.dirname(rollbackPath), { recursive: true });
    await fs.copyFile(persistedJsonPath, rollbackPath);
    const digest = createHash("sha256").update(await fs.readFile(rollbackPath)).digest("hex");
    await fs.writeFile(`${rollbackPath}.sha256`, `${digest}  ${path.basename(rollbackPath)}\n`, "utf8");
    database.prepare("INSERT INTO system_meta(key,value) VALUES ('rollback_path',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(rollbackPath);
  } catch (error: any) { if (error?.code !== "ENOENT") throw error; migrationSource = "new-install"; }
  writeSqliteState(source);
  const verification = verifySqliteState(source);
  if (!verification.ok) throw new Error(`JSON-to-SQLite migration verification failed: ${verification.errors.join("; ")}`);
  database.prepare("INSERT INTO system_meta(key,value) VALUES ('migration_completed_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(new Date().toISOString());
  return source;
}

export function sqliteStorageStatus() {
  if (!database) return { ready: false, schemaVersion: 0, path: sqlitePath, source: migrationSource, verification: lastVerification };
  const meta = Object.fromEntries((database.prepare("SELECT key,value FROM system_meta").all() as any[]).map(row => [row.key, row.value]));
  return { ready: true, authoritative: true, schemaVersion: SQLITE_SCHEMA_VERSION, path: sqlitePath, source: migrationSource, journalMode: (database.prepare("PRAGMA journal_mode").get() as any)?.journal_mode, foreignKeys: Boolean((database.prepare("PRAGMA foreign_keys").get() as any)?.foreign_keys), meta, verification: lastVerification };
}

export function loadPersistentSessions(): PersistentSession[] {
  if (!database) return [];
  database.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(Date.now());
  return (database.prepare("SELECT id,token_hash tokenHash,created_at createdAt,expires_at expiresAt,ip_address ipAddress,user_agent userAgent FROM auth_sessions").all() as any[]) as PersistentSession[];
}
export function savePersistentSession(session: PersistentSession) { if (!database) throw new Error("SQLite unavailable."); database.prepare("INSERT INTO auth_sessions(id,token_hash,created_at,expires_at,ip_address,user_agent) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET token_hash=excluded.token_hash,expires_at=excluded.expires_at,ip_address=excluded.ip_address,user_agent=excluded.user_agent").run(session.id, session.tokenHash, session.createdAt, session.expiresAt, session.ipAddress, session.userAgent); }
export function deletePersistentSession(id: string) { if (database) database.prepare("DELETE FROM auth_sessions WHERE id=?").run(id); }
export function sessionTokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export function createSqliteSnapshot(destination: string) {
  if (!database) throw new Error("SQLite has not been initialized.");
  database.exec("PRAGMA wal_checkpoint(FULL)");
  const escaped = destination.replaceAll("'", "''");
  database.exec(`VACUUM INTO '${escaped}'`);
}

export function sqliteIntegrityCheck() {
  if (!database) throw new Error("SQLite has not been initialized.");
  const rows = database.prepare("PRAGMA integrity_check").all() as Array<{ integrity_check: string }>;
  const expiredSessionsRemoved = Number((database.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(Date.now()) as any)?.changes || 0);
  return { ok: rows.length === 1 && rows[0]?.integrity_check === "ok", results: rows.map(row => row.integrity_check), expiredSessionsRemoved };
}
