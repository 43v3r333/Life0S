import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Cpu,
  Layers,
  Compass,
  Moon,
  Building2,
  BookOpen,
  Clock,
  MessageSquare,
  Key,
  Code,
  Lock,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Search,
  Bookmark,
  Sparkles,
  Calculator,
  Calendar,
  ArrowRight,
  MapPin,
  UserCheck,
  FileSpreadsheet,
  Share2,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  Award,
  Globe,
  Database,
  Play,
  FileText,
  Terminal,
  Settings2,
  Sliders,
  Eye,
  Check,
  X,
  ShieldAlert,
  List,
  Network,
  GitBranch,
  Mail,
  FileSignature,
  TrendingUp,
  BarChart3,
  HelpCircle,
  FolderTree,
  Network as NetworkIcon,
  Workflow,
  Wrench,
  Boxes,
  LockKeyhole,
  CheckSquare,
  Bug,
  Flame,
  ShieldCheck,
  Users
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
  Cell
} from "recharts";

interface AIWorkforceViewProps {
  onAddSignalREvent?: (msg: string) => void;
  onUpdateScore?: () => void;
}

export default function AIWorkforceView({ onAddSignalREvent = () => {}, onUpdateScore = () => {} }: AIWorkforceViewProps) {
  // Navigation tabs for the AI Workforce Hub
  const [activeSubTab, setActiveSubTab] = useState<
    "cockpit" | "directory" | "automation" | "mcp" | "coding" | "governance" | "analytics" | "diagnostics"
  >("cockpit");

  // Local Storage state keys helper
  const STORAGE_KEY_PREFIX = "lifeos_p8_";
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

  // 1. Live Task queues
  const [tasks, setTasks] = useState<any[]>(() => loadState("tasks", [
    { id: "task_1", name: "Extract entities & compile daily brief", agent: "Gabriel (COS)", status: "running", progress: 68, priority: "High", startedAt: "02:45 AM" },
    { id: "task_2", name: "Perform Shariah screening on AAPL options proposal", agent: "Islamic Advisor", status: "queued", progress: 0, priority: "High", startedAt: "Pending" },
    { id: "task_3", name: "Analyze SQL server deadlock trace logs", agent: "SQL Optimizer", status: "queued", progress: 0, priority: "Medium", startedAt: "Pending" },
    { id: "task_4", name: "Process incoming client email inquiries", agent: "Email Assistant", status: "running", progress: 12, priority: "Low", startedAt: "02:55 AM" },
    { id: "task_5", name: "Analyze industrial subnet routing packet loss", agent: "Manufacturing Engineer", status: "completed", progress: 100, priority: "Critical", startedAt: "01:22 AM", result: "Identified backup broadcast packet collision on VLAN 4." }
  ]));

  // 2. Human Approval Center queue
  const [approvals, setApprovals] = useState<any[]>(() => loadState("approvals", [
    {
      id: "app_1",
      title: "Authorize Capital Reallocation for physical gold backup bar",
      agent: "CFO Advisor",
      risk: "High",
      category: "Finance",
      description: "Transfer £15,400 from Corporate checking account into bullion holdings vault.",
      policyApplied: "Liquidity Reserve Allocation Rule Sec 4.2",
      alternatives: "Hold in fiat currency (exposed to 3.8% inflation debasement risk).",
      status: "pending",
      date: "2026-07-06 02:40 AM"
    },
    {
      id: "app_2",
      title: "Approve Siemens PLC interlock firmware patch deploy",
      agent: "Manufacturing Engineer",
      risk: "Critical",
      category: "Operations",
      description: "Apply firmware binary S7-V3.2.1-Interlock to Assembly Line 4 system controller.",
      policyApplied: "Industrial Subnet Change Protocol Rule C7",
      alternatives: "Postpone until planned scheduled maintenance window in August.",
      status: "pending",
      date: "2026-07-06 02:50 AM"
    },
    {
      id: "app_3",
      title: "Send official strategic B2B proposal to AstraZeneca",
      agent: "CEO Advisor",
      risk: "Medium",
      category: "Business",
      description: "Transmit proposal document PROP-2026-44 containing pricing structures for MES validation.",
      policyApplied: "Client NDA and Commercial Disclosure Rule Sec 1.1",
      alternatives: "Incorporate further review cycle from legal advisory board.",
      status: "pending",
      date: "2026-07-06 02:35 AM"
    }
  ]));

  // 3. Automation triggers and workflow logs
  const [workflows, setWorkflows] = useState<any[]>(() => loadState("workflows", [
    { id: "wf_1", name: "Daily Executive Brief Preparation", trigger: "Cron: 0 6 * * *", active: true, actionsCount: 5, lastExecuted: "Yesterday 06:00 AM", status: "success" },
    { id: "wf_2", name: "Incident Processing & RCA Builder", trigger: "Webhook: /api/v1/mes/incident", active: true, actionsCount: 8, lastExecuted: "01:22 AM", status: "success" },
    { id: "wf_3", name: "Invoice Generation & Auto-Reconcile", trigger: "Event: OpportunityWon", active: true, actionsCount: 4, lastExecuted: "02:10 AM", status: "success" },
    { id: "wf_4", name: "Weekly Prayer & Reflection Review", trigger: "Cron: 0 20 * * 5", active: false, actionsCount: 3, lastExecuted: "Last Friday", status: "success" },
    { id: "wf_5", name: "Email Intake & Priority Categorization", trigger: "SMTP Socket Event", active: true, actionsCount: 6, lastExecuted: "Just now", status: "success" }
  ]));

  // Selected agent state for Directory
  const [selectedAgentId, setSelectedAgentId] = useState<string>("gabriel_cos");

  // Filter query for agent directory
  const [agentQuery, setAgentQuery] = useState("");

  // Audit Logs database
  const [auditLogs, setAuditLogs] = useState<any[]>(() => loadState("auditLogs", [
    { id: "aud_1", timestamp: "2026-07-06 02:51:12", event: "WorkflowStarted", details: "Workflow 'Email Intake & Priority Categorization' initiated on client hook.", category: "Automation", agent: "Chief Automation Officer" },
    { id: "aud_2", timestamp: "2026-07-06 02:50:42", event: "ApprovalRequested", details: "Approval token issued for 'Approve Siemens PLC interlock firmware patch deploy'. Risk: Critical.", category: "Governance", agent: "Chief Compliance Officer" },
    { id: "aud_3", timestamp: "2026-07-06 02:42:01", event: "ToolExecuted", details: "MCP tool 'sql_query_executor' executed successfully on 'tblInvoices' updates.", category: "Tools", agent: "SQL Optimizer" },
    { id: "aud_4", timestamp: "2026-07-06 02:35:10", event: "KnowledgeCreated", details: "Created structured wiki card: 'VLAN 4 Broadcast Suppression Standards'.", category: "Knowledge", agent: "Chief Knowledge Officer" },
    { id: "aud_5", timestamp: "2026-07-06 02:10:05", event: "AutomationExecuted", details: "SignalR event published. Auto-generated invoice sent to client accounting queue.", category: "Automation", agent: "Finance Advisor" }
  ]));

  // MCP tool registry list
  const [mcpTools, setMcpTools] = useState<any[]>([
    { id: "tool_1", name: "sql_query_executor", description: "Executes sanitized SQL commands on active SQL Server clusters.", permissions: "CFO, Database Architect, SQL Optimizer", version: "1.4.2", telemetry: "Calls: 89, Avg latency: 12ms", status: "Active" },
    { id: "tool_2", name: "plc_telemetry_fetcher", description: "Connects to Wonderware MES backend to collect live OPC Tags from S7 controller.", permissions: "Chief of Staff, Manufacturing Engineer", version: "2.1.0", telemetry: "Calls: 452, Avg latency: 45ms", status: "Active" },
    { id: "tool_3", name: "exchange_calendar_write", description: "Binds with Outlook / Exchange server to reserve corporate meetings.", permissions: "Gabriel, Calendar Manager", version: "1.0.1", telemetry: "Calls: 14, Avg latency: 120ms", status: "Active" },
    { id: "tool_4", name: "github_pull_request_audit", description: "Analyzes codebase delta using tree-sitter compiler hooks.", permissions: "Software Architect, Senior Developer", version: "0.8.9", telemetry: "Calls: 31, Avg latency: 280ms", status: "Active" },
    { id: "tool_5", name: "islamic_screening_checker", description: "Queries live AAOIFI guidelines database to check interest ratios.", permissions: "Islamic Advisor, Investment Analyst", version: "3.2.0", telemetry: "Calls: 120, Avg latency: 85ms", status: "Active" }
  ]);

  // Connectors registry
  const [connectors, setConnectors] = useState<any[]>([
    { name: "Microsoft 365 (Outlook, Exchange, Teams)", category: "Enterprise", status: "Connected", auth: "Secret Isolated • OAuth Applet Token" },
    { name: "Google Workspace (Gmail, Drive, Docs)", category: "Enterprise", status: "Connected", auth: "OAuth Client Secured" },
    { name: "Jira / Confluence Cloud Client", category: "DevOps", status: "Connected", auth: "Secret Key Encrypted" },
    { name: "GitHub API Secure Integration", category: "DevOps", status: "Connected", auth: "Secure Deployment Key" },
    { name: "Wonderware & Siemens S7 Subnet Gateway", category: "Industrial", status: "Connected", auth: "VLAN Gateway Isolated" },
    { name: "WhatsApp Business Cloud API", category: "Communications", status: "Disconnected", auth: "Pending credentials" }
  ]);

  // Coding center mock project state
  const [codeReviewPr, setCodeReviewPr] = useState({
    title: "PR-124: Optimize SQL index for Wonderware MES event logs queue",
    diff: "CREATE NONCLUSTERED INDEX IX_MesEvents_Timestamp ON tblMesEvents(Timestamp, Severity) WITH (ONLINE = ON);",
    architectReview: "Approved. Clustered scans are bypassed. The index avoids deadlock contention on Assembly line telemetry. Recom: Apply RCSI isolation.",
    testResults: "All build constraints compiled successfully in Sandbox.",
    autoSop: "SOP-142: Emergency Index Application Guidelines under Concurrency."
  });

  // State for diagnostics test runner
  const [tests, setTests] = useState<any[]>([
    { id: "t_1", name: "AgentFramework.Identity_Verification_WithDecisionLimits", status: "Untested" },
    { id: "t_2", name: "WorkflowBuilder.Execute_DailyBrief_GeneratesRcaReport", status: "Untested" },
    { id: "t_3", name: "McpRuntime.ToolSandbox_Isolation_ThrowsOnUnauthorizedAccess", status: "Untested" },
    { id: "t_4", name: "EmailAutomation.Inbox_Classification_AutoPrioritizesS1", status: "Untested" },
    { id: "t_5", name: "DecisionGovernance.Audit_Trail_PersistsShariahComplianceMetric", status: "Untested" },
    { id: "t_6", name: "EnterpriseIntegrations.MicrosoftGraph_FetchActiveMeetingAgenda", status: "Untested" }
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testCoverage, setTestCoverage] = useState(0);

  // Quick State for Manual Task Delegation
  const [delegationForm, setDelegationForm] = useState({
    taskName: "",
    priority: "Medium"
  });

  // Local storage auto save on state changes
  useEffect(() => { saveState("tasks", tasks); }, [tasks]);
  useEffect(() => { saveState("approvals", approvals); }, [approvals]);
  useEffect(() => { saveState("workflows", workflows); }, [workflows]);
  useEffect(() => { saveState("auditLogs", auditLogs); }, [auditLogs]);

  // Handle human approval actions
  const handleApproval = (id: string, action: "Approved" | "Rejected") => {
    const item = approvals.find(a => a.id === id);
    if (!item) return;

    // Remove from approvals queue or change status
    setApprovals(prev => prev.filter(a => a.id !== id));

    // Log the event to audit logs
    const logItem = {
      id: "aud_" + Date.now(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      event: action === "Approved" ? "ApprovalGranted" : "ApprovalRejected",
      details: `Human operator Ethan verified and ${action.toLowerCase()} task: '${item.title}' triggered by ${item.agent}.`,
      category: "Governance",
      agent: item.agent
    };

    setAuditLogs(prev => [logItem, ...prev]);

    // If approved, trigger simulated completion
    if (action === "Approved") {
      onAddSignalREvent(`ApprovalGranted event published for system token [${id}]`);
      // Auto add to running task pool as completed soon after
      const approvedTask = {
        id: "task_auto_" + Date.now(),
        name: `EX: ${item.title}`,
        agent: item.agent,
        status: "completed",
        progress: 100,
        priority: item.risk,
        startedAt: "Approved Now",
        result: `Executed safely with authorized human override keys.`
      };
      setTasks(prev => [approvedTask, ...prev]);
    } else {
      onAddSignalREvent(`ApprovalRejected event: Execution cancelled for [${item.title}]`);
    }
    onUpdateScore();
  };

  // Run diagnostics testing suite
  const executeTests = () => {
    setIsRunningTests(true);
    setTestLogs([]);
    setTestCoverage(0);

    const logHistory: string[] = [];
    let currentSuite = 0;

    const stepInterval = setInterval(() => {
      if (currentSuite < tests.length) {
        const currentTest = tests[currentSuite];
        logHistory.push(`[SYSTEM] Initializing test sandbox for ${currentTest.name}...`);
        logHistory.push(`[MOCK] Mapping memory scope and injecting context constraints...`);
        logHistory.push(`[PASS] Invariant check complete: ${currentTest.name} passed (latency: ${Math.floor(Math.random() * 22) + 5}ms)`);

        setTests(prev => prev.map((t, idx) => {
          if (idx === currentSuite) return { ...t, status: "Passed" };
          return t;
        }));

        setTestLogs([...logHistory]);
        currentSuite++;
      } else {
        clearInterval(stepInterval);
        logHistory.push(`[SYS] Completing regression suites. Verification cycle success.`);
        logHistory.push(`[SYS] Code Coverage: 96.2% across Agent Coordination Engine and MCP Sandboxes.`);
        logHistory.push(`[SYS] 6 of 6 system test modules verified as 100% compliant with zero leak parameters.`);
        setTestLogs([...logHistory]);
        setTestCoverage(96.2);
        setIsRunningTests(false);
        onAddSignalREvent("All Phase 8 agent workforce unit and governance test suites passed successfully.");
        onUpdateScore();
      }
    }, 450);
  };

  // Add a task manual delegation
  const handleDelegationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegationForm.taskName) return;

    const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

    const newTask = {
      id: "task_manual_" + Date.now(),
      name: delegationForm.taskName,
      agent: currentAgent.name,
      status: "running",
      progress: 5,
      priority: delegationForm.priority,
      startedAt: "Just now"
    };

    setTasks(prev => [newTask, ...prev]);

    // Log the event
    const logItem = {
      id: "aud_" + Date.now(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      event: "AgentStarted",
      details: `Delegated manual goal '${delegationForm.taskName}' to agent ${currentAgent.name} (Priority: ${delegationForm.priority}).`,
      category: "Automation",
      agent: currentAgent.name
    };
    setAuditLogs(prev => [logItem, ...prev]);

    onAddSignalREvent(`Delegated task to ${currentAgent.name}: [${delegationForm.taskName}]`);
    setDelegationForm({ taskName: "", priority: "Medium" });

    // Tick the progress bar of the newly created task on a timer
    const intervalId = setInterval(() => {
      setTasks(prev => prev.map(t => {
        if (t.id === newTask.id && t.progress < 100) {
          const nextProg = t.progress + Math.floor(Math.random() * 20) + 10;
          if (nextProg >= 100) {
            clearInterval(intervalId);
            onAddSignalREvent(`Task Completed by ${currentAgent.name}: [${delegationForm.taskName}]`);
            // Update audit logs
            const completionLog = {
              id: "aud_completed_" + Date.now(),
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
              event: "WorkflowCompleted",
              details: `Task '${delegationForm.taskName}' reached target invariant and successfully closed.`,
              category: "Automation",
              agent: currentAgent.name
            };
            setAuditLogs(l => [completionLog, ...l]);
            return { ...t, status: "completed", progress: 100, result: "Task successfully processed. Target state reconciled." };
          }
          return { ...t, progress: nextProg };
        }
        return t;
      }));
    }, 2000);
  };

  // Toggle workflow activation
  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id === id) {
        onAddSignalREvent(`Workflow ${wf.name} is now ${!wf.active ? "Enabled" : "Disabled"}`);
        return { ...wf, active: !wf.active };
      }
      return wf;
    }));
  };

  // List of all Executive & Specialist Agents for Directory (Phase 8 full list)
  const agents = [
    { id: "gabriel_cos", name: "Gabriel", role: "Chief of Staff & Autonomous Coordinator", group: "Executive", mission: "Coordinate all C-suite models, filter executive updates, monitor safety parameters, and manage Daily Brief orchestration pipelines.", capabilities: "Context Compaction, Pipeline routing, High availability orchestration", memoryScope: "Global LifeOS State Context (1024KB dynamic)", riskLevel: "High" },
    { id: "ceo_advisor", name: "CEO Advisor", role: "Chief Executive Officer Model", group: "Executive", mission: "Develop premium corporate visions, align legal partnerships, oversee long-range company registration rules.", capabilities: "Musharakah framework building, corporate legal structuring", memoryScope: "Strategic company objectives, investor covenant index", riskLevel: "Critical" },
    { id: "cfo_advisor", name: "CFO Advisor", role: "Chief Financial Officer Model", group: "Executive", mission: "Audit double-entry cash books, recommend halal capital splits, analyze tax models and gold reserves physical backing.", capabilities: "Capital forecasting, tax allowance automation, purification accounting", memoryScope: "Corporate ledger, transactions history, bullion indices", riskLevel: "High" },
    { id: "cto_advisor", name: "CTO Advisor", role: "Chief Technology Officer Model", group: "Executive", mission: "Audit system architectures, ensure C# ASP.NET Core high performance, structure SQL Server deadlock bypass routines.", capabilities: "Microservice decoupling, system telemetry, deadlock prevention", memoryScope: "Scaffold repository schema, server CPU/RAM traces", riskLevel: "High" },
    { id: "cko_advisor", name: "Chief Knowledge Officer", role: "CKO & Vector DB Curator", group: "Executive", mission: "Ensure high density knowledge capture, index new meeting SOPs, compile and categorize root cause analyses.", capabilities: "Vector embedding mapping, entity extraction, flashcard synthesis", memoryScope: "Knowledge hub vector clusters, Markdown indices", riskLevel: "Medium" },
    { id: "cro_advisor", name: "Chief Risk Officer", role: "CRO Strategic Safeguard", group: "Executive", mission: "Evaluate financial and operational vulnerabilities, flag high-leverage liabilities, audit transaction counterparties.", capabilities: "Stochastic risk modeling, portfolio stress-testing", memoryScope: "System risk registry, exposure indexes", riskLevel: "High" },
    { id: "compliance_advisor", name: "Chief Compliance Officer", group: "Executive", role: "AAOIFI Shariah Policy Auditor", mission: "Formulate Islamic policy compliance tests, audit business activities for interest or speculative exposure.", capabilities: "Fiqh al-Muamalat jurisprudence, AAOIFI rule validation", memoryScope: "Compliance guidelines book, purify target tables", riskLevel: "High" },
    { id: "security_advisor", name: "Chief Security Officer", group: "Executive", role: "RBAC & Secret Isolation Guard", mission: "Verify cryptographic locks, enforce role-based access controls, prevent API key leaks in browser previews.", capabilities: "Secret hashing, secure environment isolation, audit logging", memoryScope: "RBAC directory, encrypted vault parameters", riskLevel: "Critical" },
    
    // Specialist Agents
    { id: "software_arch", name: "Software Architect", group: "Specialist", role: "C# & React Structural Designer", mission: "Enforce clean architectural boundaries, define API contracts, analyze project dependency trees.", capabilities: "DDD schema modeling, OpenAPI blueprint generation", memoryScope: "Project build configurations, types index", riskLevel: "Medium" },
    { id: "senior_dev", name: "Senior Developer", group: "Specialist", role: "TypeScript & .NET Code Smith", mission: "Author enterprise features, resolve compiler bugs, conduct automated PR reviews and test creation.", capabilities: "Functional coding, compiler diagnostics interpretation", memoryScope: "Active workspace repository delta, test suites", riskLevel: "Medium" },
    { id: "sql_opt", name: "SQL Optimizer", group: "Specialist", role: "High Concurrency Database Engineer", mission: "Monitor slow execution trees, suggest clustered indexes, configure database isolation parameters.", capabilities: "Execution plan diagnostics, compound index optimization", memoryScope: "Database DMV stats, table structures", riskLevel: "Medium" },
    { id: "mfg_eng", name: "Manufacturing Engineer", group: "Specialist", role: "Automation & MES Specialist", mission: "Track assembly OEE metrics, design corrective actions, build root cause analyses for S7 controllers.", capabilities: "Wonderware handshakes, PLC ladder logic diagnostics, S2 incidents", memoryScope: "MES event streams, PLC register trace logs", riskLevel: "High" },
    { id: "islamic_advisor", name: "Islamic Advisor", group: "Specialist", role: "Fiqh & Muamalat Consultant", mission: "Evaluate investment products, screen stocks for interest ratios, purge non-compliant dividend revenue.", capabilities: "AAOIFI debt-screening ratios, purified yield accounting", memoryScope: "Global stock screen indexes, AAOIFI standards", riskLevel: "Medium" },
    { id: "marriage_coach", name: "Marriage Coach", group: "Specialist", role: "Family Sync & Chore Allocator", mission: "Sync shared family calendars, track chore lists, model relationship objectives to prevent friction.", capabilities: "Conflict mediation, objective planning, task balancing", memoryScope: "Spousal calendar sync, chores database", riskLevel: "Low" },
    { id: "email_assistant", name: "Email Assistant", group: "Specialist", role: "Inbox Classifier & Draft Writer", mission: "Monitor corporate mail, prioritize urgent SLA requests, auto-draft replies for operator review.", capabilities: "Entity extraction, automated drafting, priority detection", memoryScope: "Incoming/outgoing email buffers", riskLevel: "Low" }
  ];

  // Filtered list of agents based on search query
  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(agentQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(agentQuery.toLowerCase()) ||
    a.group.toLowerCase().includes(agentQuery.toLowerCase())
  );

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Analytical stats
  const totalCompletedTasks = tasks.filter(t => t.status === "completed").length;
  const runningCount = tasks.filter(t => t.status === "running").length;
  const queuedCount = tasks.filter(t => t.status === "queued").length;

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-mono text-xs uppercase tracking-wider font-semibold">
            <BrainCircuit className="h-4 w-4" />
            <span>Autonomous Coordination Engine • Phase 8 Active</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            AI Workforce, Automation & Integrations Hub
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-3xl font-mono">
            COORDINATED MULTI-AGENT WORKFORCE • MODEL CONTEXT PROTOCOL (MCP) RUNTIME • PROCESS ORCHESTRATION & COMPLIANCE GOVERNANCE
          </p>
        </div>

        {/* View Sub-selector */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 justify-end max-w-xl">
          {[
            { id: "cockpit", label: "Workforce Cockpit", icon: Layers },
            { id: "directory", label: "Agent Directory", icon: Users },
            { id: "automation", label: "Automation Designer", icon: Workflow },
            { id: "mcp", label: "MCP & Connectors", icon: Wrench },
            { id: "coding", label: "AI Developer Lab", icon: Code },
            { id: "governance", label: "Decision Audit Logs", icon: LockKeyhole },
            { id: "analytics", label: "Workforce Analytics", icon: BarChart3 },
            { id: "diagnostics", label: "System Diagnostics", icon: Terminal }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  onAddSignalREvent(`Navigated to AI Workforce portal: ${tab.label}`);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-mono text-[10px] transition border ${
                  isSel
                    ? "bg-stone-900 border-stone-950 text-white font-bold shadow-sm"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* SUB-WORKSPACE 1: WORKFORCE COCKPIT */}
            {activeSubTab === "cockpit" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-base font-bold text-stone-900 font-sans">Executive AI Workforce Cockpit</h2>
                    <p className="text-xs text-stone-500 font-mono font-bold uppercase">Real-Time Employee Routing & Operator Interlock Gateways</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-1.5 text-xs font-mono text-indigo-800">
                    <Activity className="h-4 w-4 text-indigo-600 animate-pulse" />
                    <span>Cognitive Load: Balanced (12 Active Threads)</span>
                  </div>
                </div>

                {/* Workforce health grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Workforce Health</span>
                    <span className="text-2xl font-black text-stone-900 mt-1 block font-mono">100.0%</span>
                    <span className="text-[9px] text-emerald-600 block font-mono mt-1 font-bold">Zero fail constraints</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Running Tasks</span>
                    <span className="text-2xl font-black text-indigo-600 mt-1 block font-mono">{runningCount}</span>
                    <span className="text-[9px] text-stone-500 block font-mono mt-1">Queued Threads: {queuedCount}</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Approval Queue</span>
                    <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">{approvals.length}</span>
                    <span className="text-[9px] text-red-600 block font-mono mt-1 font-bold">Awaiting Human Consent</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Task Accomplished (Phase 8)</span>
                    <span className="text-2xl font-black text-stone-900 mt-1 block font-mono">{totalCompletedTasks + 412}</span>
                    <span className="text-[9px] text-emerald-600 block font-mono mt-1 font-bold">SLA Compliance: 99.8%</span>
                  </div>
                </div>

                {/* Co-ordinated Org Chart Overview and Live Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Interactive Human Approval Center */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                        <span className="text-xs font-bold text-stone-900 uppercase font-mono">Human Approval Center (High-Risk Gates)</span>
                      </div>
                      <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded uppercase font-bold">Action Required</span>
                    </div>

                    {approvals.length === 0 ? (
                      <div className="p-8 text-center text-stone-400 font-mono text-xs">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                        <span>All high-risk pipelines authorized and clear. Invariant safe.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {approvals.map((app) => (
                          <div key={app.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-bold text-stone-900 block font-sans">{app.title}</span>
                                <span className="text-[9px] font-mono text-stone-500">Initiated by {app.agent} • {app.category} • {app.date}</span>
                              </div>
                              <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                app.risk === "Critical" ? "bg-red-100 text-red-800 border border-red-300 animate-pulse" : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}>
                                {app.risk} Risk
                              </span>
                            </div>

                            <div className="text-xs text-stone-600 bg-white border border-stone-200 rounded-lg p-3 space-y-1.5 font-mono">
                              <p><strong>Proposed Action:</strong> {app.description}</p>
                              <p><strong>Policy Applied:</strong> <span className="text-emerald-700 font-semibold">{app.policyApplied}</span></p>
                              <p><strong>System Alternative Evaluated:</strong> {app.alternatives}</p>
                            </div>

                            <div className="flex items-center space-x-2 justify-end">
                              <button
                                onClick={() => handleApproval(app.id, "Rejected")}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-mono font-bold uppercase"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject Action</span>
                              </button>
                              <button
                                onClick={() => handleApproval(app.id, "Approved")}
                                className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded text-[10px] font-mono font-bold uppercase"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve & Execute</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Live Agent Task Streams */}
                  <div className="border border-stone-200 rounded-xl p-4 flex flex-col">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block border-b border-stone-100 pb-2 mb-3">Live Task Streams</span>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
                      {tasks.map((tk) => (
                        <div key={tk.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[11px] font-bold text-stone-900 block leading-tight">{tk.name}</span>
                              <span className="text-[9px] font-mono text-stone-400">{tk.agent} • {tk.startedAt}</span>
                            </div>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              tk.status === "completed" ? "bg-emerald-100 text-emerald-800" : tk.status === "running" ? "bg-blue-100 text-blue-800 animate-pulse" : "bg-stone-100 text-stone-600"
                            }`}>
                              {tk.status}
                            </span>
                          </div>

                          {tk.status !== "completed" && (
                            <div className="w-full bg-stone-200 rounded-full h-1">
                              <div className="bg-indigo-600 h-1 rounded-full transition-all duration-500" style={{ width: `${tk.progress}%` }}></div>
                            </div>
                          )}

                          {tk.result && (
                            <p className="text-[10px] font-mono bg-white border border-stone-200 rounded p-1.5 text-stone-600 leading-tight">
                              <strong>Output:</strong> {tk.result}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Organization Chart visual layout */}
                <div className="border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-4">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block">AI Workforce Organization Layout</span>
                    <span className="text-[10px] font-mono text-stone-400">Governance: Checked</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
                    {/* Layer 1: Chief of Staff */}
                    <div className="md:col-span-3 bg-stone-900 text-white rounded-xl p-3 border border-stone-950 max-w-sm mx-auto w-full">
                      <span className="font-bold block text-emerald-400">Gabriel</span>
                      <span className="text-[9px] font-mono opacity-80 block">Chief of Staff & Coordinator</span>
                    </div>

                    {/* Left Layer: C-Suite Advisory Group */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-mono text-stone-400 block font-bold uppercase">Executive Cabinet</span>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                        <div className="p-1.5 bg-white border border-stone-200 rounded">CEO Advisor</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">CFO Advisor</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">CTO Advisor</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">Chief Risk Officer</div>
                      </div>
                    </div>

                    {/* Middle Layer: Specialized Technicians */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-mono text-stone-400 block font-bold uppercase">Software & DevOps Engineers</span>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                        <div className="p-1.5 bg-white border border-stone-200 rounded">Software Architect</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">Senior Developer</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">SQL Optimizer</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">DevOps Engineer</div>
                      </div>
                    </div>

                    {/* Right Layer: Operations & Support Specialist */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-mono text-stone-400 block font-bold uppercase">Operations Specialists</span>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                        <div className="p-1.5 bg-white border border-stone-200 rounded font-semibold text-emerald-800">Islamic Compliance</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">Manufacturing Engineer</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">Email Assistant</div>
                        <div className="p-1.5 bg-white border border-stone-200 rounded">Document Processor</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 2: AGENT DIRECTORY & INSPECTOR */}
            {activeSubTab === "directory" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">Corporate Agent Directory</h2>
                  <p className="text-xs text-stone-500 font-mono">Inspect cognitive profiles, tool access bounds, memory capacities, and delegation parameters</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: List and Filter */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search roster (e.g. CFO, SQL)..."
                        value={agentQuery}
                        onChange={(e) => setAgentQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none text-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[450px]">
                      {filteredAgents.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            setSelectedAgentId(a.id);
                            onAddSignalREvent(`Inspecting agent profile: ${a.name}`);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition border text-xs flex items-center justify-between ${
                            selectedAgentId === a.id
                              ? "bg-stone-900 border-stone-950 text-white font-bold shadow-sm"
                              : "bg-white border-stone-200 hover:bg-stone-50 text-stone-800"
                          }`}
                        >
                          <div>
                            <span className="block font-bold">{a.name}</span>
                            <span className="text-[10px] opacity-75 font-mono">{a.role}</span>
                          </div>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${
                            selectedAgentId === a.id
                              ? "bg-emerald-800 text-emerald-100"
                              : "bg-stone-100 text-stone-600"
                          }`}>
                            {a.group}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Detailed Inspector */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 font-sans">{activeAgent.name} Cognitive Blueprint</h3>
                        <p className="text-xs text-stone-400 font-mono">{activeAgent.role}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        activeAgent.riskLevel === "Critical" ? "bg-red-100 text-red-800 border border-red-300" : activeAgent.riskLevel === "High" ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}>
                        {activeAgent.riskLevel} Decision Risk Limit
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="space-y-1 bg-stone-50 border border-stone-200 rounded-lg p-3">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Mission Objective</span>
                        <p className="text-stone-700 leading-relaxed font-sans">{activeAgent.mission}</p>
                      </div>

                      <div className="space-y-1 bg-stone-50 border border-stone-200 rounded-lg p-3">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Capabilities</span>
                        <p className="text-stone-700 leading-relaxed font-sans">{activeAgent.capabilities}</p>
                      </div>

                      <div className="space-y-1 bg-stone-50 border border-stone-200 rounded-lg p-3">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Memory & Context Range</span>
                        <p className="text-stone-800 font-bold">{activeAgent.memoryScope}</p>
                      </div>

                      <div className="space-y-1 bg-stone-50 border border-stone-200 rounded-lg p-3">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Authorized Actions Bounds</span>
                        <span className="text-stone-800 font-semibold block text-emerald-800">Must run through Compliance rule audits</span>
                      </div>
                    </div>

                    {/* Interactive Task Delegation to selected Agent */}
                    <form onSubmit={handleDelegationSubmit} className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50/50">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-bold text-stone-900 uppercase font-mono">Delegate Task to {activeAgent.name}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Task command (e.g. Screen ticker TSLA)"
                          value={delegationForm.taskName}
                          onChange={(e) => setDelegationForm(prev => ({ ...prev, taskName: e.target.value }))}
                          className="bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 sm:col-span-2"
                        />
                        <select
                          value={delegationForm.priority}
                          onChange={(e) => setDelegationForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[10px] py-2 rounded uppercase font-bold tracking-wider"
                      >
                        Issue Task & Trigger Execution Loop
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 3: AUTOMATION BUILDER */}
            {activeSubTab === "automation" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">Orchestrated Workflow Platform</h2>
                  <p className="text-xs text-stone-500 font-mono">Create triggers, bind agent dependencies, map execution priorities, and run compensation actions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Workflow Designer */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block">Visual Workflow Designer</span>

                    {/* Step Sequence Mock layout */}
                    <div className="space-y-4 relative">
                      <div className="flex items-center space-x-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="bg-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0">1</div>
                        <div>
                          <span className="text-xs font-bold text-stone-950 block">Trigger: Webhook - Incidents Logs Intake</span>
                          <span className="text-[10px] font-mono text-stone-500">Route: /api/v1/mes/incident_ingest</span>
                        </div>
                      </div>

                      <div className="h-4 w-0.5 bg-stone-300 ml-6"></div>

                      <div className="flex items-center space-x-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <div className="bg-stone-700 text-white h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0">2</div>
                        <div>
                          <span className="text-xs font-bold text-stone-950 block">Action: Agent Ingest - Root Cause Discovery</span>
                          <span className="text-[10px] font-mono text-stone-500">Assigned Agent: Manufacturing Engineer • Timeout: 120s</span>
                        </div>
                      </div>

                      <div className="h-4 w-0.5 bg-stone-300 ml-6"></div>

                      <div className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="bg-amber-600 text-white h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0">3</div>
                        <div>
                          <span className="text-xs font-bold text-stone-950 block">Condition: Risk Interlock Checklist</span>
                          <span className="text-[10px] font-mono text-stone-500">Filter: If Priority is 'Critical' -&gt; Hold for Approval Gate</span>
                        </div>
                      </div>

                      <div className="h-4 w-0.5 bg-stone-300 ml-6"></div>

                      <div className="flex items-center space-x-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <div className="bg-stone-700 text-white h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0">4</div>
                        <div>
                          <span className="text-xs font-bold text-stone-950 block">Action: Event Bus Publish</span>
                          <span className="text-[10px] font-mono text-stone-500">Emit event: IssueResolved • Notify operator over SignalR</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          onAddSignalREvent("Initiated draft workflow schema creation.");
                          alert("Workflow Designer: Customized sequence can be exported via JSON to ASP.NET Quartz pipeline.");
                        }}
                        className="bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] px-3 py-1.5 rounded uppercase font-bold"
                      >
                        Publish Custom Workflow
                      </button>
                    </div>
                  </div>

                  {/* Right: Workflows Library list with activation toggles */}
                  <div className="border border-stone-200 rounded-xl p-4 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block border-b border-stone-100 pb-2">Process Automation Library</span>

                    <div className="space-y-3">
                      {workflows.map((wf) => (
                        <div key={wf.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-bold text-stone-900 block leading-tight">{wf.name}</span>
                              <span className="text-[9px] font-mono text-stone-400">Trigger: {wf.trigger}</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                              Active
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="font-mono text-stone-500">Steps count: {wf.actionsCount}</span>
                            <button
                              onClick={() => {
                                onAddSignalREvent(`Manually triggered automation: ${wf.name}`);
                                const updated = {
                                  id: "task_wf_" + Date.now(),
                                  name: `WF Exec: ${wf.name}`,
                                  agent: "Chief Automation Officer",
                                  status: "completed",
                                  progress: 100,
                                  priority: "Medium",
                                  startedAt: "Operator fired",
                                  result: "Workflow finished with exit code 0."
                                };
                                setTasks(prev => [updated, ...prev]);
                              }}
                              className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono font-bold px-2 py-0.5 rounded uppercase text-[8px]"
                            >
                              Run Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 4: MCP RUNTIME */}
            {activeSubTab === "mcp" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">Model Context Protocol (MCP) Runtime</h2>
                  <p className="text-xs text-stone-500 font-mono">Registry of secure sandbox APIs, telemetry counts, and Enterprise OAuth Connectors</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Tool Discovery & Permissions */}
                  <div className="lg:col-span-2 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block">Registered MCP Tools Sandbox</span>

                    <div className="space-y-3">
                      {mcpTools.map((tool) => (
                        <div key={tool.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-xs font-black text-indigo-950 block">{tool.name} (v{tool.version})</span>
                              <span className="text-xs text-stone-600 font-sans leading-tight block mt-1">{tool.description}</span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase">{tool.status}</span>
                          </div>

                          <div className="text-[10px] font-mono pt-1 flex justify-between border-t border-stone-200/60 pt-2 text-stone-400">
                            <span>Security: {tool.permissions}</span>
                            <span className="text-stone-500 font-bold">{tool.telemetry}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Live Integrations connectors status */}
                  <div className="border border-stone-200 rounded-xl p-4 space-y-4">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block border-b border-stone-100 pb-2">Active Connector Bridges</span>

                    <div className="space-y-3">
                      {connectors.map((c, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 block leading-tight">{c.name}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              c.status === "Connected" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-stone-400 block">{c.auth}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 5: AI CODING PLATFORM */}
            {activeSubTab === "coding" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">AI Coding Platform</h2>
                  <p className="text-xs text-stone-500 font-mono">Automated repository management, SQL Server performance scans, and peer code reviews</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pull Request Audit Simulation */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-indigo-950 uppercase font-mono block">Automated Code Review Sandbox</span>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded uppercase font-bold">Diagnostics Out</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-stone-900 rounded-lg text-white font-mono text-[11px] overflow-x-auto space-y-1">
                        <span className="text-emerald-400 block">{codeReviewPr.title}</span>
                        <p className="opacity-80 leading-relaxed">{codeReviewPr.diff}</p>
                      </div>

                      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <BrainCircuit className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-bold text-indigo-950 uppercase font-mono">Software Architect Feedback</span>
                        </div>
                        <p className="text-xs text-indigo-900 leading-relaxed font-sans">{codeReviewPr.architectReview}</p>
                      </div>

                      <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                        <span className="font-mono text-stone-400 block uppercase text-[10px]">Auto Generated Standard Operating Procedure</span>
                        <p className="font-bold text-stone-900 font-sans">{codeReviewPr.autoSop}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          onAddSignalREvent("Triggered automated repository dependency audit...");
                          alert("Dependency scan: All 26 imported modules are secure and match strict offline SHA validation rules.");
                        }}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-[9px] px-3 py-1.5 rounded uppercase font-bold"
                      >
                        Dependency Audit
                      </button>
                      <button
                        onClick={() => {
                          onAddSignalREvent("Triggered custom schema migration checklist...");
                          alert("Schema checks: Code is fully in sync with EF Core schema.");
                        }}
                        className="bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] px-3 py-1.5 rounded uppercase font-bold"
                      >
                        Compile Migration SQL
                      </button>
                    </div>
                  </div>

                  {/* Codebase Diagnostics */}
                  <div className="border border-stone-200 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 uppercase font-mono block border-b border-stone-100 pb-2 mb-3">Diagnostic Status</span>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between border-b border-stone-100 pb-1.5">
                          <span className="text-stone-400">EF Core Models</span>
                          <span className="font-bold text-emerald-600">Sync Invariant</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 pb-1.5">
                          <span className="text-stone-400">Deadlock Risk</span>
                          <span className="font-bold text-emerald-600">0% (Low)</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 pb-1.5">
                          <span className="text-stone-400">SLA Success Ratio</span>
                          <span className="font-bold text-stone-900">99.8%</span>
                        </div>
                        <div className="flex justify-between pb-1.5">
                          <span className="text-stone-400">Active Branches</span>
                          <span className="font-bold text-indigo-600">main, prod-jannah</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] leading-relaxed">
                      <strong>AI Coding Platform Invariant:</strong> Every generated PR triggers compliance testing automatically before merge proposals reach the human approval queue.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 6: DECISION GOVERNANCE */}
            {activeSubTab === "governance" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">Decision Governance & Audit Viewer</h2>
                  <p className="text-xs text-stone-500 font-mono">Permanent ledger records mapping model reasoning, policy constraints, and Shariah validation metrics</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block">Audit Logs</span>
                    <button
                      onClick={() => {
                        setAuditLogs(() => loadState("auditLogs", []));
                        onAddSignalREvent("Synchronized audit trail with system log database.");
                      }}
                      className="text-stone-600 font-mono text-[9px] hover:underline uppercase"
                    >
                      Sync Audit Log Feed
                    </button>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-indigo-950 uppercase text-[10px]">{log.event}</span>
                            <span className="text-stone-400">|</span>
                            <span className="text-[10px] text-stone-500 font-bold">{log.agent}</span>
                          </div>
                          <span className="text-[9px] text-stone-400 font-bold">{log.timestamp}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed font-sans">{log.details}</p>
                        <div className="flex items-center justify-between text-[8px] pt-1 text-stone-400 uppercase font-bold">
                          <span>Category: {log.category}</span>
                          <span className="text-emerald-700">Shariah Invariant: OK</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 7: ANALYTICS */}
            {activeSubTab === "analytics" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">AI Workforce Automation Analytics</h2>
                  <p className="text-xs text-stone-500 font-mono">Consolidated telemetry charts on model executions, automation success ratios, and saved human hours</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Recharts Automation Success & Failure */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold text-stone-900 uppercase font-mono block">Automation Success VS Failure Rates (YTD)</span>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { week: "W24", Success: 42, Failure: 1 },
                            { week: "W25", Success: 55, Failure: 0 },
                            { week: "W26", Success: 68, Failure: 2 },
                            { week: "W27", Success: 84, Failure: 0 },
                            { week: "W28", Success: 110, Failure: 1 }
                          ]}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <XAxis dataKey="week" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                          <YAxis tick={{ fontSize: 9, fontFamily: "monospace" }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <Tooltip contentStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                          <Bar dataKey="Success" fill="#10b981" />
                          <Bar dataKey="Failure" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Accumulated Business Value */}
                  <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 uppercase font-mono block border-b border-stone-100 pb-2 mb-3">Value Realized</span>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Operator Hours Saved</span>
                          <span className="text-3xl font-black text-stone-900 mt-1 block font-mono">248.5 hrs</span>
                          <span className="text-[9px] text-emerald-600 font-mono block mt-0.5">↑ 18.2 hours this week</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Estimated Financial Value</span>
                          <span className="text-3xl font-black text-emerald-600 mt-1 block font-mono">£12,425.00</span>
                          <span className="text-[9px] text-stone-500 font-mono block mt-0.5">Calculated at £50/hr consultant rate equivalence</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-[11px] leading-normal font-sans">
                      <strong>Phase 8 Telemetry Statement:</strong> Automation has successfully processed 98.4% of non-critical support tickets with zero intervention.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-WORKSPACE 8: SYSTEM DIAGNOSTICS */}
            {activeSubTab === "diagnostics" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900 font-sans">Governance & Compliance Testing Sandbox</h2>
                  <p className="text-xs text-stone-500 font-mono">Run compliance test suites to verify system invariants and inspect real-time logs</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Test Suite list */}
                  <div className="lg:col-span-1 border border-stone-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 uppercase font-mono">Test Suites (90%+ Target)</span>
                      {testCoverage > 0 && (
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">{testCoverage}% Coverage</span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {tests.map((t) => (
                        <div key={t.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-800 truncate max-w-[180px]">{t.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            t.status === "Passed" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={executeTests}
                      disabled={isRunningTests}
                      className="w-full bg-stone-900 hover:bg-stone-850 disabled:bg-stone-400 text-white font-mono text-[10px] py-2.5 rounded uppercase font-bold tracking-wider"
                    >
                      {isRunningTests ? "Running Invariant Verifications..." : "Execute Full Verification Suite"}
                    </button>
                  </div>

                  {/* Right Column: Console Outputs */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-4 bg-stone-950 text-stone-200 font-mono text-xs flex flex-col justify-between h-[450px]">
                    <div className="space-y-1.5 overflow-y-auto flex-1 pr-2">
                      <div className="text-emerald-400 border-b border-stone-800 pb-2 mb-2 font-black uppercase text-[10px]">
                        SYSTEM TEST EXECUTION OUTPUT WINDOW (v0.8.0)
                      </div>
                      {testLogs.length === 0 ? (
                        <div className="text-stone-500 h-full flex items-center justify-center text-center">
                          Awaiting execution trigger...
                        </div>
                      ) : (
                        testLogs.map((log, idx) => (
                          <div key={idx} className={log.includes("[PASS]") ? "text-emerald-400" : log.includes("[EXEC]") ? "text-indigo-300" : "text-stone-300"}>
                            {log}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-stone-800 pt-3 text-[10px] text-stone-500 flex justify-between uppercase">
                      <span>Invariants Checked: {tests.filter(t => t.status === "Passed").length} of {tests.length}</span>
                      <span>Target: Shariah & Operations Invariant Safe</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Embedded Documentation & Specs with Mermaid SVG layout */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900 uppercase font-mono border-b border-stone-100 pb-2 mb-4">
          Phase 8 System Architecture & Integration Model
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-stone-600">
          <div>
            <h4 className="font-bold text-stone-900 mb-2 font-sans">Orchestrated AI Workforce Architecture</h4>
            <p className="mb-3">
              The autonomous workforce is layered into specialized modules. Every action executes within a Sandboxed Node context complying with <strong>Role-Based Access Controls (RBAC)</strong>. High-risk requests bypass automated execution and route dynamically to the operator's human gate.
            </p>
            <p className="mb-3">
              <strong>Islamic Compliance Loop:</strong> All transactions and financial forecasting models evaluate through the AAOIFI guidelines engine. Any interest exposure is caught immediately and routed to the purification sub-ledger prior to ledger finalization.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] font-mono text-stone-500">
              <li>SignalR Real-Time Event Dispatching</li>
              <li>MediatR CQRS Command-Query Separation</li>
              <li>Hangfire Persistent Scheduled Workflows</li>
              <li>OAuth secret token isolation patterns</li>
            </ul>
          </div>

          {/* SVG representation of Mermaid Integration Flow */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-center items-center">
            <span className="text-[10px] font-mono text-stone-400 font-bold uppercase mb-2">Live Integration Flow Spec</span>
            <svg viewBox="0 0 400 180" className="w-full max-w-sm">
              {/* Box 1: Webhook Trigger */}
              <rect x="10" y="70" width="80" height="40" rx="6" fill="#f5f5f4" stroke="#a8a29e" strokeWidth="1.5" />
              <text x="50" y="95" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#292524" fontWeight="bold">Ingress</text>

              {/* Arrow */}
              <path d="M 90 90 L 130 90" stroke="#78716c" strokeWidth="1.5" markerEnd="url(#arrow)" />

              {/* Box 2: Orchestrator Decision */}
              <rect x="140" y="50" width="100" height="80" rx="8" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.5" />
              <text x="190" y="80" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#1e1b4b" fontWeight="bold">AI Engine</text>
              <text x="190" y="95" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#312e81">Gabriel Chief</text>
              <text x="190" y="110" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#312e81">Of Staff</text>

              {/* Arrow Up: High Risk Approval */}
              <path d="M 190 50 L 190 25 L 290 25" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
              <rect x="290" y="10" width="90" height="30" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
              <text x="335" y="28" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#7f1d1d" fontWeight="bold">Human Gate</text>

              {/* Arrow Straight: Compliance & Publish */}
              <path d="M 240 90 L 290 90" stroke="#78716c" strokeWidth="1.5" />
              <rect x="290" y="70" width="90" height="40" rx="6" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
              <text x="335" y="90" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#064e3b" fontWeight="bold">Compliance Pass</text>
              <text x="335" y="102" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#065f46">Emit Event</text>

              {/* Arrow Markers */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#78716c" />
                </marker>
              </defs>
            </svg>
            <span className="text-[9px] font-mono text-stone-400 mt-2">Diagram: mediatR CQRS pipeline & validation flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Helper component to avoid compile issues
function BookMarkedIcon(props: any) {
  return <Bookmark {...props} />;
}
