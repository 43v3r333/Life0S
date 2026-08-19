import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import request from "supertest";
import { createSystemRouter } from "../server/routes/systemRoutes.js";

const dependencies = {
  status: () => ({ ready: true }),
  migrate: async () => ({ migrated: true }),
  verify: () => ({ ok: true }),
  integrity: async () => ({ ok: true }),
  audit: (limit: number) => ({ generatedAt: new Date().toISOString(), events: [], retained: 0, retentionLimit: 500 }),
};

const app = express();
app.use("/api/system", createSystemRouter(dependencies));

test("GET /api/system/ping returns ok status and timestamp", async () => {
  const response = await request(app).get("/api/system/ping").expect(200);
  assert.equal(response.body.status, "ok");
  assert.ok(response.body.timestamp);
  assert.doesNotThrow(() => new Date(response.body.timestamp));
});

test("GET /api/system/ping timestamp is recent ISO string", async () => {
  const before = new Date();
  const response = await request(app).get("/api/system/ping").expect(200);
  const after = new Date();
  const timestamp = new Date(response.body.timestamp);
  assert.ok(timestamp >= before);
  assert.ok(timestamp <= after);
});