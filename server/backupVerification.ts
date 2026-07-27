import fs from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { DatabaseSync } from "node:sqlite";
import { isDeepStrictEqual } from "node:util";
import { validateStateEnvelope } from "./validation.js";

export const REQUIRED_BACKUP_ARTIFACTS = ["state.json", "lifeos.sqlite", "qdrant.json", "statements", "balance-screenshots"] as const;

function verifySqliteSnapshot(sqlitePath: string) {
  const database = new DatabaseSync(sqlitePath, { readOnly: true });
  try {
    const integrity = database.prepare("PRAGMA integrity_check").all() as Array<{ integrity_check: string }>;
    if (integrity.length !== 1 || integrity[0]?.integrity_check !== "ok") throw new Error("SQLite integrity check failed.");
    const row = database.prepare("SELECT json FROM app_state WHERE id=1").get() as { json?: string } | undefined;
    if (!row?.json) throw new Error("SQLite snapshot has no authoritative app_state.");
    const sessionCount = Number((database.prepare("SELECT COUNT(*) count FROM auth_sessions").get() as { count?: number } | undefined)?.count || 0);
    if (sessionCount !== 0) throw new Error("SQLite backup contains persistent authentication sessions.");
    return validateStateEnvelope(JSON.parse(row.json));
  } finally {
    database.close();
  }
}

export async function verifyBackup(backupPath: string) {
  const info = await fs.stat(backupPath);
  if (!info.isDirectory()) {
    const backup = JSON.parse(await fs.readFile(backupPath, "utf8"));
    if (backup.version !== 1 || !backup.state) throw Object.assign(new Error("Unsupported legacy backup."), { status: 400, code: "INVALID_BACKUP" });
    validateStateEnvelope(backup.state);
    return { ok: true, format: "legacy-json", version: 1, files: 1, state: backup.state };
  }
  const manifest = JSON.parse(await fs.readFile(path.join(backupPath, "manifest.json"), "utf8"));
  if (manifest.version !== 2 || !Array.isArray(manifest.files)) throw Object.assign(new Error("Unsupported backup manifest."), { status: 400, code: "INVALID_BACKUP" });
  const failures: string[] = [];
  if (Array.isArray(manifest.requiredArtifacts)) {
    for (const artifact of REQUIRED_BACKUP_ARTIFACTS) {
      if (!manifest.requiredArtifacts.includes(artifact)) { failures.push(artifact); continue; }
      try { await fs.lstat(path.join(backupPath, artifact)); } catch { failures.push(artifact); }
    }
  }
  for (const file of manifest.files) {
    const absolute = path.resolve(backupPath, String(file.path || ""));
    if (!absolute.startsWith(`${path.resolve(backupPath)}${path.sep}`)) { failures.push(String(file.path)); continue; }
    try { const bytes = await fs.readFile(absolute); if (bytes.length !== file.size || createHash("sha256").update(bytes).digest("hex") !== file.sha256) failures.push(file.path); } catch { failures.push(file.path); }
  }
  if (failures.length) throw Object.assign(new Error("Backup verification failed."), { status: 409, code: "BACKUP_CHECKSUM_FAILED", details: failures, recovery: "The current database was not changed. Choose a different verified backup." });
  let databaseVerified = false;
  let sqliteState: Record<string, any> | undefined;
  if (Array.isArray(manifest.requiredArtifacts) || await fs.stat(path.join(backupPath, "lifeos.sqlite")).then(() => true).catch(() => false)) {
    try { sqliteState = verifySqliteSnapshot(path.join(backupPath, "lifeos.sqlite")); databaseVerified = true; }
    catch (error: any) { throw Object.assign(new Error("Backup SQLite verification failed."), { status: 409, code: "BACKUP_SQLITE_INVALID", details: [error?.message || String(error)], recovery: "The current database was not changed. Choose a different verified backup." }); }
  }
  const envelope = JSON.parse(await fs.readFile(path.join(backupPath, "state.json"), "utf8"));
  const state = validateStateEnvelope(envelope.state);
  if (sqliteState && !isDeepStrictEqual(sqliteState, state)) {
    throw Object.assign(new Error("Backup database and compatibility state do not match."), {
      status: 409,
      code: "BACKUP_STATE_MISMATCH",
      recovery: "The current database was not changed. Create and verify a new backup bundle.",
    });
  }
  return { ok: true, format: "sqlite-bundle", version: 2, files: manifest.files.length, createdAt: manifest.createdAt, databaseVerified, requiredArtifacts: manifest.requiredArtifacts || [], state };
}
