import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface Goal {
  id: string;
  title: string;
  type: string; // matches Category in prompt (e.g. Business, Spiritual, Learning)
  priority: string;
  targetDate: string;
  progress: number;
  smartDefinition: string;
  okrObjective: string;
  kpis: string[];
  northStar: string;
  risk: string;
  dependencies: string[];
  evidence: string;
  aiForecast?: string;
  aiRiskAnalysis?: string;
  aiRecommendations?: string;
  linkedDocs?: string[];
  
  // Deliverable 1: Goal Aggregate Fields
  purpose?: string;
  status?: string; // "Active" | "Paused" | "Completed" | "Archived"
  owner?: string;
  createdDate?: string;
  modifiedDate?: string;
  completedDate?: string;
  parentGoal?: string; // ID of the parent goal
  milestones?: { id: string; title: string; completed: boolean; mandatory: boolean }[];
  tags?: string[];
  notes?: string;
  attachments?: string[];
  purposeAlignmentScore?: number;
}

export interface Task {
  id: string;
  title: string;
  projectId?: string;
  goalId?: string;
  priority: string;
  deepWork: boolean;
  energyLevel: string;
  estimatedTime: number;
  actualTime: number;
  recurrence: string;
  dependencies: string[];
  focusScore: number;
  aiPriority: string;
  status: string;
  contextTags: string[];
  timeBlock: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  streak: number;
  target: string;
  identity: string;
  routine: string;
}

export interface KnowledgeObject {
  id: string;
  title: string;
  summary: string;
  description: string;
  source: string;
  author: string;
  owner: string;
  created: string;
  modified: string;
  version: number;
  category: string;
  tags: string[];
  topics: string[];
  keywords: string[];
  relationships: { targetId: string; type: string; confidence: number }[];
  metadata: Record<string, any>;
  attachments?: any[];
  permissions?: string;
  aiSummary?: string;
  aiKeywords?: string[];
  aiQuestions?: string[];
  aiFlashcards?: { question: string; answer: string; ease: number; interval: number; nextDue: string }[];
  confidenceScore?: number;
  importanceScore?: number;
  lifecycleStatus?: string;
}

export interface DbState {
  currentUser: string;
  sessions: any[];
  vault: Record<string, string>;
  scores: Record<string, number>;
  salahCount: number;
  workoutCount: number;
  expenseCount: number;
  goals: Goal[];
  projects: any[];
  tasks: Task[];
  habits: Habit[];
  focusSessions: any[];
  knowledgeObjects: KnowledgeObject[];
  graphNodes: any[];
  graphEdges: any[];
  systemEvents: any[];
  ledgers?: any[];
  accounts?: any[];
  journalEntries?: any[];
  statementImports?: any[];
  portfolio?: any[];
  zakahHistory?: any[];
  waqfRegistry?: any[];
}

let dbCache: DbState | null = null;
let writePromise: Promise<void> = Promise.resolve();

export async function initDb(initialState: DbState): Promise<DbState> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const content = await fs.readFile(DB_FILE, "utf-8");
      dbCache = JSON.parse(content);
      console.log(`[DB] Loaded persistent PostgreSQL-equivalent state from ${DB_FILE}`);
      // Ensure any new tables are synced with initial values if they are empty
      if (dbCache) {
        dbCache.goals = dbCache.goals || [];
        dbCache.tasks = dbCache.tasks || [];
        dbCache.habits = dbCache.habits || [];
        dbCache.knowledgeObjects = dbCache.knowledgeObjects || [];
        dbCache.systemEvents = dbCache.systemEvents || [];
        dbCache.ledgers = dbCache.ledgers || [];
        dbCache.accounts = dbCache.accounts || [];
        dbCache.journalEntries = dbCache.journalEntries || [];
        dbCache.statementImports = dbCache.statementImports || [];
        dbCache.portfolio = dbCache.portfolio || [];
        dbCache.zakahHistory = dbCache.zakahHistory || [];
        dbCache.waqfRegistry = dbCache.waqfRegistry || [];
      }
    } catch (err) {
      dbCache = initialState;
      await saveDb();
      console.log(`[DB] Created new relational database file at ${DB_FILE}`);
    }
  } catch (err) {
    console.error("[DB] Database initialization failed, falling back to memory:", err);
    dbCache = initialState;
  }
  return dbCache!;
}

export async function saveDb(): Promise<void> {
  if (!dbCache) return;
  // Prevent parallel/overlapping file writes using a micro-lock promise chain
  writePromise = writePromise.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB] Failed to save relational database to file:", err);
    }
  });
  await writePromise;
}

export function getDb(): DbState {
  if (!dbCache) {
    throw new Error("[DB] Relational database not initialized. Call initDb() first.");
  }
  return dbCache;
}
