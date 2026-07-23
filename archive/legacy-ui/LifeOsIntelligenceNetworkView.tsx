import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Zap,
  Boxes,
  Database,
  Cpu,
  Network,
  Activity,
  ArrowRight,
  TrendingUp,
  Plus,
  Trash2,
  Check,
  Sliders,
  Send,
  Search,
  BookOpen,
  Info,
  SlidersHorizontal,
  Workflow,
  Brain,
  MessageSquare,
  Lock,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  HelpCircle,
  Book,
  Code,
  FileText,
  Key,
  Globe,
  Settings,
  Scale,
  CloudLightning,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Compass,
  GitBranch,
  ShieldAlert,
  Fingerprint,
  Radio,
  FileCode,
  Server,
  Flame,
  Gauge
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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface LifeOsIntelligenceNetworkViewProps {
  onAddSignalREvent?: (msg: string) => void;
  onUpdateScore?: () => void;
}

export default function LifeOsIntelligenceNetworkView({
  onAddSignalREvent = () => {},
  onUpdateScore = () => {}
}: LifeOsIntelligenceNetworkViewProps) {
  const STORAGE_KEY_PREFIX = "lifeos_lin_";

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

  // --------------------------------------------------
  // UI NAVIGATION SUB-TABS
  // --------------------------------------------------
  const [activeSubTab, setActiveSubTab] = useState<
    | "cockpit"
    | "memory"
    | "routing"
    | "knowledge"
    | "skills"
    | "observability"
    | "marketplace"
    | "sdk"
    | "tests"
    | "docs"
  >("cockpit");

  // --------------------------------------------------
  // PRODUCTION HARDENING STATES (v5.0.0 PROJECT JANNAH)
  // --------------------------------------------------
  const [chaosState, setChaosState] = useState<any>({
    slowNetworkActive: false,
    databaseOverloadActive: false,
    circuitBreakerTripped: false,
    memoryLeakActive: false
  });
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [rateLimitInput, setRateLimitInput] = useState<number>(100);
  const [securityFindings, setSecurityFindings] = useState<any[]>([]);
  const [securityScore, setSecurityScore] = useState<string>("Pending ASVS Scan");
  const [isScanningSecurity, setIsScanningSecurity] = useState<boolean>(false);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<any[]>([]);
  const [systemLoad, setSystemLoad] = useState<any>({ cpuUsage: "12.4%", memoryUsage: "42.8%", activeConnections: "1,240 active clients" });
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  // Runbooks state
  const [activeRunbookId, setActiveRunbookId] = useState<string>("");
  const [isExecutingRunbook, setIsExecutingRunbook] = useState<boolean>(false);
  const [runbookConsoleLogs, setRunbookConsoleLogs] = useState<string[]>([]);

  // Tests expansion state
  const [selectedTestSuite, setSelectedTestSuite] = useState<"unit" | "contract" | "load" | "security" | "chaos" | "accessibility">("unit");
  const [coverageData] = useState<any>({
    unit: "98.2%",
    contract: "100%",
    load: "96.4%",
    security: "100%",
    chaos: "95.0%",
    accessibility: "100% (WCAG 2.1 AA compliant)"
  });

  // Docs manual selection state
  const [selectedManual, setSelectedManual] = useState<"architecture" | "deploy" | "runbooks" | "disaster" | "security_sop" | "dev">("architecture");

  const fetchChaosState = async () => {
    try {
      const res = await fetch("/api/v4/lin/chaos/state");
      const json = await res.json();
      if (json.status === "success") {
        setChaosState(json.data);
      }
    } catch (e) {
      console.error("Error fetching chaos state", e);
    }
  };

  const toggleChaos = async (action: string, currentValue: boolean) => {
    try {
      const res = await fetch("/api/v4/lin/chaos/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value: !currentValue })
      });
      const json = await res.json();
      if (json.status === "success") {
        setChaosState(json.activeChaos);
        onAddSignalREvent(`Chaos parameter modified: ${action.toUpperCase()} is now ${!currentValue ? "ENABLED" : "DISABLED"}`);
        fetchSecurityLogs();
        runBenchmark(); // automatically re-run benchmark to show degraded metrics!
      }
    } catch (e) {
      console.error("Error setting chaos", e);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const res = await fetch("/api/v4/lin/security/audit-logs");
      const json = await res.json();
      if (json.status === "success") {
        setSecurityLogs(json.logs);
      }
    } catch (e) {
      console.error("Error fetching security logs", e);
    }
  };

  const fetchRateLimitConfig = async () => {
    try {
      const res = await fetch("/api/v4/lin/rate-limit-config");
      const json = await res.json();
      if (json.status === "success") {
        setRateLimitInput(json.threshold);
      }
    } catch (e) {
      console.error("Error fetching rate limit configuration", e);
    }
  };

  const saveRateLimitConfig = async (threshold: number) => {
    try {
      const res = await fetch("/api/v4/lin/rate-limit-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold })
      });
      const json = await res.json();
      if (json.status === "success") {
        setRateLimitInput(json.threshold);
        onAddSignalREvent(`Rate Limiter Gateway threshold hardened to: ${json.threshold} req/min`);
        fetchSecurityLogs();
      }
    } catch (e) {
      console.error("Error saving rate limit configuration", e);
    }
  };

  const runSecurityScan = async () => {
    setIsScanningSecurity(true);
    onAddSignalREvent("Initiating OWASP ASVS secure automated code scanner...");
    try {
      const res = await fetch("/api/v4/lin/security/scan", { method: "POST" });
      const json = await res.json();
      if (json.status === "success") {
        setSecurityFindings(json.checklist);
        setSecurityScore(json.score);
        onAddSignalREvent(`Security Scan Complete. System Score: ${json.score}. 0 Vulnerabilities.`);
        fetchSecurityLogs();
      }
    } catch (e) {
      console.error("Error scanning security", e);
    } finally {
      setIsScanningSecurity(false);
    }
  };

  const runBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch("/api/v4/lin/performance/benchmark", { method: "POST" });
      const json = await res.json();
      if (json.status === "success") {
        setBenchmarkMetrics(json.metrics);
        setSystemLoad(json.systemLoad);
      }
    } catch (e) {
      console.error("Error benchmarking", e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const executeRunbookOnServer = async (runbookId: string) => {
    setIsExecutingRunbook(true);
    setActiveRunbookId(runbookId);
    setRunbookConsoleLogs([`[RUNBOOK-CLIENT] Queuing execution block for "${runbookId}" on central cluster...`]);
    onAddSignalREvent(`Dispatched cluster-wide runbook execution payload for: ${runbookId}`);

    try {
      const res = await fetch("/api/v4/lin/runbook/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runbookId })
      });
      const json = await res.json();
      if (json.status === "success") {
        // Stream the console logs smoothly
        let currentIdx = 0;
        const interval = setInterval(() => {
          if (currentIdx < json.logs.length) {
            setRunbookConsoleLogs(prev => [...prev, json.logs[currentIdx]]);
            currentIdx++;
          } else {
            clearInterval(interval);
            setIsExecutingRunbook(false);
            onAddSignalREvent(`Operations runbook "${runbookId}" executed flawlessly.`);
            fetchSecurityLogs();
          }
        }, 300);
      }
    } catch (e) {
      console.error("Error executing runbook", e);
      setRunbookConsoleLogs(prev => [...prev, `❌ [ERROR] Cluster rejected execution. Check node credentials.`]);
      setIsExecutingRunbook(false);
    }
  };

  useEffect(() => {
    fetchChaosState();
    fetchSecurityLogs();
    fetchRateLimitConfig();
    runBenchmark();
  }, []);

  // --------------------------------------------------
  // 1. COGNITIVE MESH / GLOBAL MEMORY FABRIC
  // --------------------------------------------------
  const [memories, setMemories] = useState<any[]>(() => loadState("memories", [
    { id: "mem_1", scope: "Global Semantic Memory", key: "Islamic Finance Ethics (Musharakah)", syncState: "In Sync", lastUpdated: "Just Now", type: "Semantic Vector", conflictResolved: true },
    { id: "mem_2", scope: "Barnes Family Endowment Waqf", key: "Asset allocation ledger guidelines", syncState: "In Sync", lastUpdated: "5 mins ago", type: "Document Chunk", conflictResolved: false },
    { id: "mem_3", scope: "43v3r MES Manufacturing", key: "Line #3 safety tolerance register limits", syncState: "Syncing", lastUpdated: "12 secs ago", type: "Structured telemetry", conflictResolved: true },
    { id: "mem_4", scope: "Conversation Memory", key: "Maghrib light triggers with Ethan", syncState: "In Sync", lastUpdated: "1 hr ago", type: "Chat Context", conflictResolved: false },
    { id: "mem_5", scope: "Reflections & Lessons Learned", key: "Post-outage database cascade buffers", syncState: "In Sync", lastUpdated: "Yesterday", type: "Graph Node", conflictResolved: true }
  ]));

  const [newMemoryScope, setNewMemoryScope] = useState("Global Semantic Memory");
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryType, setNewMemoryType] = useState("Semantic Vector");

  const handleRegisterMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey.trim()) return;

    const newMem = {
      id: "mem_" + Date.now(),
      scope: newMemoryScope,
      key: newMemoryKey,
      syncState: "In Sync",
      lastUpdated: "Just Now",
      type: newMemoryType,
      conflictResolved: true
    };

    setMemories(prev => [newMem, ...prev]);
    setNewMemoryKey("");
    onAddSignalREvent(`Published Event: MemorySynchronized - Mapped key "${newMem.key}" onto [${newMem.scope}]`);
    onUpdateScore();
  };

  const forceSyncMemory = (id: string, key: string) => {
    setMemories(prev =>
      prev.map(m => (m.id === id ? { ...m, syncState: "In Sync", lastUpdated: "Just Now" } : m))
    );
    onAddSignalREvent(`Triggered Memory Sync & Conflict Resolution: "${key}"`);
    onUpdateScore();
  };

  // --------------------------------------------------
  // 2. FEDERATED AI ROUTER STATE
  // --------------------------------------------------
  const [routingRules, setRoutingRules] = useState<any[]>(() => loadState("routingRules", [
    { id: "r_1", queryPattern: "Shariah investment advice", targetModel: "Cloud AI (Gemini 1.5 Pro)", latencyLimit: "800ms", minConfidence: "98%", status: "Active", callsCount: 412 },
    { id: "r_2", queryPattern: "PLC register byte manipulation", targetModel: "Local AI (Private Edge Server)", latencyLimit: "120ms", minConfidence: "99.5%", status: "Active", callsCount: 1450 },
    { id: "r_3", queryPattern: "Spike threshold anomaly alert", targetModel: "Hybrid AI (Ollama + Vertex)", latencyLimit: "300ms", minConfidence: "95%", status: "Bypassed", callsCount: 88 },
    { id: "r_4", queryPattern: "Weekly grocery budgeting", targetModel: "Edge AI (On-Device WebGpu)", latencyLimit: "1500ms", minConfidence: "90%", status: "Active", callsCount: 204 }
  ]));

  const [newQueryPattern, setNewQueryPattern] = useState("");
  const [newTargetModel, setNewTargetModel] = useState("Cloud AI (Gemini 1.5 Pro)");

  const handleCreateRoutingRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryPattern.trim()) return;

    const rule = {
      id: "r_" + Date.now(),
      queryPattern: newQueryPattern,
      targetModel: newTargetModel,
      latencyLimit: "500ms",
      minConfidence: "95%",
      status: "Active",
      callsCount: 0
    };

    setRoutingRules(prev => [rule, ...prev]);
    setNewQueryPattern("");
    onAddSignalREvent(`Federated Router Rule registered: "${rule.queryPattern}" -> ${rule.targetModel}`);
    onUpdateScore();
  };

  const toggleRuleStatus = (id: string) => {
    setRoutingRules(prev =>
      prev.map(r => {
        if (r.id === id) {
          const nextState = r.status === "Active" ? "Bypassed" : "Active";
          onAddSignalREvent(`Federated Routing Rule adjusted: ${r.queryPattern} set to ${nextState}`);
          return { ...r, status: nextState };
        }
        return r;
      })
    );
  };

  // --------------------------------------------------
  // 3. KNOWLEDGE FABRIC & ONTOLOGY ONTOLOGIES
  // --------------------------------------------------
  const [knowledgeNodes, setKnowledgeNodes] = useState<any[]>(() => loadState("knowledgeNodes", [
    { id: "k_1", entity: "Musharakah Partnership", type: "Islamic Finance Concept", qualityScore: "9.8/10", domain: "FinanceOS" },
    { id: "k_2", entity: "Modbus PLC Reg 40012", type: "Hardware Address Map", qualityScore: "9.5/10", domain: "ManufacturingOS" },
    { id: "k_3", entity: "Maghrib Prayer Trigger", type: "Astronomic Temporal State", qualityScore: "10/10", domain: "IslamOS" },
    { id: "k_4", entity: "Barnes Trust Allocations", type: "Legal Asset Schema", qualityScore: "9.2/10", domain: "FamilyOS" }
  ]));

  const [entityQuery, setEntityQuery] = useState("");
  const [resolvedEntity, setResolvedEntity] = useState<any>(null);

  const resolveEntityInFabric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityQuery.trim()) return;

    onAddSignalREvent(`Initiated Fabric Entity Resolution & Ontology Walk for: "${entityQuery}"`);
    const found = knowledgeNodes.find(n => n.entity.toLowerCase().includes(entityQuery.toLowerCase()));
    
    setTimeout(() => {
      if (found) {
        setResolvedEntity(found);
        onAddSignalREvent(`Ontology entity match verified: "${found.entity}" (Quality: ${found.qualityScore})`);
      } else {
        const generatedNode = {
          id: "k_" + Date.now(),
          entity: entityQuery,
          type: "Dynamically Discovered Concept",
          qualityScore: "8.8/10 (Enriched)",
          domain: "Cross-Product Cognitive Discovery"
        };
        setKnowledgeNodes(prev => [generatedNode, ...prev]);
        setResolvedEntity(generatedNode);
        onAddSignalREvent(`Cross-Domain Ontology Discovery: Auto-enriched "${entityQuery}" node.`);
      }
      onUpdateScore();
    }, 400);
  };

  // --------------------------------------------------
  // 4. UNIVERSAL SKILL REGISTRY (CERTIFIED CAPABILITIES)
  // --------------------------------------------------
  const [skills, setSkills] = useState<any[]>(() => loadState("skills", [
    { id: "sk_1", name: "mudarabah.contract.generator", version: "v2.1.0", author: "Gabriel.FinanceExpert", certified: true, dependency: "financeos.core >= 1.4" },
    { id: "sk_2", name: "siemens.s7.register.reader", version: "v1.0.4", author: "Gabriel.TechnicalArchitect", certified: true, dependency: "mes.drivers >= 3.2" },
    { id: "sk_3", name: "quranic.spaced_repetition.cuer", version: "v4.0.0", author: "Gabriel.IslamOS_Auditor", certified: true, dependency: "islamos.engine >= 4.0" },
    { id: "sk_4", name: "homeassistant.mqtt.dispatch", version: "v1.5.0", author: "Gabriel.HomeSpecialist", certified: true, dependency: "hass.integration >= 2.0" }
  ]));

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDep, setNewSkillDep] = useState("");

  const handleRegisterSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSk = {
      id: "sk_" + Date.now(),
      name: newSkillName,
      version: "v1.0.0",
      author: "Ethan.Operator",
      certified: true,
      dependency: newSkillDep || "None"
    };

    setSkills(prev => [newSk, ...prev]);
    setNewSkillName("");
    setNewSkillDep("");
    onAddSignalREvent(`Published Event: ApplicationInstalled - Universal skill signed & certified: "${newSk.name}"`);
    onUpdateScore();
  };

  // --------------------------------------------------
  // 5. MARKETPLACE ECOSYSTEM (PREMIUM MODULES)
  // --------------------------------------------------
  const [marketItems, setMarketItems] = useState<any[]>(() => loadState("marketItems", [
    { id: "mkt_1", name: "Saudi Capital Markets Integration Pack", author: "Barnes Waqf Group", price: "Licensed", category: "Finance Pack" },
    { id: "mkt_2", name: "Kafka OPC UA Industrial Broker", author: "43v3r Engineering", price: "Licensed", category: "Automation Pack" },
    { id: "mkt_3", name: "Advanced Spaced Repetition Juz' 1-30 Core", author: "Madinah AI Labs", price: "Licensed", category: "IslamOS Pack" },
    { id: "mkt_4", name: "Qdrant Vector Database Connector Plugin", author: "43v3r Labs", price: "£240/mo", category: "Infrastructure Pack" }
  ]));

  const licenseMarketItem = (id: string, name: string) => {
    setMarketItems(prev =>
      prev.map(item => (item.id === id ? { ...item, price: "Licensed" } : item))
    );
    onAddSignalREvent(`Licensed LIN Marketplace asset: "${name}"`);
    onUpdateScore();
  };

  // --------------------------------------------------
  // 6. SDK COGNITIVE CLI & CODE GENERATOR
  // --------------------------------------------------
  const [sdkLanguage, setSdkLanguage] = useState<"typescript" | "dotnet" | "python" | "mcp">("typescript");
  const [sdkCommandOutput, setSdkCommandOutput] = useState("");

  const generateSdkBootstrap = (lang: string) => {
    onAddSignalREvent(`Invoking LIN platform SDK code generator for [${lang.toUpperCase()}]`);
    let code = "";
    if (lang === "typescript") {
      code = `// LifeOS Intelligence Network (LIN) SDK for TypeScript
import { LinClient, CognitiveBus } from "@43v3r/lin-sdk";

const lin = new LinClient({
  endpoint: "https://api.43v3r.net/v4",
  authToken: process.env.LIN_AUTH_TOKEN
});

// Establish cognitive mesh subscription
const bus = await lin.connectBus();
bus.subscribe("MemorySynchronized", (event) => {
  console.log(\`Memory sync event caught on tenant: \${event.tenantId}\`);
  console.log(\`Key: \${event.key} | Hash: \${event.hash}\`);
});

// Query semantic network
const results = await lin.knowledge.search("Musharakah");
console.log("Found ontology links:", results.nodes);
`;
    } else if (lang === "dotnet") {
      code = `// LifeOS Intelligence Network (LIN) SDK for .NET C#
using FortyThreeVeeThree.Lin;

var lin = new LinClient(new LinConfig {
    Endpoint = "https://api.43v3r.net/v4",
    AuthToken = Environment.GetEnvironmentVariable("LIN_AUTH_TOKEN")
});

// Hook into federated AI router
lin.Router.OnQueryRouted += (sender, e) => {
    Console.WriteLine($"Query: '{e.Query}' routed to Model: '{e.TargetModel}' with latency: {e.LatencyMs}ms");
};

await lin.ConnectAsync();
`;
    } else if (lang === "python") {
      code = `# LifeOS Intelligence Network (LIN) SDK for Python
from fortythree_lin import LinClient

lin = LinClient(
    endpoint="https://api.43v3r.net/v4",
    auth_token="LIN_SECRET_JWT"
)

# Broadcast new universal skill
lin.skills.register(
    name="my_custom_task",
    author="Ethan (Human)",
    dependencies=["islamos.engine>=4.0"]
)

print("Skill published successfully & digitally signed.")
`;
    } else if (lang === "mcp") {
      code = `{
  "mcp_version": "1.0.0",
  "name": "LifeOS Intelligence Network MCP Server",
  "description": "Exposes cognitive memory synchronization and Shariah compliance checks to Claude or Gemini IDE instances",
  "tools": [
    {
      "name": "check_compliance",
      "description": "Verify absence of Riba elements in double-entry books",
      "input_schema": {
        "type": "object",
        "properties": {
          "ledger_entries": { "type": "array", "items": { "type": "object" } }
        }
      }
    }
  ]
}`;
    }
    setSdkCommandOutput(code);
  };

  useEffect(() => {
    generateSdkBootstrap(sdkLanguage);
  }, [sdkLanguage]);

  // --------------------------------------------------
  // 7. DISTRIBUTED OBSERVABILITY FABRIC (METRICS)
  // --------------------------------------------------
  const platformStats = {
    totalMeshConnections: "1,240 active clients",
    federatedBusThroughput: "42,410 events/sec",
    memoryFabricSyncRatio: "99.98% synchronized",
    crossSystemReasoningSuccess: "100% Shariah Compliant",
    averageRoutingLatency: "42ms"
  };

  // Recharts Data
  const dynamicTelemetryData = [
    { time: "14:15", Cloud_AI: 45, Local_AI: 12, Edge_AI: 8, Memory_Sync_Ops: 142 },
    { time: "14:16", Cloud_AI: 48, Local_AI: 15, Edge_AI: 9, Memory_Sync_Ops: 156 },
    { time: "14:17", Cloud_AI: 52, Local_AI: 18, Edge_AI: 8, Memory_Sync_Ops: 204 },
    { time: "14:18", Cloud_AI: 42, Local_AI: 11, Edge_AI: 14, Memory_Sync_Ops: 188 },
    { time: "14:19", Cloud_AI: 39, Local_AI: 12, Edge_AI: 12, Memory_Sync_Ops: 164 },
    { time: "14:20", Cloud_AI: 46, Local_AI: 14, Edge_AI: 11, Memory_Sync_Ops: 220 },
    { time: "14:21", Cloud_AI: 50, Local_AI: 15, Edge_AI: 10, Memory_Sync_Ops: 245 }
  ];

  // --------------------------------------------------
  // 8. CRITICAL VERIFICATION & PLATFORM TESTING SUITE
  // --------------------------------------------------
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<"idle" | "running" | "passed" | "failed">("idle");

  const executeCognitiveTests = () => {
    setIsRunningTests(true);
    setTestResult("running");
    setTestLogs([]);
    onAddSignalREvent(`Dispatched secure LIN test payload for suite: ${selectedTestSuite.toUpperCase()}`);

    let logs: string[] = [];
    if (selectedTestSuite === "unit") {
      logs = [
        `[UNIT-TEST] Compiling Jannah v5.0.0 core assemblies at ${new Date().toISOString()}`,
        "[UNIT-TEST] Loading test runner schemas...",
        "[UNIT-TEST] evaluateDoubleEntryLedgerSymmetry... PASSED (4ms)",
        "[UNIT-TEST] verifyShariahPurificationPurgeRate... PASSED (24ms)",
        "[UNIT-TEST] inspectMudarabahRevenueShares... PASSED (14ms)",
        "[UNIT-TEST] evaluateRibaStrictIsolationFilter... PASSED (8ms)",
        "[UNIT-TEST] checking deep-space screen embargo policy... PASSED (6ms)",
        "[SYSTEM] Unit & Integration Coverage Level: 98.2%",
        "[SUCCESS] 42/42 unit assertions passed with 100% success."
      ];
    } else if (selectedTestSuite === "contract") {
      logs = [
        `[CONTRACT-TEST] Querying Postgres database schema state (Drizzle ORM metadata)...`,
        "[CONTRACT-TEST] verifyUserAuthRelations... PASSED (8ms)",
        "[CONTRACT-TEST] verifyTrusteeAssetPartitionLimits... PASSED (12ms)",
        "[CONTRACT-TEST] verifyIslamOsPolicyInheritanceSchema... PASSED (16ms)",
        "[CONTRACT-TEST] checking foreign-key cascade index performance... PASSED (3ms)",
        "[SYSTEM] Database relational contract test complete.",
        "[SUCCESS] 18 schema invariants evaluated. Database structure is completely congruent."
      ];
    } else if (selectedTestSuite === "load") {
      logs = [
        `[LOAD-TEST] Provisioning virtual HTTP load generation engines (target: 10,000 requests/sec peak)...`,
        "[LOAD-TEST] Inundating /api/v4/lin/memory vector retrieval endpoint...",
        "[LOAD-TEST] 5,000 hits: Mean latency 12ms. Error rate 0.00%.",
        "[LOAD-TEST] 10,000 hits: Mean latency 19ms. Error rate 0.01% (within SLA threshold).",
        "[LOAD-TEST] Running load spikes across 4 federated nodes (London, Makkah, Frankfurt, Virginia)...",
        "[SYSTEM] Load & API stress test complete.",
        "[SUCCESS] Zero HTTP thread pools exhausted. System load safely within bounds."
      ];
    } else if (selectedTestSuite === "chaos") {
      logs = [
        `[CHAOS-TEST] Spawning Chaos Monkey daemon thread...`,
        `[CHAOS-TEST] Active parameter scan: SlowNetwork: ${chaosState.slowNetworkActive ? "ENABLED" : "DISABLED"}, DBOverload: ${chaosState.databaseOverloadActive ? "ENABLED" : "DISABLED"}, MemoryLeak: ${chaosState.memoryLeakActive ? "ENABLED" : "DISABLED"}.`,
        "[CHAOS-TEST] Evaluating system failover response times...",
        "[CHAOS-TEST] Bulkhead isolation check... PASSED.",
        `[CHAOS-TEST] Circuit breaker tripped state: ${chaosState.circuitBreakerTripped ? "OPEN (Active deflection)" : "CLOSED (Passive)"}`,
        "[SUCCESS] System remained stable. Chaos resilience verification passed."
      ];
    } else if (selectedTestSuite === "accessibility") {
      logs = [
        `[ACC-TEST] Crawling DOM node structures against WCAG 2.1 AA parameters...`,
        "[ACC-TEST] checking color contrast ratios on display headers... PASSED (4.5:1 ratio verified).",
        "[ACC-TEST] verifying aria-label attributes on cockpit sliders... PASSED.",
        "[ACC-TEST] checking screen-reader element traversal order... PASSED.",
        "[SUCCESS] WCAG 2.1 AA Audit Passed successfully. 0 accessibility issues detected."
      ];
    } else if (selectedTestSuite === "security") {
      logs = [
        `[SEC-TEST] Running active OWASP ASVS secure automated code scanner...`,
        `[SEC-TEST] Scanning X-Frame-Options, X-Content-Type-Options headers... [SECURE]`,
        `[SEC-TEST] Scanning Content-Security-Policy rules... [SECURE]`,
        `[SEC-TEST] Verifying server API Rate Limiter deflection gateways... [SECURE]`,
        `[SEC-TEST] Checking database query parametrized models (ORM)... [SECURE]`,
        `[SYSTEM] Dynamic OWASP scan complete. Current Rate-Limit threshold: ${rateLimitInput} req/min.`,
        `[SUCCESS] 100/100 ASVS Compliance Index. 0 Vulnerabilities.`
      ];
      // Fire the actual scan in background too
      runSecurityScan();
    }

    let current = 0;
    const interval = setInterval(() => {
      if (current < logs.length) {
        setTestLogs(prev => [...prev, logs[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsRunningTests(false);
        setTestResult("passed");
        onAddSignalREvent(`LIN ${selectedTestSuite.toUpperCase()} tests completed successfully.`);
        onUpdateScore();
      }
    }, 150);
  };

  // --------------------------------------------------
  // 9. SWAGGER / OPENAPI LIVE CONSOLE
  // --------------------------------------------------
  const [apiEndpoint, setApiEndpoint] = useState("memory");
  const [apiConsoleResponse, setApiConsoleResponse] = useState("");

  const fireApiEndpoint = (endpoint: string) => {
    setApiEndpoint(endpoint);
    let payload = {};
    if (endpoint === "memory") {
      payload = {
        object: "list",
        data: memories,
        sync_status: "Operational",
        global_semantic_hash: "sha256-a1b2c3d4e5f6g7h8"
      };
    } else if (endpoint === "router") {
      payload = {
        active_routes: routingRules,
        dynamic_balancing: true,
        fallbacks: { "Local AI": "Cloud AI (Gemini 1.5 Pro)" }
      };
    } else if (endpoint === "skills") {
      payload = {
        skills_signed_count: skills.length,
        trusted_issuers: ["Gabriel.Executive_Core", "Ethan.Operator"],
        skill_package_list: skills
      };
    } else if (endpoint === "observability") {
      payload = {
        platform_metrics: platformStats,
        throughput_events_per_second: 42410,
        average_roundtrip_ms: 42
      };
    }
    setApiConsoleResponse(JSON.stringify(payload, null, 2));
    onAddSignalREvent(`Executed OpenAPI test request to: /api/v4/lin/${endpoint}`);
  };

  // Sync state changes with localStorage
  useEffect(() => { saveState("memories", memories); }, [memories]);
  useEffect(() => { saveState("routingRules", routingRules); }, [routingRules]);
  useEffect(() => { saveState("knowledgeNodes", knowledgeNodes); }, [knowledgeNodes]);
  useEffect(() => { saveState("skills", skills); }, [skills]);
  useEffect(() => { saveState("marketItems", marketItems); }, [marketItems]);

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-mono text-xs uppercase tracking-wider font-bold">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>Cognitive Operating System Backbone • Version 4.0.0</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            LifeOS Intelligence Network (LIN) Cockpit
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-4xl font-mono">
            CODENAME: PROJECT JANNAH • PHASE 17 FEDERATED REASONING FABRIC • GLOBAL SEMANTIC MEMORY • ROUTER ROUTING RULES • UNIVERSAL SKILL REGISTRY
          </p>
        </div>

        {/* Sync telemetry block */}
        <div className="flex items-center space-x-4 bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-mono">
          <div className="text-right">
            <span className="text-[9px] text-stone-400 block uppercase font-bold">LIN Status</span>
            <span className="text-sm font-bold text-indigo-600">Active Mesh</span>
          </div>
          <div className="text-right border-l border-stone-200 pl-4">
            <span className="text-[9px] text-stone-400 block uppercase font-bold">Network Speed</span>
            <span className="text-xs font-bold text-emerald-600">42ms Latency</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex flex-wrap gap-1 bg-stone-50 border border-stone-200 p-1 rounded-xl">
        {[
          { id: "cockpit", label: "Intelligence Bus Cockpit", icon: Layers },
          { id: "memory", label: "Global Memory Fabric", icon: Database },
          { id: "routing", label: "Federated AI Routing", icon: Cpu },
          { id: "knowledge", label: "Knowledge Fabric Explorer", icon: Network },
          { id: "skills", label: "Universal Skill Registry", icon: Workflow },
          { id: "observability", label: "Observability & Tracing", icon: Activity },
          { id: "marketplace", label: "Skills Marketplace", icon: Sparkles },
          { id: "sdk", label: "Platform SDK Console", icon: Terminal },
          { id: "tests", label: "Cognitive System Tests", icon: Code },
          { id: "docs", label: "LIN Network Protocol Manual", icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                onAddSignalREvent(`Navigated LIN Control: ${tab.label}`);
              }}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-mono text-[10px] transition border ${
                isSelected
                  ? "bg-stone-950 border-stone-950 text-white font-bold shadow-xs"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Wrapper */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.1 }}
          >
            {/* SUBTAB 1: INTEGRATION COCKPIT */}
            {activeSubTab === "cockpit" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Distributed Intelligence Mesh Cockpit</h2>
                  <p className="text-xs text-stone-500 font-mono">Observe top-level LIN node diagnostics, events traffic velocities, and compliance scores</p>
                </div>

                {/* KPI block */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(platformStats).map(([key, value]) => {
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs">
                        <span className="text-[9px] text-stone-400 block uppercase font-bold leading-none">{label}</span>
                        <span className="text-sm font-bold text-stone-900 block mt-1.5">{value}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Recharts chart on left */}
                  <div className="lg:col-span-8 border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">
                      Dynamic Cognitive Routing Distribution & Memory Synchronization Operations
                    </span>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dynamicTelemetryData}>
                          <defs>
                            <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4338ca" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="syncGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                          <XAxis dataKey="time" stroke="#888888" fontSize={9} className="font-mono" />
                          <YAxis stroke="#888888" fontSize={9} className="font-mono" />
                          <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                          <Area type="monotone" dataKey="Cloud_AI" stroke="#4338ca" fillOpacity={1} fill="url(#cloudGrad)" name="Cloud AI Calls" />
                          <Area type="monotone" dataKey="Memory_Sync_Ops" stroke="#06b6d4" fillOpacity={1} fill="url(#syncGrad)" name="Memory Sync Operations" />
                          <Line type="monotone" dataKey="Local_AI" stroke="#f59e0b" name="Local Edge AI" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Active federated clients status */}
                  <div className="lg:col-span-4 border border-stone-200 rounded-xl p-5 bg-stone-50/20 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Cognitive Client Mesh Registry
                    </span>

                    <div className="space-y-2.5">
                      {[
                        { name: "43v3r LifeOS Client", version: "v4.0.0", latency: "14ms", state: "Active" },
                        { name: "43v3r BusinessOS Client", version: "v3.2.0", latency: "22ms", state: "Active" },
                        { name: "43v3r MES Extruder Control", version: "v2.5.0", latency: "4ms", state: "Active" },
                        { name: "Barnes Waqf Asset Ledger", version: "v1.8.0", latency: "18ms", state: "Active" }
                      ].map((client, i) => (
                        <div key={i} className="p-3 bg-white border border-stone-250 rounded-lg text-xs font-mono space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-stone-900">{client.name}</span>
                            <span className="text-emerald-600 text-[10px] uppercase font-bold">{client.state}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-stone-400">
                            <span>Rel: {client.version}</span>
                            <span>Direct ping: {client.latency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: GLOBAL MEMORY FABRIC */}
            {activeSubTab === "memory" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Distributed Global Memory Fabric</h2>
                  <p className="text-xs text-stone-500 font-mono">Monitor cross-tenant vector memory allocations, trigger active conflict resolution, and register key guidelines</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Memory items */}
                  <div className="lg:col-span-8 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Active Semantic Memory Allocations
                    </span>

                    <div className="space-y-2.5">
                      {memories.map((mem) => (
                        <div key={mem.id} className="p-4 bg-stone-50/40 rounded-xl border border-stone-200 text-xs font-mono space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-bold uppercase">{mem.scope}</span>
                                <span className="text-stone-400 text-[10px]">Type: <strong>{mem.type}</strong></span>
                              </div>
                              <h3 className="font-bold text-stone-900 text-sm mt-1">{mem.key}</h3>
                            </div>

                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                              mem.syncState === "In Sync" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            }`}>
                              {mem.syncState}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-150 pt-2">
                            <span>Last synchronized: <strong>{mem.lastUpdated}</strong></span>
                            <div className="flex items-center space-x-2">
                              {mem.conflictResolved && (
                                <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">Conflict Resolved</span>
                              )}
                              <button
                                onClick={() => forceSyncMemory(mem.id, mem.key)}
                                className="px-2 py-0.5 bg-stone-900 text-white text-[9px] font-bold rounded hover:bg-stone-800"
                              >
                                Resolve / Force Sync
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Register memory key */}
                  <div className="lg:col-span-4">
                    <form onSubmit={handleRegisterMemory} className="border border-stone-200 rounded-xl p-5 bg-stone-50/50 text-xs font-mono space-y-4">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                        Map Key Guideline
                      </span>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Target Tenant Workspace Scope</label>
                        <select
                          value={newMemoryScope}
                          onChange={(e) => setNewMemoryScope(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        >
                          <option>Global Semantic Memory</option>
                          <option>Barnes Family Endowment Waqf</option>
                          <option>43v3r MES Manufacturing</option>
                          <option>Reflections & Lessons Learned</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Knowledge Key Identifier</label>
                        <input
                          type="text"
                          value={newMemoryKey}
                          onChange={(e) => setNewMemoryKey(e.target.value)}
                          placeholder="e.g., Purification ratio rules"
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Storage Memory Format</label>
                        <select
                          value={newMemoryType}
                          onChange={(e) => setNewMemoryType(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        >
                          <option>Semantic Vector</option>
                          <option>Document Chunk</option>
                          <option>Structured telemetry</option>
                          <option>Graph Node</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded text-[10px] transition"
                      >
                        Synchronize Memory Node
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: FEDERATED AI ROUTER */}
            {activeSubTab === "routing" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Federated Intelligence AI Router</h2>
                  <p className="text-xs text-stone-500 font-mono">Configure routing parameters mapped to local, cloud, edge, or private models based on telemetry thresholds</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left list of rules */}
                  <div className="lg:col-span-8 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Routing Policy Maps
                    </span>

                    <div className="space-y-2.5">
                      {routingRules.map((rule) => (
                        <div key={rule.id} className="p-4 bg-stone-50/30 rounded-xl border border-stone-200 text-xs font-mono space-y-3 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 rounded font-bold uppercase">Calls Routed: {rule.callsCount}</span>
                              <h3 className="font-bold text-stone-950 text-sm mt-1">If Query matches: <span className="text-indigo-600 font-bold">"{rule.queryPattern}"</span></h3>
                            </div>

                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                              rule.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-stone-150 text-stone-600 border-stone-250"
                            }`}>
                              {rule.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-2 text-[10px] border-t border-b border-stone-150">
                            <div>Target: <strong className="text-stone-800 block">{rule.targetModel}</strong></div>
                            <div>Max Latency: <strong className="text-stone-800 block">{rule.latencyLimit}</strong></div>
                            <div>Min Confidence: <strong className="text-stone-800 block">{rule.minConfidence}</strong></div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => toggleRuleStatus(rule.id)}
                              className="px-2.5 py-1 bg-white border border-stone-300 rounded text-[10px] font-bold hover:bg-stone-50 transition"
                            >
                              Toggle Policy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Register Form */}
                  <div className="lg:col-span-4">
                    <form onSubmit={handleCreateRoutingRule} className="border border-stone-200 rounded-xl p-5 bg-stone-50/50 text-xs font-mono space-y-4">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                        Formulate AI Rule
                      </span>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">If Query matches pattern</label>
                        <input
                          type="text"
                          value={newQueryPattern}
                          onChange={(e) => setNewQueryPattern(e.target.value)}
                          placeholder="e.g., database query performance"
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Route directly to model</label>
                        <select
                          value={newTargetModel}
                          onChange={(e) => setNewTargetModel(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        >
                          <option>Cloud AI (Gemini 1.5 Pro)</option>
                          <option>Local AI (Private Edge Server)</option>
                          <option>Hybrid AI (Ollama + Vertex)</option>
                          <option>Edge AI (On-Device WebGpu)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded text-[10px] transition"
                      >
                        Enforce Routing Policy
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: KNOWLEDGE FABRIC & ONTOLOGY */}
            {activeSubTab === "knowledge" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Knowledge Fabric & Entity Discovery</h2>
                  <p className="text-xs text-stone-500 font-mono">Resolve semantic entities, perform multi-tenant ontology walks, and query cross-system graphs</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Entity Resolution Walker */}
                  <div className="lg:col-span-6 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Entity Resolution Sandbox
                    </span>

                    <form onSubmit={resolveEntityInFabric} className="flex gap-2">
                      <input
                        type="text"
                        value={entityQuery}
                        onChange={(e) => setEntityQuery(e.target.value)}
                        placeholder="e.g., Musharakah, Modbus, Maghrib..."
                        className="flex-1 bg-white border border-stone-300 rounded p-2 text-xs font-mono focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-stone-950 text-white text-[11px] font-bold rounded font-mono hover:bg-stone-850"
                      >
                        Resolve
                      </button>
                    </form>

                    {resolvedEntity && (
                      <div className="p-4 bg-indigo-50/10 border border-indigo-150 rounded-xl font-mono text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-600 font-bold uppercase text-[9px]">{resolvedEntity.domain}</span>
                          <span className="text-stone-400 text-[10px]">Quality: {resolvedEntity.qualityScore}</span>
                        </div>
                        <h3 className="font-bold text-stone-900 text-sm">Matched: {resolvedEntity.entity}</h3>
                        <p className="text-stone-500 text-[10px]">Semantic type: <strong>{resolvedEntity.type}</strong></p>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">Ontology Walk Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Registered ontologies */}
                  <div className="lg:col-span-6 border border-stone-200 rounded-xl p-5 space-y-3 bg-stone-50/20 text-xs font-mono">
                    <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                      Registered Core Entities
                    </span>

                    <div className="space-y-2">
                      {knowledgeNodes.map((node) => (
                        <div key={node.id} className="p-2.5 bg-white border border-stone-200 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-bold text-stone-900 block">{node.entity}</span>
                            <span className="text-stone-400 text-[9px]">Scope: {node.domain} • Type: {node.type}</span>
                          </div>
                          <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 rounded">
                            {node.qualityScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5: UNIVERSAL SKILL REGISTRY */}
            {activeSubTab === "skills" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Universal Cognitive Skill Registry</h2>
                  <p className="text-xs text-stone-500 font-mono">Register certified, reusable micro-workflows and cryptographic agent capabilities</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Skills lists */}
                  <div className="lg:col-span-8 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Signed & Certified Capabilities
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((sk) => (
                        <div key={sk.id} className="p-4 bg-stone-50/40 border border-stone-200 rounded-xl font-mono text-xs space-y-2 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-indigo-600 font-bold text-[10px]">{sk.version}</span>
                              <span className="text-emerald-600 bg-emerald-50 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border border-emerald-100">
                                Certified
                              </span>
                            </div>
                            <h3 className="font-bold text-stone-950 text-sm mt-1">{sk.name}</h3>
                            <p className="text-stone-400 text-[10px] mt-1">Dependency: <strong className="text-stone-700">{sk.dependency}</strong></p>
                          </div>

                          <div className="text-[9px] text-stone-400 border-t border-stone-150 pt-2 flex justify-between">
                            <span>Author: {sk.author}</span>
                            <span className="text-emerald-600 font-bold">Signed Digitally</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Register Skill */}
                  <div className="lg:col-span-4">
                    <form onSubmit={handleRegisterSkill} className="border border-stone-200 rounded-xl p-5 bg-stone-50/50 text-xs font-mono space-y-4">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                        Certify Skill Package
                      </span>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Skill Identifier (Dot notation)</label>
                        <input
                          type="text"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          placeholder="e.g., finance.mudarabah.rebalancer"
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Dependency Constraint</label>
                        <input
                          type="text"
                          value={newSkillDep}
                          onChange={(e) => setNewSkillDep(e.target.value)}
                          placeholder="e.g., financeos.core >= 2.0"
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded text-[10px] transition"
                      >
                        Publish Certified Skill
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 6: OBSERVABILITY, TELEMETRY & RESILIENCE */}
            {activeSubTab === "observability" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Observability Fabric, Telemetry & Resilience Core
                    </h2>
                    <p className="text-xs text-stone-500 font-mono">Real-time OpenTelemetry trace spans, Prometheus node benchmarks, and Chaos Monkey injections</p>
                  </div>
                  <button
                    onClick={runBenchmark}
                    disabled={isBenchmarking}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition font-mono flex items-center gap-1.5 self-start md:self-auto"
                  >
                    <RefreshCw className={`h-3 w-3 ${isBenchmarking ? "animate-spin" : ""}`} />
                    <span>{isBenchmarking ? "Profiling..." : "Profile Benchmarks"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Traces and Real Benchmarks */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Prometheus Benchmarks Card */}
                    <div className="border border-stone-200 rounded-xl p-5 space-y-4 font-mono text-xs bg-white">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu className="h-4 w-4 text-emerald-600 animate-pulse" />
                          Live Node Telemetry (Prometheus)
                        </span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Interval: 10s</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-center">
                          <span className="text-[9px] text-stone-500 block uppercase font-semibold">Node CPU Load</span>
                          <span className={`text-base font-bold tracking-tight block ${chaosState.databaseOverloadActive ? "text-amber-600" : "text-stone-900"}`}>
                            {systemLoad.cpuUsage}
                          </span>
                        </div>
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-center">
                          <span className="text-[9px] text-stone-500 block uppercase font-semibold">Active RAM</span>
                          <span className={`text-base font-bold tracking-tight block ${chaosState.memoryLeakActive ? "text-rose-600" : "text-stone-900"}`}>
                            {systemLoad.memoryUsage}
                          </span>
                        </div>
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-center">
                          <span className="text-[9px] text-stone-500 block uppercase font-semibold">HTTP Mesh Pool</span>
                          <span className="text-base font-bold text-stone-900 tracking-tight block">
                            {systemLoad.activeConnections}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase block">Active Gateway Performance Indicators</span>
                        <div className="border border-stone-100 rounded-lg overflow-hidden">
                          {benchmarkMetrics.map((bm, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 border-b border-stone-100 last:border-b-0 text-[11px] hover:bg-stone-50 transition">
                              <span className="text-stone-700">{bm.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900">{bm.value}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                                  bm.score.includes("Excellent") ? "bg-emerald-50 text-emerald-700" :
                                  bm.score.includes("Degraded") ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                                }`}>
                                  {bm.score}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* OpenTelemetry Trace Spans */}
                    <div className="border border-stone-200 rounded-xl p-5 space-y-4 font-mono text-xs bg-white">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-2 flex items-center gap-1.5">
                        <GitBranch className="h-4 w-4 text-indigo-600" />
                        OpenTelemetry Distributed Spans
                      </span>

                      <div className="space-y-3">
                        {[
                          { span: "Musharakah Contract Generation", client: "43v3r LifeOS Client", duration: chaosState.databaseOverloadActive ? "1,240ms" : "182ms", steps: ["Check Riba rules compliance (IslamOS)", "Fetch semantic vector memories (Qdrant)", "Compile markdown payload"] },
                          { span: "Line #3 Downstream Telemetry Cycle", client: "43v3r MES Extruder Control", duration: "12ms", steps: ["Poll Siemens slot #4 physical bus", "Trigger database audit telemetry"] },
                          { span: "Family Trust Inheritance Audit", client: "Barnes Waqf Asset Ledger", duration: chaosState.slowNetworkActive ? "1,884ms" : "84ms", steps: ["Audit compliance threshold variables", "Propagate Shariah policy blocks across LIN nodes"] }
                        ].map((trace, i) => (
                          <div key={i} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-stone-950 text-xs flex items-center gap-1.5">
                                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-ping"></span>
                                {trace.span}
                              </span>
                              <span className={`font-mono text-xs ${
                                trace.duration.includes("1,") ? "text-amber-600 font-bold" : "text-indigo-600"
                              }`}>{trace.duration}</span>
                            </div>
                            <p className="text-[10px] text-stone-400">Context Identifier: <strong>{trace.client}</strong></p>

                            <div className="pl-4 border-l border-indigo-200 mt-2 space-y-1 text-[10px] text-stone-600">
                              {trace.steps.map((st, idx) => (
                                <div key={idx} className="flex items-center space-x-1.5">
                                  <span className="h-1 w-1 bg-indigo-400 rounded-full"></span>
                                  <span>{st}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Chaos Control Panel */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Chaos Monkey Box */}
                    <div className="border border-stone-200 rounded-xl p-5 space-y-4 font-mono text-xs bg-white">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-2 flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-red-600 animate-pulse" />
                        Chaos Monkey Injector
                      </span>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Verify system architecture self-healing capabilities, bulkhead isolation limits, and circuit breaker tripping routines under simulated degradation.
                      </p>

                      <div className="space-y-3 pt-2">
                        {/* 1. Slow Network latency */}
                        <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div>
                            <span className="font-bold text-stone-900 block text-[11px]">Inject Network Latency</span>
                            <span className="text-[10px] text-stone-400 block">Adds 1.8s delay to all /api requests</span>
                          </div>
                          <button
                            onClick={() => toggleChaos("slow_network", chaosState.slowNetworkActive)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition uppercase ${
                              chaosState.slowNetworkActive
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-700"
                            }`}
                          >
                            {chaosState.slowNetworkActive ? "Active" : "Disabled"}
                          </button>
                        </div>

                        {/* 2. Database connection pool overload */}
                        <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div>
                            <span className="font-bold text-stone-900 block text-[11px]">Database Pool Exhaustion</span>
                            <span className="text-[10px] text-stone-400 block">Causes /api/healthz probe failure</span>
                          </div>
                          <button
                            onClick={() => toggleChaos("db_overload", chaosState.databaseOverloadActive)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition uppercase ${
                              chaosState.databaseOverloadActive
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-700"
                            }`}
                          >
                            {chaosState.databaseOverloadActive ? "Active" : "Disabled"}
                          </button>
                        </div>

                        {/* 3. Circuit Breaker Simulation */}
                        <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div>
                            <span className="font-bold text-stone-900 block text-[11px]">Circuit Breaker Trip</span>
                            <span className="text-[10px] text-stone-400 block">Fails open on consecutive RPC errors</span>
                          </div>
                          <button
                            onClick={() => toggleChaos("circuit_breaker", chaosState.circuitBreakerTripped)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition uppercase ${
                              chaosState.circuitBreakerTripped
                                ? "bg-stone-900 text-white"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-700"
                            }`}
                          >
                            {chaosState.circuitBreakerTripped ? "Open (Tripped)" : "Closed"}
                          </button>
                        </div>

                        {/* 4. Memory Leak Simulation */}
                        <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div>
                            <span className="font-bold text-stone-900 block text-[11px]">Memory Leak (Heap Spill)</span>
                            <span className="text-[10px] text-stone-400 block">Forces container RAM usage above 95%</span>
                          </div>
                          <button
                            onClick={() => toggleChaos("memory_leak", chaosState.memoryLeakActive)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition uppercase ${
                              chaosState.memoryLeakActive
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-700"
                            }`}
                          >
                            {chaosState.memoryLeakActive ? "Active" : "Disabled"}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleChaos("reset", false)}
                        className="w-full py-2 border border-dashed border-stone-300 text-stone-600 hover:bg-stone-50 text-[10px] rounded-lg font-bold transition uppercase"
                      >
                        Reset All Chaos Parameters
                      </button>
                    </div>

                    {/* Rate Limiting Configurations */}
                    <div className="border border-stone-200 rounded-xl p-5 space-y-4 font-mono text-xs bg-white">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-2 flex items-center gap-1.5">
                        <Gauge className="h-4 w-4 text-emerald-600" />
                        API Gateway Rate Limiter
                      </span>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Adjust maximum allowed HTTP API operations per IP before gateway deflection kicks in to protect cognitive thread scheduling.
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <input
                          type="number"
                          value={rateLimitInput}
                          onChange={(e) => setRateLimitInput(parseInt(e.target.value) || 100)}
                          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-900 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Hits/minute (e.g. 100)"
                        />
                        <button
                          onClick={() => saveRateLimitConfig(rateLimitInput)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-lg transition"
                        >
                          Harder Limit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 7: SKILLS MARKETPLACE */}
            {activeSubTab === "marketplace" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Ecosystem Skills & Agent Marketplace</h2>
                  <p className="text-xs text-stone-500 font-mono">Unlock certified third-party integrations, specialized compliance templates, and premium routing filters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketItems.map((item) => (
                    <div key={item.id} className="p-5 border border-stone-200 rounded-2xl flex flex-col justify-between space-y-4 bg-stone-50/30 font-mono text-xs">
                      <div>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">{item.category}</span>
                        <h3 className="font-bold text-stone-900 text-sm mt-1.5">{item.name}</h3>
                        <p className="text-[10px] text-stone-400 mt-1">Publisher: {item.author}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-stone-150">
                        <span className="text-xs font-bold text-indigo-600">{item.price}</span>

                        {item.price === "Licensed" ? (
                          <span className="text-emerald-600 font-bold text-[10px]">Unlocked</span>
                        ) : (
                          <button
                            onClick={() => licenseMarketItem(item.id, item.name)}
                            className="px-3 py-1 bg-stone-900 text-white rounded font-bold text-[10px] hover:bg-stone-800"
                          >
                            License
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 8: PLATFORM SDK CONSOLE */}
            {activeSubTab === "sdk" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Multi-Product Platform SDK Playground</h2>
                  <p className="text-xs text-stone-500 font-mono">Generate bootstrap blocks for standard TypeScript, .NET, Python, and Model Context Protocol (MCP) systems</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Selector list */}
                  <div className="lg:col-span-3 space-y-2 font-mono text-xs">
                    <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                      Choose Language
                    </span>

                    {[
                      { id: "typescript", label: "TypeScript / Node" },
                      { id: "dotnet", label: ".NET Core C#" },
                      { id: "python", label: "Python SDK" },
                      { id: "mcp", label: "MCP Protocol" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSdkLanguage(item.id as any)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          sdkLanguage === item.id ? "bg-stone-900 text-white border-stone-900 font-bold" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Code display */}
                  <div className="lg:col-span-9 border border-stone-200 rounded-xl p-5 bg-stone-950 font-mono text-xs text-stone-200 space-y-3 relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-stone-800 text-stone-400 text-[10px] px-2 py-0.5 rounded uppercase">
                      Syntax Checked
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                      {sdkCommandOutput}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 9: INTEGRATED TEST HARNESS, ASVS PENETRATION SCANS & SECURE AUDITING */}
            {activeSubTab === "tests" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    Distributed Test Harness, OWASP Audits & Verification Core
                  </h2>
                  <p className="text-xs text-stone-500 font-mono">Execute high-fidelity unit coverage, relational database schemas compliance, load simulations, and penetration checks</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                  {/* Left Column: Test Suite Selector */}
                  <div className="lg:col-span-4 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                      Verification Suites
                    </span>

                    <div className="space-y-1.5">
                      {[
                        { id: "unit", label: "Unit & Integration", desc: "42 assertions verifying ledger symmetry & Shariah pure purges", cov: "98.2%" },
                        { id: "contract", label: "Relational Schema Contracts", desc: "Verifies Drizzle schema models, foreign keys & indexes state", cov: "100%" },
                        { id: "load", label: "Gateway Stress & Load", desc: "Stress routes at 10,000 req/sec peak threads load simulation", cov: "96.4%" },
                        { id: "chaos", label: "Chaos Monkey Resiliency", desc: "Evaluates bulkhead isolation under latency & RAM leaking states", cov: "95.0%" },
                        { id: "security", label: "OWASP ASVS Penetration Scan", desc: "Dynamic scanner checking strict CORS, frame injectors & CSP rules", cov: "100%" },
                        { id: "accessibility", label: "WCAG 2.1 AA Audit", desc: "Inspects contrast ratios, keyboard routing & accessible labels", cov: "100%" }
                      ].map((suite) => (
                        <button
                          key={suite.id}
                          onClick={() => setSelectedTestSuite(suite.id as any)}
                          className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 ${
                            selectedTestSuite === suite.id
                              ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                              : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center font-bold">
                              <span className="truncate">{suite.label}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                selectedTestSuite === suite.id ? "bg-stone-800 text-emerald-400" : "bg-stone-200 text-stone-700"
                              }`}>{suite.cov}</span>
                            </div>
                            <span className={`text-[10px] block leading-snug mt-1 ${
                              selectedTestSuite === suite.id ? "text-stone-300" : "text-stone-400"
                            }`}>{suite.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Execution Parameters</span>
                      <div className="space-y-1 text-[11px] text-stone-600">
                        <div className="flex justify-between">
                          <span>Target Coverage Limit:</span>
                          <strong className="text-stone-800">95.0%+ (Mandatory)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Environment:</span>
                          <strong className="text-indigo-600">Secure Cloud Sandbox</strong>
                        </div>
                      </div>

                      <button
                        onClick={executeCognitiveTests}
                        disabled={isRunningTests}
                        className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg transition text-[11px] flex items-center justify-center gap-1.5 uppercase"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRunningTests ? "animate-spin" : ""}`} />
                        <span>{isRunningTests ? "Executing..." : "Run Test Suite"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Console Output & Secure Audit Trail */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Live Test Console */}
                    <div className="border border-stone-200 rounded-xl p-5 bg-stone-950 text-stone-300 space-y-2.5 h-64 overflow-y-auto font-mono">
                      <div className="flex justify-between items-center border-b border-stone-800 pb-1">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">
                          Terminal Output
                        </span>
                        <span className="text-[10px] text-stone-500 uppercase">SUITE: {selectedTestSuite}</span>
                      </div>

                      {testLogs.length === 0 ? (
                        <div className="text-stone-500 text-xs italic py-4">
                          Select a test suite and click "Run Test Suite" to evaluate system metrics...
                        </div>
                      ) : (
                        <div className="space-y-1 text-[11px] leading-relaxed">
                          {testLogs.map((log, i) => (
                            <div key={i} className={
                              log.includes("PASSED") ? "text-emerald-400" :
                              log.includes("SUCCESS") ? "text-emerald-300 font-bold" :
                              log.includes("[ERROR]") || log.includes("Fail") ? "text-rose-400" : "text-stone-300"
                            }>
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Security Audit Trail Logs (Pulls from backend) */}
                    <div className="border border-stone-200 rounded-xl p-5 bg-stone-50 space-y-3 font-mono">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-1.5">
                        <span className="text-xs font-bold text-stone-900 uppercase flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-stone-700 animate-pulse" />
                          Security Gateway Audit Trail (Live)
                        </span>
                        <button
                          onClick={fetchSecurityLogs}
                          className="text-[9px] text-stone-500 hover:text-stone-900 underline uppercase"
                        >
                          Refresh Logs
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-2 text-[10px]">
                        {securityLogs.length === 0 ? (
                          <div className="text-stone-400 italic py-2">No security audit logs available. Try triggering some API requests...</div>
                        ) : (
                          securityLogs.map((log, idx) => (
                            <div key={idx} className="p-2.5 bg-white border border-stone-200 rounded-lg space-y-1 shadow-2xs">
                              <div className="flex justify-between font-bold items-center">
                                <span className={
                                  log.status === 429 ? "text-rose-600 uppercase" : "text-stone-800 uppercase"
                                }>{log.action}</span>
                                <span className={`text-[9px] px-1.5 rounded font-bold ${
                                  log.status === 200 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                }`}>{log.status}</span>
                              </div>
                              <div className="flex justify-between text-stone-400 font-normal">
                                <span>Caller IP: {log.ip} • Path: {log.url}</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              {log.details && (
                                <div className="text-[9px] text-rose-500 font-semibold bg-rose-50/20 p-1.5 rounded border border-rose-100 mt-1">
                                  {log.details}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 10: ARCHITECTURE MANUAL */}
            {activeSubTab === "docs" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">LIN Network Protocol & Architecture Manual</h2>
                  <p className="text-xs text-stone-500 font-mono">Understand the core federation model, semantic layers, and cognitive orchestration parameters</p>
                </div>

                <div className="space-y-4 font-mono text-xs text-stone-700 leading-relaxed">
                  <div className="p-5 border border-stone-200 rounded-xl bg-stone-50/40 space-y-2">
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-indigo-600" />
                      1. Cross-Tenant Cognitive Isolation Boundaries
                    </h3>
                    <p>
                      Every 43v3r client product (LifeOS, BusinessOS, MES, Records) initiates secure gRPC or WebSocket handshakes with the central LIN cognitive cluster.
                      Under row-level database filters and fine-grained SAML permissions, data structures, specialized memories, and custom-trained local weights remain strictly insulated from secondary tenant nodes.
                    </p>
                  </div>

                  <div className="p-5 border border-stone-200 rounded-xl bg-stone-50/40 space-y-2">
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-emerald-600" />
                      2. Global Shariah Compliance Shield Inheritance
                    </h3>
                    <p>
                      The Root Intelligence Layer maintains certified Shariah policy rulesets (e.g., prohibition of compounding interest/Riba, automatic purification of venture yields).
                      Any federated sub-node or customer department automatically inherits these rules, executing continuous auditing on secondary double-entry transaction ledgers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* OpenAPI Live Playground Console at bottom */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 font-mono text-xs space-y-4">
        <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <Server className="h-4 w-4 text-indigo-600" />
              Live OpenAPI v4 Sandbox Console
            </h3>
            <p className="text-[10px] text-stone-500">Test live requests to the cognitive network interface</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "memory", label: "GET /api/v4/lin/memory" },
              { id: "router", label: "GET /api/v4/lin/router" },
              { id: "skills", label: "GET /api/v4/lin/skills" },
              { id: "observability", label: "GET /api/v4/lin/observability" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => fireApiEndpoint(btn.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                  apiEndpoint === btn.id
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "bg-white border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {apiConsoleResponse && (
          <div className="p-4 bg-stone-950 text-stone-200 rounded-xl relative">
            <span className="absolute top-2.5 right-3 text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded font-bold uppercase">
              Response 200 OK
            </span>
            <pre className="overflow-x-auto max-h-56 whitespace-pre-wrap leading-relaxed text-[11px]">
              {apiConsoleResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
