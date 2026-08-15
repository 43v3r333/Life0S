import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("legacy memory page id is retained with the Knowledge label", () => {
  const navigation = read("src/ui/navigation.ts");
  assert.match(navigation, /id:\s*["']memory["']/);
  assert.match(navigation, /label:\s*["']Knowledge["']/);
  const app = read("src/App.tsx");
  assert.match(app, /activeTab === ["']memory["']/);
  assert.match(app, /KnowledgeView/);
});

test("Knowledge workspace exposes every guarded learning view", () => {
  const source = read("src/components/KnowledgeView.tsx");
  for (const label of ["Overview", "Knowledge graph", "Finance intelligence", "Learning runs", "Review queue", "Evidence and claims", "Controls"]) {
    assert.match(source, new RegExp(label.replace(/[&]/g, "&"), "i"));
  }
  assert.match(source, /Financial and inferred changes require approval/i);
});

test("knowledge APIs are authenticated and registered before error middleware", () => {
  const server = read("server.ts");
  const auth = server.search(/app\.use\(["']\/api["'],/);
  const authGuard = server.indexOf("Authentication required.", auth);
  const routes = server.indexOf("registerKnowledgeRoutes(app");
  const errors = server.search(/app\.use\(["']\/api["'],\s*apiErrorHandler\)/);
  assert.ok(auth >= 0 && authGuard > auth && routes > authGuard && errors > routes);
  for (const route of ["overview", "graph", "runs", "claims", "proposals", "settings", "analyze", "feedback"]) {
    assert.match(read("server/knowledgeEngine.ts"), new RegExp(`/api/ai/knowledge/${route}`));
  }
});
