export interface UserProfile {
  name: string;
  vision: string;
  currentGoal: string;
  islamicPreferences: {
    prayerCalculationMethod: string;
    timezone: string;
    location: string;
    language: string;
  };
  personalInfo: {
    marriageStatus: string;
    emergencyContacts: string;
    occupation: string;
    education: string;
  };
  strategic: {
    values: string[];
    missionStatement: string;
    corePrinciples: string[];
  };
  preferences: {
    energyPreferences: string;
    workingHours: string;
    learningPreferences: string;
    aiPersonality: string;
    compactThreshold?: number;
    speechEnabled?: boolean;
  };
  notifications: {
    policyViolations: boolean;
    goalProgress: boolean;
    prayerReminders: boolean;
    learningReminders: boolean;
    healthAlerts: boolean;
  };
  privacy: {
    developerLogsEnabled: boolean;
    telemetrySharing: boolean;
    vectorDbSync: boolean;
  };
}

export interface ActiveSession {
  id: string;
  device: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecretVault {
  nvidiaKey: string;
  openaiKey: string;
  geminiKey: string;
  anthropicKey: string;
  githubToken: string;
  microsoftToken: string;
  googleToken: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleGrantedScopes: string;
  dbConnectionString: string;
  smtpConnectionString: string;
}

export interface CognitiveAgent {
  id: string;
  name: string;
  role: string;
  status: "idle" | "running" | "sleeping" | "disconnected";
  currentTask: string;
  memoryUsage: string;
  responseTime: number;
  health: number;
  capabilities: string[];
  recentDecision: string;
  stats: {
    tasksCompleted: number;
    accuracy: number;
  };
}

export interface SystemScore {
  overall: number;
  faith: number;
  marriage: number;
  health: number;
  career: number;
  business: number;
  finance: number;
  learning: number;
  discipline: number;
  consistency: number;
}

export interface UnifiedSearchItem {
  id: string;
  title: string;
  type: "Goal" | "Project" | "Task" | "Journal" | "Memory" | "Policy" | "Meeting" | "Event" | "Book" | "Document";
  description: string;
  relevance: number; // Simulated vector match score (e.g. 0.94)
  link: string;
}

export interface ScheduledItem {
  id: string;
  time: string;
  title: string;
  category: "deen" | "health" | "finance" | "career" | "learning" | "family";
  status: "pending" | "completed" | "skipped";
}

export interface TelemetryMetric {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  dbPoolActive: number;
  mcpRequestRate: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  reasoningTrace?: string[];
  referencedMemories?: string[];
  referencedPolicies?: string[];
  referencedGoals?: string[];
  isPinned?: boolean;
  tags?: string[];
}

// Phase 4: Knowledge Graph, Second Brain & AI Memory Intelligence types
export interface KnowledgeObject {
  id: string;
  title: string;
  summary: string;
  description: string;
  source: string; // e.g. "PDF", "WhatsApp Export", "Manual Notes", "Email"
  author: string;
  owner: string;
  created: string;
  modified: string;
  version: number;
  category: "Document" | "Note" | "Journal" | "Bookmark" | "Article" | "Book" | "Course" | "Meeting" | "SOP" | "Template" | "Research" | "Archive";
  tags: string[];
  topics: string[];
  keywords: string[];
  relationships: { targetId: string; type: string; confidence: number }[];
  metadata: Record<string, any>;
  attachments: { name: string; size: string; type: string }[];
  permissions: string; // e.g. "Private", "Shared"
  aiSummary: string;
  aiKeywords: string[];
  aiQuestions: string[];
  aiFlashcards: { question: string; answer: string; ease?: number; interval?: number; nextDue?: string }[];
  confidenceScore: number; // e.g. 98
  importanceScore: number; // e.g. 85
  lifecycleStatus: "Draft" | "Published" | "Archived" | "Stale" | "Processing";
}

export interface GraphNode {
  id: string;
  label: string;
  type: "Document" | "Project" | "Goal" | "Meeting" | "Person" | "Company" | "Task" | "Book" | "Course" | "Habit" | "Policy" | "Conversation" | "Journal" | "Research";
  group: string;
  val: number; // size/importance
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: "associated" | "depends_on" | "references" | "assigned_to" | "similar_to" | "contradicts";
  confidence: number;
}

export interface IngestionPipelineStatus {
  step: "Idle" | "Uploading" | "Parsing" | "OCR_Scanning" | "Language_Detecting" | "Extracting_Metadata" | "Generating_Embeddings" | "Running_Duplicate_Detection" | "AI_Summarizing" | "Creating_Flashcards" | "Completed" | "Failed";
  progress: number; // 0 to 100
  logs: string[];
}
