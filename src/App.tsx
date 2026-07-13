import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  BrainCircuit,
  Activity,
  Layers,
  Database,
  Users,
  Scale,
  Heart,
  DollarSign,
  Flame,
  GraduationCap,
  Clock,
  Code,
  Terminal,
  Cpu,
  Settings,
  Info,
  Key,
  Lock,
  MessageSquare,
  Sparkles,
  Bell,
  Search,
  CheckCircle2,
  BookOpen,
  Compass,
  Moon,
  Building2,
  Boxes,
  Network
} from "lucide-react";

// Components imports
import NotificationCenter, { SystemNotification } from "./components/NotificationCenter";
import CommandPalette from "./components/CommandPalette";
import AuthView from "./components/AuthView";
import VaultView from "./components/VaultView";
import AIWorkforceView from "./components/AIWorkforceView";
import PlannerCalendarView from "./components/PlannerCalendarView";
import SettingsView from "./components/SettingsView";
import ScaffoldExplorerView, { ScaffoldFileLocal } from "./components/ScaffoldExplorerView";
import AiChatView from "./components/AiChatView";
import DashboardView from "./components/DashboardView";
import KnowledgeHubView from "./components/KnowledgeHubView";
import ExecutivePlannerView from "./components/ExecutivePlannerView";
import IslamOSView from "./components/IslamOSView";
import EnterpriseOSView from "./components/EnterpriseOSView";
import DataPlatformView from "./components/DataPlatformView";
import ProductionOperationsView from "./components/ProductionOperationsView";
import ProjectJannahView from "./components/ProjectJannahView";
import StrategicIntelligenceView from "./components/StrategicIntelligenceView";
import AutonomousIntelligenceView from "./components/AutonomousIntelligenceView";
import EnterpriseIntegrationView from "./components/EnterpriseIntegrationView";
import AutonomousMissionControlView from "./components/AutonomousMissionControlView";
import EnterpriseAiOrganizationView from "./components/EnterpriseAiOrganizationView";
import LifeOsIntelligenceNetworkView from "./components/LifeOsIntelligenceNetworkView";

// Types
import { UserProfile, ActiveSession, SystemScore, ChatMessage } from "./types";

const scaffoldFileTree: ScaffoldFileLocal[] = [
  {
    name: "docs",
    path: "docs",
    type: "folder",
    children: [
      { name: "ARCHITECTURE.md", path: "docs/ARCHITECTURE.md", type: "file", description: "Clean Architecture & CQRS specs" },
      { name: "LIFE_KERNEL_SPEC.md", path: "docs/LIFE_KERNEL_SPEC.md", type: "file", description: "Mermaid-driven core system specifications" },
      { name: "CODING_STANDARDS.md", path: "docs/CODING_STANDARDS.md", type: "file", description: "DDD style guides & C# patterns" },
      { name: "PROMPT_STANDARDS.md", path: "docs/PROMPT_STANDARDS.md", type: "file", description: "AI Memory & Gabriel Agent prompts" },
      { name: "CONTEXT_ENGINEERING.md", path: "docs/CONTEXT_ENGINEERING.md", type: "file", description: "Telemetry window pipelines" }
    ]
  },
  {
    name: "backend",
    path: "backend",
    type: "folder",
    children: [
      { name: "LifeOS.sln", path: "backend/LifeOS.sln", type: "file", description: "Visual Studio solution file" },
      {
        name: "src",
        path: "backend/src",
        type: "folder",
        children: [
          {
            name: "LifeOS.Domain",
            path: "backend/src/LifeOS.Domain",
            type: "folder",
            children: [
              {
                name: "Kernel",
                path: "backend/src/LifeOS.Domain/Kernel",
                type: "folder",
                children: [
                  { name: "LifeKernelEvents.cs", path: "backend/src/LifeOS.Domain/Kernel/LifeKernelEvents.cs", type: "file", description: "Kernel-level events & structures" },
                  { name: "ModuleRegistry.cs", path: "backend/src/LifeOS.Domain/Kernel/ModuleRegistry.cs", type: "file", description: "Topological dependency module registry" },
                  { name: "EventBus.cs", path: "backend/src/LifeOS.Domain/Kernel/EventBus.cs", type: "file", description: "Enterprise Event Store, Retry policy & DLQ" },
                  { name: "LifeGraph.cs", path: "backend/src/LifeOS.Domain/Kernel/LifeGraph.cs", type: "file", description: "Graph node, edge, and dependency engine" },
                  { name: "PolicyEngine.cs", path: "backend/src/LifeOS.Domain/Kernel/PolicyEngine.cs", type: "file", description: "Executable life invariant policy evaluator" },
                  { name: "GoalEngine.cs", path: "backend/src/LifeOS.Domain/Kernel/GoalEngine.cs", type: "file", description: "Hierarchical goal alignment tree" }
                ]
              },
              { name: "SalahLog.cs", path: "backend/src/LifeOS.Domain/Entities/SalahLog.cs", type: "file", description: "Pure C# Domain aggregate root" }
            ]
          },
          {
            name: "LifeOS.Application",
            path: "backend/src/LifeOS.Application",
            type: "folder",
            children: [
              {
                name: "Kernel",
                path: "backend/src/LifeOS.Application/Kernel",
                type: "folder",
                children: [
                  { name: "ICognitiveMemoryCore.cs", path: "backend/src/LifeOS.Application/Kernel/ICognitiveMemoryCore.cs", type: "file", description: "Cognitive core abstractions" },
                  { name: "ContextEngine.cs", path: "backend/src/LifeOS.Application/Kernel/ContextEngine.cs", type: "file", description: "ContextBuilder & compressor pipeline" },
                  { name: "MemoryEngine.cs", path: "backend/src/LifeOS.Application/Kernel/MemoryEngine.cs", type: "file", description: "Multi-layer memory manager & lifecycle manager" },
                  { name: "DecisionEngine.cs", path: "backend/src/LifeOS.Application/Kernel/DecisionEngine.cs", type: "file", description: "Strategic and Islamic alignment optimizer" },
                  { name: "AiOrchestrator.cs", path: "backend/src/LifeOS.Application/Kernel/AiOrchestrator.cs", type: "file", description: "Gabriel CoS and sub-agent team orchestrator" },
                  { name: "ReflectionEngine.cs", path: "backend/src/LifeOS.Application/Kernel/ReflectionEngine.cs", type: "file", description: "Daily, Weekly, and Annual review analyzer" }
                ]
              },
              { name: "LogSalahCommand.cs", path: "backend/src/LifeOS.Application/Features/Salah/Commands/LogSalahCommand.cs", type: "file", description: "C# MediatR CQRS Command" }
            ]
          },
          {
            name: "LifeOS.Infrastructure",
            path: "backend/src/LifeOS.Infrastructure",
            type: "folder",
            children: [
              {
                name: "Kernel",
                path: "backend/src/LifeOS.Infrastructure/Kernel",
                type: "folder",
                children: [
                  { name: "LifeKernelEventBus.cs", path: "backend/src/LifeOS.Infrastructure/Kernel/LifeKernelEventBus.cs", type: "file", description: "In-memory MediatR-aligned event router" },
                  { name: "CognitiveMemoryCore.cs", path: "backend/src/LifeOS.Infrastructure/Kernel/CognitiveMemoryCore.cs", type: "file", description: "Context and compaction implementation" },
                  { name: "KernelInfrastructure.cs", path: "backend/src/LifeOS.Infrastructure/Kernel/KernelInfrastructure.cs", type: "file", description: "Telemetry, Scheduler & AI Skill runtimes" }
                ]
              },
              { name: "QdrantVectorStore.cs", path: "backend/src/LifeOS.Infrastructure/Services/QdrantVectorStore.cs", type: "file", description: "Qdrant Dense Vector store" }
            ]
          },
          {
            name: "LifeOS.Tests",
            path: "backend/src/LifeOS.Tests",
            type: "folder",
            children: [
              { name: "KernelTests.cs", path: "backend/src/LifeOS.Tests/KernelTests.cs", type: "file", description: "Full xUnit Core & Engine test suites" }
            ]
          },
          {
            name: "LifeOS.WebApi",
            path: "backend/src/LifeOS.WebApi",
            type: "folder",
            children: [
              { name: "Program.cs", path: "backend/src/LifeOS.WebApi/Program.cs", type: "file", description: "Minimal APIs & DI wiring" }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "frontend",
    path: "frontend",
    type: "folder",
    children: [
      {
        name: "src",
        path: "frontend/src",
        type: "folder",
        children: [
          { name: "page.tsx", path: "frontend/src/app/page.tsx", type: "file", description: "React 19 NextJS view page" },
          { name: "useSalahTracker.ts", path: "frontend/src/hooks/useSalahTracker.ts", type: "file", description: "Cache invalidating state hook" }
        ]
      }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("lifeos_intelligence_network");
  const [selectedFile, setSelectedFile] = useState<ScaffoldFileLocal | null>(scaffoldFileTree[0].children?.[0] || null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Command & Notification panel state variables
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">("light");

  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>("Ethan");

  // Mock global notifications feed (Simulated SignalR broadcast pool)
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "not1",
      title: "Core Kernel Initialized",
      description: "Stage 3 LifeOS executive center online. Dynamic double-entry books linked.",
      category: "system",
      priority: "medium",
      timestamp: "Just now",
      isRead: false
    },
    {
      id: "not2",
      title: "Salah Window Impending",
      description: "Dhuhr congregational prayer starting in 25 mins. Aligning scheduler variables.",
      category: "prayer",
      priority: "high",
      timestamp: "12 mins ago",
      isRead: false
    },
    {
      id: "not3",
      title: "Gold Asset Purchase Flagged",
      description: "Surplus cash evaluated. Automatic asset allocation recommended to hedge inflation.",
      category: "goal",
      priority: "low",
      timestamp: "1 hour ago",
      isRead: true
    }
  ]);

  // Real-time Event Broadcaster (SignalR Feed)
  const [signalREvents, setSignalREvents] = useState<string[]>([
    "Initialised SignalR Hub on ws://127.0.0.1:3000/hubs/life",
    "Connected successfully with Client ID: cx_jannah_92f1",
    "Subscribed to topic: 'LifeOS.Domain.Events.SalahLoggedEvent'",
    "Subscribed to topic: 'LifeOS.Domain.Events.LedgerTransactionAddedEvent'"
  ]);

  // Master scores calculated live by backend endpoint
  const [scores, setScores] = useState<SystemScore>({
    overall: 88,
    faith: 82,
    marriage: 84,
    health: 78,
    career: 85,
    business: 80,
    finance: 87,
    learning: 89,
    discipline: 82,
    consistency: 86
  });

  // Master profile parameters injected into Gabriel AI prompts
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Ethan",
    vision: "Build high-impact halal technology solutions while maintaining strict devotion to daily prayer, peak physical health, and family harmony.",
    currentGoal: "Establish Phase 3 Identity, Authentication, and Executive Command Center",
    preferences: {
      aiPersonality: "strategic",
      compactThreshold: 80,
      speechEnabled: false,
      energyPreferences: "focused",
      workingHours: "08:00 - 18:00",
      learningPreferences: "visual"
    },
    notifications: {
      policyViolations: true,
      goalProgress: true,
      prayerReminders: true,
      learningReminders: false,
      healthAlerts: true
    },
    privacy: {
      developerLogsEnabled: true,
      telemetrySharing: true,
      vectorDbSync: true
    },
    islamicPreferences: {
      prayerCalculationMethod: "ISNA",
      timezone: "GMT",
      location: "London, UK",
      language: "en"
    },
    personalInfo: {
      marriageStatus: "Married",
      emergencyContacts: "+447700900077",
      occupation: "AI Architect",
      education: "MSc Computer Science"
    },
    strategic: {
      values: ["Faith", "Legacy", "Discipline"],
      missionStatement: "Elevate humanity with clean tech",
      corePrinciples: ["Islamic integrity", "Open-source", "No-interest finance"]
    }
  });

  // AI Chat Messages database list
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "chat_1",
      role: "assistant",
      content: "Assalamu alaykum, Ethan. I am **Gabriel**, your AI Chief of Staff. I have indexed the Complete Phase 3 Executive Center scaffold of Project Jannah. How shall we align your personal goals, Deen telemetry, halal finances, or professional learning tracks today?",
      timestamp: "Just now",
      isPinned: false,
      referencedPolicies: ["Prayer boundary calculation constant", "Halal portfolio check threshold"],
      referencedMemories: ["User bio-metric recovery levels", "Weekly marital chore schedule"],
      reasoningTrace: [
        "Index user profile context variables.",
        "Check local non-negotiable spiritual constraints (Salah window alignment).",
        "Formulate optimized workflow advice based on 5.8hr sleep deficit."
      ]
    }
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch current score aggregates from backend
  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (err) {
      console.error("Could not fetch score aggregates from server.", err);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // Sync virtual SignalR event trigger
  const addSignalREvent = (msg: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] Broadcast: ${msg}`;
    setSignalREvents((prev) => [formatted, ...prev.slice(0, 18)]);
  };

  const handleSendMessage = async (text: string, activeAgentId: string) => {
    if (!text.trim() || sendingMessage) return;

    const userMsg: ChatMessage = {
      id: "msg_user_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setSendingMessage(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile,
          activeAgent: activeAgentId
        })
      });

      if (!res.ok) {
        throw new Error("Cognitive connection to Gabriel was interrupted.");
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: "msg_assistant_" + Date.now(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString(),
        reasoningTrace: [
          `Target agent: ${activeAgentId}`,
          "Parsing incoming message structure for C# commands.",
          "Analyzing life scores consistency against user goal targets.",
          "Generating ASP.NET MediatR command blocks."
        ],
        referencedPolicies: ["Islamic prayer validation pipeline", "Halal assets allocation bounds"],
        referencedMemories: ["Ethan's life vision statement", "Weekly activity history logs"]
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addSignalREvent(`GabrielAgent responded inside dialogue workspace.`);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: `⚠️ **Cognitive Disconnect**: ${err.message || "Gabriel was unable to synthesize a response. Check your API configuration."}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCopyCode = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommandSelect = (actionId: string, value: string) => {
    setShowCommandPalette(false);
    if (actionId === "nav_tab") {
      setActiveTab(value);
      addSignalREvent(`CommandPalette navigated user to: ${value}`);
    } else if (actionId === "add_sample") {
      addSignalREvent(`CommandPalette dispatched dynamic user task: "${value}"`);
    } else if (actionId === "change_focus") {
      setUserProfile((prev) => ({ ...prev, currentGoal: value }));
      addSignalREvent(`CommandPalette updated active target focus to: "${value}"`);
    }
  };

  // Theme support
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-stone-950 text-stone-100 border-stone-800";
      case "high-contrast":
        return "bg-black text-white border-white";
      default:
        return "bg-[#fafaf9] text-[#1c1917]";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-200 ${getThemeClasses()}`}>
      
      {/* Dynamic Upper Top Status Bar */}
      <div className="bg-stone-900 text-stone-400 text-[10px] font-mono py-2 px-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 z-30 shrink-0">
        <div className="flex items-center space-x-3.5">
          <span className="text-emerald-400 flex items-center space-x-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>SYSTEM_SECURED_ONLINE</span>
          </span>
          <span>|</span>
          <span>CODENAME: PROJECT_JANNAH</span>
          <span>|</span>
          <span>STAGE: FOUNDATION EXECUTIVE v0.3.0</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 hover:text-white px-2 py-0.5 rounded text-[9px] border border-stone-700 transition"
          >
            <Search className="h-3 w-3 text-stone-400" />
            <span>Search Console (⌘K)</span>
          </button>
          <span>|</span>
          <span>MSSQL: ACTIVE</span>
          <span>|</span>
          <span>QDRANT: SYNCED</span>
        </div>
      </div>

      {/* Main Beautiful Executive Header */}
      <header className={`border-b shrink-0 transition ${
        theme === "light" ? "bg-white border-stone-200" : "bg-stone-900 border-stone-800"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-900 text-white rounded-xl shadow-md border border-stone-850 shrink-0">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold tracking-tight">LifeOS</h1>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  FOUNDATION CORE
                </span>
              </div>
              <p className="text-[11px] text-stone-500 max-w-xl leading-normal mt-0.5">
                Dynamic execution engine. Personal, Spiritual (Deen), Halal wealth portfolios, and Athletic metrics monitored safely in an encrypted SQLite sandbox.
              </p>
            </div>
          </div>

          {/* Action buttons on the right - Renders Notification Center flyout */}
          <div className="flex items-center space-x-2 shrink-0 self-stretch justify-end md:self-auto relative">
            <NotificationCenter
              notifications={notifications}
              onMarkRead={(id) => {
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                );
                addSignalREvent(`Notification marked read: ${id}`);
              }}
              onClearAll={() => {
                setNotifications([]);
                addSignalREvent("All notifications swept from live feed.");
              }}
              onAddSample={(cat) => {
                const newN: SystemNotification = {
                  id: "not_" + Date.now(),
                  title: `Manual Alert [${cat.toUpperCase()}]`,
                  description: `Simulated event broadcast of category: ${cat}`,
                  category: cat,
                  timestamp: "Just now",
                  isRead: false,
                  priority: "medium"
                };
                setNotifications((prev) => [newN, ...prev]);
                addSignalREvent(`Simulated ${cat} event triggered.`);
              }}
              isOpen={showNotificationCenter}
              onToggle={() => setShowNotificationCenter(!showNotificationCenter)}
              signalREvents={signalREvents}
            />
          </div>
        </div>

        {/* Tab Selector Nav bar */}
        <div className="border-t border-stone-100/60 bg-stone-50/50 px-6 py-2.5 shrink-0 overflow-x-auto">
          <nav className="max-w-7xl mx-auto flex space-x-1.5 font-mono text-[10px]">
            {[
              { id: "lifeos_intelligence_network", label: "Intelligence Network (LIN)", icon: Network },
              { id: "enterprise_ai_organization", label: "Enterprise AI Org (43v3r)", icon: Boxes },
              { id: "autonomous_mission_control", label: "Autonomous Mission Control (PMO)", icon: Layers },
              { id: "enterprise_integration", label: "Enterprise Automation Suite", icon: Cpu },
              { id: "strategic_intelligence", label: "Strategic Intelligence", icon: BrainCircuit },
              { id: "autonomous_intelligence", label: "Autonomous Intelligence Core", icon: Cpu },
              { id: "project_jannah", label: "Gabriel Executive Twin", icon: Sparkles },
              { id: "executive_center", label: "Executive Command Center", icon: Layers },
              { id: "executive_planner", label: "Executive Planner OS", icon: Compass },
              { id: "islamos", label: "IslamOS Control Center", icon: Moon },
              { id: "enterprise_os", label: "Enterprise Business & Finance OS", icon: Building2 },
              { id: "knowledge_hub", label: "Knowledge Hub", icon: BookOpen },
              { id: "planner", label: "Salah & Habiteer Logs", icon: Clock },
              { id: "chat", label: "Gabriel Strategic Chat", icon: MessageSquare },
              { id: "vault", label: "Encrypted Wallet Vault", icon: Key },
              { id: "agents", label: "AI Workforce & Automation Hub", icon: BrainCircuit },
              { id: "data_platform", label: "Intelligence Lakehouse & Twin", icon: Database },
              { id: "operations", label: "Production & DevSecOps Portal", icon: Cpu },
              { id: "scaffold", label: "Scaffold Filesystem", icon: Code },
              { id: "auth", label: "Identity & Cryptography Enclave", icon: Lock },
              { id: "settings", label: "Kernel Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    addSignalREvent(`Switched active workspace viewport: ${tab.label}`);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition ${
                    isActive
                      ? "bg-stone-900 border-stone-950 text-white font-bold shadow-sm"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectAction={handleCommandSelect}
      />

      {/* Main Section Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            
            {/* VIEW -0.3: LIFEOS INTELLIGENCE NETWORK (LIN) PHASE 17 */}
            {activeTab === "lifeos_intelligence_network" && (
              <LifeOsIntelligenceNetworkView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW -0.4: ENTERPRISE AI ORGANIZATION PHASE 16 */}
            {activeTab === "enterprise_ai_organization" && (
              <EnterpriseAiOrganizationView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW -0.5: AUTONOMOUS MISSION CONTROL PHASE 15 */}
            {activeTab === "autonomous_mission_control" && (
              <AutonomousMissionControlView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW -1: STRATEGIC INTELLIGENCE ENGINE PHASE 12 */}
            {activeTab === "strategic_intelligence" && (
              <StrategicIntelligenceView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW -2: AUTONOMOUS INTELLIGENCE CORE PHASE 13 */}
            {activeTab === "autonomous_intelligence" && (
              <AutonomousIntelligenceView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW -3: ENTERPRISE INTEGRATION SUITE PHASE 14 */}
            {activeTab === "enterprise_integration" && (
              <EnterpriseIntegrationView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 0: GABRIEL EXECUTIVE TWIN PHASE 11 */}
            {activeTab === "project_jannah" && (
              <ProjectJannahView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 1: EXECUTIVE DASHBOARD */}
            {activeTab === "executive_center" && (
              <DashboardView
                scores={scores}
                userProfile={userProfile}
                onChangeFocus={(f) => {
                  setUserProfile((prev) => ({ ...prev, currentGoal: f }));
                  addSignalREvent(`Goal target focus variable mutated to: "${f}"`);
                }}
                onNavigate={(t) => setActiveTab(t)}
                onAddSignalREvent={addSignalREvent}
              />
            )}

            {/* VIEW 10: EXECUTIVE PLANNER PHASE 5 */}
            {activeTab === "executive_planner" && (
              <ExecutivePlannerView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 11: ISLAMOS CONTROL CENTER */}
            {activeTab === "islamos" && (
              <IslamOSView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 12: ENTERPRISE BUSINESS & FINANCE OS */}
            {activeTab === "enterprise_os" && (
              <EnterpriseOSView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 9: KNOWLEDGE HUB */}
            {activeTab === "knowledge_hub" && (
              <KnowledgeHubView />
            )}

            {/* VIEW 2: PLANNER & CALENDAR LOGS */}
            {activeTab === "planner" && (
              <PlannerCalendarView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 3: GABRIEL AI CHAT WORKSPACE */}
            {activeTab === "chat" && (
              <AiChatView
                userProfile={userProfile}
                messages={messages}
                onSendMessage={handleSendMessage}
                sendingMessage={sendingMessage}
                onClearHistory={() => {
                  setMessages([]);
                  addSignalREvent("Cleared local chat dialogue log history.");
                }}
                onAddSignalREvent={addSignalREvent}
              />
            )}

            {/* VIEW 4: SECRET VAULT */}
            {activeTab === "vault" && <VaultView />}

            {/* VIEW 5: AGENTS ROSTER */}
            {activeTab === "agents" && (
              <AIWorkforceView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 5.5: UNIFIED INTELLIGENCE LAKEHOUSE & TWIN */}
            {activeTab === "data_platform" && (
              <DataPlatformView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 5.6: PRODUCTION OPERATIONS & DEVSECOPS PORTAL */}
            {activeTab === "operations" && (
              <ProductionOperationsView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 6: SCAFFOLD FILESYSTEM */}
            {activeTab === "scaffold" && (
              <ScaffoldExplorerView
                scaffoldTree={scaffoldFileTree}
                selectedFile={selectedFile}
                onSelectFile={(f) => setSelectedFile(f)}
                fileContent={fileContent}
                loadingFile={loadingFile}
                copied={copied}
                onCopyCode={handleCopyCode}
              />
            )}

            {/* VIEW 7: AUTH & CRYPTO VIEW */}
            {activeTab === "auth" && (
              <AuthView
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  addSignalREvent(`SecurityEngine authenticated session for user: "${user}"`);
                }}
                currentUser={currentUser}
                onLogout={() => {
                  setCurrentUser(null);
                  addSignalREvent("SecurityEngine revoked and ended connected session.");
                }}
              />
            )}

            {/* VIEW 8: KERNEL SETTINGS */}
            {activeTab === "settings" && (
              <SettingsView
                userProfile={userProfile}
                onChangeProfile={(p) => setUserProfile(p)}
                onAddSignalREvent={addSignalREvent}
                theme={theme}
                onChangeTheme={(t) => setTheme(t)}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Two-Column split footer: Live SignalR Broadcaster Log & System branding */}
      <footer className="border-t shrink-0 p-6 bg-stone-900 border-stone-850 text-stone-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-mono text-[10.5px]">
          
          {/* Col 1 & 2: Dynamic SignalR event trace logs */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>SignalR Core Event Trace Broadcast Hub</span>
            </h4>
            <div className="bg-black/45 p-3 rounded-xl border border-stone-800 text-[10px] leading-relaxed max-h-[105px] overflow-y-auto space-y-1 scrollbar-thin">
              {signalREvents.map((ev, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 font-mono text-stone-300">
                  <span className="text-emerald-500 font-bold shrink-0">&gt;</span>
                  <span className="break-all">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: System meta details */}
          <div className="space-y-2 border-l border-stone-800 pl-6 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                System Metadata
              </h4>
              <p className="text-[10px] text-stone-400 mt-1.5 leading-normal">
                Executing in full-stack Sandboxed environment. Ports: nginx:3000 mapped to Node container.
              </p>
            </div>
            
            <p className="text-[9px] text-stone-500 uppercase tracking-wider font-bold pt-2 mt-auto">
              © 2026 Project Jannah • 43v3r Tech
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
