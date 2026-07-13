import React, { useState, useEffect } from "react";
import {
  Sparkles,
  User,
  Activity,
  Calendar,
  Clock,
  Compass,
  Heart,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Terminal,
  Cpu,
  Brain,
  Layers,
  Search,
  BookOpen,
  DollarSign,
  Briefcase,
  HelpCircle,
  Copy,
  ChevronRight,
  Database,
  ArrowRight,
  RefreshCw,
  Clock3,
  Flame,
  Check,
  Send,
  Workflow,
  Plus,
  Trash2,
  Bookmark,
  Share2
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
  LineChart as RechartsLineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface ProjectJannahViewProps {
  onAddSignalREvent?: (msg: string) => void;
  onUpdateScore?: () => void;
}

export default function ProjectJannahView({
  onAddSignalREvent = () => {},
  onUpdateScore = () => {}
}: ProjectJannahViewProps) {
  // Navigation tabs for Project Jannah
  const [activeTab, setActiveTab] = useState<
    | "twin"
    | "concierge"
    | "timeline"
    | "purpose"
    | "legacy"
    | "reviews"
    | "boardroom"
    | "optimization"
    | "api"
    | "tests"
    | "architecture"
  >("twin");

  const STORAGE_KEY_PREFIX = "lifeos_p11_";

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
  // 1. STATE DEFINITIONS
  // --------------------------------------------------

  // Digital Self Model sliders and values
  const [digitalSelf, setDigitalSelf] = useState(() => loadState("digitalSelf", {
    energy: 85,
    focus: 90,
    stress: 30,
    burnout: 15,
    motivation: 95,
    habits: 88,
    faith: 94,
    relationships: 85,
    finances: 92,
    health: 86,
    learning: 89,
    career: 91,
    businesses: 87,
    character: 93,
    strengths: "Strategic reasoning, durable discipline, Islamic alignment, finance purifications",
    weaknesses: "High deep-work threshold, high mental load, sleep latency variance",
    workStyle: "Asynchronous hyper-focused blocks",
    communicationStyle: "High signal, brief, objective, respectful",
    leadershipStyle: "Servant-leader, goal-focused, decentralized",
    riskProfile: "Calculated explorer (Shariah-compliant)",
    sleepProfile: "7.8 hrs avg, latency 22m, deep sleep ratio 24%",
    nutritionProfile: "Halal, high-protein organic, 2200 kcal limit",
    exerciseProfile: "3x resistance, 2x zone 2 cardio, 10k steps base"
  }));

  // Timeline events state
  const [timelineEvents, setTimelineEvents] = useState<any[]>(() => loadState("timelineEvents", [
    { id: "e_1", date: "2026-07-06 04:15 AM", category: "faith", title: "Fajr congregation recorded", desc: "Aisha and Ethan synchronized Fajr at Masjid. 27x Barakah multiplier verified.", impact: "High" },
    { id: "e_2", date: "2026-07-05 09:00 AM", category: "business", title: "OEE line tag stabilization", desc: "Wonderware automated CDC pipeline reconciled. Assembly Line #4 OEE stabilized at 89.2%.", impact: "Medium" },
    { id: "e_3", date: "2026-07-04 02:00 PM", category: "career", title: "Contract client expansion", desc: "Signed 4th active enterprise client for digital transformation advisory.", impact: "High" },
    { id: "e_4", date: "2026-07-03 08:00 PM", category: "marriage", title: "Weekly marriage synchronization", desc: "Chore balancer ratios updated to 50/50. Shared calendar goals locked.", impact: "High" },
    { id: "e_5", date: "2026-07-01 01:00 PM", category: "financial", title: "Purified surplus reallocation", desc: "£4,500 transferred to purified Waqf and purification pools.", impact: "High" },
    { id: "e_6", date: "2026-06-28 07:00 AM", category: "health", title: "Cardio VO2 max baseline check", desc: "Consistent resistance cycles improved VO2 max index to 48.5 ml/kg/min.", impact: "Medium" },
    { id: "e_7", date: "2026-06-25 10:00 AM", category: "learning", title: "Completed Islamic Finance Module", desc: "Shariah Contracts & Usury Avoidance certificate finalized.", impact: "High" },
    { id: "e_8", date: "2026-06-20 11:30 AM", category: "ai", title: "Gabriel Chief of Staff agent deployed", desc: "Durable memory orchestration layer and MCP endpoints integrated.", impact: "Critical" },
    { id: "e_9", date: "2026-05-15 12:00 PM", category: "decision", title: "Durable ledger integration approved", desc: "Voted on-demand double-entry replication schema validation.", impact: "High" }
  ]));
  const [newTimelineEvent, setNewTimelineEvent] = useState({ title: "", desc: "", category: "faith", impact: "Medium" });

  // Executive Concierge planner & proactive decisions
  const [conciergeApprovals, setConciergeApprovals] = useState<any[]>(() => loadState("conciergeApprovals", [
    { id: "ap_1", title: "Reschedule deep work around Asr prayer", category: "Focus & Faith Protection", reason: "Current calendar slot (03:30 - 05:00 PM) overlaps directly with Asr congregation at 04:12 PM.", detail: "Move focus block to 05:15 - 06:45 PM. Safeguard prayer buffer.", risk: "None. Target client has approved asynchronous SLA." },
    { id: "ap_2", title: "Generate weekly Shariah Purified ledger report", category: "Autonomous Reporting", reason: "Reconciliation engine found £45 of unpurified interest elements from legacy dividend payouts.", detail: "Draft purified journal and route £45 to Charity Purge pool.", risk: "Low. Reverses unpurified elements immediately." },
    { id: "ap_3", title: "Lock partner feedback evening schedule", category: "Marriage Synchronization", reason: "Streak indicator shows 12 days since dedicated collaborative reflection session with Aisha.", detail: "Lock Wednesday evening 07:00 PM. Temporarily auto-decline non-emergency corporate pings.", risk: "Minor. Delays 1 non-emergency client query by 12 hours." }
  ]));
  const [recentConciergeActions, setRecentConciergeActions] = useState<any[]>(() => loadState("recentConciergeActions", [
    { id: "ca_1", time: "05:12 AM", action: "Detected high mental strain. Auto-inserted 20-min walking recovery gap post-Fajr.", status: "Executed" },
    { id: "ca_2", time: "04:15 AM", action: "Protected Fajr prayer timeframe. Disabled all incoming API messaging webhooks.", status: "Executed" },
    { id: "ca_3", time: "01:00 AM", action: "Optimized HVAC & sleep environment based on latency variance.", status: "Executed" }
  ]));

  // Purpose Engine state
  const [evaluatedActions, setEvaluatedActions] = useState<any[]>(() => loadState("evaluatedActions", [
    { id: "ea_1", action: "Leverage debt to expand Line #5 capacity", category: "Business Mission", purposeScore: 42, impactScore: 78, oppCost: "Faith alignment penalty due to potential non-halal financing leverage risk.", recommendation: "Avoid conventional debt. Propose a venture partnership (Mudarabah) or leasing (Ijarah).", status: "Rejected" },
    { id: "ea_2", action: "Dedicate 2 hours daily to Quranic Tafseer", category: "Islamic Mission", purposeScore: 98, impactScore: 95, oppCost: "2 hours reduction in daily client billing capacity (-£240).", recommendation: "Approve immediately. The spiritual Barakah feedback loop stabilizes focus, compensating for billing loss.", status: "Approved" },
    { id: "ea_3", action: "Advisory expansion in ESG sectors", category: "Career Mission", purposeScore: 75, impactScore: 80, oppCost: "Diverts resources from the core manufacturing IoT sector.", recommendation: "Approve as secondary. Blend ESG policies with existing Shariah screening criteria.", status: "Approved" }
  ]));
  const [customActionToEvaluate, setCustomActionToEvaluate] = useState("");
  const [evalCategory, setEvalCategory] = useState("Business Mission");

  // Executive Life Review active period
  const [reviewPeriod, setReviewPeriod] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "annual" | "lifetime">("weekly");
  const reviewsData = {
    daily: {
      achievements: "Completed Fajr in congregation. Reconciled Wonderware MES line OEE tag sync. Finalized critical 2-hour Deep Work block.",
      failures: "Sleep latency increased to 35 mins due to late screen exposure post-Isha.",
      lessons: "Screen embargo must be strictly enforced 60 minutes before bedroom transition.",
      faith: "Prayer consistency 100%. Recorded 100x Morning & Evening Dhikr.",
      marriage: "Cleared common household task list. Aisha and Ethan synchronized calendar blocks.",
      health: "11,400 steps logged. Caloric intake 2,150 kcal. Sleep index: Optimal.",
      finance: "Purified balances verified. Zero transaction variances recorded.",
      career: "Contract SLA maintained at 100%.",
      business: "Wonderware assembly lines producing within 0.2% variance limit.",
      knowledge: "Indexed 4 new markdown nodes on Islamic Contracts.",
      character: "Enforced absolute patience and calm demeanor during high-stress operational delays.",
      legacy: "Drafted 1-page legacy thesis for the upcoming Barnes Family Trust."
    },
    weekly: {
      achievements: "Successfully stabilized Phase 10 Production Console. Onboarded 1 new high-value advisory client. Completed 4 resistance workouts.",
      failures: "Missed 1 planned cardio session due to emergency database schema migration.",
      lessons: "Reserve Friday afternoon as a buffer slot for emergency DevOps mitigations to safeguard health and prayer times.",
      faith: "Jumuah attended. Read Surah Al-Kahf. Reconciled purification ledgers.",
      marriage: "Dedicated date night successfully executed. Ratios perfectly balanced at 50/50.",
      health: "Average sleep 7.5 hours. VO2 max stable. Resistance strength metrics improved.",
      finance: "Allocated £4,500 surplus. Reviewed company cash flow statements.",
      career: "SLA index: 99.8%. Active client index optimized.",
      business: "Wonderware line OEE averaged 88.1% (target was 87.5%).",
      knowledge: "Indexed 28 new wiki articles into Qdrant vector memory.",
      character: "Cultivated steady discipline. Practiced consistent benevolence (Ihsan).",
      legacy: "Secured educational allocation fund structures."
    },
    monthly: {
      achievements: "Phase 10 Enterprise Release deployed. Cleared the entire technical debt backlog on the Life Kernel. Expanded liquid reserves.",
      failures: "Spouse shared task backlog overflowed twice during peak sprint cycles.",
      lessons: "Pre-emptively delegate low-risk administrative micro-tasks to AI agents before sprint peaks.",
      faith: "98% prayers logged in congregation. Finished reading 2 books on Tafseer.",
      marriage: "Resolved shared chore bottlenecks. Conducted joint financial audit with Aisha.",
      health: "Average resting HR 62 bpm. Body fat down 0.4%. Active consistency index: 92%.",
      finance: "Total portfolio net worth expanded by 4.2%. Purification actions audit completed.",
      career: "Onboarded senior advisor to alleviate administrative workload.",
      business: "Business profits rose by 12% following optimized MES OEE workflows.",
      knowledge: "Vector database embeddings reached 12.4M dimensions.",
      character: "Demonstrated strong focus under intense pressure. Reduced reactiveness.",
      legacy: "Initiated foundation papers for the Jannah Waqf Platform."
    },
    quarterly: {
      achievements: "Achieved absolute alignment between enterprise outputs and personal life mission. Maintained zero non-compliant financial exposures.",
      failures: "Social relationships outside the immediate family contracted slightly.",
      lessons: "Schedule proactive social micro-syncs (e.g., calling relatives, community events) directly inside the Executive Concierge.",
      faith: "Completed 3 full fasts. Evaluated 15 business decisions with the Shariah Policy Engine.",
      marriage: "Completed weekend getaway. Re-anchored joint long-term vision board.",
      health: "VO2 max increased from 46 to 48.5. Consistent training habits verified.",
      finance: "Reconciled double-entry ledger database. Certified 100% pure assets.",
      career: "Successfully consolidated advisory role into a highly autonomous corporate vehicle.",
      business: "Secured critical intellectual property rights for the IoT ingestion framework.",
      knowledge: "Completed 2 masterclasses. Re-indexed central Knowledge Hub schemas.",
      character: "Strengthened fortitude, truthfulness, and spiritual accountability (Muraqabah).",
      legacy: "Barnes family values document drafted, signed, and encrypted."
    },
    annual: {
      achievements: "Fully manifested the Project Jannah system. Attained complete financial security. Upgraded marriage connection and physical fitness parameters.",
      failures: "Burnout risk peaked briefly during early Spring sprint transitions.",
      lessons: "Enforce a mandatory 3-day complete digital detox once every quarter to protect cognitive durability.",
      faith: "Completed spiritual retreats (I'tikaf) and paid full annual Zakat cleanly.",
      marriage: "Undertook beautiful pilgrimage journey together. Stabilized deep marital bonding.",
      health: "Maintained ideal physiological weight. Resting heart rate reduced to 58 bpm.",
      finance: "Grew liquid wealth index, creating stable generational financial independence.",
      career: "Commanded position as a thought-leader at the intersection of AI, IoT, and Shariah tech.",
      business: "Expanded corporate revenue by 35% with high net-margins of 32%.",
      knowledge: "Published 2 educational handbooks. Curated an immense personal library.",
      character: "Achieved deep spiritual peace and continuous consciousness of purpose.",
      legacy: "Fully funded the first community clean energy well in Tanzania as a perpetual legacy project."
    },
    lifetime: {
      achievements: "Established a living, autonomous digital legacy. Maximized Barakah and service to humanity. Left an indelible footprint of faith and knowledge.",
      failures: "Early years had suboptimal optimization patterns, corrected later in life by LifeOS.",
      lessons: "Time is the ultimate non-replenishable capital. Let every heartbeat be conscious.",
      faith: "Built and sustained structures of perpetual charity (Sadaqah Jariyah).",
      marriage: "A lifelong, loving partnership in faith, culminating in a beautiful legacy of descendants.",
      health: "Preserved vital health span, active and sharp until the final chapters.",
      finance: "100% Shariah-pure wealth generated and passed on as a righteous endowment.",
      career: "Defined a new standard of ethical executive leadership.",
      business: "Created sustainable, generation-spanning, ethical business models.",
      knowledge: "Transferred a lifetime of wisdom into the digital twin for descendants.",
      character: "Lived with absolute integrity, sincerity, and humility.",
      legacy: "Project Jannah fully realized. The digital twin continues to guide and assist future generations."
    }
  };

  // --------------------------------------------------
  // 6. PERSONAL AI ADVISORY BOARD DEBATER
  // --------------------------------------------------
  const [boardDecisionTopic, setBoardDecisionTopic] = useState("Acquire a local manufacturing facility using partial interest leverage");
  const [isDebating, setIsDebating] = useState(false);
  const [boardDebateLog, setBoardDebateLog] = useState<any[]>(() => loadState("boardDebateLog", [
    { advisor: "Islamic Advisor (Shaykh Gabriel)", content: "We must analyze the financing structure. If there is any interest (Riba) involved, the contract is non-compliant. We must pursue equity-based partners (Musharakah) or leasing structures (Ijarah) instead.", verdict: "Non-Compliant" },
    { advisor: "Finance Advisor", content: "The numbers look highly accretive at 14% IRR, but the Shariah restriction is absolute. If we pivot to a Murabaha credit-sale model, cost increases by 2.1% but maintains full compliance.", verdict: "Neutral" },
    { advisor: "Chief Strategy Officer", content: "From a 10-year view, acquiring this facility secures supply chain sovereignty. This fits perfectly with the Business Mission.", verdict: "Approve" }
  ]));

  const [boardConsensus, setBoardConsensus] = useState(() => loadState("boardConsensus", {
    compliance: 90,
    viability: 85,
    risk: "Medium",
    finalVerdict: "Proceed ONLY with Islamic Murabaha structures. Conventional debt rejected."
  }));

  // --------------------------------------------------
  // 7. LIFE OPTIMIZATION ENGINE STATE
  // --------------------------------------------------
  const [optimizationMetrics, setOptimizationMetrics] = useState(() => loadState("optimizationMetrics", {
    scheduleEfficiency: 92,
    energyManagement: 84,
    deepWorkRatio: 78,
    sleepConsistency: 85,
    prayerBufferScore: 99,
    delegationRate: 65,
    barakahMultiplier: 91
  }));
  const [isRunningOptimization, setIsRunningOptimization] = useState(false);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);

  // --------------------------------------------------
  // 8. AUTONOMOUS EXECUTION STATE
  // --------------------------------------------------
  const [automationRules, setAutomationRules] = useState<any[]>(() => loadState("automationRules", [
    { id: "au_1", action: "Schedule follow-up meetings with vetted leads", type: "Calendar", threshold: "Immediate after pitch", autoApprove: true, status: "Active" },
    { id: "au_2", action: "Generate executive weekly client performance reports", type: "Reporting", threshold: "Fridays 04:00 PM", autoApprove: true, status: "Active" },
    { id: "au_3", action: "Organize raw voice memos into markdown obsidian summaries", type: "Knowledge", threshold: "Daily 11:00 PM", autoApprove: true, status: "Active" },
    { id: "au_4", action: "Create task backlogs from missed email items", type: "Tasks", threshold: "Unread > 12h", autoApprove: true, status: "Active" },
    { id: "au_5", action: "Reallocate company dividends to liquid escrow account", type: "Financial", threshold: "Any amount", autoApprove: false, status: "REQUIRES APPROVAL" },
    { id: "au_6", action: "Sign major enterprise partnership contract", type: "High Risk", threshold: "Contracts > £10k", autoApprove: false, status: "REQUIRES APPROVAL" }
  ]));

  // --------------------------------------------------
  // 9. LEGACY ENGINE STATE
  // --------------------------------------------------
  const [legacyMetrics, setLegacyMetrics] = useState(() => loadState("legacyMetrics", {
    lifeMissionProgress: 68,
    familyLegacy: 85,
    knowledgeLegacy: 72,
    businessLegacy: 58,
    islamicLegacy: 82,
    overallImpactIndex: 73
  }));
  const [impactProjectionYears, setImpactProjectionYears] = useState(25);
  const [calculatedLegacyImpact, setCalculatedLegacyImpact] = useState("Generational family alignment established. 1,422 digital nodes containing lifelong wisdom encrypted for descendants. 3 purified businesses active. Annual Waqf contributions project to feed 12,000+ people permanently by Year 25.");

  // --------------------------------------------------
  // 10. API & OPENAPI DOCUMENTATION STATE
  // --------------------------------------------------
  const [apiTerminalOutput, setApiTerminalOutput] = useState("");
  const [activeApiRoute, setActiveApiRoute] = useState("get_twin");

  // --------------------------------------------------
  // 11. TESTING RUNNER STATE
  // --------------------------------------------------
  const [testSuite, setTestSuite] = useState<any[]>([
    { id: "t_1", name: "DigitalTwin.SelfModel_EvaluatesFocusAndBurnoutLevel", status: "Passed", latency: "14ms" },
    { id: "t_2", name: "ExecutiveConcierge.PrayerBuffer_AutoDisplacesOverlappingFocus", status: "Passed", latency: "8ms" },
    { id: "t_3", name: "PurposeEngine.Score_EvaluatesFinancingAgainstShariah", status: "Passed", latency: "22ms" },
    { id: "t_4", name: "Timeline.UnifiedExplorer_CorrectlyFiltersDeenAndBusiness", status: "Passed", latency: "5ms" },
    { id: "t_5", name: "ExecutiveReview.LogGeneration_GeneratesAchievementsAndLessons", status: "Passed", latency: "11ms" },
    { id: "t_6", name: "LegacyEngine.ImpactSimulation_ProjectsEndowmentsCorrectly", status: "Passed", latency: "38ms" },
    { id: "t_7", name: "Boardroom.DebateEngine_GeneratesConsensusUponRiskWarning", status: "Passed", latency: "42ms" },
    { id: "t_8", name: "OptimizationEngine.ScheduleOptimizer_EnhancesBarakahYield", status: "Passed", latency: "19ms" }
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testConsoleLogs, setTestConsoleLogs] = useState<string[]>([]);
  const [testCoverageScore, setTestCoverageScore] = useState(98.4);

  // --------------------------------------------------
  // 12. ARCHITECTURE TAB ENHANCED STATES (v6.0 REFINEMENTS)
  // --------------------------------------------------
  const [adrActiveId, setAdrActiveId] = useState("adr-1");
  const [adrSearchQuery, setAdrSearchQuery] = useState("");
  const [pasWeights, setPasWeights] = useState({
    deen: 95,
    family: 85,
    health: 80,
    knowledge: 85,
    business: 75,
    finance: 80,
    community: 75,
    legacy: 90
  });
  const [pasPerformances, setPasPerformances] = useState({
    deen: 94,
    family: 85,
    health: 86,
    knowledge: 89,
    business: 87,
    finance: 92,
    community: 75,
    legacy: 80
  });
  const [isSimulatingSlice, setIsSimulatingSlice] = useState(false);
  const [sliceLogs, setSliceLogs] = useState<string[]>([]);
  const [sliceCurrentStep, setSliceCurrentStep] = useState(-1);

  // Save states to local storage automatically
  useEffect(() => { saveState("digitalSelf", digitalSelf); }, [digitalSelf]);
  useEffect(() => { saveState("timelineEvents", timelineEvents); }, [timelineEvents]);
  useEffect(() => { saveState("conciergeApprovals", conciergeApprovals); }, [conciergeApprovals]);
  useEffect(() => { saveState("recentConciergeActions", recentConciergeActions); }, [recentConciergeActions]);
  useEffect(() => { saveState("evaluatedActions", evaluatedActions); }, [evaluatedActions]);
  useEffect(() => { saveState("boardDebateLog", boardDebateLog); }, [boardDebateLog]);
  useEffect(() => { saveState("boardConsensus", boardConsensus); }, [boardConsensus]);
  useEffect(() => { saveState("optimizationMetrics", optimizationMetrics); }, [optimizationMetrics]);
  useEffect(() => { saveState("automationRules", automationRules); }, [automationRules]);
  useEffect(() => { saveState("legacyMetrics", legacyMetrics); }, [legacyMetrics]);

  // --------------------------------------------------
  // INTERACTIVE ACTION HANDLERS
  // --------------------------------------------------

  // Timeline add event
  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineEvent.title) return;
    const newE = {
      id: "e_" + Date.now(),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      category: newTimelineEvent.category,
      title: newTimelineEvent.title,
      desc: newTimelineEvent.desc || "Manual event logs added to digital twin database.",
      impact: newTimelineEvent.impact
    };
    setTimelineEvents(prev => [newE, ...prev]);
    setNewTimelineEvent({ title: "", desc: "", category: "faith", impact: "Medium" });
    onAddSignalREvent(`Added timeline milestone: "${newE.title}" under ${newE.category}.`);
    onUpdateScore();
  };

  // Concierge Decision Actions
  const handleApproveAction = (id: string, name: string) => {
    setConciergeApprovals(prev => prev.filter(ap => ap.id !== id));
    const newAct = {
      id: "ca_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Approved & Automated: "${name}"`,
      status: "Executed"
    };
    setRecentConciergeActions(prev => [newAct, ...prev]);
    onAddSignalREvent(`Concierge executive decision approved: "${name}"`);
    onUpdateScore();
  };

  const handleDeclineAction = (id: string, name: string) => {
    setConciergeApprovals(prev => prev.filter(ap => ap.id !== id));
    const newAct = {
      id: "ca_" + Date.now(),
      time: new Date().toLocaleTimeString(),
      action: `Declined & Shelved: "${name}"`,
      status: "Archived"
    };
    setRecentConciergeActions(prev => [newAct, ...prev]);
    onAddSignalREvent(`Concierge executive decision declined: "${name}"`);
    onUpdateScore();
  };

  // Purpose Evaluator
  const handleEvaluateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionToEvaluate) return;

    // Simulate AI Purpose Engine score weights
    let purpose = 50;
    let impact = 50;
    let opp = "Diversion of cognitive resources.";
    let rec = "Approve with standardized limitations.";
    let status: "Approved" | "Rejected" = "Approved";

    const text = customActionToEvaluate.toLowerCase();
    if (text.includes("debt") || text.includes("interest") || text.includes("riba") || text.includes("unpurified")) {
      purpose = 15;
      impact = 60;
      opp = "Extreme spiritual penalty. Potential Shariah policy violation.";
      rec = "REJECT IMMEDIATELY. Pivot to Islamic profit-sharing agreements.";
      status = "Rejected";
    } else if (text.includes("quran") || text.includes("salah") || text.includes("prayer") || text.includes("aisha") || text.includes("family")) {
      purpose = 99;
      impact = 95;
      opp = "Minor displacement of secondary business calls.";
      rec = "APPROVE with high priority. Increases Barakah yields globally.";
    } else if (text.includes("business") || text.includes("automation") || text.includes("iot")) {
      purpose = 85;
      impact = 88;
      opp = "Requires upfront engineering focus and testing cycles.";
      rec = "Approve. Standardize metrics inside the Digital Twin dashboard first.";
    }

    const newEval = {
      id: "ea_" + Date.now(),
      action: customActionToEvaluate,
      category: evalCategory,
      purposeScore: purpose,
      impactScore: impact,
      oppCost: opp,
      recommendation: rec,
      status: status
    };

    setEvaluatedActions(prev => [newEval, ...prev]);
    setCustomActionToEvaluate("");
    onAddSignalREvent(`Evaluated action purpose score: ${purpose}% for "${newEval.action}"`);
    onUpdateScore();
  };

  // Advisory Board Debate simulator
  const triggerBoardroomDebate = () => {
    setIsDebating(true);
    setBoardDebateLog([]);
    onAddSignalREvent(`Boardroom debate dispatched for topic: "${boardDecisionTopic}"`);

    const advisors = [
      { name: "Gabriel (Executive Chief of Staff)", delay: 300, content: "My cognitive maps show this topic intersects core life values. I will coordinate input channels across specialized sectors.", verdict: "Neutral" },
      { name: "Shaykh Gabriel (Islamic Scholar)", delay: 800, content: boardDecisionTopic.toLowerCase().includes("debt") || boardDecisionTopic.toLowerCase().includes("interest") ? "Conventional leverage is strictly impermissible (Haram). This diminishes the Barakah score to absolute zero. We must block this financial trajectory." : "The activity aligns fully with Ihsan (excellence) and is Halal. No restrictions detected.", verdict: boardDecisionTopic.toLowerCase().includes("debt") || boardDecisionTopic.toLowerCase().includes("interest") ? "Non-Compliant" : "Approved" },
      { name: "Business Advisor", delay: 1300, content: "If we reject this format, our expansion rate drops by 12% over 18 months, but the operational compliance SLA is a blocking constraint. We must seek compliant venture capital.", verdict: "Neutral" },
      { name: "Finance Advisor", delay: 1800, content: "Using cost-plus leasing (Ijarah) or credit-sales (Murabaha) yields comparable financial growth without triggering Shariah non-compliance flags. Pivoting recommended.", verdict: "Approve" },
      { name: "Chief Strategy Officer", delay: 2300, content: "Risk parameters verified. Long-term compliance is the ultimate competitive moat. Pivoting to Ijarah secures our balance sheet integrity.", verdict: "Approve" },
      { name: "Marriage Advisor (Aisha's Twin API)", delay: 2800, content: "Ensure this investment doesn't require more evening travel or weekend work. Focus on maintaining a 50/50 balance in domestic sprints.", verdict: "Approve" }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < advisors.length) {
        setBoardDebateLog(prev => [...prev, {
          advisor: advisors[current].name,
          content: advisors[current].content,
          verdict: advisors[current].verdict
        }]);
        current++;
      } else {
        clearInterval(interval);
        setIsDebating(false);
        // Calculate new consensus
        const isNonCompliant = boardDecisionTopic.toLowerCase().includes("debt") || boardDecisionTopic.toLowerCase().includes("interest");
        setBoardConsensus({
          compliance: isNonCompliant ? 15 : 95,
          viability: isNonCompliant ? 70 : 92,
          risk: isNonCompliant ? "High Critical" : "Low Controlled",
          finalVerdict: isNonCompliant
            ? "REJECT original structure. Restructure using Islamic Murabaha contracts. Security shield enforced."
            : "APPROVE. Standardize operations under existing Life Kernel telemetry protocols."
        });
        onAddSignalREvent(`AI Boardroom debate completed. Consensus: ${isNonCompliant ? "Restructure" : "Proceed"}.`);
        onUpdateScore();
      }
    }, 450);
  };

  // Run Life Optimization simulation
  const runLifeOptimizer = () => {
    setIsRunningOptimization(true);
    setOptimizationLogs([]);
    onAddSignalREvent("Triggered cognitive life optimization algorithms...");

    const steps = [
      "Gathering real-time heart rate, HRV, and sleep latency telemetry from Fitbit...",
      "Parsing today's prayer times for Masjid congregation alignment...",
      "Scanning active email backlogs and Slack workspaces via Microsoft Graph...",
      "Auto-scheduling 2 hours of Deep Work during peak focus hours (09:00 - 11:00 AM)...",
      "Injecting a 30-minute recovery buffer before Maghrib prayer block...",
      "Drafting delegation templates for 3 non-essential administrative emails...",
      "Updating global Barakah yield multipliers inside the database...",
      "Optimization complete. Telemetry models updated."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setOptimizationLogs(prev => [...prev, `[OPTIMIZER] ${steps[current]}`]);
        current++;
      } else {
        clearInterval(interval);
        setIsRunningOptimization(false);
        setOptimizationMetrics({
          scheduleEfficiency: 96,
          energyManagement: 91,
          deepWorkRatio: 85,
          sleepConsistency: 88,
          prayerBufferScore: 100,
          delegationRate: 78,
          barakahMultiplier: 97
        });
        onAddSignalREvent("Schedule optimized successfully! Barakah multiplier increased to 97%.");
        onUpdateScore();
      }
    }, 350);
  };

  // Execute Playbook Tests
  const runPlaybookTests = () => {
    setIsRunningTests(true);
    setTestConsoleLogs([]);
    onAddSignalREvent("Dispatched Phase 11 complete test runner.");

    const logs = [
      "[INFO] Launching Project Jannah Test Execution Suite v1.1.0...",
      "[TEST] Running DigitalTwin.SelfModel_EvaluatesFocusAndBurnoutLevel... PASSED (14ms)",
      "[TEST] Running ExecutiveConcierge.PrayerBuffer_AutoDisplacesOverlappingFocus... PASSED (8ms)",
      "[TEST] Running PurposeEngine.Score_EvaluatesFinancingAgainstShariah... PASSED (22ms)",
      "[TEST] Running Timeline.UnifiedExplorer_CorrectlyFiltersDeenAndBusiness... PASSED (5ms)",
      "[TEST] Running ExecutiveReview.LogGeneration_GeneratesAchievementsAndLessons... PASSED (11ms)",
      "[TEST] Running LegacyEngine.ImpactSimulation_ProjectsEndowmentsCorrectly... PASSED (38ms)",
      "[TEST] Running Boardroom.DebateEngine_GeneratesConsensusUponRiskWarning... PASSED (42ms)",
      "[TEST] Running OptimizationEngine.ScheduleOptimizer_EnhancesBarakahYield... PASSED (19ms)",
      "[INFO] Executed 8 unit and integration tests. Assertions evaluated: 44.",
      "[INFO] Database integrity verify: OK. Mock coverage calculation: 98.4%",
      "[SUCCESS] All Project Jannah tests passed perfectly green."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logs.length) {
        setTestConsoleLogs(prev => [...prev, logs[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsRunningTests(false);
        onAddSignalREvent("Project Jannah unit tests completed. 100% success rate, 98.4% coverage.");
        onUpdateScore();
      }
    }, 250);
  };

  // Milestone 1: The First End-to-End Vertical Slice Simulator
  const runVerticalSliceSimulation = async () => {
    if (isSimulatingSlice) return;
    setIsSimulatingSlice(true);
    setSliceLogs([]);
    setSliceCurrentStep(0);
    onAddSignalREvent("Initiating Milestone 1 end-to-end vertical slice simulation...");

    try {
      const response = await fetch("/api/v1/simulation/slice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Optimize BusinessOS Line #4",
          category: "Business",
          smartDefinition: "Implement real-time PLC register readings with OEE calculation modules."
        })
      });

      const data = await response.json();
      if (!data.success || !data.logs) {
        throw new Error("Failed to execute real server-side vertical slice.");
      }

      // Progressively render the real logs returned from the backend
      const rawLogs = data.logs;
      let currentLogIdx = 0;
      
      const interval = setInterval(() => {
        if (currentLogIdx < rawLogs.length) {
          const logText = rawLogs[currentLogIdx];
          
          // Map log contents to step indices for the visual stepper
          if (logText.includes("[API INGRESS]")) {
            setSliceCurrentStep(0);
          } else if (logText.includes("[APPLICATION]")) {
            setSliceCurrentStep(1);
          } else if (logText.includes("[POSTGRESQL]")) {
            setSliceCurrentStep(2);
          } else if (logText.includes("[EVENT BUS]")) {
            setSliceCurrentStep(3);
          } else if (logText.includes("[Qdrant SDK]")) {
            setSliceCurrentStep(4);
          } else if (logText.includes("[PAS SERVICE]")) {
            setSliceCurrentStep(5);
          } else if (logText.includes("[EXTERNAL GATEWAY]") || logText.includes("[SUCCESS]")) {
            setSliceCurrentStep(6);
          }

          setSliceLogs(prev => [...prev, logText]);
          onAddSignalREvent(`Syncing server-side vertical trace line ${currentLogIdx + 1}`);
          currentLogIdx++;
        } else {
          clearInterval(interval);
          setIsSimulatingSlice(false);
          onUpdateScore();
          onAddSignalREvent("Successfully completed and persisted vertical slice!");
        }
      }, 400);

    } catch (err: any) {
      setSliceLogs(prev => [...prev, `[CRITICAL ERROR] Failed to connect to server-side vertical slice: ${err.message}`]);
      setIsSimulatingSlice(false);
    }
  };

  // Swagger API Interactive console executor
  const runApiRouteSimulation = (route: string) => {
    setActiveApiRoute(route);
    let payload = {};
    if (route === "get_twin") {
      payload = {
        status: "success",
        timestamp: "2026-07-06T07:48:21Z",
        twin: {
          user: "Ethan Barnes",
          core_state: {
            energy: digitalSelf.energy,
            focus: digitalSelf.focus,
            burnout_risk: digitalSelf.burnout,
            faith_compliance: digitalSelf.faith
          },
          profiles: {
            sleep: digitalSelf.sleepProfile,
            nutrition: digitalSelf.nutritionProfile
          }
        }
      };
    } else if (route === "post_concierge") {
      payload = {
        status: "success",
        action: "re-prioritize",
        displaced_blocks: 1,
        mutations: [
          { block_id: "deep_work_1", previous_time: "15:30", new_time: "17:15", reason: "Prayer buffer overlap" }
        ],
        prayer_schedules_protected: ["Asr", "Maghrib"]
      };
    } else if (route === "evaluate_purpose") {
      payload = {
        status: "success",
        input: "Acquire business with interest loan",
        scores: {
          purpose_score: 15,
          impact_score: 60,
          opportunity_cost: "Shariah non-compliance penalty, loss of Barakah multiplier",
          shariah_compliance: "REJECTED"
        },
        recommendation: "Pivot to venture-based partnership (Mudarabah) or leasing (Ijarah)."
      };
    } else if (route === "get_legacy") {
      payload = {
        status: "success",
        metrics: legacyMetrics,
        impact_projections: {
          target_year: 25,
          waqf_food_feed_capacity: 12000,
          family_unity_score: "9.8/10",
          digital_wisdom_nodes: 1422
        }
      };
    }

    setApiTerminalOutput(JSON.stringify(payload, null, 2));
    onAddSignalREvent(`Dispatched API Endpoint Mock Call: ${route}`);
  };

  // Re-run legacy projections
  const runLegacyProjections = (years: number) => {
    setImpactProjectionYears(years);
    const scale = years / 25;
    setCalculatedLegacyImpact(
      `Generational family alignment established. ${Math.floor(1422 * scale)} digital nodes containing lifelong wisdom encrypted for descendants. ${Math.floor(3 * (years / 10))} purified businesses active. Annual Waqf contributions project to feed ${Math.floor(12000 * scale)} people permanently by Year ${years}.`
    );
    onAddSignalREvent(`Recalculated 50-year legacy projection for Year ${years}.`);
  };

  // Radar Data for Digital Twin Spider Chart
  const radarData = [
    { subject: "Faith & Deen", value: digitalSelf.faith },
    { subject: "Focus & Discipline", value: digitalSelf.focus },
    { subject: "Health & Vigor", value: digitalSelf.health },
    { subject: "Marriage & Family", value: digitalSelf.relationships },
    { subject: "Financial Purified", value: digitalSelf.finances },
    { subject: "Career advisory", value: digitalSelf.career },
    { subject: "Business MES OEE", value: digitalSelf.businesses },
    { subject: "Learning Hub", value: digitalSelf.learning }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 font-mono text-xs uppercase tracking-wider font-bold">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Operational Console • Phase 11 Living Digital Twin</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            Gabriel Executive Twin (Project Jannah)
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-3xl font-mono">
            CHIEF OF STAFF CONCIERGE • LIVING DIGITAL SELF MODEL • COMPLIANCE AUDITING • BOARDROOM DEBATES • PURIFIED LEGACY
          </p>
        </div>

        {/* Global Dashboard Status */}
        <div className="flex items-center space-x-4 bg-amber-50/50 border border-amber-200/60 p-2 rounded-xl">
          <div className="text-right font-mono">
            <span className="text-[9px] text-stone-500 block uppercase font-bold">Overall Alignment</span>
            <span className="text-sm font-bold text-amber-700">98.2% (Barakah Max)</span>
          </div>
          <div className="text-right font-mono border-l border-amber-200 pl-4">
            <span className="text-[9px] text-stone-500 block uppercase font-bold">Autonomous SLA</span>
            <span className="text-xs font-bold text-stone-900">99.9% Active</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1 bg-stone-50 border border-stone-200 p-1.5 rounded-xl">
        {[
          { id: "twin", label: "Digital Self Model", icon: User },
          { id: "concierge", label: "Executive Concierge", icon: Compass },
          { id: "timeline", label: "Life Timeline", icon: Calendar },
          { id: "purpose", label: "Purpose Evaluator", icon: TargetIcon },
          { id: "legacy", label: "Legacy Dashboard", icon: Award },
          { id: "reviews", label: "Executive Reviews", icon: FileText },
          { id: "boardroom", label: "AI Boardroom", icon: MessageSquare },
          { id: "optimization", label: "Optimization Center", icon: Sliders },
          { id: "api", label: "OpenAPI Sandbox", icon: Database },
          { id: "tests", label: "Playbook Tests", icon: ShieldCheck },
          { id: "architecture", label: "Architecture Specs", icon: Workflow }
        ].map((tab) => {
          const Icon = tab.id === "purpose" ? Compass : tab.icon; // Fallback helper
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                onAddSignalREvent(`Navigated to Twin Portal: ${tab.label}`);
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

      {/* Main Viewport Content Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* TAB 1: DIGITAL SELF MODEL */}
            {activeTab === "twin" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Ethan Barnes: Evolving Digital Self Model</h2>
                    <p className="text-xs text-stone-500 font-mono">Real-time parameters mapping energy reserves, spiritual state, cognitive limits, and habits</p>
                  </div>
                  <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded font-bold">
                    Last sync: Just now
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left panel: Spider Radar Chart */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 flex flex-col items-center justify-center bg-stone-50/30">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block text-center mb-4">
                      Core Cognitive & Spiritual Dimensions
                    </span>
                    <div className="w-full h-64 flex justify-center items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#e5e5e7" />
                          <PolarAngleAxis dataKey="subject" stroke="#78716c" fontSize={9} fontStyle="bold" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#d6d3d1" />
                          <Radar name="Ethan's State" dataKey="value" stroke="#d97706" fill="#f59e0b" fillOpacity={0.25} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right panel: Sliders / Evolving Parameters */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">
                      Adjust Vital Sign Coefficients
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "energy", label: "Energy Level", color: "bg-amber-500" },
                        { key: "focus", label: "Focus Concentration", color: "bg-indigo-500" },
                        { key: "stress", label: "Stress Threshold", color: "bg-rose-500" },
                        { key: "burnout", label: "Burnout Index", color: "bg-red-500" },
                        { key: "motivation", label: "Drive & Motivation", color: "bg-teal-500" },
                        { key: "habits", label: "Habit Consistency", color: "bg-emerald-500" },
                        { key: "faith", label: "Islamic Alignment (Faith)", color: "bg-amber-600" },
                        { key: "finances", label: "Financial Purified Status", color: "bg-green-600" }
                      ].map((item) => (
                        <div key={item.key} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-stone-600">{item.label}</span>
                            <span className="font-bold text-stone-900">{(digitalSelf as any)[item.key]}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={(digitalSelf as any)[item.key]}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setDigitalSelf(prev => ({ ...prev, [item.key]: val }));
                              }}
                              className="flex-1 accent-amber-600 h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3 text-xs font-mono leading-relaxed mt-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">Identified Strengths & Vulnerabilities</span>
                        <p className="text-stone-900 mt-0.5"><strong>Strengths:</strong> {digitalSelf.strengths}</p>
                        <p className="text-stone-900 mt-0.5"><strong>Vulnerabilities:</strong> {digitalSelf.weaknesses}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Work Style</span>
                          <span className="text-stone-900 text-[11px] font-bold">{digitalSelf.workStyle}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Communication</span>
                          <span className="text-stone-900 text-[11px] font-bold">{digitalSelf.communicationStyle}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-profiles segment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-600 border-b border-stone-100 pb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-bold font-mono uppercase">Sleep Profile</span>
                    </div>
                    <ul className="text-xs font-mono space-y-2 text-stone-700">
                      <li>• Average duration: <strong>7.8 Hours</strong></li>
                      <li>• Restless cycles: <strong>Suboptimal (latency 22m)</strong></li>
                      <li>• Sleep score recommendation: <strong className="text-indigo-600">Strict blue-light embargo at 10:00 PM.</strong></li>
                    </ul>
                  </div>

                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-600 border-b border-stone-100 pb-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs font-bold font-mono uppercase">Nutrition Profile</span>
                    </div>
                    <ul className="text-xs font-mono space-y-2 text-stone-700">
                      <li>• Sourcing constraint: <strong>100% Certified Halal Organics</strong></li>
                      <li>• Intake target: <strong>2,200 kcal max</strong></li>
                      <li>• Dynamic feedback: <strong className="text-emerald-600">Rebalance protein following weightlifting blocks.</strong></li>
                    </ul>
                  </div>

                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-rose-600 border-b border-stone-100 pb-2">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs font-bold font-mono uppercase">Exercise Profile</span>
                    </div>
                    <ul className="text-xs font-mono space-y-2 text-stone-700">
                      <li>• Resistance training: <strong>3x Weekly Hypertrophy blocks</strong></li>
                      <li>• Zone 2 aerobic cardio: <strong>2x Weekly (VO2 Max tracking active)</strong></li>
                      <li>• Daily steps benchmark: <strong className="text-rose-600">10,000 steps minimum (88% success rate).</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXECUTIVE CONCIERGE */}
            {activeTab === "concierge" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Gabriel Executive Concierge & Focus Shield</h2>
                  <p className="text-xs text-stone-500 font-mono">Proactively schedules family buffers, detects spiritual overlaps, and safeguards deep focus blocks</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Active Telemetry warnings */}
                  <div className="border border-stone-200 rounded-xl p-5 bg-amber-50/20 border-amber-200/50 space-y-4">
                    <div className="flex items-center space-x-2 text-amber-700 border-b border-amber-200/30 pb-2 font-bold font-mono text-xs uppercase">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Focus & Prayer Shield Radar</span>
                    </div>

                    <div className="space-y-3 text-xs font-mono text-stone-700">
                      <div className="p-3 bg-white border border-stone-200 rounded-xl">
                        <span className="font-bold text-stone-900 uppercase text-[10px] block">Salah Telemetry Guard</span>
                        <p className="mt-1">Asr congregation (04:12 PM) overlaps with client session. Guard buffer triggered.</p>
                      </div>

                      <div className="p-3 bg-white border border-stone-200 rounded-xl">
                        <span className="font-bold text-stone-900 uppercase text-[10px] block">Marriage Cadence Sensor</span>
                        <p className="mt-1"> Streak low: Aisha sync block has slipped. Dynamic prompt injected to hold Wednesday night.</p>
                      </div>

                      <div className="p-3 bg-white border border-stone-200 rounded-xl">
                        <span className="font-bold text-stone-900 uppercase text-[10px] block">OEE Machinery Strain</span>
                        <p className="mt-1">Line #4 Wonderware tag rate variance exceeded 4.5% during night shift. Schedule diagnostic.</p>
                      </div>
                    </div>
                  </div>

                  {/* Active Approvals */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Proactive Decisions Awaiting Human Consent</span>
                      <span className="text-[9px] text-stone-400 font-mono">Chief of Staff Gateway</span>
                    </div>

                    <div className="space-y-4">
                      {conciergeApprovals.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl font-mono text-stone-400 text-xs">
                          All proactive agenda actions approved. Gabriel is in stable autonomous alignment.
                        </div>
                      ) : (
                        conciergeApprovals.map((ap) => (
                          <div key={ap.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-mono px-1.5 py-0.5 rounded font-bold uppercase">{ap.category}</span>
                                <h4 className="text-xs font-bold text-stone-900 mt-1">{ap.title}</h4>
                                <p className="text-xs text-stone-500 mt-1 font-mono leading-relaxed">{ap.reason}</p>
                                <p className="text-[11px] text-stone-700 bg-white border border-stone-200 p-2 rounded mt-2 font-mono"><strong>Actions proposed:</strong> {ap.detail}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
                              <span className="text-[10px] text-stone-400 font-mono mr-auto">Risk profile: {ap.risk}</span>
                              <button
                                onClick={() => handleDeclineAction(ap.id, ap.title)}
                                className="px-3 py-1 bg-white border border-stone-200 rounded hover:bg-stone-100 text-stone-600 font-mono text-[10px] transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleApproveAction(ap.id, ap.title)}
                                className="px-3 py-1 bg-stone-950 hover:bg-stone-800 text-white rounded font-mono text-[10px] transition flex items-center space-x-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve & Dispatch</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Actions Executed */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Gabriel Execution Logging Streams</span>
                  <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-36 overflow-y-auto">
                    {recentConciergeActions.map((act) => (
                      <div key={act.id} className="flex justify-between items-center text-stone-300">
                        <span>[{act.time}] <span className="text-amber-400">{act.action}</span></span>
                        <span className="text-emerald-500 font-bold">{act.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LIFE TIMELINE */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Unified Personal & Venture Timeline</h2>
                    <p className="text-xs text-stone-500 font-mono">Consolidated tracking of faith, career milestones, marital syncs, financial actions, and AI upgrades</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Add Event Form */}
                  <form onSubmit={handleAddTimelineEvent} className="lg:col-span-4 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Insert Timeline Milestone</span>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Milestone Category</label>
                        <select
                          value={newTimelineEvent.category}
                          onChange={(e) => setNewTimelineEvent(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                        >
                          <option value="faith">Faith & Spiritual Milestone</option>
                          <option value="business">Business & OEE Logs</option>
                          <option value="career">Career Expansion</option>
                          <option value="marriage">Marriage Synchronization</option>
                          <option value="financial">Financial Purification</option>
                          <option value="health">Health & Athletics</option>
                          <option value="learning">Knowledge Acquisition</option>
                          <option value="ai">AI Core Orchestration</option>
                          <option value="decision">Strategic Corporate Decisions</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={newTimelineEvent.title}
                          onChange={(e) => setNewTimelineEvent(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 placeholder-stone-400"
                          placeholder="e.g. Purified £1,200 company dividend"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Description / Metadata</label>
                        <textarea
                          value={newTimelineEvent.desc}
                          onChange={(e) => setNewTimelineEvent(prev => ({ ...prev, desc: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 placeholder-stone-400 h-20"
                          placeholder="Provide audit context, OEE values, or core lessons..."
                        />
                      </div>

                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Life Impact Level</label>
                        <select
                          value={newTimelineEvent.impact}
                          onChange={(e) => setNewTimelineEvent(prev => ({ ...prev, impact: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                        >
                          <option value="Low">Low Secondary</option>
                          <option value="Medium">Medium Standard</option>
                          <option value="High">High Strategic</option>
                          <option value="Critical">Critical Generational</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-950 hover:bg-stone-800 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-2 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Push Milestone to Twin</span>
                      </button>
                    </div>
                  </form>

                  {/* Right Column: Interactive Vertical Timeline */}
                  <div className="lg:col-span-8 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Chronological Timeline Explorer</span>

                    <div className="space-y-6 max-h-[460px] overflow-y-auto pr-2 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-stone-200" />

                      {timelineEvents.map((item) => (
                        <div key={item.id} className="relative pl-10 group">
                          {/* Dot marker */}
                          <div className={`absolute left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs transition-colors ${
                            item.category === "faith" ? "bg-amber-500" :
                            item.category === "business" ? "bg-indigo-500" :
                            item.category === "career" ? "bg-teal-500" :
                            item.category === "marriage" ? "bg-rose-500" :
                            item.category === "financial" ? "bg-emerald-500" :
                            item.category === "health" ? "bg-red-500" :
                            item.category === "learning" ? "bg-purple-500" :
                            item.category === "ai" ? "bg-blue-600" : "bg-stone-500"
                          }`} />

                          <div className="p-3.5 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl transition space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-stone-400">{item.date}</span>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[8px] font-mono bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase">{item.category}</span>
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                  item.impact === "Critical" ? "bg-red-100 text-red-800" :
                                  item.impact === "High" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"
                                }`}>{item.impact} Impact</span>
                              </div>
                            </div>
                            <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                            <p className="text-xs text-stone-600 font-mono leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PURPOSE EVALUATOR */}
            {activeTab === "purpose" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Cognitive Purpose Engine & Barakah Auditing</h2>
                  <p className="text-xs text-stone-500 font-mono">Assesses proposed business decisions and life actions against ethical policies and spiritual missions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Action Evaluator Form */}
                  <form onSubmit={handleEvaluateAction} className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Evaluate Strategic Option</span>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Mission Vector</label>
                        <select
                          value={evalCategory}
                          onChange={(e) => setEvalCategory(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                        >
                          <option value="Islamic Mission">Islamic Mission Alignment</option>
                          <option value="Business Mission">Business Mission (Wonderware IoT)</option>
                          <option value="Family Mission">Family Legacy & Marriage Stability</option>
                          <option value="Career Mission">Career & Advisory Moat</option>
                          <option value="Learning Mission">Learning & Cognitive Growth</option>
                          <option value="Financial Mission">Financial Shariah Purification</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Describe Action or Decision</label>
                        <textarea
                          required
                          value={customActionToEvaluate}
                          onChange={(e) => setCustomActionToEvaluate(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 placeholder-stone-400 h-24"
                          placeholder="e.g. Utilize partial bank-backed interest debt line to quickly double raw manufacturing throughput metrics next month."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-950 hover:bg-stone-800 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-2 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Dispatch Purpose Evaluation</span>
                      </button>
                    </div>
                  </form>

                  {/* Evaluation Outputs */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Recent Alignment Evaluations</span>

                    <div className="space-y-4 max-h-[380px] overflow-y-auto">
                      {evaluatedActions.map((ea) => (
                        <div key={ea.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
                            <div>
                              <span className="text-[10px] bg-stone-200 text-stone-700 font-mono px-1.5 py-0.5 rounded font-bold uppercase">{ea.category}</span>
                              <h4 className="text-xs font-bold text-stone-900 mt-1">{ea.action}</h4>
                            </div>
                            <div className="flex space-x-2 font-mono text-[10px]">
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Purpose Score: {ea.purposeScore}%</span>
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Impact: {ea.impactScore}%</span>
                            </div>
                          </div>

                          <div className="text-xs space-y-1 font-mono">
                            <p className="text-stone-500"><strong>Opportunity Cost:</strong> <span className="text-stone-700">{ea.oppCost}</span></p>
                            <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2"><strong>Gabriel's Recommendation:</strong> {ea.recommendation}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] font-mono">
                            <span className="text-stone-400">Compliance standard: Strict ABAC Policy</span>
                            <span className={`font-bold ${
                              ea.status === "Approved" ? "text-emerald-700" : "text-rose-700"
                            }`}>
                              Status: {ea.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: LEGACY DASHBOARD */}
            {activeTab === "legacy" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900"> Barnes Generational Legacy & Waqf Dashboard</h2>
                  <p className="text-xs text-stone-500 font-mono">Tracks perpetual charity (Sadaqah Jariyah), familial alignment values, and digital knowledge transfer nodes</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Legacy Progress Meters */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Active Generational Metrics</span>

                    <div className="space-y-3 font-mono text-xs">
                      {[
                        { key: "lifeMissionProgress", label: "Life Mission Blueprint", value: legacyMetrics.lifeMissionProgress, color: "bg-amber-600" },
                        { key: "familyLegacy", label: "Family Value Alignment", value: legacyMetrics.familyLegacy, color: "bg-rose-500" },
                        { key: "knowledgeLegacy", label: "Perpetual Wisdom Nodes (Obsidian)", value: legacyMetrics.knowledgeLegacy, color: "bg-indigo-500" },
                        { key: "businessLegacy", label: "Purified Generational Sprints", value: legacyMetrics.businessLegacy, color: "bg-teal-500" },
                        { key: "islamicLegacy", label: "Perpetual Endowment Foundation", value: legacyMetrics.islamicLegacy, color: "bg-emerald-600" }
                      ].map((met) => (
                        <div key={met.key} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-stone-500 uppercase font-bold">{met.label}</span>
                            <span className="font-bold text-stone-900">{met.value}%</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div className={`${met.color} h-full transition-all duration-500`} style={{ width: `${met.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projections Simulator */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Long-Term Impact & Waqf Simulator</span>
                      <div className="flex space-x-1">
                        {[10, 25, 50].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => runLegacyProjections(yr)}
                            className={`px-2 py-1 rounded font-mono text-[9px] uppercase font-bold transition ${
                              impactProjectionYears === yr
                                ? "bg-amber-700 text-white"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                          >
                            {yr} Years
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50/20 border border-amber-200/50 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex items-center space-x-2 text-amber-800">
                        <Award className="h-5 w-5" />
                        <span className="font-bold">Calculated Perpetual Impact Report ({impactProjectionYears} Yr target)</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed text-xs">
                        {calculatedLegacyImpact}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-3 bg-stone-50 rounded border border-stone-200">
                        <span className="text-[9px] text-stone-500 uppercase font-bold block">Sadaqah Jariyah Index</span>
                        <span className="text-lg font-bold text-emerald-700 mt-1 block">A+ Pure</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded border border-stone-200">
                        <span className="text-[9px] text-stone-500 uppercase font-bold block">Consolidated Descendants Vault</span>
                        <span className="text-lg font-bold text-indigo-700 mt-1 block">Active (Encrypted)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: EXECUTIVE REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Executive Life Review Console</h2>
                    <p className="text-xs text-stone-500 font-mono">Automated and highly structured periodic logs analyzing achievements, lessons, and holistic progress</p>
                  </div>

                  <div className="flex space-x-1 bg-stone-100 p-1 rounded-lg">
                    {(["daily", "weekly", "monthly", "quarterly", "annual", "lifetime"] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setReviewPeriod(period);
                          onAddSignalREvent(`Generated executive review: ${period}`);
                        }}
                        className={`px-2.5 py-1 rounded font-mono text-[9px] uppercase font-bold transition ${
                          reviewPeriod === period
                            ? "bg-stone-950 text-white"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Core achievements section */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2 text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Major Achievements</span>
                    </span>
                    <p className="text-xs text-stone-700 leading-relaxed font-mono">
                      {reviewsData[reviewPeriod].achievements}
                    </p>
                  </div>

                  {/* Failures & lessons section */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2 text-rose-700 flex items-center space-x-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Identified Failures</span>
                    </span>
                    <p className="text-xs text-stone-700 leading-relaxed font-mono">
                      {reviewsData[reviewPeriod].failures}
                    </p>
                  </div>

                  {/* Primary Lessons Learned */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2 text-indigo-700 flex items-center space-x-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Primary Lessons</span>
                    </span>
                    <p className="text-xs text-stone-700 leading-relaxed font-mono">
                      {reviewsData[reviewPeriod].lessons}
                    </p>
                  </div>

                  {/* Faith & Relationship indices */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-stone-50/50">
                    <span className="text-[10px] text-stone-500 font-mono uppercase font-bold block border-b border-stone-200 pb-1">Spiritual State & Marriage</span>
                    <div className="space-y-2 text-xs font-mono text-stone-800">
                      <p><strong>Spiritual:</strong> {reviewsData[reviewPeriod].faith}</p>
                      <p><strong>Spouse sync:</strong> {reviewsData[reviewPeriod].marriage}</p>
                    </div>
                  </div>

                  {/* Career & Wonderware OEE */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-stone-50/50">
                    <span className="text-[10px] text-stone-500 font-mono uppercase font-bold block border-b border-stone-200 pb-1">Venture Outputs & Finances</span>
                    <div className="space-y-2 text-xs font-mono text-stone-800">
                      <p><strong>Wonderware OEE:</strong> {reviewsData[reviewPeriod].business}</p>
                      <p><strong>Advisory SLA:</strong> {reviewsData[reviewPeriod].career}</p>
                      <p><strong>Purification balance:</strong> {reviewsData[reviewPeriod].finance}</p>
                    </div>
                  </div>

                  {/* Health, wisdom & legacy indices */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-stone-50/50">
                    <span className="text-[10px] text-stone-500 font-mono uppercase font-bold block border-b border-stone-200 pb-1">Body, Brain & Generational Legacy</span>
                    <div className="space-y-2 text-xs font-mono text-stone-800">
                      <p><strong>Health span:</strong> {reviewsData[reviewPeriod].health}</p>
                      <p><strong>Wisdom embeddings:</strong> {reviewsData[reviewPeriod].knowledge}</p>
                      <p><strong>Barnes legacy focus:</strong> {reviewsData[reviewPeriod].legacy}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: AI BOARDROOM */}
            {activeTab === "boardroom" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">AI Boardroom & Multi-Dimensional Debater</h2>
                  <p className="text-xs text-stone-500 font-mono">Convenes specialized advisors (Gabriel, Islamic Scholar, Finance, Strategy, Health, Marriage) to stress-test your life decisions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Debate Dispatcher */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Submit Decision to Board</span>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Decision Topic to Audit</label>
                        <textarea
                          required
                          value={boardDecisionTopic}
                          onChange={(e) => setBoardDecisionTopic(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 placeholder-stone-400 h-28"
                          placeholder="e.g. Expand manufacturing lines by taking a conventional interest-bearing SBA credit line next quarter."
                        />
                      </div>

                      <button
                        onClick={triggerBoardroomDebate}
                        disabled={isDebating}
                        className="w-full py-2 bg-stone-950 hover:bg-stone-800 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-2 transition disabled:opacity-50"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{isDebating ? "Debating..." : "Dispatch Advisory Board"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Interactive debate flow */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Collaborative Debate Dialogue</span>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {boardDebateLog.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl font-mono text-stone-400 text-xs">
                          Advisory board ready. Enter a proposed decision and hit Dispatch to simulate debate logs.
                        </div>
                      ) : (
                        boardDebateLog.map((log, index) => (
                          <div key={index} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                            <div className="flex items-center justify-between border-b border-stone-200/50 pb-1">
                              <span className="font-bold text-stone-900 text-xs">{log.advisor}</span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                log.verdict === "Approved" ? "bg-emerald-100 text-emerald-800" :
                                log.verdict === "Non-Compliant" ? "bg-red-100 text-red-800" : "bg-stone-200 text-stone-700"
                              }`}>{log.verdict}</span>
                            </div>
                            <p className="text-xs text-stone-600 font-mono mt-1 leading-relaxed">{log.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {boardDebateLog.length > 0 && !isDebating && (
                      <div className="p-3.5 bg-amber-50/30 border border-amber-200 rounded-xl space-y-2 font-mono text-[11px]">
                        <div className="flex items-center justify-between font-bold text-amber-900 border-b border-amber-200 pb-1">
                          <span>Consensus Alignment Score</span>
                          <span>Compliance: {boardConsensus.compliance}% • Risk: {boardConsensus.risk}</span>
                        </div>
                        <p className="text-stone-700">
                          <strong>Advisory Consensus:</strong> {boardConsensus.finalVerdict}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: LIFE OPTIMIZATION ENGINE */}
            {activeTab === "optimization" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Life Optimization Engine & Tuning Core</h2>
                  <p className="text-xs text-stone-500 font-mono">Dynamically aligns calendar intervals, sleep metrics, and habit streaks for maximum spiritual productivity</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Optimizer controls */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4 bg-stone-50/50">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Optimization Dashboard</span>

                    <div className="space-y-3 font-mono text-xs">
                      {[
                        { label: "Schedule Efficiency", val: optimizationMetrics.scheduleEfficiency },
                        { label: "Energy Management", val: optimizationMetrics.energyManagement },
                        { label: "Deep Work Capacity", val: optimizationMetrics.deepWorkRatio },
                        { label: "Prayer Buffer Integrity", val: optimizationMetrics.prayerBufferScore },
                        { label: "Delegation Percentage", val: optimizationMetrics.delegationRate },
                        { label: "Spiritual Barakah multiplier", val: optimizationMetrics.barakahMultiplier }
                      ].map((met, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2.5 border border-stone-200 rounded-lg">
                          <span className="text-stone-500 font-bold uppercase text-[9px]">{met.label}</span>
                          <span className="font-bold text-stone-900">{met.val}%</span>
                        </div>
                      ))}

                      <button
                        onClick={runLifeOptimizer}
                        disabled={isRunningOptimization}
                        className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-2 transition disabled:opacity-50 mt-4"
                      >
                        <Sliders className="h-4 w-4" />
                        <span>{isRunningOptimization ? "Optimizing State..." : "Optimize Life & Schedules Now"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Logs terminal */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Algorithmic Optimization Streams</span>

                    <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-64 overflow-y-auto">
                      {optimizationLogs.length === 0 ? (
                        <span className="text-stone-500">Optimizer standing by. Click the button to align all digital twin schedules.</span>
                      ) : (
                        optimizationLogs.map((log, index) => (
                          <div key={index} className="leading-relaxed">
                            <span className="text-amber-400">{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Automation & Delegate Section */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">
                    Approval-Based Autonomous Automation Rules
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automationRules.map((rule) => (
                      <div key={rule.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase font-mono">{rule.type}</span>
                            <span className={`text-[8px] font-mono font-bold ${
                              rule.autoApprove ? "text-emerald-700" : "text-amber-700"
                            }`}>{rule.autoApprove ? "AUTO-EXECUTE" : "CONSENT MANDATE"}</span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 mt-2">{rule.action}</h4>
                          <span className="text-[9px] text-stone-400 font-mono block mt-1">Rule Trigger: {rule.threshold}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 mt-auto text-[10px] font-mono">
                          <span className="text-stone-500">Status: {rule.status}</span>
                          <button
                            onClick={() => {
                              setAutomationRules(prev =>
                                prev.map(r => r.id === rule.id ? { ...r, autoApprove: !r.autoApprove } : r)
                              );
                              onAddSignalREvent(`Mutated automation consensus for: ${rule.action}`);
                            }}
                            className="text-[9px] text-indigo-600 hover:underline font-bold"
                          >
                            Toggle Consent
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: INTERACTIVE API SANDBOX */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Gabriel Digital Twin API & Swagger Sandbox</h2>
                  <p className="text-xs text-stone-500 font-mono">Simulate core JSON endpoints, explore OpenAPI schemas, and audit integration responses</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Interactive Swagger Endpoint Switcher */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Swagger OpenAPI 3.0 Endpoints</span>

                    <div className="space-y-3 font-mono text-[10px]">
                      {[
                        { route: "get_twin", verb: "GET", path: "/api/v1/twin/state", desc: "Retrieves complete cognitive digital twin vector model state." },
                        { route: "post_concierge", verb: "POST", path: "/api/v1/concierge/reprioritize", desc: "Automates calendar protection and prayer shift displacements." },
                        { route: "evaluate_purpose", verb: "POST", path: "/api/v1/purpose/evaluate", desc: "Audits strategic corporate or personal actions against rules." },
                        { route: "get_legacy", verb: "GET", path: "/api/v1/legacy/project", desc: "Projects long-term family value alignments and Waqf assets." }
                      ].map((item) => (
                        <button
                          key={item.route}
                          onClick={() => runApiRouteSimulation(item.route)}
                          className={`w-full p-3 border rounded-xl text-left transition flex flex-col space-y-1.5 ${
                            activeApiRoute === item.route
                              ? "bg-stone-950 border-stone-950 text-white"
                              : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                              item.verb === "GET" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
                            }`}>{item.verb}</span>
                            <span className="font-bold text-[11px]">{item.path}</span>
                          </div>
                          <span className="text-[9px] text-stone-400 font-mono leading-relaxed">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Terminal Console response */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Response Payload Terminal</span>

                    <div className="relative">
                      <pre className="bg-stone-900 text-stone-100 text-[10px] font-mono p-5 rounded-xl overflow-x-auto h-[320px] border border-stone-800 leading-relaxed">
                        {apiTerminalOutput === "" ? (
                          <span className="text-stone-500">Select an API route in the Swagger panel to dispatch and display the live JSON mock response payload.</span>
                        ) : (
                          apiTerminalOutput
                        )}
                      </pre>
                      {apiTerminalOutput !== "" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(apiTerminalOutput);
                            onAddSignalREvent(`Copied API mock payload for: ${activeApiRoute}`);
                          }}
                          className="absolute right-3 top-3 p-1.5 bg-stone-800 hover:bg-stone-700 transition rounded text-stone-300"
                          title="Copy JSON Payload"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: PLAYBOOK TESTS */}
            {activeTab === "tests" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Project Jannah Comprehensive Test Runner</h2>
                  <p className="text-xs text-stone-500 font-mono">Runs real-time logical validations across digital twin engines, checking alignment rules and tracking code coverage</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left panel: Test assertions lists */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-4 bg-stone-50/20">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Unit & Integration Assertions</span>
                      <span className="text-[10px] text-stone-500 font-mono">Coverage: {testCoverageScore}%</span>
                    </div>

                    <div className="space-y-2.5 font-mono text-[9px] max-h-[300px] overflow-y-auto">
                      {testSuite.map((test) => (
                        <div key={test.id} className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between">
                          <span className="text-stone-700 font-bold truncate pr-3">{test.name}</span>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-stone-400">{test.latency}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">PASSED</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={runPlaybookTests}
                      disabled={isRunningTests}
                      className="w-full py-2 bg-stone-950 hover:bg-stone-800 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>{isRunningTests ? "Running Tests..." : "Trigger Full Playbook Test Suite"}</span>
                    </button>
                  </div>

                  {/* Right panel: Terminal logs output */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Real-time Test Compilation Stream</span>

                    <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-[280px] overflow-y-auto">
                      {testConsoleLogs.length === 0 ? (
                        <span className="text-stone-500">Test console standing by. Re-run suite to print validation assertions in real-time.</span>
                      ) : (
                        testConsoleLogs.map((log, index) => (
                          <div key={index} className="leading-relaxed">
                            {log.includes("[SUCCESS]") ? (
                              <span className="text-emerald-400 font-bold">{log}</span>
                            ) : log.includes("[TEST]") ? (
                              <span className="text-indigo-300">{log}</span>
                            ) : (
                              <span className="text-stone-300">{log}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 11: ARCHITECTURE SPECS */}
            {activeTab === "architecture" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                      <Workflow className="h-5 w-5 text-amber-600" />
                      LifeOS v6.0 Blueprint: Enterprise Modular Monolith
                    </h2>
                    <p className="text-xs text-stone-500 font-mono">Consolidating simulated microservices into high-integrity domain slices with structured aggregates & real-world gateways</p>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded font-bold">
                    Target State: Monolith First (Non-Distributed)
                  </span>
                </div>

                {/* 5-Layered Architecture Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-xs">
                  {[
                    { title: "1. API Routing Gateways", tech: "HTTP, Minimal APIs, WASM", desc: "Aggregates external secure webhooks and unified frontend event pings. No business logic permitted." },
                    { title: "2. Application Layer", tech: "MediatR, Commands, Queries", desc: "Orchestrates transactions, handles use-case pipelines, and manages transaction boundaries cleanly." },
                    { title: "3. Domain Layer", tech: "Aggregates, Invariants, Entities", desc: "Core business models (SalahLog, Portfolio) enforcing Shariah and physical invariants." },
                    { title: "4. Infrastructure Core", tech: "Drizzle, Qdrant SDK, PG, Redis", desc: "Concrete adapters for databases, dense vectors, caching, and mail service providers." },
                    { title: "5. Canonical Persistence", tech: "Postgres, Redis, Qdrant", desc: "No localStorage system-of-record. Absolute database-backed storage layers." }
                  ].map((layer, idx) => (
                    <div key={idx} className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-1">
                      <div className="text-stone-400 text-[10px] font-bold uppercase">Layer {idx + 1}</div>
                      <h4 className="font-bold text-stone-950">{layer.title}</h4>
                      <div className="text-[9px] text-amber-700 bg-amber-50/40 px-1.5 py-0.5 rounded w-max">{layer.tech}</div>
                      <p className="text-[10px] text-stone-500 leading-snug pt-1">{layer.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Section 1: Interactive Milestone 1 Vertical Slice Tracer */}
                <div className="border border-stone-200 rounded-xl p-5 bg-white space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 font-mono uppercase flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-emerald-600" />
                        Milestone 1: End-to-End Vertical Slice Execution Tracer
                      </h3>
                      <p className="text-[10px] text-stone-500 font-mono">Simulate a user creating a goal, persisting in PostgreSQL, fanning out local event handlers, vectorizing memory, and syncing with GitHub.</p>
                    </div>
                    <div className="flex gap-2">
                      {sliceCurrentStep >= 0 && (
                        <button
                          onClick={() => {
                            setSliceLogs([]);
                            setSliceCurrentStep(-1);
                          }}
                          className="px-2.5 py-1 text-[10px] border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg font-mono"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={runVerticalSliceSimulation}
                        disabled={isSimulatingSlice}
                        className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-white rounded-lg font-bold text-[10px] flex items-center gap-1.5 transition disabled:opacity-50 font-mono"
                      >
                        {isSimulatingSlice ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Tracing Step {sliceCurrentStep + 1}/7...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 text-emerald-400" />
                            <span>{sliceCurrentStep >= 0 ? "Re-Run Complete Tracer" : "Execute Milestone 1 Slice"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Progression Visual Stepper */}
                    <div className="lg:col-span-5 space-y-2 font-mono text-[10px]">
                      {[
                        { title: "Authentication Ingress (IdentityOS)", icon: User, desc: "User logs in, session token generated via safe proxy API." },
                        { title: "Command Dispatch (StrategyOS)", icon: FileText, desc: "CreateGoalCommand hydrated & dispatched via local MediatR." },
                        { title: "Canonical SQL Persistence (Postgres)", icon: Database, desc: "Drizzle ORM compiles & commits the goal transaction cleanly." },
                        { title: "In-Process Event Bus Fan-Out", icon: Zap, desc: "GoalCreatedEvent triggers immediate multi-threaded local callbacks." },
                        { title: "Memory Embeddings Sync (Qdrant)", icon: Brain, desc: "Semantic vectors written to dense collections via Qdrant SDK." },
                        { title: "PAS Recalculator Core", icon: Sliders, desc: "The composite Purpose Alignment Score gets updated." },
                        { title: "External GitHub Issue Sync", icon: Bookmark, desc: "Dispatches HTTPS outbound webhook to map real-time tracker logs." }
                      ].map((step, idx) => {
                        const StepIcon = step.icon;
                        const isPending = sliceCurrentStep < idx;
                        const isActive = sliceCurrentStep === idx;
                        const isCompleted = sliceCurrentStep > idx;

                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all duration-300 ${
                              isActive
                                ? "bg-amber-50/40 border-amber-300 text-stone-900 shadow-sm"
                                : isCompleted
                                ? "bg-stone-50/50 border-stone-200 text-stone-600"
                                : "border-stone-100 text-stone-400"
                            }`}
                          >
                            <div className="pt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : isActive ? (
                                <RefreshCw className="h-4 w-4 text-amber-600 animate-spin shrink-0" />
                              ) : (
                                <div className="h-4 w-4 border border-stone-300 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 text-stone-400 bg-white">
                                  {idx + 1}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                <StepIcon className={`h-3 w-3 ${isActive ? "text-amber-600" : isCompleted ? "text-emerald-600" : "text-stone-400"}`} />
                                {step.title}
                              </div>
                              <p className="text-[9px] text-stone-400 leading-tight mt-0.5">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Trace Logs Console */}
                    <div className="lg:col-span-7 flex flex-col h-full min-h-[300px]">
                      <div className="bg-stone-950 rounded-xl p-4 font-mono text-[10px] text-stone-200 flex-1 flex flex-col justify-between border border-stone-800">
                        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                          {sliceLogs.length === 0 ? (
                            <div className="h-[280px] flex flex-col items-center justify-center text-stone-500 space-y-1">
                              <Terminal className="h-6 w-6 text-stone-600" />
                              <p>Execution Stream standing by.</p>
                              <p className="text-[9px] text-stone-600">Click &quot;Execute Milestone 1 Slice&quot; to begin end-to-end tracing.</p>
                            </div>
                          ) : (
                            sliceLogs.map((log, index) => (
                              <div key={index} className="border-l-2 border-amber-500/50 pl-2 py-0.5 space-y-1 whitespace-pre-wrap leading-relaxed">
                                {log.split("\n").map((line, lIdx) => {
                                  let colorClass = "text-stone-300";
                                  if (line.includes("[SUCCESS]")) colorClass = "text-emerald-400 font-bold";
                                  else if (line.includes("[API INGRESS]")) colorClass = "text-amber-300";
                                  else if (line.includes("[APPLICATION]")) colorClass = "text-blue-300";
                                  else if (line.includes("[POSTGRESQL]")) colorClass = "text-sky-300";
                                  else if (line.includes("[EVENT BUS]")) colorClass = "text-purple-300";
                                  else if (line.includes("[Qdrant SDK]")) colorClass = "text-pink-300";
                                  else if (line.includes("[PAS SERVICE]")) colorClass = "text-teal-300";
                                  else if (line.includes("[EXTERNAL GATEWAY]")) colorClass = "text-emerald-300";
                                  return (
                                    <div key={lIdx} className={colorClass}>
                                      {line}
                                    </div>
                                  );
                                })}
                              </div>
                            ))
                          )}
                        </div>
                        {sliceLogs.length > 0 && (
                          <div className="border-t border-stone-800 pt-2.5 mt-2.5 flex justify-between items-center text-[9px] text-stone-500">
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Trace Session
                            </span>
                            <span>Traced in local in-memory worker context</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Interactive Explainable PAS Composite Index Playground */}
                <div className="border border-amber-200 rounded-xl p-5 bg-amber-50/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 font-mono uppercase flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-amber-600" />
                        Explainable PAS Composite Index Playground
                      </h3>
                      <p className="text-[10px] text-stone-500 font-mono">Rather than an opaque single score, PAS is a structured composite index. Drag sliders to adjust weight and performance metrics.</p>
                    </div>
                    <button
                      onClick={() => {
                        setPasWeights({ deen: 95, family: 85, health: 80, knowledge: 85, business: 75, finance: 80, community: 75, legacy: 90 });
                        setPasPerformances({ deen: 94, family: 85, health: 86, knowledge: 89, business: 87, finance: 92, community: 75, legacy: 80 });
                      }}
                      className="px-2 py-1 text-[10px] border border-amber-200 text-amber-800 hover:bg-amber-50 rounded font-mono"
                    >
                      Reset Weights & Performance
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sliders Panel */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: "deen", label: "Spiritual Dimension (Deen)", color: "accent-emerald-600" },
                          { key: "family", label: "Family Dynamics", color: "accent-blue-600" },
                          { key: "health", label: "Physical Health & Fitness", color: "accent-rose-600" },
                          { key: "knowledge", label: "Cognitive Knowledge & learning", color: "accent-indigo-600" },
                          { key: "business", label: "Corporate BusinessOS OEE", color: "accent-amber-600" },
                          { key: "finance", label: "Liquid FinanceOS purification", color: "accent-orange-600" },
                          { key: "community", label: "Waqf & community networks", color: "accent-teal-600" },
                          { key: "legacy", label: "Generational Family Trust Legacy", color: "accent-purple-600" }
                        ].map(dim => {
                          const k = dim.key as keyof typeof pasWeights;
                          return (
                            <div key={dim.key} className="border border-stone-200 rounded-lg p-3 bg-white space-y-2 font-mono text-[10px]">
                              <div className="font-bold text-stone-800 flex justify-between">
                                <span>{dim.label}</span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] text-stone-500">
                                  <span>Weight: {pasWeights[k]}%</span>
                                  <span>Value: {pasPerformances[k]}/100</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] text-stone-400 w-10">Weight</span>
                                    <input
                                      type="range"
                                      min="10"
                                      max="100"
                                      value={pasWeights[k]}
                                      onChange={(e) => setPasWeights(prev => ({ ...prev, [k]: parseInt(e.target.value) }))}
                                      className={`w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer ${dim.color}`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] text-stone-400 w-10">Value</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={pasPerformances[k]}
                                      onChange={(e) => setPasPerformances(prev => ({ ...prev, [k]: parseInt(e.target.value) }))}
                                      className={`w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer ${dim.color}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gauge and Explanation Column */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* PAS Gauge Display */}
                      <div className="border border-amber-200 rounded-xl p-5 bg-amber-50/20 text-center space-y-4">
                        <span className="text-[10px] font-mono text-amber-800 uppercase font-bold tracking-wider block">Calculated Composite PAS</span>
                        
                        {/* Live Score Ring */}
                        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            {/* Background Track */}
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              className="stroke-amber-100"
                              strokeWidth="10"
                              fill="transparent"
                            />
                            {/* Animated Value Ring */}
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              className="stroke-amber-600 transition-all duration-500 ease-out"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={351.8}
                              strokeDashoffset={351.8 - (351.8 * (Math.round((
                                (pasPerformances.deen * (pasWeights.deen / 100)) +
                                (pasPerformances.family * (pasWeights.family / 100)) +
                                (pasPerformances.health * (pasWeights.health / 100)) +
                                (pasPerformances.knowledge * (pasWeights.knowledge / 100)) +
                                (pasPerformances.business * (pasWeights.business / 100)) +
                                (pasPerformances.finance * (pasWeights.finance / 100)) +
                                (pasPerformances.community * (pasWeights.community / 100)) +
                                (pasPerformances.legacy * (pasWeights.legacy / 100))
                              ) / ((pasWeights.deen + pasWeights.family + pasWeights.health + pasWeights.knowledge + pasWeights.business + pasWeights.finance + pasWeights.community + pasWeights.legacy) || 1) * 100) / 100)) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black font-mono text-stone-900">
                              {Math.round((
                                (pasPerformances.deen * (pasWeights.deen / 100)) +
                                (pasPerformances.family * (pasWeights.family / 100)) +
                                (pasPerformances.health * (pasWeights.health / 100)) +
                                (pasPerformances.knowledge * (pasWeights.knowledge / 100)) +
                                (pasPerformances.business * (pasWeights.business / 100)) +
                                (pasPerformances.finance * (pasWeights.finance / 100)) +
                                (pasPerformances.community * (pasWeights.community / 100)) +
                                (pasPerformances.legacy * (pasWeights.legacy / 100))
                              ) / ((pasWeights.deen + pasWeights.family + pasWeights.health + pasWeights.knowledge + pasWeights.business + pasWeights.finance + pasWeights.community + pasWeights.legacy) || 1) * 100) / 100}%
                            </span>
                            <span className="text-[8px] font-mono uppercase font-bold text-amber-700 tracking-wider">PAS Index</span>
                          </div>
                        </div>

                        {/* Hydrated Equation */}
                        <div className="bg-stone-950 text-amber-400 p-3 rounded-lg font-mono text-[9px] text-center border border-stone-800 space-y-1">
                          <div className="text-stone-400 font-bold">EXPLAINABLE MATH ALIGNMENT</div>
                          <div className="text-white break-all leading-relaxed">
                            PAS = (({pasWeights.deen}×{pasPerformances.deen} + {pasWeights.family}×{pasPerformances.family} + {pasWeights.health}×{pasPerformances.health} + {pasWeights.knowledge}×{pasPerformances.knowledge} + {pasWeights.business}×{pasPerformances.business} + {pasWeights.finance}×{pasPerformances.finance} + {pasWeights.community}×{pasPerformances.community} + {pasWeights.legacy}×{pasPerformances.legacy}) / {pasWeights.deen + pasWeights.family + pasWeights.health + pasWeights.knowledge + pasWeights.business + pasWeights.finance + pasWeights.community + pasWeights.legacy})
                          </div>
                        </div>
                      </div>

                      {/* Explainability Engine Prompter Context */}
                      <div className="border border-stone-200 rounded-xl p-4 bg-white font-mono text-[10px] space-y-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 block">AI Platform Explainability Analysis</span>
                        <div className="text-stone-600 leading-relaxed text-[11px]">
                          {(() => {
                            const scores = [
                              { key: "Spiritual", val: pasPerformances.deen },
                              { key: "Family", val: pasPerformances.family },
                              { key: "Health", val: pasPerformances.health },
                              { key: "Learning", val: pasPerformances.knowledge },
                              { key: "Business", val: pasPerformances.business },
                              { key: "Finance", val: pasPerformances.finance },
                              { key: "Community", val: pasPerformances.community },
                              { key: "Legacy", val: pasPerformances.legacy }
                            ];
                            const sorted = [...scores].sort((a, b) => a.val - b.val);
                            const lowest = sorted[0];
                            const highest = sorted[sorted.length - 1];

                            return (
                              <p>
                                The anchor of highest alignment is the <strong className="text-emerald-700">{highest.key}</strong> dimension with a value of {highest.val}/100.
                                The priority recommendation focuses on optimizing the <strong className="text-rose-700">{lowest.key}</strong> dimension ({lowest.val}/100), which represents the current limiting invariant constraint. Under v6.0 architecture guidelines, the AI Router will pre-emptively decline corporate expansion workflows that degrade this constraint.
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Bounded Contexts, PlatformOS, and Product Boundaries Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Bounded Contexts (Including PlatformOS) */}
                  <div className="lg:col-span-6 border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block">
                        LifeOS Bounded Contexts (Monolith Slices)
                      </span>
                      <span className="text-[9px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">10 Domains Isolated</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-[10px] font-mono">
                      {[
                        { name: "IslamOS", desc: "Salah logs, Charity purification", color: "bg-emerald-50 text-emerald-800 border-emerald-100" },
                        { name: "BusinessOS", desc: "Wonderware Line OEE aggregation", color: "bg-amber-50 text-amber-800 border-amber-100" },
                        { name: "FinanceOS", desc: "Double-entry Shariah ledgers", color: "bg-blue-50 text-blue-800 border-blue-100" },
                        { name: "KnowledgeOS", desc: "Personal wiki markdown indexes", color: "bg-purple-50 text-purple-800 border-purple-100" },
                        { name: "TwinOS", desc: "Multi-projection cognitive self", color: "bg-indigo-50 text-indigo-800 border-indigo-100" },
                        { name: "MemoryOS", desc: "Qdrant dense vector arrays", color: "bg-pink-50 text-pink-800 border-pink-100" },
                        { name: "StrategyOS", desc: "Milestones & composite PAS", color: "bg-sky-50 text-sky-800 border-sky-100" },
                        { name: "AutomationOS", desc: "In-process active event chains", color: "bg-rose-50 text-rose-800 border-rose-100" },
                        { name: "IdentityOS", desc: "Secure API Auth, tenant policies", color: "bg-orange-50 text-orange-800 border-orange-100" },
                        { name: "PlatformOS", desc: "Config, Licensing, BG Jobs, email/SMS, notifications", color: "bg-stone-100 text-stone-800 border-stone-200 font-bold" }
                      ].map((bc, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-left flex flex-col justify-between ${bc.color}`}>
                          <strong className="block">{bc.name}</strong>
                          <span className="text-[8px] opacity-80 mt-1 leading-tight">{bc.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Boundaries Matrix */}
                  <div className="lg:col-span-6 border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block">
                        43v3r Platform Umbrella Boundaries
                      </span>
                      <span className="text-[9px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">Commercial SaaS Setup</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-[10px] text-stone-600 border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-900">
                            <th className="pb-1.5 font-bold">Product</th>
                            <th className="pb-1.5 font-bold">UI Domain Owned</th>
                            <th className="pb-1.5 font-bold">Platform Services Consumed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {[
                            { name: "LifeOS", ui: "Spouse synchronizer, Daily Reviews", platform: "PlatformOS Core, MemoryOS" },
                            { name: "IslamOS", ui: "Salah Log, Purification ledger", platform: "PlatformOS BG Jobs, IdentityOS" },
                            { name: "MES Suite", ui: "Wonderware line OEE telemetry", platform: "PlatformOS config system, Events" },
                            { name: "IT Copilot", ui: "Client SLA tracker, system maps", platform: "MemoryOS, In-Process Event Bus" },
                            { name: "BusinessOS", ui: "Corporate accounts, transaction logs", platform: "IdentityOS multi-tenant adapter" }
                          ].map((p, idx) => (
                            <tr key={idx} className="hover:bg-stone-50">
                              <td className="py-2 font-bold text-stone-900">{p.name}</td>
                              <td className="py-2 text-[9px]">{p.ui}</td>
                              <td className="py-2 text-[9px] text-amber-800 bg-amber-50/20 px-1.5 rounded">{p.platform}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section 4: Enterprise ADR (Architecture Decision Record) Catalog */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: ADR Index Selection List */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-4 bg-white">
                    <div className="border-b border-stone-100 pb-2 flex flex-col gap-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block">
                        Enterprise ADR Catalog
                      </span>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Search records (e.g. Postgres, Monolith)..."
                          value={adrSearchQuery}
                          onChange={(e) => setAdrSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-[10px] font-mono border border-stone-200 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[340px] overflow-y-auto font-mono text-[10px]">
                      {[
                        { id: "adr-1", code: "ADR-001", title: "PostgreSQL Core Relational Store", type: "Core DB" },
                        { id: "adr-2", code: "ADR-002", title: "Qdrant Dedicated Vector Engine", type: "Vector Store" },
                        { id: "adr-3", code: "ADR-003", title: "Enterprise Modular Monolith", type: "Architecture" },
                        { id: "adr-4", code: "ADR-004", title: "In-Process Event Bus", type: "Messaging" }
                      ]
                        .filter(adr =>
                          adr.title.toLowerCase().includes(adrSearchQuery.toLowerCase()) ||
                          adr.code.toLowerCase().includes(adrSearchQuery.toLowerCase()) ||
                          adr.type.toLowerCase().includes(adrSearchQuery.toLowerCase())
                        )
                        .map((adr) => (
                          <button
                            key={adr.id}
                            onClick={() => setAdrActiveId(adr.id)}
                            className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                              adrActiveId === adr.id
                                ? "bg-amber-50/50 border-amber-300 text-stone-900"
                                : "bg-stone-50/30 border-stone-100 hover:border-stone-300 text-stone-600"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 rounded">{adr.code}</span>
                              <h4 className="font-bold text-stone-900">{adr.title}</h4>
                            </div>
                            <span className="text-[8px] border border-stone-200 px-1 rounded text-stone-400 bg-white">{adr.type}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Right: ADR Detailed Viewer */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 bg-white space-y-4">
                    {(() => {
                      const activeAdr = [
                        {
                          id: "adr-1",
                          code: "ADR-001",
                          title: "PostgreSQL Core Relational Store",
                          status: "Approved",
                          date: "2026-07-01",
                          context: "The platform requires a highly reliable, ACID-compliant transaction boundary for storing user accounts, financial ledgers, purifications, and core domain aggregates.",
                          decision: "Select PostgreSQL as the canonical, absolute source-of-truth database for all structural relational tables.",
                          alternatives: "Relational database platforms like Microsoft SQL Server and MySQL were evaluated. PostgreSQL was selected for its open-source license, robust Drizzle ORM integration, and compatibility with advanced JSON/array operations.",
                          consequences: "Achieves absolute durability and transaction boundaries. Avoids localStorage dependencies. Requires migration plans during schema evolution."
                        },
                        {
                          id: "adr-2",
                          code: "ADR-002",
                          title: "Qdrant Dedicated Vector Engine",
                          status: "Approved",
                          date: "2026-07-02",
                          context: "To power the cognitive self-model and memory graph, the platform must store and perform fast semantic search on high-dimensional vector embeddings generated from voice memos, chat logs, and daily reflections.",
                          decision: "Adopt Qdrant as the dedicated vector search engine, utilizing the Qdrant TypeScript/Node SDK.",
                          alternatives: "Compared pgvector and Pinecone. While pgvector is convenient, a dedicated Qdrant instance provides superior indexing speed, payload filtering, and cluster isolation for multi-tenant SaaS scaling.",
                          consequences: "Ensures sub-10ms semantic searches across millions of memory points. Decouples vector storage from relational workloads."
                        },
                        {
                          id: "adr-3",
                          code: "ADR-003",
                          title: "Enterprise Modular Monolith",
                          status: "Approved",
                          date: "2026-07-03",
                          context: "Early stage SaaS architectures often suffer from over-engineered microservices, which introduce high latency, deployment complexity, and expensive network overhead.",
                          decision: "Enforce a Modular Monolith architecture, separating modules by explicit domain boundaries with clean public APIs, but running in a single process.",
                          alternatives: "Distributed microservices (Kubernetes, AWS ECS) were considered. We rejected them to maintain a single deployment boundary, single transaction boundaries, simpler debugging, and drastically lower cloud maintenance costs.",
                          consequences: "High-integrity architecture that can be selectively extracted into microservices only when concrete metrics demonstrate performance bottlenecks."
                        },
                        {
                          id: "adr-4",
                          code: "ADR-004",
                          title: "In-Process Event Bus",
                          status: "Approved",
                          date: "2026-07-04",
                          context: "Core modules must remain decoupled, yet communicate state changes (e.g., notifying MemoryOS when StrategyOS creates a goal). We need a high-performance event publisher.",
                          decision: "Implement an in-process local Event Bus that dispatches events immediately in memory using local thread routing.",
                          alternatives: "Compared distributed message brokers like Apache Kafka, RabbitMQ, and Redis PubSub. We rejected distributed brokers in Milestone 1 to avoid network failure modes, serialisation overheads, and complex infrastructure hosting costs.",
                          consequences: "Instant local fan-out with zero network overhead. Easy transition to Redis or Kafka in the future by simply swapping the Event Bus implementation adapter."
                        }
                      ].find(adr => adr.id === adrActiveId) || {
                        id: "adr-1",
                        code: "ADR-001",
                        title: "PostgreSQL Core Relational Store",
                        status: "Approved",
                        date: "2026-07-01",
                        context: "The platform requires a highly reliable, ACID-compliant transaction boundary for storing user accounts, financial ledgers, purifications, and core domain aggregates.",
                        decision: "Select PostgreSQL as the canonical, absolute source-of-truth database for all structural relational tables.",
                        alternatives: "Relational database platforms like Microsoft SQL Server and MySQL were evaluated. PostgreSQL was selected for its open-source license, robust Drizzle ORM integration, and compatibility with advanced JSON/array operations.",
                        consequences: "Achieves absolute durability and transaction boundaries. Avoids localStorage dependencies. Requires migration plans during schema evolution."
                      };

                      return (
                        <div className="font-mono text-[10px] space-y-3.5">
                          <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                            <div>
                              <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 rounded">{activeAdr.code}</span>
                              <h4 className="text-xs font-bold text-stone-900 mt-1">{activeAdr.title}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase">{activeAdr.status}</span>
                              <div className="text-[8px] text-stone-400 mt-1">Date: {activeAdr.date}</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-stone-400">1. Context & Problem Challenge</span>
                              <p className="text-[10px] text-stone-600 leading-relaxed pl-2 border-l border-stone-200">{activeAdr.context}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-amber-700">2. Architectural Decision</span>
                              <p className="text-[10px] text-stone-800 font-bold leading-relaxed pl-2 border-l border-amber-500 bg-amber-50/10 p-1 rounded">{activeAdr.decision}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-stone-400">3. Alternatives Considered & Rejected</span>
                              <p className="text-[10px] text-stone-600 leading-relaxed pl-2 border-l border-stone-200">{activeAdr.alternatives}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-stone-400">4. Architectural Consequences</span>
                              <p className="text-[10px] text-stone-600 leading-relaxed pl-2 border-l border-stone-200">{activeAdr.consequences}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Section 5: Separation of Graphs & Digital Twin Projections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Separation of Graphs */}
                  <div className="lg:col-span-6 border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                    <div className="border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block">
                        Knowledge Graph vs. Memory Graph Separation
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
                      <div className="p-3 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-2">
                        <strong className="text-indigo-900 block flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          Knowledge Graph (Structured)
                        </strong>
                        <p className="text-[9px] text-stone-500 leading-relaxed">
                          Contains explicit aggregates: objectives, actions, corporate policies, Shariah rules, contacts, and transaction tables.
                        </p>
                        <span className="text-[8px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded block w-max">Queries: Structural REST, GraphQL</span>
                      </div>
                      <div className="p-3 bg-pink-50/20 border border-pink-100 rounded-xl space-y-2">
                        <strong className="text-pink-900 block flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5" />
                          Memory Graph (Episodic)
                        </strong>
                        <p className="text-[9px] text-stone-500 leading-relaxed">
                          Captures chronological audio memo logs, chat summaries, emotional states, and contextual reflections vectorized in Qdrant.
                        </p>
                        <span className="text-[8px] bg-pink-50 text-pink-800 px-1.5 py-0.5 rounded block w-max">Queries: Semantic Vector Search</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Digital Twin Projections */}
                  <div className="lg:col-span-6 border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block">
                        Formalized Digital Twin Projections
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold">8 Active Projections</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[9px] font-mono">
                      {[
                        { name: "Physical Twin", val: `${digitalSelf.energy}% Energy`, desc: "Garmin Sleep, HRV tracking", status: "ONLINE" },
                        { name: "Spiritual Twin", val: `${digitalSelf.faith}% Faith`, desc: "Salah log congruence", status: "ONLINE" },
                        { name: "Financial Twin", val: `£${(digitalSelf.finances * 1500).toLocaleString()}`, desc: "Asset ledgers purification", status: "ONLINE" },
                        { name: "Professional Twin", val: `${digitalSelf.career}% SLA`, desc: "Advisory client indicators", status: "ONLINE" },
                        { name: "Relationship Twin", val: `${digitalSelf.relationships}% Harmony`, desc: "Chore balancing metrics", status: "ONLINE" },
                        { name: "Knowledge Twin", val: `${digitalSelf.learning}% Index`, desc: "Personal wiki node count", status: "ONLINE" },
                        { name: "Operational Twin", val: `${optimizationMetrics.scheduleEfficiency}% Efficiency`, desc: "Cron background tasks", status: "ONLINE" },
                        { name: "Health Twin", val: `${digitalSelf.health}% Metabolic`, desc: "Caloric organic profiling", status: "ONLINE" }
                      ].map((proj, idx) => (
                        <div key={idx} className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between text-left">
                          <div>
                            <span className="font-bold text-stone-900 block">{proj.name}</span>
                            <span className="text-[8px] text-stone-400 block mt-0.5 leading-tight">{proj.desc}</span>
                          </div>
                          <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between">
                            <span className="font-bold text-stone-700">{proj.val}</span>
                            <span className="text-[7px] text-emerald-600 bg-emerald-50 px-1 rounded">{proj.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 6: Versioned Workflows Engine & Event Ledger */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Versioned Workflows Engine */}
                  <div className="lg:col-span-5 border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                    <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block">
                        Versioned Workflows Schema Engine
                      </span>
                      <span className="text-[9px] font-mono bg-purple-50 text-purple-800 border border-purple-100 px-1.5 py-0.2 rounded font-bold">Active: v1.2.0</span>
                    </div>
                    <div className="bg-stone-950 p-4 rounded-xl font-mono text-[8px] text-purple-300 leading-relaxed overflow-x-auto border border-stone-800 h-[190px]">
                      <pre>{`{
  "workflow": "WeeklyClientPurificationSLA",
  "version": "1.2.0",
  "trigger": "Cron(Monday 09:00)",
  "conditions": {
    "HasUnpurifiedDividends": true
  },
  "steps": [
    {
      "step": 1,
      "action": "ComputePurificationFee",
      "args": { "rate": 0.025 }
    },
    {
      "step": 2,
      "action": "SecureConsentMessage",
      "args": { "channel": "Slack" }
    },
    {
      "step": 3,
      "action": "ReallocateCharity",
      "args": { "target": "PurificationPool" }
    }
  ],
  "compensation": "RevertCharityReserveUpdate",
  "auditLogStatus": "PERSISTED"
}`}</pre>
                    </div>
                  </div>

                  {/* Right: Selective Event Sourcing Ledger Log */}
                  <div className="lg:col-span-7 border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">
                        Selective Event Sourcing Ledger (Immutable Domain Audit Log)
                      </span>
                      <span className="text-[9px] text-amber-600 font-mono uppercase font-bold">Event Log: Enabled</span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-mono">
                      Transactions, purification audits, and critical business rules utilize selective Event Sourcing to maintain complete history, replayability and audit security.
                    </p>
                    <div className="space-y-1.5 font-mono text-[9px]">
                      {[
                        { ev: "SalahLoggedEvent", payload: '{"SalahId":"e_1","Congregation":true,"BarakahMultiplier":27,"PurePurge":true}', time: "2026-07-06 04:15" },
                        { ev: "AssetPurifiedEvent", payload: '{"TransactionId":"tx_9921","PurificationRate":0.025,"CharityReallocated":45.00}', time: "2026-07-05 09:00" },
                        { ev: "AdvisoryWorkflowDispatched", payload: '{"RuleId":"au_2","WorkflowName":"Weekly Client Performance","Approved":true}', time: "2026-07-04 16:00" }
                      ].map((entry, idx) => (
                        <div key={idx} className="flex justify-between p-2 bg-stone-50 rounded border border-stone-200 text-stone-600">
                          <span>[{entry.time}] <strong>{entry.ev}</strong>: <code className="text-indigo-600">{entry.payload}</code></span>
                          <span className="text-emerald-600 font-bold">REPLAYABLE</span>
                        </div>
                      ))}
                    </div>
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

// Minimal target component icon helper block to secure Lucide imports compatibility
function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
