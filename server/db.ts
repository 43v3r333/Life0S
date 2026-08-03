import fs from "fs/promises";
import path from "path";
import { initializeSqlite, sqliteStorageStatus, verifySqliteState, writeSqliteState } from "./sqliteStore.js";
import type { AiMemory, AiProposal, AuditEvent, BankAccount, BankTransaction, FinanceEntry, Liability, LiabilityPayment, UploadedDocument, WorkShift, WorkTask } from "./domainTypes.js";
import { lifeOsDataDirectory } from "./dataPaths.js";

const DATA_DIR = lifeOsDataDirectory();
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
  financeEntries?: FinanceEntry[];
  incomeSources?: any[];
  monthlyBudgets?: any[];
  salaryBreakdowns?: any[];
  bankAccounts?: BankAccount[];
  debts?: Liability[];
  liabilityPayments?: LiabilityPayment[];
  liabilityAdjustments?: any[];
  bankTransactions?: BankTransaction[];
  bankStatementAnalyses?: any[];
  bankStatementDocuments?: UploadedDocument[];
  merchantCategoryRules?: any[];
  creditCardStatements?: any[];
  workShifts?: WorkShift[];
  workTasks?: WorkTask[];
  aiActionProposals?: AiProposal[];
  aiMemories?: AiMemory[];
  aiFinanceBriefings?: any[];
  operationAudit?: AuditEvent[];
  onboarding?: Record<string, any>;
  knowledgeAnalysisQueue?: any[];
  knowledgeAnalysisRuns?: any[];
  knowledgeClaims?: any[];
  knowledgeEvidence?: any[];
  knowledgeFeedback?: any[];
  knowledgeMetrics?: Record<string, any>;
  knowledgeCheckpoints?: Record<string, string>;
  knowledgeSettings?: Record<string, any>;
}

let dbCache: DbState | null = null;
let writePromise: Promise<void> = Promise.resolve();
const saveObservers = new Set<() => void | Promise<void>>();

export function toPersistedState(state: DbState): DbState {
  return {
    ...state,
    vault: Object.fromEntries(Object.keys(state.vault || {}).map(key => [key, ""])),
  };
}

export async function initDb(initialState: DbState): Promise<DbState> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      dbCache = await initializeSqlite(DATA_DIR, initialState, DB_FILE) as DbState;
      console.log(`[DB] Loaded authoritative SQLite state from ${sqliteStorageStatus().path}`);
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
        dbCache.financeEntries = dbCache.financeEntries || [];
        dbCache.incomeSources = dbCache.incomeSources || [];
        dbCache.monthlyBudgets = dbCache.monthlyBudgets || [];
        dbCache.salaryBreakdowns = dbCache.salaryBreakdowns || [];
        dbCache.bankAccounts = dbCache.bankAccounts || [];
        dbCache.debts = dbCache.debts || [];
        dbCache.liabilityPayments = dbCache.liabilityPayments || [];
        dbCache.liabilityAdjustments = dbCache.liabilityAdjustments || [];
        dbCache.bankTransactions = dbCache.bankTransactions || [];
        dbCache.bankStatementAnalyses = dbCache.bankStatementAnalyses || [];
        dbCache.bankStatementDocuments = dbCache.bankStatementDocuments || [];
        dbCache.merchantCategoryRules = dbCache.merchantCategoryRules || [];
        dbCache.creditCardStatements = dbCache.creditCardStatements || [];
        dbCache.workShifts = dbCache.workShifts || [];
        dbCache.workTasks = dbCache.workTasks || [];
        dbCache.aiActionProposals = dbCache.aiActionProposals || [];
        dbCache.aiMemories = dbCache.aiMemories || [];
        dbCache.aiFinanceBriefings = dbCache.aiFinanceBriefings || [];
        dbCache.operationAudit = dbCache.operationAudit || [];
        dbCache.onboarding = dbCache.onboarding || {};
        dbCache.knowledgeAnalysisQueue = dbCache.knowledgeAnalysisQueue || [];
        dbCache.knowledgeAnalysisRuns = dbCache.knowledgeAnalysisRuns || [];
        dbCache.knowledgeClaims = dbCache.knowledgeClaims || [];
        dbCache.knowledgeEvidence = dbCache.knowledgeEvidence || [];
        dbCache.knowledgeFeedback = dbCache.knowledgeFeedback || [];
        dbCache.knowledgeMetrics = dbCache.knowledgeMetrics || {};
        dbCache.knowledgeCheckpoints = dbCache.knowledgeCheckpoints || {};
        dbCache.knowledgeSettings = dbCache.knowledgeSettings || {};
      }
    } catch (err) {
      console.error("[DB] SQLite initialization or verification failed:", err);
      throw err;
    }
  } catch (err) {
    console.error("[DB] Database initialization failed; startup stopped to protect persisted data:", err);
    throw err;
  }
  return dbCache!;
}

export async function saveDb(): Promise<void> {
  if (!dbCache) return;
  // Prevent parallel/overlapping file writes using a micro-lock promise chain
  writePromise = writePromise.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Provider secrets are runtime-only. Persisting them in SQLite would expose
    // plaintext tokens, so the compatibility state is sanitized first.
    const persistedState = toPersistedState(dbCache!);
    writeSqliteState(persistedState);
  });
  await writePromise;
  for (const observer of saveObservers) queueMicrotask(() => { Promise.resolve(observer()).catch(error => console.error("[DB] Save observer failed:", error)); });
}

export function observeDatabaseSaves(observer: () => void | Promise<void>) { saveObservers.add(observer); return () => saveObservers.delete(observer); }

export function getStorageStatus() { return sqliteStorageStatus(); }
export function verifyStorage() { if (!dbCache) throw new Error("Database not initialized."); return verifySqliteState(toPersistedState(dbCache)); }

export function getDb(): DbState {
  if (!dbCache) {
    throw new Error("[DB] Relational database not initialized. Call initDb() first.");
  }
  return dbCache;
}
