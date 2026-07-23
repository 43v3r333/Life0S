import fs from "fs/promises";
import path from "path";

const countFiles = async (directory: string, extensions: Set<string>): Promise<number> => {
  let total = 0;
  try { for (const entry of await fs.readdir(directory, { withFileTypes: true })) { if (["node_modules", "dist", "archive", ".git"].includes(entry.name)) continue; const absolute = path.join(directory, entry.name); if (entry.isDirectory()) total += await countFiles(absolute, extensions); else if (extensions.has(path.extname(entry.name))) total++; } } catch {}
  return total;
};

export async function buildCodebaseGuide(root: string, state: Record<string, any>) {
  const packageJson = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const sourceFiles = await countFiles(root, new Set([".ts", ".tsx"]));
  const businessGoal = (state.goals || []).find((item: any) => item.id === "goal_43v3r") || null;
  const businessTasks = (state.tasks || []).filter((item: any) => item.goalId === "goal_43v3r");
  return {
    generatedAt: new Date().toISOString(),
    product: { name: "LifeOS", purpose: "A private operating system that connects personal finance, planning, work, business development and grounded AI.", businessUse: "LifeOS is both your personal operating system and a working product case study for 43v3r Technology." },
    metrics: { sourceFiles, tests: Object.keys(packageJson.scripts || {}).includes("test"), database: "SQLite", frontend: "React + TypeScript + Vite", backend: "Express + TypeScript", ai: "NVIDIA/OpenAI/Gemini with deterministic local capability" },
    architecture: [
      { id: "ui", name: "User interface", location: "src/components", purpose: "Dashboards and workflows for Finance, Plan, Work, Assistant, Memory and System.", businessLesson: "Turns complex personal data into focused customer workflows." },
      { id: "api", name: "Application API", location: "server.ts and server/routes", purpose: "Authenticated endpoints, validation and orchestration.", businessLesson: "A product needs stable contracts between the interface and business logic." },
      { id: "data", name: "Persistent data", location: "server/sqliteStore.ts", purpose: "Transactional SQLite state, sessions and normalized records.", businessLesson: "Trustworthy software must protect customer data and recover safely." },
      { id: "ai", name: "AI and memory", location: "server/aiDiagnostics.ts and server/qdrant.ts", purpose: "Grounded answers, controlled long-term memory and approval-only actions.", businessLesson: "Useful AI needs current evidence, boundaries and user approval." },
      { id: "quality", name: "Quality and recovery", location: "tests and server/backupVerification.ts", purpose: "Automated checks, backups, integrity verification and rollback.", businessLesson: "Reliability is a marketable feature, especially for financial data." }
    ],
    learningPath: [
      { order: 1, title: "Trace one complete feature", outcome: "Follow a finance entry from the React form through its API route into SQLite and back to the dashboard." },
      { order: 2, title: "Understand the domain model", outcome: "Explain accounts, transactions, entries, liabilities, goals, tasks, memories and proposals in your own words." },
      { order: 3, title: "Run the quality gate", outcome: "Run lint, tests, build and API documentation checks, then understand what each protects." },
      { order: 4, title: "Identify a customer problem", outcome: "Choose one painful workflow LifeOS already solves and define the target customer." },
      { order: 5, title: "Create a sellable proof", outcome: "Prepare a short demo, value proposition and interview script without exposing your personal data." }
    ],
    businessDevelopment: {
      goal: businessGoal ? { id: businessGoal.id, title: businessGoal.title, progress: businessGoal.progress, status: businessGoal.status } : null,
      taskCounts: { total: businessTasks.length, completed: businessTasks.filter((item: any) => item.status === "completed").length },
      opportunities: [
        "Personal finance reconciliation for shift workers with variable overtime.",
        "Private AI memory with explicit approval and source-grounded answers.",
        "Screenshot and statement capture for people who cannot connect bank APIs.",
        "Goal and work planning that respects rotating shifts and recovery days."
      ],
      guardrails: ["Use anonymized demonstration data for customers.", "Never include API keys, bank identifiers or raw personal statements in demos.", "Validate the customer problem through interviews before building additional breadth."]
    }
  };
}
