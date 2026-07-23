import fs from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { validateStateEnvelope } from "./validation.js";

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
  for (const file of manifest.files) {
    const absolute = path.resolve(backupPath, String(file.path || ""));
    if (!absolute.startsWith(`${path.resolve(backupPath)}${path.sep}`)) { failures.push(String(file.path)); continue; }
    try { const bytes = await fs.readFile(absolute); if (bytes.length !== file.size || createHash("sha256").update(bytes).digest("hex") !== file.sha256) failures.push(file.path); } catch { failures.push(file.path); }
  }
  if (failures.length) throw Object.assign(new Error("Backup verification failed."), { status: 409, code: "BACKUP_CHECKSUM_FAILED", details: failures, recovery: "The current database was not changed. Choose a different verified backup." });
  const envelope = JSON.parse(await fs.readFile(path.join(backupPath, "state.json"), "utf8"));
  const state = validateStateEnvelope(envelope.state);
  return { ok: true, format: "sqlite-bundle", version: 2, files: manifest.files.length, createdAt: manifest.createdAt, state };
}
