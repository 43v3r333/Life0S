import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { REQUIRED_BACKUP_ARTIFACTS, verifyBackup } from "./backupVerification.js";

export const RESTORABLE_FILE_ARTIFACTS = ["qdrant.json", "statements", "balance-screenshots"] as const;

type RestoreOptions = {
  backupPath: string;
  dataDirectory: string;
  createSafetyBackup: () => Promise<string>;
  activateState: (state: Record<string, any>) => Promise<void>;
  rollbackState: () => Promise<void>;
  verifyActivatedState: () => { ok: boolean; errors?: string[] };
  afterArtifactActivated?: (artifact: string) => Promise<void> | void;
};

async function exists(location: string) {
  try { await fs.lstat(location); return true; } catch (error: any) { if (error?.code === "ENOENT") return false; throw error; }
}

export async function restoreBundleAtomically(options: RestoreOptions) {
  const initialVerification = await verifyBackup(options.backupPath);
  if (initialVerification.format !== "sqlite-bundle") {
    throw Object.assign(new Error("Transactional restore requires a SQLite backup bundle."), {
      status: 400,
      code: "LEGACY_RESTORE_UNSUPPORTED",
      recovery: "Import the legacy backup into an isolated LifeOS instance, create a current verified bundle, and restore that bundle instead.",
    });
  }

  const operationId = randomUUID();
  const stagingRoot = path.join(options.dataDirectory, `.restore-staging-${operationId}`);
  const stagedBundle = path.join(stagingRoot, "bundle");
  const rollbackRoot = path.join(options.dataDirectory, `.restore-rollback-${operationId}`);
  const movedLive = new Set<string>();
  const activated = new Set<string>();
  let stateActivationAttempted = false;
  let safetyBackup = "";
  let rollbackComplete = false;
  let restoreComplete = false;

  const rollbackFiles = async () => {
    const errors: string[] = [];
    for (const artifact of [...RESTORABLE_FILE_ARTIFACTS].reverse()) {
      const live = path.join(options.dataDirectory, artifact);
      const rollback = path.join(rollbackRoot, artifact);
      try {
        if (activated.has(artifact) && await exists(live)) await fs.rm(live, { recursive: true, force: true });
        if (movedLive.has(artifact) && await exists(rollback)) {
          await fs.mkdir(path.dirname(live), { recursive: true });
          await fs.rename(rollback, live);
        }
      } catch (error: any) { errors.push(`${artifact}: ${error?.message || error}`); }
    }
    if (errors.length) throw new Error(errors.join("; "));
  };

  try {
    const declaredArtifacts = new Set(initialVerification.requiredArtifacts);
    const missingDeclarations = REQUIRED_BACKUP_ARTIFACTS.filter((artifact) => !declaredArtifacts.has(artifact));
    if (missingDeclarations.length || !initialVerification.databaseVerified) {
      throw Object.assign(new Error("Restore requires a complete current LifeOS backup bundle."), {
        status: 409,
        code: "BACKUP_ARTIFACT_MISSING",
        details: missingDeclarations,
        recovery: "Create and verify a new LifeOS backup before attempting restore.",
      });
    }
    await fs.mkdir(stagingRoot, { recursive: true, mode: 0o700 });
    await fs.cp(options.backupPath, stagedBundle, { recursive: true, force: false, errorOnExist: true });
    const stagedVerification = await verifyBackup(stagedBundle);
    safetyBackup = await options.createSafetyBackup();
    await fs.mkdir(rollbackRoot, { recursive: true, mode: 0o700 });

    for (const artifact of RESTORABLE_FILE_ARTIFACTS) {
      const staged = path.join(stagedBundle, artifact);
      const live = path.join(options.dataDirectory, artifact);
      const rollback = path.join(rollbackRoot, artifact);
      if (!await exists(staged)) throw Object.assign(new Error(`Staged backup is missing ${artifact}.`), { code: "BACKUP_ARTIFACT_MISSING" });
      if (await exists(live)) {
        await fs.mkdir(path.dirname(rollback), { recursive: true });
        await fs.rename(live, rollback);
        movedLive.add(artifact);
      }
      await fs.rename(staged, live);
      activated.add(artifact);
      await options.afterArtifactActivated?.(artifact);
    }

    stateActivationAttempted = true;
    await options.activateState(stagedVerification.state);
    const activatedVerification = options.verifyActivatedState();
    if (!activatedVerification.ok) {
      throw Object.assign(new Error("Restored SQLite state did not reconcile."), {
        status: 409,
        code: "RESTORE_RECONCILIATION_FAILED",
        details: activatedVerification.errors || [],
      });
    }

    await fs.rm(rollbackRoot, { recursive: true, force: true });
    restoreComplete = true;
    return { safetyBackup, verification: activatedVerification, bundle: stagedVerification };
  } catch (error: any) {
    const rollbackErrors: string[] = [];
    if (stateActivationAttempted) {
      try { await options.rollbackState(); } catch (rollbackError: any) { rollbackErrors.push(`database: ${rollbackError?.message || rollbackError}`); }
    }
    try { await rollbackFiles(); } catch (rollbackError: any) { rollbackErrors.push(`files: ${rollbackError?.message || rollbackError}`); }
    rollbackComplete = rollbackErrors.length === 0;
    if (rollbackErrors.length) {
      error.code = "RESTORE_ROLLBACK_FAILED";
      error.details = [...(Array.isArray(error.details) ? error.details : []), ...rollbackErrors];
      error.recovery = `Restore failed and rollback needs operator attention. The pre-restore backup ${safetyBackup || "could not be created"} and rollback workspace ${rollbackRoot} were retained.`;
    } else {
      error.recovery ||= `The live database and upload directories were left unchanged. The pre-restore backup ${safetyBackup || "was not yet required"} was retained.`;
    }
    throw error;
  } finally {
    await fs.rm(stagingRoot, { recursive: true, force: true }).catch(() => undefined);
    if (restoreComplete || rollbackComplete) await fs.rm(rollbackRoot, { recursive: true, force: true }).catch(() => undefined);
  }
}
