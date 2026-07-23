import fs from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { sqliteIntegrityCheck, sqliteStorageStatus } from "./sqliteStore.js";

const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

export async function buildSystemIntegrity(state: Record<string, any>, dataDirectory: string) {
  const storage = sqliteStorageStatus();
  const sqlite = sqliteIntegrityCheck();
  let databaseSize = 0;
  try { databaseSize = (await fs.stat(String(storage.path))).size; } catch {}
  const documents = [...(state.bankStatementDocuments || []), ...(state.balanceScreenshotDocuments || [])];
  let validUploads = 0, missingUploads = 0, checksumFailures = 0;
  for (const document of documents) {
    const relative = String(document.storagePath || document.filePath || (document.storedFilename ? path.join("statements", document.storedFilename) : ""));
    if (!relative) { missingUploads++; continue; }
    const absolute = path.isAbsolute(relative) ? relative : path.resolve(dataDirectory, relative.replace(/^data\//, ""));
    try { const bytes = await fs.readFile(absolute); if (document.sha256 && sha256(bytes) !== document.sha256) checksumFailures++; else validUploads++; } catch { missingUploads++; }
  }
  let lastBackup: any = null;
  try {
    const directory = path.join(dataDirectory, "backups");
    for (const name of await fs.readdir(directory)) { const info = await fs.stat(path.join(directory, name)); if (!lastBackup || info.mtimeMs > lastBackup.time) lastBackup = { filename: name, createdAt: info.mtime.toISOString(), time: info.mtimeMs }; }
  } catch {}
  return { generatedAt: new Date().toISOString(), ok: sqlite.ok && missingUploads === 0 && checksumFailures === 0, storage: { ...storage, databaseSize }, sqlite, uploads: { total: documents.length, valid: validUploads, missing: missingUploads, checksumFailures }, backup: { lastSuccessful: lastBackup ? { filename: lastBackup.filename, createdAt: lastBackup.createdAt } : null }, audit: { retained: (state.operationAudit || []).length, failedOperations: (state.operationAudit || []).filter((item: any) => /fail|error/i.test(`${item.action} ${JSON.stringify(item.details || {})}`)).length } };
}

export async function cleanupOrphanedTemporaryUploads(state: Record<string, any>, dataDirectory: string) {
  const temporary = path.join(dataDirectory, "tmp");
  const referenced = new Set([...(state.bankStatementDocuments || []), ...(state.balanceScreenshotDocuments || [])].map((item: any) => path.resolve(String(item.storagePath || item.filePath || ""))).filter(Boolean));
  let removed = 0;
  try { for (const name of await fs.readdir(temporary)) { const file = path.join(temporary, name), info = await fs.stat(file); if (info.isFile() && Date.now() - info.mtimeMs > 24 * 60 * 60 * 1000 && !referenced.has(path.resolve(file))) { await fs.unlink(file); removed++; } } } catch (error: any) { if (error?.code !== "ENOENT") throw error; }
  return { removed };
}
