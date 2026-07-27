import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { lifeOsDataDirectory, lifeOsDataPath } from "../server/dataPaths.js";
import { loadRuntimeConfiguration, validateRuntimeConfiguration } from "../server/config.js";
import { localOcrCapability, unsupportedImageReason } from "../server/ocrSupport.js";

test("production requires private authentication, explicit storage, and a persistent strong vault secret", () => {
  const base = {
    NODE_ENV: "production",
    APP_URL: "http://127.0.0.1:3001",
    LIFEOS_DATA_DIR: "/srv/lifeos/shared/data",
    LIFEOS_AUTH_REQUIRED: "true",
    LIFEOS_AUTH_EMAIL: "owner@example.com",
    LIFEOS_AUTH_PASSWORD_HASH: `${"a".repeat(32)}:${"b".repeat(64)}`,
    LIFEOS_VAULT_SECRET: "3d33c4c5750df8da0f365c61ed6718f1",
  } as NodeJS.ProcessEnv;
  assert.doesNotThrow(() => validateRuntimeConfiguration(loadRuntimeConfiguration(base)));
  for (const key of ["LIFEOS_DATA_DIR", "LIFEOS_AUTH_EMAIL", "LIFEOS_AUTH_PASSWORD_HASH", "LIFEOS_VAULT_SECRET"] as const) {
    const invalid = { ...base, [key]: "" };
    assert.throws(() => validateRuntimeConfiguration(loadRuntimeConfiguration(invalid)), new RegExp(key));
  }
  assert.throws(() => validateRuntimeConfiguration(loadRuntimeConfiguration({ ...base, LIFEOS_AUTH_REQUIRED: "false" })), /LIFEOS_AUTH_REQUIRED=true/);
  assert.throws(() => validateRuntimeConfiguration(loadRuntimeConfiguration({ ...base, LIFEOS_VAULT_SECRET: "replace-me-with-a-secret-value" })), /LIFEOS_VAULT_SECRET/);
});

test("all persistent paths derive from LIFEOS_DATA_DIR", () => {
  const environment = { LIFEOS_DATA_DIR: ".test-data/custom-root" } as NodeJS.ProcessEnv;
  assert.equal(lifeOsDataDirectory(environment), path.resolve(process.cwd(), ".test-data/custom-root"));
  const previous = process.env.LIFEOS_DATA_DIR;
  process.env.LIFEOS_DATA_DIR = ".test-data/custom-root";
  try {
    assert.equal(lifeOsDataPath("statements", "one.png"), path.resolve(process.cwd(), ".test-data/custom-root/statements/one.png"));
  } finally {
    if (previous === undefined) delete process.env.LIFEOS_DATA_DIR;
    else process.env.LIFEOS_DATA_DIR = previous;
  }
});

test("Linux OCR skips Apple tools and retains unsupported HEIC safely", () => {
  assert.deepEqual(localOcrCapability("darwin"), { supported: true, provider: "Apple Vision on-device", reason: null });
  const linux = localOcrCapability("linux");
  assert.equal(linux.supported, false);
  assert.equal(linux.provider, "NVIDIA vision");
  assert.match(String(linux.reason), /Apple Vision tools will not be invoked/);
  assert.equal(unsupportedImageReason("image/jpeg", "linux"), null);
  assert.match(String(unsupportedImageReason("image/heic", "linux")), /original remains saved/i);
});

test("server source contains no user-specific startup recovery or automatic startup writes", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "server.ts"), "utf8");
  for (const removed of [
    "def2440648d08e7d51546fa7acada4d1685f4a55d145a369dae8bf204fe9c6dc",
    "34826e73abd6509935a12c9136a0860464426be01da66b71d7e0a299a64f5b08",
    "643b8ddb4c098703affab7c89955993f2794c7192c176d022ff1982d381b340c",
    "startup_auto_validation_repair",
    "task_finance_baseline",
  ]) assert.doesNotMatch(source, new RegExp(removed));
  assert.match(source, /Startup is deliberately read-only with respect to authoritative records/);
  const commandCenter = source.slice(source.indexOf('app.get("/api/personal/command-center"'), source.indexOf('app.post("/api/ai/actions/refresh"'));
  assert.doesNotMatch(commandCenter, /saveDb|createLocalBackup|auditOperation/);
  const overview = source.slice(source.indexOf('app.get("/api/personal/overview"'), source.indexOf('app.post("/api/personal/finance/entries"'));
  assert.doesNotMatch(overview, /saveDb|rollDueDates|ensureFinanceLedgerConsistency/);
  const automation = fs.readFileSync(path.resolve(process.cwd(), "server/dailyAutomation.ts"), "utf8");
  const google = fs.readFileSync(path.resolve(process.cwd(), "server/googleAutomation.ts"), "utf8");
  assert.doesNotMatch(automation, /evaluate\("startup"\)/);
  assert.doesNotMatch(google, /sync\("startup"\)/);
});

test("approved dependency patch versions are pinned", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));
  assert.equal(packageJson.dependencies["body-parser"], "1.20.6");
  assert.equal(packageJson.devDependencies.postcss, "8.5.23");
});
