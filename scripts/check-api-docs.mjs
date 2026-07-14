import { readFile } from "node:fs/promises";

const sources = [
  ["server.ts", /app\.(?:get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g],
  ["src/modules/FinanceOS/API/FinanceController.ts", /financeRouter\.(?:get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g],
];

const docs = await readFile("docs/API_REFERENCE.md", "utf8");
const missing = [];

for (const [file, routePattern] of sources) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(routePattern)) {
    if (match[1] === "*") continue;
    const route = file.includes("FinanceController")
      ? `/api/finance${match[1]}`
      : match[1];
    if (!docs.includes(`\`${route}\``)) missing.push(`${file}: ${route}`);
  }
}

if (missing.length) {
  console.error("Undocumented HTTP routes:\n" + missing.map(route => `- ${route}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("API reference covers every Express route.");
}
