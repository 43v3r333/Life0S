import React, { useState, useEffect } from "react";
import {
  Database,
  Activity,
  Terminal,
  Workflow,
  LockKeyhole,
  BarChart3,
  Users,
  Globe,
  Network,
  RefreshCw,
  Eye,
  Cpu,
  Search,
  ShieldCheck,
  LineChart,
  History,
  FileText,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Settings,
  ChevronRight,
  Filter,
  Plus,
  BookOpen,
  DollarSign,
  Briefcase,
  Heart,
  TrendingUp,
  Sliders,
  Sparkles,
  Download,
  Info,
  Layers,
  Flame,
  Binary,
  ArrowRight,
  RefreshCcw,
  Book,
  Moon,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from "recharts";

interface DataPlatformViewProps {
  onAddSignalREvent?: (msg: string) => void;
  onUpdateScore?: () => void;
}

export default function DataPlatformView({
  onAddSignalREvent = () => {},
  onUpdateScore = () => {}
}: DataPlatformViewProps) {
  // Navigation tabs for the Unified Data Platform
  const [activeTab, setActiveTab] = useState<
    "digital_twin" | "catalog" | "lakehouse" | "observability" | "replay" | "analytics" | "governance" | "query" | "reports" | "diagnostics"
  >("digital_twin");

  // Local Storage state helper
  const STORAGE_KEY_PREFIX = "lifeos_p9_";
  const loadState = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };
  const saveState = (key: string, value: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving state to localStorage", e);
    }
  };

  // 1. Digital Twin Entities
  const [digitalTwinState, setDigitalTwinState] = useState(() => loadState("digitalTwinState", {
    life: { name: "Life Twin", status: "Optimal", focusScore: 92, lastSync: "Just now" },
    faith: { prayerConsistency: "98%", salahCount: "5/5 Today", dhikrCount: "100+", charity: "£450 Purified", lastSync: "04:15 AM" },
    marriage: { choreBalance: "50/50 Synchronized", syncLevel: "Optimal", calendarShared: "Yes", lastSync: "02:30 AM" },
    career: { currentMilestone: "Phase 9 Release", activeClientContracts: 3, careerSla: "99.8%", lastSync: "Just now" },
    businesses: { mesS7Integration: "Active", oeeTarget: "87.5%", marginRatio: "32.4%", lastSync: "03:10 AM" },
    projects: { activeSprint: "Sprint 26", completedTasks: 44, velocity: "18.2 pts", lastSync: "Just now" },
    knowledge: { indexedWikis: 1422, graphNodes: 5892, vectorEmbeddings: "12.4M", lastSync: "04:12 AM" },
    health: { sleepQuality: "88%", avgSteps: "11,400", restingHeartRate: "62 bpm", lastSync: "04:30 AM" },
    finances: { doubleEntryStatus: "Balanced", liquidBalance: "£142,300", pureReserve: "10.0%", lastSync: "04:32 AM" },
    workforce: { activeThreads: 12, agentsRosterCount: 15, automationSla: "100.0%", lastSync: "Just now" }
  }));

  // 2. Data Pipelines and Ingestion Logs
  const [pipelines, setPipelines] = useState<any[]>(() => loadState("pipelines", [
    { id: "pipe_1", name: "Wonderware MES Change Data Capture (CDC)", source: "SQL Server (MES)", target: "Delta Warehouse", rate: "240 recs/sec", latency: "14ms", status: "Active", format: "Parquet", type: "Streaming" },
    { id: "pipe_2", name: "Microsoft Graph (Emails & Outlook Calendars)", source: "Exchange Online API", target: "Vector Embedding Store", rate: "Batch (10m)", latency: "240ms", status: "Active", format: "JSON", type: "Incremental" },
    { id: "pipe_3", name: "Salah Logs & Spiritual Ingestion Sync", source: "IslamOS Mobile App", target: "Operational Database", rate: "Event-driven", latency: "5ms", status: "Active", format: "JSON", type: "Streaming" },
    { id: "pipe_4", name: "Double-Entry Ledgers Reconciler Pipeline", source: "CSV & Excel Uploads", target: "Financial Analytics Store", rate: "Batch (Daily)", latency: "1.2s", status: "Idle", format: "Excel", type: "Batch" },
    { id: "pipe_5", name: "Qdrant Vector Store Syncer Pipeline", source: "Knowledge Hub Markdown", target: "Vector Store Cluster", rate: "Streaming", latency: "8ms", status: "Active", format: "Embeddings", type: "Streaming" }
  ]));

  // 3. Central Logging and Tracing console
  const [systemLogs, setSystemLogs] = useState<any[]>(() => loadState("systemLogs", [
    { id: "log_1", time: "04:34:12", service: "SQL Server CDC", level: "info", message: "Snapshot sequence LSN [00000012:00001242:0001] applied cleanly." },
    { id: "log_2", time: "04:33:55", service: "SignalR Hub", level: "info", message: "Published 'DigitalTwinUpdated' event payload to 4 listening clients." },
    { id: "log_3", time: "04:31:02", service: "Qdrant Store", level: "info", message: "Indexed 12 new narrative blocks into partition 'lifeos_knowledge_embeddings'." },
    { id: "log_4", time: "04:30:00", service: "Quartz.NET", level: "info", message: "Trigger 'DailyFinancialReconcilerTrigger' dispatched successfully." },
    { id: "log_5", time: "04:22:15", service: "Hangfire Engine", level: "warning", message: "Transient socket dropout detected on WhatsApp API. Retrying backoff connection..." },
    { id: "log_6", time: "04:12:45", service: "Security ABAC", level: "info", message: "Enforced encryption block on partition 'life_finances_durable'." }
  ]));

  // 4. Data Quality Rules and Issues
  const [qualityScore, setQualityScore] = useState(98.5);
  const [qualityIssues, setQualityIssues] = useState<any[]>(() => loadState("qualityIssues", [
    { id: "iss_1", dataset: "Financial Transactions Ledger", rule: "Double-Entry Balance Constraint", severity: "High", desc: "Unbalanced transaction trace found on partition 2026-Q2. Difference: £0.04.", suggest: "Inject reconciliation corrective journal." },
    { id: "iss_2", dataset: "Physical Steps telemetry", rule: "Missing Data Bound Checks", severity: "Low", desc: "30-minute interval void found on Fitbit sync stream between 01:00 and 01:30 AM.", suggest: "Interpolate using historical average coefficients." }
  ]));

  // 5. Query terminal input & output
  const [queryInput, setQueryInput] = useState("SELECT * FROM fact_executive_kpis WHERE category = 'Finance' ORDER BY timestamp DESC LIMIT 5;");
  const [queryResult, setQueryResult] = useState<any[] | null>(() => [
    { timestamp: "2026-07-06 04:00 AM", focus_score: 94, prayer_consistency: 0.98, cash_liquidity: 142300, risk_exposure: 0.05, business_oee: 0.88 },
    { timestamp: "2026-07-05 04:00 AM", focus_score: 92, prayer_consistency: 0.98, cash_liquidity: 141900, risk_exposure: 0.05, business_oee: 0.86 },
    { timestamp: "2026-07-04 04:00 AM", focus_score: 89, prayer_consistency: 0.96, cash_liquidity: 141200, risk_exposure: 0.06, business_oee: 0.87 },
    { timestamp: "2026-07-03 04:00 AM", focus_score: 95, prayer_consistency: 1.00, cash_liquidity: 142100, risk_exposure: 0.04, business_oee: 0.89 },
    { timestamp: "2026-07-02 04:00 AM", focus_score: 90, prayer_consistency: 0.98, cash_liquidity: 139500, risk_exposure: 0.04, business_oee: 0.88 }
  ]);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);

  // 6. Data Catalog registered datasets
  const [catalogSearch, setCatalogSearch] = useState("");
  const catalogDatasets = [
    { id: "cat_1", name: "fact_spiritual_salah_logs", description: "Durable event store mapping prayer timestamps, congregation statuses, and reflective scores.", schema: "Timestamp UTC, SalahName VARCHAR(12), Location VARCHAR(44), Congregation BIT, ReflectionScore INT", size: "41.2 KB", retention: "Infinite / Permanent" },
    { id: "cat_2", name: "dim_corporate_balance_ledger", description: "Relational company balance tracking double-entry transactions and Shariah-purified holdings.", schema: "AccountID INT, AccountName VARCHAR(60), Balance DECIMAL(18,2), Currency VARCHAR(3), PurifiedRatio DECIMAL(5,4)", size: "124.5 KB", retention: "7 Years / Financial Compliance" },
    { id: "cat_3", name: "fact_knowledge_graph_triples", description: "Knowledge base semantic relational triples indexed from Obsidian, Markdown, and custom books.", schema: "SubjectNodeID INT, PredicateRelationship VARCHAR(32), ObjectNodeID INT, SourceDocument VARCHAR(120)", size: "4.8 MB", retention: "Infinite / Permanent" },
    { id: "cat_4", name: "fact_mes_telemetry_stream", description: "High-density streaming dataset capture from assembly line S7 PLCs and Wonderware tag logs.", schema: "EventTime DATETIME2, AssemblyLineID INT, MachineStatus VARCHAR(20), OeeMetric DECIMAL(4,3), ActivePowerKw FLOAT", size: "145.2 MB", retention: "90 Days Partitioned" },
    { id: "cat_5", name: "dim_ai_workforce_execution_history", description: "Audit store documenting Model Context Protocol (MCP) tool queries, agent token spends, and decisions.", schema: "ExecutionID UNIQUEIDENTIFIER, InitiatorAgent VARCHAR(30), McpToolUsed VARCHAR(50), TokenCost DECIMAL(6,4), ResultHash VARCHAR(64)", size: "2.1 MB", retention: "3 Years" }
  ];

  // 7. Event Replay controls
  const [replayTime, setReplayTime] = useState("2026-07-06 02:00:00");
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayLogs, setReplayLogs] = useState<string[]>([]);

  // 8. Test suite variables
  const [pipelineTests, setPipelineTests] = useState<any[]>([
    { id: "pt_1", name: "DataPlatform.IngestionEngine_NormalizesUnstructuredCsv", status: "Untested" },
    { id: "pt_2", name: "Lakehouse.DeltaCommit_EnforcesSchemaValidation", status: "Untested" },
    { id: "pt_3", name: "Observability.DistributedTracer_FailsOnHangfireStall", status: "Untested" },
    { id: "pt_4", name: "DigitalTwin.FaithState_AutoUpdatesOnSalahEvent", status: "Untested" },
    { id: "pt_5", name: "DataQuality.OutlierDetection_FlagsAbnormalGains", status: "Untested" },
    { id: "pt_6", name: "EventReplay.PointInTime_ReconcilesLedgerSnapshot", status: "Untested" }
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testCoverage, setTestCoverage] = useState(0);
  const [testConsoleLogs, setTestConsoleLogs] = useState<string[]>([]);

  // 9. Forecasting Variables
  const [burnoutRiskForecast, setBurnoutRiskForecast] = useState([
    { name: "Jul 06", SleepQuality: 88, FocusScore: 92, BurnoutRisk: 12 },
    { name: "Jul 07", SleepQuality: 85, FocusScore: 91, BurnoutRisk: 14 },
    { name: "Jul 08", SleepQuality: 80, FocusScore: 88, BurnoutRisk: 20 },
    { name: "Jul 09", SleepQuality: 78, FocusScore: 84, BurnoutRisk: 28 }, // simulated drop
    { name: "Jul 10 (Proj)", SleepQuality: 84, FocusScore: 89, BurnoutRisk: 22 },
    { name: "Jul 11 (Proj)", SleepQuality: 89, FocusScore: 93, BurnoutRisk: 15 }
  ]);

  const [cashFlowForecast, setCashFlowForecast] = useState([
    { name: "Jul 06", CashOnHand: 142300, ProjCash: 142300 },
    { name: "Jul 13", CashOnHand: 143500, ProjCash: 143500 },
    { name: "Jul 20", CashOnHand: 145100, ProjCash: 145000 },
    { name: "Jul 27 (Proj)", CashOnHand: null, ProjCash: 147800 },
    { name: "Aug 03 (Proj)", CashOnHand: null, ProjCash: 151200 },
    { name: "Aug 10 (Proj)", CashOnHand: null, ProjCash: 154500 }
  ]);

  const [decisionHistory, setDecisionHistory] = useState(() => loadState("decisionHistory", [
    { id: "dec_1", time: "04:12:00", title: "Double-Entry ledger automated audit snapshot", confidence: "99.8%", risk: "Low", status: "Auto-Approved" },
    { id: "dec_2", time: "03:44:10", title: "AAOIFI Compliant purifier transfer schedule", confidence: "98.2%", risk: "Medium", status: "Human Approved" },
    { id: "dec_3", time: "01:22:00", title: "Wonderware Line 4 S7 firmware telemetry check", confidence: "95.4%", risk: "High", status: "Human Approved" }
  ]));

  // Auto-saves state
  useEffect(() => { saveState("digitalTwinState", digitalTwinState); }, [digitalTwinState]);
  useEffect(() => { saveState("pipelines", pipelines); }, [pipelines]);
  useEffect(() => { saveState("systemLogs", systemLogs); }, [systemLogs]);
  useEffect(() => { saveState("qualityIssues", qualityIssues); }, [qualityIssues]);
  useEffect(() => { saveState("decisionHistory", decisionHistory); }, [decisionHistory]);

  // Execute Point-in-time Event Replay
  const runEventReplay = () => {
    setIsReplaying(true);
    setReplayLogs([]);
    onAddSignalREvent(`Triggered Event Replay from checkpoint: ${replayTime}`);

    const logs: string[] = [];
    const steps = [
      `Initializing point-in-time state recovery at timestamp: ${replayTime}...`,
      `Locking down active databases & halting streaming ingestion queues.`,
      `Acquiring CDC LSN logs corresponding to target timestamp...`,
      `Replaying 4,812 event-store blocks for user Ethan Barnes...`,
      `Applying Delta transaction logs. Reconstituting Knowledge Graph structure...`,
      `State reconstructed. Focus: 91%, Cash: £141,800, Salah Consistency: 98%.`,
      `Point-in-Time snapshot analysis compiled successfully.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        logs.push(`[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`);
        setReplayLogs([...logs]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsReplaying(false);
        onAddSignalREvent(`Event Replay complete. point-in-time comparison view populated.`);
        onUpdateScore();
      }
    }, 400);
  };

  // Run Custom Query
  const executeQuery = () => {
    setIsExecutingQuery(true);
    onAddSignalREvent(`Executing Lakehouse Query...`);

    setTimeout(() => {
      setIsExecutingQuery(false);
      onAddSignalREvent(`Query execution complete. 5 rows retrieved in 18ms.`);
      onUpdateScore();
    }, 500);
  };

  // Run Platform Pipeline Test Diagnostics
  const executeDiagnostics = () => {
    setIsRunningTests(true);
    setTestConsoleLogs([]);
    setTestCoverage(0);

    const logs: string[] = [];
    let current = 0;

    const interval = setInterval(() => {
      if (current < pipelineTests.length) {
        const testCase = pipelineTests[current];
        logs.push(`[SYSTEM] Initializing telemetry container for ${testCase.name}...`);
        logs.push(`[DB] Injecting mock DuckDB / Parquet data contracts and schemas...`);
        logs.push(`[PASS] Verified test constraint: ${testCase.name} successfully loaded (90%+ coverage verified).`);

        setPipelineTests(prev => prev.map((t, index) => {
          if (index === current) return { ...t, status: "Passed" };
          return t;
        }));

        setTestConsoleLogs([...logs]);
        current++;
      } else {
        clearInterval(interval);
        logs.push(`\n=== PIPELINE DIAGNOSTIC REPORT ===`);
        logs.push(`Unit tests compiled: 6 | Integration: 6 | Flow checks: 6`);
        logs.push(`Overall Code Coverage: 96.8% across Unified Data Platform schemas.`);
        logs.push(`Durable Lakehouse Lineage checking: Passed.`);
        logs.push(`All system invariants successfully verified against raw SQL Server clusters.`);
        setTestConsoleLogs([...logs]);
        setTestCoverage(96.8);
        setIsRunningTests(false);
        onAddSignalREvent(`All Phase 9 Lakehouse diagnostic tests passed cleanly with 96.8% coverage.`);
        onUpdateScore();
      }
    }, 350);
  };

  // Simulated live event trigger to show updating Digital Twin
  const triggerSimulatedLiveEvent = () => {
    // Modify one key in state to show real-time synchronization
    const randFocus = Math.floor(Math.random() * 8) + 90;
    const stepCount = (Math.floor(Math.random() * 1000) + 11000).toLocaleString();
    
    setDigitalTwinState(prev => ({
      ...prev,
      life: { ...prev.life, focusScore: randFocus, lastSync: "04:35 AM" },
      health: { ...prev.health, avgSteps: `${stepCount}`, lastSync: "04:35 AM" }
    }));

    // Insert new system log
    const newLog = {
      id: "log_" + Date.now(),
      time: "04:35:15",
      service: "Digital Twin Engine",
      level: "info",
      message: `Synchronized Ethan's dynamic bio-metrics: steps improved to ${stepCount}, focal state recalculated at ${randFocus}%.`
    };
    setSystemLogs(prev => [newLog, ...prev.slice(0, 10)]);

    onAddSignalREvent(`Live ingestion sync: Digital Twin synchronized with steps & focal score.`);
    onUpdateScore();
  };

  // Export Board Reports
  const handleDownloadReport = (type: string) => {
    onAddSignalREvent(`Successfully generated Phase 9 ${type} board-level analytics report.`);
    alert(`Phase 9 Executive Report (${type}) compiled successfully!\nFile downloaded securely as: lifeos_analytics_report.${type.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Main Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-mono text-xs uppercase tracking-wider font-semibold">
            <Database className="h-4 w-4" />
            <span>Unified Intelligence Platform • Phase 9 Operational</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            Data Lakehouse, Observability & Digital Twin OS
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-3xl font-mono">
            ENTERPRISE CATALOG • DATA LINEAGE • SYSTEM OBSERVABILITY • HISTORICAL EVENT REPLAY • DOCKDB ANALYTICAL LAKEHOUSE
          </p>
        </div>

        {/* Quick action triggers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={triggerSimulatedLiveEvent}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-mono hover:bg-emerald-100 font-semibold"
          >
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Ingest Live CDC Event</span>
          </button>
        </div>
      </div>

      {/* Workspace Sub-tab Selection bar */}
      <div className="flex flex-wrap gap-1 bg-stone-50 border border-stone-200 p-1.5 rounded-xl">
        {[
          { id: "digital_twin", label: "Digital Twin", icon: Globe },
          { id: "catalog", label: "Data Catalog", icon: Database },
          { id: "lakehouse", label: "Lakehouse Pipelines", icon: Workflow },
          { id: "observability", label: "Observability Platform", icon: Activity },
          { id: "replay", label: "Historical Event Replay", icon: History },
          { id: "analytics", label: "Executive & Predictive", icon: BarChart3 },
          { id: "governance", label: "Data Governance", icon: LockKeyhole },
          { id: "query", label: "Executive Query", icon: Terminal },
          { id: "reports", label: "Reporting Center", icon: FileText },
          { id: "diagnostics", label: "Lakehouse Tests", icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                onAddSignalREvent(`Navigated to Data Platform: ${tab.label}`);
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-mono text-[10px] transition border ${
                isSelected
                  ? "bg-stone-900 border-stone-950 text-white font-bold shadow-sm"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View Body container */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* VIEW 1: DIGITAL TWIN ENGINE */}
            {activeTab === "digital_twin" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Digital Twin Engine</h2>
                  <p className="text-xs text-stone-500 font-mono">Real-time state synchronization mapping physical activities, business metrics, and spiritual compliance logs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Digital Twin State Cards */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Life State</span>
                      <Home className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 block font-mono">{digitalTwinState.life.focusScore}%</span>
                    <span className="text-[9px] text-emerald-700 font-mono block">Focus: {digitalTwinState.life.status}</span>
                    <span className="text-[8px] text-stone-400 font-mono block">Sync: {digitalTwinState.life.lastSync}</span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Faith & IslamOS</span>
                      <Moon className="h-4 w-4 text-teal-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 block font-mono">{digitalTwinState.faith.prayerConsistency}</span>
                    <span className="text-[9px] text-teal-700 font-mono block">Salah: {digitalTwinState.faith.salahCount}</span>
                    <span className="text-[8px] text-stone-400 font-mono block">Purified: {digitalTwinState.faith.charity}</span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Marriage Sync</span>
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 block font-mono">{digitalTwinState.marriage.syncLevel}</span>
                    <span className="text-[9px] text-stone-700 font-mono block">{digitalTwinState.marriage.choreBalance}</span>
                    <span className="text-[8px] text-stone-400 font-mono block">Shared Calendar Active</span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Career Twin</span>
                      <Briefcase className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 block font-mono">{digitalTwinState.career.careerSla}</span>
                    <span className="text-[9px] text-orange-700 font-mono block">{digitalTwinState.career.currentMilestone}</span>
                    <span className="text-[8px] text-stone-400 font-mono block">Active Clients: {digitalTwinState.career.activeClientContracts}</span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Halal Finance</span>
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 block font-mono">{digitalTwinState.finances.liquidBalance}</span>
                    <span className="text-[9px] text-emerald-700 font-mono block">Double-Entry: {digitalTwinState.finances.doubleEntryStatus}</span>
                    <span className="text-[8px] text-stone-400 font-mono block">Purification: {digitalTwinState.finances.pureReserve}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Lineage Flow representing the Digital Twin pipeline mappings */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Inter-Module Core Data Lineage Graph</span>
                      <span className="text-[10px] font-mono text-stone-400">Target: DuckDB / Parquet Warehouse</span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-6">
                      {/* Interactive visual layout of how data flows */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center text-xs font-mono">
                        {/* Source Modules */}
                        <div className="space-y-2 w-full md:w-1/3">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block">Operational Stores</span>
                          <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-xs text-stone-800">
                            SQL Server (Ledgers)
                          </div>
                          <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-xs text-stone-800">
                            IslamOS Event Hub
                          </div>
                          <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-xs text-stone-800 font-semibold text-indigo-700">
                            AI Workforce Logs
                          </div>
                        </div>

                        {/* Transformation & Aggregation */}
                        <div className="flex flex-col items-center justify-center space-y-1 w-full md:w-1/3 py-2">
                          <ArrowRight className="h-5 w-5 text-indigo-600 animate-pulse rotate-90 md:rotate-0" />
                          <div className="p-2.5 bg-stone-900 text-white rounded-xl text-[10px] font-bold w-full">
                            ETL Ingestion Engine
                            <span className="block text-[8px] text-emerald-400 font-normal mt-0.5">Incremental Deduplication</span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-indigo-600 animate-pulse rotate-90 md:rotate-0" />
                        </div>

                        {/* Analytics Warehouse */}
                        <div className="space-y-2 w-full md:w-1/3">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block">Analytical Warehouse</span>
                          <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg shadow-xs font-bold text-indigo-900">
                            Parquet Delta Storage
                            <span className="block text-[8px] font-normal text-stone-500">DuckDB Analytics ready</span>
                          </div>
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg shadow-xs font-bold text-emerald-900">
                            Qdrant Knowledge Store
                            <span className="block text-[8px] font-normal text-stone-500">Embedding clusters synced</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-stone-100/55 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 font-mono space-y-1 leading-relaxed">
                        <p><strong>Durable Integrity Check:</strong> Data contract version <span className="font-bold text-indigo-700">v1.4.2</span> enforced. Real-time streaming is active. Zero pipeline dropouts recorded in the past 24 hours.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Digital Twin Sync Events */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Cognitive Twin Events</span>
                    
                    <div className="space-y-3 overflow-y-auto max-h-80">
                      {decisionHistory.map((dec) => (
                        <div key={dec.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-stone-800 leading-snug">{dec.title}</span>
                            <span className="text-[8px] font-mono text-stone-400">{dec.time}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="text-stone-500">Risk: {dec.risk}</span>
                            <span className="text-indigo-600 font-bold">Conf: {dec.confidence}</span>
                          </div>
                          <span className={`inline-block text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase mt-1 ${
                            dec.status === "Auto-Approved" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                          }`}>
                            {dec.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: UNIFIED DATA CATALOG & SCHEMAS */}
            {activeTab === "catalog" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Unified Data Catalog</h2>
                  <p className="text-xs text-stone-500 font-mono">Register schemas, monitor active Parquet datasets, and inspect strong-typed contracts</p>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search datasets, schema schemas, columns (e.g. salah, balance, mes)..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none text-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {catalogDatasets
                    .filter(d => d.name.toLowerCase().includes(catalogSearch.toLowerCase()) || d.description.toLowerCase().includes(catalogSearch.toLowerCase()))
                    .map((ds) => (
                      <div key={ds.id} className="border border-stone-200 rounded-xl p-5 space-y-3 hover:bg-stone-50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                          <div>
                            <span className="text-sm font-bold text-indigo-900 font-mono">{ds.name}</span>
                            <p className="text-xs text-stone-600 leading-relaxed mt-1">{ds.description}</p>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[9px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded uppercase font-bold">Size: {ds.size}</span>
                            <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold">{ds.retention}</span>
                          </div>
                        </div>

                        <div className="bg-stone-900 text-stone-100 rounded-xl p-3 text-[10px] font-mono space-y-1">
                          <span className="text-indigo-400 block font-bold uppercase text-[8px] tracking-wider mb-1">Active Schema Contract:</span>
                          <p>{ds.schema}</p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                          <span className="text-emerald-700 font-bold flex items-center space-x-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Data Lineage Integrity Checked (v1.2)</span>
                          </span>
                          <span>Source Partition: AWS/Local MinIO S3 parquet-replica</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* VIEW 3: PIPELINES MONITOR & FEATURE STORE */}
            {activeTab === "lakehouse" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Intelligence Lakehouse pipelines</h2>
                  <p className="text-xs text-stone-500 font-mono">Monitor Change Data Capture (CDC), DuckDB partition engines, and machine-learning Feature Store values</p>
                </div>

                {/* Core pipeline statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block font-bold">Lakehouse Engines</span>
                    <span className="text-xl font-bold text-stone-900 block mt-1 font-mono">Delta / DuckDB</span>
                    <span className="text-[9px] text-emerald-700 block font-mono mt-1 font-bold">Storage format: Parquet</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block font-bold">Feature Store vectors</span>
                    <span className="text-xl font-bold text-indigo-600 block mt-1 font-mono">12.4M Features</span>
                    <span className="text-[9px] text-stone-500 block font-mono mt-1">Consistency metrics active</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block font-bold">Change Data Capture rate</span>
                    <span className="text-xl font-bold text-stone-900 block mt-1 font-mono">240 logs/sec</span>
                    <span className="text-[9px] text-emerald-600 block font-mono mt-1 font-bold">SQL Server replication live</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block font-bold">Qdrant Node Index Size</span>
                    <span className="text-xl font-bold text-stone-900 block mt-1 font-mono">4.8 GB</span>
                    <span className="text-[9px] text-stone-500 block font-mono mt-1">Vector dimensions: 1536 (Gemini)</span>
                  </div>
                </div>

                {/* Pipelines Active List */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Active Data Pipelines</span>
                  <div className="space-y-3">
                    {pipelines.map((pipe) => (
                      <div key={pipe.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-stone-900">{pipe.name}</span>
                            <span className="text-[8px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded uppercase font-bold">{pipe.type}</span>
                          </div>
                          <p className="text-[10px] font-mono text-stone-400 mt-1">Source: {pipe.source} → Target: {pipe.target}</p>
                        </div>

                        <div className="flex items-center space-x-6 text-[10px] font-mono shrink-0">
                          <div>
                            <span className="text-stone-400 uppercase block text-[8px] font-bold">Sync speed</span>
                            <span className="text-stone-800 font-bold">{pipe.rate}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 uppercase block text-[8px] font-bold">Pipeline Latency</span>
                            <span className="text-indigo-700 font-bold">{pipe.latency}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 uppercase block text-[8px] font-bold">Format</span>
                            <span className="text-stone-700">{pipe.format}</span>
                          </div>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-mono">
                            {pipe.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Feature Store definitions */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase">Reusable Intelligence Feature Store</span>
                    <span className="text-[10px] font-mono text-stone-400">Total metrics: 18</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="text-[9px] text-stone-400 uppercase font-bold">Habit Consistency (7d)</span>
                      <p className="text-stone-800 font-bold text-sm">88.2%</p>
                      <p className="text-[9px] text-stone-500 font-normal leading-relaxed">Continuous habit integration tracking weights and focus triggers.</p>
                    </div>
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="text-[9px] text-stone-400 uppercase font-bold">Salah Consistency (30d)</span>
                      <p className="text-teal-700 font-bold text-sm">98.5%</p>
                      <p className="text-[9px] text-stone-500 font-normal leading-relaxed">Salah timelines monitoring in-mosque congregation scores.</p>
                    </div>
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="text-[9px] text-stone-400 uppercase font-bold">Finances Purified ratio</span>
                      <p className="text-emerald-700 font-bold text-sm">10.0% Purified</p>
                      <p className="text-[9px] text-stone-500 font-normal leading-relaxed">Double-entry ledger audit mapping interest purification targets.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: OBSERVABILITY PLATFORM */}
            {activeTab === "observability" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Observability Platform</h2>
                  <p className="text-xs text-stone-500 font-mono">Distributed tracing service map, central logging queues, and anomaly alert logs</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Central Logging */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Central System Log Stream</span>
                    
                    <div className="bg-stone-900 text-stone-100 rounded-xl p-4 font-mono text-[10px] space-y-2 overflow-y-auto max-h-96">
                      {systemLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-2">
                          <span className="text-stone-500">[{log.time}]</span>
                          <span className={`uppercase font-bold ${
                            log.level === "warning" ? "text-amber-400" : log.level === "error" ? "text-red-400" : "text-emerald-400"
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-indigo-300">({log.service})</span>
                          <span className="text-stone-300 flex-1">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distributed Tracing & Service Map status */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Central Dependency Map</span>
                    
                    <div className="space-y-3.5 font-mono text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                        <span className="font-bold text-stone-800">ASP.NET Core Web API</span>
                        <span className="text-emerald-700 font-bold">Active (12ms)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                        <span className="font-bold text-stone-800">SQL Server Cluster</span>
                        <span className="text-emerald-700 font-bold">Active (4ms)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                        <span className="font-bold text-stone-800">Hangfire Scheduler</span>
                        <span className="text-emerald-700 font-bold">Active (140ms)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                        <span className="font-bold text-stone-800">Redis Cache Cluster</span>
                        <span className="text-emerald-700 font-bold">Active (2ms)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                        <span className="font-bold text-stone-800">Qdrant Vector Cluster</span>
                        <span className="text-emerald-700 font-bold">Active (18ms)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anomaly Alerts & Corrections */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Data Quality Exceptions</span>
                  
                  {qualityIssues.length === 0 ? (
                    <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-mono">
                      No quality exceptions recorded. Data streams comply with schemas 100%.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {qualityIssues.map((iss) => (
                        <div key={iss.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900">{iss.dataset}</span>
                            <span className="text-[9px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase font-bold">{iss.severity} Severity</span>
                          </div>
                          <p className="text-xs text-stone-600 font-mono"><strong>Issue:</strong> {iss.desc}</p>
                          <p className="text-xs text-stone-600 font-mono"><strong>Correction Suggestion:</strong> <span className="text-emerald-700 font-bold">{iss.suggest}</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 5: EVENT REPLAY CONSOLE */}
            {activeTab === "replay" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Historical Event Replay Console</h2>
                  <p className="text-xs text-stone-500 font-mono">Perform point-in-time state comparisons, replay past telemetry events, and audit state lineage drift</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Controls card */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Replay Parameters</span>
                    
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Target Point-In-Time</label>
                        <input
                          type="text"
                          value={replayTime}
                          onChange={(e) => setReplayTime(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Replay Scope Segment</label>
                        <select className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none text-stone-900">
                          <option>Global (All Modules)</option>
                          <option>IslamOS (Faith Records)</option>
                          <option>Double-Entry Ledgers</option>
                          <option>AI Workforce executions</option>
                          <option>Mes PLC logs</option>
                        </select>
                      </div>

                      <button
                        onClick={runEventReplay}
                        disabled={isReplaying}
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[10px] py-2 rounded font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5"
                      >
                        <Play className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{isReplaying ? "Executing Replay..." : "Trigger Invariant Replay"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Replay Output Logs */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Point-In-Time Reconstruction Logs</span>
                    
                    {replayLogs.length === 0 ? (
                      <div className="p-8 text-center text-stone-400 font-mono text-xs bg-stone-50 border border-stone-200 rounded-xl">
                        Specify target checkpoint parameter coordinates and trigger Replay to reconstruct state.
                      </div>
                    ) : (
                      <div className="bg-stone-900 text-stone-100 rounded-xl p-4 font-mono text-[10px] space-y-2 overflow-y-auto max-h-80">
                        {replayLogs.map((log, index) => (
                          <div key={index} className="leading-relaxed">
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 6: EXECUTIVE & PREDICTIVE ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Executive & Predictive Analytics</h2>
                  <p className="text-xs text-stone-500 font-mono">Trend forecasting models, scenario plans, cash-flow projections, and cognitive burnout indexes</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Burnout prediction graph */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Trend & Burnout risk projection</span>
                      <span className="text-[10px] font-mono text-stone-400">Model: Gemini Forecasting Engine</span>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={burnoutRiskForecast}>
                          <defs>
                            <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" stroke="#78716c" fontSize={9} tickLine={false} />
                          <YAxis stroke="#78716c" fontSize={9} tickLine={false} />
                          <Tooltip wrapperStyle={{ fontFamily: "monospace", fontSize: "10px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                          <Area type="monotone" dataKey="BurnoutRisk" name="Burnout Risk %" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBurn)" />
                          <Area type="monotone" dataKey="SleepQuality" name="Sleep Quality %" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSleep)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] font-mono text-stone-500 leading-relaxed bg-stone-50 p-3 border border-stone-200 rounded-xl">
                      <strong>Burnout Warning Trigger:</strong> Projection forecasts a brief risk elevation spike on <span className="font-bold text-red-600">July 09</span> due to simulated sleep quality degradation bounds. Early mitigation schedule dispatched to Marriage sync coordinator.
                    </p>
                  </div>

                  {/* Cash Flow prediction graph */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Double-Entry Liquid Cash Flow Trend</span>
                      <span className="text-[10px] font-mono text-stone-400">Target: 30-Day Outlook</span>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={cashFlowForecast}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" stroke="#78716c" fontSize={9} tickLine={false} />
                          <YAxis stroke="#78716c" fontSize={9} tickLine={false} domain={['dataMin - 5000', 'dataMax + 5000']} />
                          <Tooltip wrapperStyle={{ fontFamily: "monospace", fontSize: "10px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                          <Line type="monotone" dataKey="CashOnHand" name="Actual Cash (£)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="ProjCash" name="Projected Cash (£)" stroke="#9ca3af" strokeDasharray="5 5" strokeWidth={1.5} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] font-mono text-stone-500 leading-relaxed bg-stone-50 p-3 border border-stone-200 rounded-xl">
                      <strong>Financial Trend Optimization:</strong> Double-entry forecast projects solid cash accretion up to <span className="font-bold text-emerald-800">£154,500</span> by August 10. Shariah compliance model suggests allocating £15,400 into Gold Reserves to comply with diversification thresholds.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 7: DATA GOVERNANCE & ACCESS CONTROL */}
            {activeTab === "governance" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Platform Data Governance & Security</h2>
                  <p className="text-xs text-stone-500 font-mono">Manage ABAC role access policies, verify encrypted schemas, and audit data ownership constraints</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
                  {/* ABAC Policies Map */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-2">Active ABAC Access Rules</span>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                        <span className="font-bold text-indigo-900">Rule 1: Spiritual & Faith Ledger privacy</span>
                        <p className="text-stone-500 text-[10px]">Permission: STRICTLY RESTRICTED to Ethan Barnes. No AI employee or specialist model can serialize plain-text congregation values unless authorized.</p>
                      </div>
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                        <span className="font-bold text-indigo-900">Rule 2: Enterprise double-entry books access</span>
                        <p className="text-stone-500 text-[10px]">Permission: CFO Advisor and legal models can run query routines only inside isolation sandbox clusters. Absolute block on public APIs.</p>
                      </div>
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                        <span className="font-bold text-indigo-900">Rule 3: MES factory register write limits</span>
                        <p className="text-stone-500 text-[10px]">Permission: Write access restricted to Manufacturing Engineer agent upon explicit human override approval token confirmation.</p>
                      </div>
                    </div>
                  </div>

                  {/* Retention Policies & Encryption */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-2">Durable Encryption Bounds</span>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-800">Spiritual & Faith Store</span>
                          <span className="text-[10px] text-stone-400 block">Encryption: AES-GCM-256</span>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Encrypted</span>
                      </div>
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-800">Double-Entry Financial Store</span>
                          <span className="text-[10px] text-stone-400 block">Encryption: AES-GCM-256 with key rotation</span>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Encrypted</span>
                      </div>
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-800">Knowledge Obsidian Filesystem</span>
                          <span className="text-[10px] text-stone-400 block">Encryption: At-rest partition encryption</span>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Encrypted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 8: EXECUTIVE QUERY ENGINE */}
            {activeTab === "query" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Executive Query Engine terminal</h2>
                  <p className="text-xs text-stone-500 font-mono">Execute high-speed SQL, GraphQL, or semantic hybrid queries across the Lakehouse warehouse</p>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                    <label className="text-[10px] text-stone-400 uppercase font-bold block">SQL/Semantic Code Query Terminal</label>
                    <textarea
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      rows={3}
                      className="w-full bg-stone-900 text-stone-100 rounded-xl p-4 focus:outline-none tracking-wide text-[11px]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={executeQuery}
                        disabled={isExecutingQuery}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] px-4 py-1.5 rounded uppercase font-bold tracking-wider"
                      >
                        {isExecutingQuery ? "Running Query..." : "Execute Query"}
                      </button>
                    </div>
                  </div>

                  {queryResult && (
                    <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block border-b border-stone-100 pb-1.5">Query Output (5 Rows Retreived)</span>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px] text-stone-600 leading-relaxed border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-800 font-bold uppercase text-[9px]">
                              <th className="py-2 px-3">Timestamp</th>
                              <th className="py-2 px-3">Focus Score %</th>
                              <th className="py-2 px-3">Prayer Consistency %</th>
                              <th className="py-2 px-3">Cash Liquidity</th>
                              <th className="py-2 px-3">Risk Exposure</th>
                              <th className="py-2 px-3">OEE (MES)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.map((row, idx) => (
                              <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50">
                                <td className="py-2 px-3 font-semibold text-stone-900">{row.timestamp}</td>
                                <td className="py-2 px-3">{row.focus_score}%</td>
                                <td className="py-2 px-3">{(row.prayer_consistency * 100).toFixed(1)}%</td>
                                <td className="py-2 px-3 text-emerald-800 font-bold">£{row.cash_liquidity.toLocaleString()}</td>
                                <td className="py-2 px-3">{(row.risk_exposure * 100).toFixed(1)}%</td>
                                <td className="py-2 px-3">{(row.business_oee * 100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 9: REPORTING CENTER */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Enterprise Reporting Center</h2>
                  <p className="text-xs text-stone-500 font-mono">Compile and export boardroom-ready PDF, Excel, and Markdown reports based on Lakehouse metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Monthly Spiritual Review */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3.5 bg-stone-50/50 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Faith Reports</span>
                      <span className="text-sm font-bold text-stone-950 block">Salah & Reflection Audit</span>
                      <p className="text-xs text-stone-500 leading-relaxed font-mono">Summarizes congregation logs, purified wealth allocations, and spiritual milestones.</p>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <button
                        onClick={() => handleDownloadReport("PDF")}
                        className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded text-[10px] font-mono font-bold uppercase"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownloadReport("Markdown")}
                        className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded text-[10px] font-mono font-bold uppercase"
                      >
                        <Download className="h-3 w-3" />
                        <span>MD</span>
                      </button>
                    </div>
                  </div>

                  {/* Corporate Board Report */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3.5 bg-stone-50/50 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Business Reports</span>
                      <span className="text-sm font-bold text-stone-950 block">Monthly Boardroom summary</span>
                      <p className="text-xs text-stone-500 leading-relaxed font-mono">Consolidates cash books, OEE factory metrics, and C-suite model execution histories.</p>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <button
                        onClick={() => handleDownloadReport("PDF")}
                        className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded text-[10px] font-mono font-bold uppercase"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownloadReport("Excel")}
                        className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded text-[10px] font-mono font-bold uppercase"
                      >
                        <Download className="h-3 w-3" />
                        <span>Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Personal Life KPI Brief */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3.5 bg-stone-50/50 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Personal Reports</span>
                      <span className="text-sm font-bold text-stone-950 block">Daily Executive Summary</span>
                      <p className="text-xs text-stone-500 leading-relaxed font-mono">High level daily mapping covering focus, health, spousal calendar coordination.</p>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <button
                        onClick={() => handleDownloadReport("PDF")}
                        className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded text-[10px] font-mono font-bold uppercase"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownloadReport("Markdown")}
                        className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded text-[10px] font-mono font-bold uppercase"
                      >
                        <Download className="h-3 w-3" />
                        <span>MD</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 10: LAKEHOUSE TESTS & COMPLIANCE */}
            {activeTab === "diagnostics" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Lakehouse Diagnostic & Test Engine</h2>
                  <p className="text-xs text-stone-500 font-mono">Validate pipeline invariants, verify compliance policies, and run automated testing with 90%+ coverage goals</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Test Suite Execution */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Diagnostic suite</span>
                    
                    <div className="space-y-3">
                      {pipelineTests.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono">
                          <span className="text-stone-800 text-[10px] break-all">{t.name}</span>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            t.status === "Passed" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-stone-100 text-stone-500 border border-stone-200"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={executeDiagnostics}
                        disabled={isRunningTests}
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[10px] py-2.5 rounded font-bold uppercase tracking-wider"
                      >
                        {isRunningTests ? "Compiling Suites..." : "Execute Suite Test Runners"}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Diagnostic Logs & Coverage report */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Telemetry Output Logs</span>
                      {testCoverage > 0 && (
                        <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          Code Coverage: {testCoverage}%
                        </span>
                      )}
                    </div>

                    {testConsoleLogs.length === 0 ? (
                      <div className="p-8 text-center text-stone-400 font-mono text-xs bg-stone-50 border border-stone-200 rounded-xl">
                        Click 'Execute Suite Test Runners' to evaluate 6 active core pipeline and data quality tests in the sandbox.
                      </div>
                    ) : (
                      <div className="bg-stone-900 text-stone-100 rounded-xl p-4 font-mono text-[10px] space-y-2 overflow-y-auto max-h-96 leading-relaxed">
                        {testConsoleLogs.map((log, index) => (
                          <div key={index}>
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
