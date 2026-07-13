import React, { useState, useEffect } from "react";
import {
  Layers,
  Compass,
  Target,
  Briefcase,
  CheckSquare,
  Calendar,
  Flame,
  BarChart3,
  BookOpen,
  Sliders,
  Terminal,
  Activity,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Music,
  Users,
  CheckCircle2,
  RefreshCw,
  Globe,
  DollarSign,
  Heart,
  ChevronRight,
  Info,
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  Eye,
  ArrowRight
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
  Legend
} from "recharts";

interface ExecutivePlannerViewProps {
  onAddSignalREvent: (msg: string) => void;
  onUpdateScore: () => void;
}

export default function ExecutivePlannerView({ onAddSignalREvent, onUpdateScore }: ExecutivePlannerViewProps) {
  // Navigation
  const [activePlannerTab, setActivePlannerTab] = useState<
    | "dashboard"
    | "vision"
    | "goals"
    | "projects"
    | "tasks"
    | "calendar"
    | "habits"
    | "focus"
    | "reviews"
    | "analytics"
    | "api"
    | "testing"
    | "docs"
  >("dashboard");

  // State
  const [goals, setGoals] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    completionRate: 0,
    totalFocusMinutes: 0,
    avgFlowScore: 0,
    prayerConsistency: 96,
    habitConsistency: 84,
    planningAccuracy: 91,
    productivityTrends: []
  });

  // Briefing and Review states
  const [dailyBriefing, setDailyBriefing] = useState<string>("");
  const [reviewReport, setReviewReport] = useState<string>("");
  const [selectedReviewType, setSelectedReviewType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);
  const [loadingReview, setLoadingReview] = useState<boolean>(false);

  // New item creation modals/form states
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "Deen",
    priority: "High",
    smartDefinition: "",
    okrObjective: "",
    kpi: "",
    northStar: "",
    risk: "Low",
    dependencies: ""
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    priority: "Medium",
    timeline: "",
    budget: "",
    resources: "",
    stakeholders: "",
    dependencies: "",
    objectives: "",
    deliverables: "",
    risks: ""
  });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: "",
    goalId: "",
    priority: "Medium",
    deepWork: true,
    energyLevel: "High",
    estimatedTime: "60",
    contextTags: "code, architecture",
    timeBlock: ""
  });

  const [showHabitForm, setShowHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    category: "deen",
    frequency: "Daily",
    target: "Daily",
    identity: "",
    routine: "Morning Routine"
  });

  // Pomodoro Focus state
  const [focusTimer, setFocusTimer] = useState<number>(1500); // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSessionName, setTimerSessionName] = useState<string>("MediatR CQRS Architecture Refactoring");
  const [timerSessionCategory, setTimerSessionCategory] = useState<string>("career");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pomodoroCycles, setPomodoroCycles] = useState<number>(0);
  const [interruptCount, setInterruptCount] = useState<number>(0);
  const [distractionBlocking, setDistractionBlocking] = useState<boolean>(true);
  const [selectedAmbientAudio, setSelectedAmbientAudio] = useState<string>("none");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Load state from backend APIs
  const fetchAllData = async () => {
    try {
      const [gRes, pRes, tRes, hRes, fRes, aRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/projects"),
        fetch("/api/tasks"),
        fetch("/api/habits"),
        fetch("/api/focus"),
        fetch("/api/planning/analytics")
      ]);

      if (gRes.ok) setGoals(await gRes.json());
      if (pRes.ok) setProjects(await pRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (hRes.ok) setHabits(await hRes.json());
      if (fRes.ok) setFocusSessions(await fRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
    } catch (err) {
      console.error("Error loading Executive Planner state:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // API Callbacks
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newGoal,
          kpis: newGoal.kpi ? [newGoal.kpi] : [],
          dependencies: newGoal.dependencies ? newGoal.dependencies.split(",") : []
        })
      });
      if (res.ok) {
        onAddSignalREvent(`Malki (Goal Engine) published GoalCreatedEvent { Title = "${newGoal.title}", Alignment = "Deen First" }`);
        onUpdateScore();
        setShowGoalForm(false);
        setNewGoal({
          title: "",
          type: "Deen",
          priority: "High",
          smartDefinition: "",
          okrObjective: "",
          kpi: "",
          northStar: "",
          risk: "Low",
          dependencies: ""
        });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoalProgress = async (id: string, currentVal: number) => {
    const newVal = Math.min(100, currentVal + 10);
    try {
      const res = await fetch("/api/goals/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, progress: newVal })
      });
      if (res.ok) {
        onAddSignalREvent(`Malki published GoalUpdatedEvent { ID = "${id}", Progress = ${newVal}% }`);
        if (newVal === 100) {
          onAddSignalREvent(`Malki published GoalCompletedEvent { ID = "${id}" }`);
        }
        onUpdateScore();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch("/api/goals/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onAddSignalREvent(`Malki removed Goal: ${id}`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProject,
          resources: newProject.resources ? newProject.resources.split(",") : [],
          stakeholders: newProject.stakeholders ? newProject.stakeholders.split(",") : [],
          dependencies: newProject.dependencies ? newProject.dependencies.split(",") : []
        })
      });
      if (res.ok) {
        onAddSignalREvent(`Kernel (Project Engine) published ProjectCreatedEvent { Title = "${newProject.title}" }`);
        onUpdateScore();
        setShowProjectForm(false);
        setNewProject({
          title: "",
          priority: "Medium",
          timeline: "",
          budget: "",
          resources: "",
          stakeholders: "",
          dependencies: "",
          objectives: "",
          deliverables: "",
          risks: ""
        });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onAddSignalREvent(`Kernel removed Project: ${id}`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          contextTags: newTask.contextTags.split(",").map((s) => s.trim())
        })
      });
      if (res.ok) {
        onAddSignalREvent(`Planner (Task Engine) published TaskCreatedEvent { Title = "${newTask.title}" }`);
        onUpdateScore();
        setShowTaskForm(false);
        setNewTask({
          title: "",
          projectId: "",
          goalId: "",
          priority: "Medium",
          deepWork: true,
          energyLevel: "High",
          estimatedTime: "60",
          contextTags: "code, architecture",
          timeBlock: ""
        });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id: string, status: string) => {
    const actTime = status === "pending" ? 45 : 0; // Simulated time tracking
    try {
      const res = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, actualTime: actTime })
      });
      if (res.ok) {
        onAddSignalREvent(`Planner updated Task ${id} completion status.`);
        onUpdateScore();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onAddSignalREvent(`Planner removed Task: ${id}`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHabit)
      });
      if (res.ok) {
        onAddSignalREvent(`HabitEngine added Habit: "${newHabit.name}"`);
        setShowHabitForm(false);
        setNewHabit({
          name: "",
          category: "deen",
          frequency: "Daily",
          target: "Daily",
          identity: "",
          routine: "Morning Routine"
        });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogHabit = async (id: string) => {
    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onAddSignalREvent(`HabitEngine published HabitCompletedEvent { ID = "${id}" }`);
        onUpdateScore();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Gabriel briefings
  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch("/api/planning/briefing", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDailyBriefing(data.briefing);
        onAddSignalREvent("Gabriel (Cognitive CoS) compiled interactive Daily Briefing.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleGenerateReview = async () => {
    setLoadingReview(true);
    try {
      const res = await fetch("/api/planning/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedReviewType })
      });
      if (res.ok) {
        const data = await res.json();
        setReviewReport(data.review);
        onAddSignalREvent(`Gabriel compiled ${selectedReviewType.toUpperCase()} review report.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReview(false);
    }
  };

  // Pomodoro state handlers
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer((prev) => prev - 1);
      }, 1000);
    } else if (focusTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      handleCompleteFocusSession();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTimer]);

  const handleStartFocus = async () => {
    try {
      const res = await fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: timerSessionName, category: timerSessionCategory })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSessionId(data.session.id);
        setIsTimerRunning(true);
        onAddSignalREvent(`FocusEngine: Block starting: '${timerSessionName}'. Policy level: STRICT.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteFocusSession = async () => {
    if (!currentSessionId) return;
    try {
      const score = Math.max(50, 100 - interruptCount * 12);
      const res = await fetch("/api/focus/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentSessionId,
          duration: 25,
          interrupts: interruptCount,
          flowScore: score
        })
      });
      if (res.ok) {
        onAddSignalREvent(`FocusEngine completed. Duration = 25m, FlowScore = ${score}%`);
        setPomodoroCycles((prev) => prev + 1);
        setFocusTimer(1500);
        setInterruptCount(0);
        setCurrentSessionId(null);
        onUpdateScore();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setFocusTimer(1500);
    setInterruptCount(0);
    setCurrentSessionId(null);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Mock test execution
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const handleRunTests = () => {
    setRunningTests(true);
    setTestResults([]);
    const suites = [
      "LifeOS.Tests.Kernel.GoalEngineTests.Verify_GoalCascade_From_Vision_Correctly",
      "LifeOS.Tests.Kernel.ProjectTests.Verify_ProjectDependencyTree_Construction",
      "LifeOS.Tests.Kernel.TaskEngineTests.Verify_EisenhowerPriorityScore_SpiritualInvariants",
      "LifeOS.Tests.Kernel.CalendarEngineTests.Verify_AutomaticTimeBlocking_PrayerWindowShields",
      "LifeOS.Tests.Kernel.HabitEngineTests.Verify_AtomicHabits_IdentityConsistencyScores",
      "LifeOS.Tests.Kernel.AnalyticsTests.Verify_DynamicSystemScorecardCalculation",
      "LifeOS.Tests.Kernel.AiPlanningTests.Verify_GabrielCoS_BriefingContextCompaction"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < suites.length) {
        setTestResults((prev) => [...prev, `[PASS] ${suites[i]} (duration: ${Math.floor(Math.random() * 40) + 10}ms)`]);
        i++;
      } else {
        clearInterval(interval);
        setRunningTests(false);
        onAddSignalREvent("Test Execution Suite finished successfully. System invariant status is green.");
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Title & Scope header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-mono text-xs uppercase tracking-wider font-semibold">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Phase 5 Operating System Enclave</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-sans mt-1">
            Executive Planning & Time Intelligence
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl font-mono">
            CODENAME: PROJECT JANNAH | HOLISTIC COGNITIVE SCHEDULER & ALIGNMENT KERNEL
          </p>
        </div>

        {/* Workspace selector */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 max-w-xl">
          {[
            { id: "dashboard", label: "Dashboard", icon: Layers },
            { id: "vision", label: "Life Vision", icon: Compass },
            { id: "goals", label: "Goals & OKRs", icon: Target },
            { id: "projects", label: "Projects", icon: Briefcase },
            { id: "tasks", label: "Task Board", icon: CheckSquare },
            { id: "calendar", label: "Calendar", icon: Calendar },
            { id: "habits", label: "Habit Engine", icon: Flame },
            { id: "focus", label: "Focus Mode", icon: Clock },
            { id: "reviews", label: "Gabriel Briefs", icon: Sparkles },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "api", label: "OpenAPI Specs", icon: Terminal },
            { id: "testing", label: "Test Lab", icon: ShieldCheck },
            { id: "docs", label: "Architecture", icon: BookOpen }
          ].map((nav) => {
            const Icon = nav.icon;
            const isSel = activePlannerTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => {
                  setActivePlannerTab(nav.id as any);
                  onAddSignalREvent(`Switched planner viewpoint: ${nav.label}`);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md font-mono text-[10px] transition border ${
                  isSel
                    ? "bg-stone-900 border-stone-950 text-white font-bold"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Views container */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activePlannerTab === "dashboard" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  Executive Alignment Dashboard
                </h2>
                <p className="text-xs text-stone-500">Real-time status of cascaded goals and active schedules</p>
              </div>
              <span className="font-mono text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full uppercase font-bold">
                ● ACTIVE HARMONY SECURED
              </span>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick KPI stats */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">Goal Completion</span>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-stone-900">{analytics.completionRate}%</span>
                    <span className="text-[10px] block text-stone-400 font-mono mt-0.5">OF ACTIVE OKRS</span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">Deep Work Logs</span>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-stone-900">
                      {(analytics.totalFocusMinutes / 60).toFixed(1)} hrs
                    </span>
                    <span className="text-[10px] block text-stone-400 font-mono mt-0.5">THIS WEEK TOTAL</span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">Salah Consistency</span>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-stone-900">{analytics.prayerConsistency}%</span>
                    <span className="text-[10px] block text-stone-400 font-mono mt-0.5">DEEN CONGREGATION</span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">Planning Accuracy</span>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-stone-900">{analytics.planningAccuracy}%</span>
                    <span className="text-[10px] block text-stone-400 font-mono mt-0.5">TASK ACCURACY</span>
                  </div>
                </div>
              </div>

              {/* Focus Block widget */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-bold mb-2">
                    <span>ACTIVE_SHIELD_STATE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <h4 className="text-xs font-semibold font-mono tracking-tight text-stone-300">ENGAGEMENT TARGET</h4>
                  <p className="text-sm font-sans mt-1 text-stone-100 font-medium">
                    {timerSessionName.slice(0, 50)}...
                  </p>
                </div>

                <div className="border-t border-stone-800 pt-3 mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-400">FOCUS CONSOLE</span>
                  <button
                    onClick={() => setActivePlannerTab("focus")}
                    className="flex items-center space-x-1 font-mono text-[9px] text-emerald-400 hover:underline uppercase"
                  >
                    <span>ACTIVATE FOCUS</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main bento split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Goals list */}
              <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-bold text-stone-900 uppercase font-mono flex items-center space-x-1.5">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <span>SMART Goals & OKR Alignment</span>
                  </h3>
                  <button
                    onClick={() => setActivePlannerTab("goals")}
                    className="text-[10px] text-stone-500 font-mono hover:underline uppercase"
                  >
                    Manage Goals
                  </button>
                </div>

                <div className="space-y-3.5">
                  {goals.map((g) => (
                    <div key={g.id} className="p-3.5 border border-stone-150 rounded-lg hover:border-stone-300 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block text-[9px] font-mono uppercase bg-stone-100 border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded mb-1">
                            {g.type} Alignment
                          </span>
                          <h4 className="text-xs font-semibold text-stone-900">{g.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">Priority:</span>
                          <span className="block text-[10px] font-mono text-red-600 font-bold">{g.priority}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-1">
                          <span>Progress: {g.progress}%</span>
                          <span>Due: {g.targetDate}</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-stone-900 h-full rounded-full transition-all duration-500"
                            style={{ width: `${g.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400">
                          <span>AI Forecast:</span>
                          <span className="text-emerald-600 font-medium">{g.aiForecast}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateGoalProgress(g.id, g.progress)}
                          className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-mono text-[9px] px-2.5 py-1 rounded"
                        >
                          + Log progress
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Daily Schedule summary */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-bold text-stone-900 uppercase font-mono flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>Intelligent Time Blocks</span>
                  </h3>
                  <button
                    onClick={() => setActivePlannerTab("calendar")}
                    className="text-[10px] text-stone-500 font-mono hover:underline uppercase"
                  >
                    Full Schedule
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 border rounded-xl flex items-center justify-between transition ${
                        t.status === "completed"
                          ? "bg-stone-50/50 border-stone-200"
                          : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <button
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            t.status === "completed"
                              ? "bg-stone-900 border-stone-950 text-white"
                              : "border-stone-300 hover:border-stone-500 bg-white"
                          }`}
                        >
                          {t.status === "completed" && <CheckSquare className="h-2.5 w-2.5" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-medium leading-tight ${
                              t.status === "completed" ? "text-stone-400 line-through" : "text-stone-900"
                            }`}
                          >
                            {t.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[8px] font-mono bg-stone-100 border border-stone-200 text-stone-500 px-1 rounded uppercase">
                              {t.energyLevel} Energy
                            </span>
                            {t.deepWork && (
                              <span className="text-[8px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-600 px-1 rounded uppercase font-bold">
                                💻 Deep Work
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 whitespace-nowrap">
                        {t.timeBlock || "Unscheduled"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Conflict indicators / Auto-scheduling triggers */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] text-stone-600 flex items-start space-x-2 leading-relaxed">
                  <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 font-mono block text-[10px] uppercase mb-0.5">
                      Scheduler Status
                    </span>
                    No calendar collisions. Pre-blocked mosque transits have shielded Fajr, Dhuhr and Asr.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIFE VISION SYSTEM */}
        {activePlannerTab === "vision" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                Unified Life Vision Architecture
              </h2>
              <p className="text-xs text-stone-500">
                The strategic cascade ensuring every single daily action inherits spiritual and operational purpose
              </p>
            </div>

            {/* Vision Cascade Diagram Grid */}
            <div className="space-y-4">
              {[
                {
                  level: "Level 1: Life Vision",
                  value: "To establish absolute spiritual peace, create highly functional halal software, and secure an inflation-proof wealth fortress that supports generations.",
                  color: "border-l-emerald-600"
                },
                {
                  level: "Level 2: Core Values",
                  value: "Deen First (Uncompromised Devotion), Meticulous Steward of Assets, Complete Domestic Harmony (Spousal Unity), Continuous Cognitive RAG Learning.",
                  color: "border-l-amber-600"
                },
                {
                  level: "Level 3: Strategic Mission",
                  value: "Deploying Project Jannah to integrate daily tracking routines, automated time-blocking algorithms, and AI assistants to serve the family's higher priorities.",
                  color: "border-l-indigo-600"
                },
                {
                  level: "Level 4: Areas of Responsibility",
                  value: "Faith Consistency (Malki tracker), Marital Health (Domestic agreements), Wealth Protection (Amanah vault), High-Yield Technical Refactoring.",
                  color: "border-l-rose-600"
                },
                {
                  level: "Level 5: Annual Objectives & OKRs",
                  value: "Achieve 95% Salah consistency, Reallocate £10k to physical gold tokens, Attain 90%+ test coverage across our core operating system files.",
                  color: "border-l-stone-600"
                }
              ].map((cascade, idx) => (
                <div
                  key={idx}
                  className={`p-4 bg-stone-50 border border-stone-200 border-l-4 ${cascade.color} rounded-xl shadow-sm hover:shadow-md transition`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider">
                      {cascade.level}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase font-bold border border-emerald-150">
                      ✓ Context Inherited
                    </span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed font-sans">{cascade.value}</p>
                </div>
              ))}
            </div>

            {/* Tree hierarchy visualization link */}
            <div className="p-5 border border-stone-200 rounded-xl bg-stone-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">
                  Cascade alignment health
                </span>
                <h4 className="text-sm font-semibold">All daily tasks currently trace back to an active OKR</h4>
                <p className="text-xs text-stone-400">
                  Zero orphan tasks detected. Strategic discipline operates at maximum topological efficacy.
                </p>
              </div>
              <button
                onClick={() => setActivePlannerTab("tasks")}
                className="bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-xs px-4 py-2 rounded-lg font-mono tracking-tight shrink-0 transition"
              >
                Inspect Task Traceability
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: GOAL MANAGEMENT */}
        {activePlannerTab === "goals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  Goal Management & SMART Alignment
                </h2>
                <p className="text-xs text-stone-500">Set, monitor, and execute quantitative OKRs with AI predictions</p>
              </div>

              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition self-start"
              >
                <Plus className="h-4 w-4" />
                <span>Create SMART Goal</span>
              </button>
            </div>

            {/* Create Goal Form Modal/Section */}
            {showGoalForm && (
              <form onSubmit={handleAddGoal} className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Establish Fajr Congregation habit"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Goal Type
                    </label>
                    <select
                      value={newGoal.type}
                      onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="Deen">Deen Alignment</option>
                      <option value="Marriage">Marriage Care</option>
                      <option value="Health">Physical Health</option>
                      <option value="Finance">Wealth Protection</option>
                      <option value="Career">Career & Dev</option>
                      <option value="Learning">RAG Learning</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Priority Level
                    </label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      SMART Definition (Measurable Criteria)
                    </label>
                    <textarea
                      placeholder="Describe exactly what, when, where and how it is measured"
                      value={newGoal.smartDefinition}
                      onChange={(e) => setNewGoal({ ...newGoal, smartDefinition: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900 h-16"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      OKR Objective Association
                    </label>
                    <textarea
                      placeholder="Which high level objective does this align with?"
                      value={newGoal.okrObjective}
                      onChange={(e) => setNewGoal({ ...newGoal, okrObjective: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900 h-16"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      North Star Metric / KPIs
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 95% consistency, £10k tokens"
                      value={newGoal.kpi}
                      onChange={(e) => setNewGoal({ ...newGoal, kpi: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Primary Risk Barrier
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. late night exhaustion"
                      value={newGoal.risk}
                      onChange={(e) => setNewGoal({ ...newGoal, risk: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Dependencies (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. prepare mat, block calendar"
                      value={newGoal.dependencies}
                      onChange={(e) => setNewGoal({ ...newGoal, dependencies: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="border border-stone-300 text-stone-700 px-3 py-1.5 rounded text-xs font-mono font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-mono font-bold"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            )}

            {/* List of active goals with robust details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((g) => (
                <div
                  key={g.id}
                  className="bg-stone-50/50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between hover:border-stone-300 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono bg-stone-100 border border-stone-200 text-stone-600 px-2 py-0.5 rounded uppercase font-bold">
                        {g.type} Alignment
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-mono uppercase text-stone-400 font-bold">Risk:</span>
                        <span className="text-[9px] font-mono text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-150 uppercase">
                          {g.risk || "Low"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-stone-950 font-sans tracking-tight">{g.title}</h3>
                      {g.smartDefinition && (
                        <p className="text-[11px] text-stone-500 mt-1 leading-normal font-sans">
                          {g.smartDefinition}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2.5">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-stone-400 font-bold">Objective:</span>
                        <p className="text-[10px] text-stone-700 font-medium leading-tight mt-0.5">{g.okrObjective}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-stone-400 font-bold">KPIs / Target:</span>
                        <p className="text-[10px] text-stone-700 font-medium leading-tight mt-0.5">
                          {g.kpis?.join(", ") || "No quantitative target set"}
                        </p>
                      </div>
                    </div>

                    {/* Progress tracking */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-1">
                        <span>Completion Rate: {g.progress}%</span>
                        <span>Target: {g.targetDate}</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-stone-900 h-full rounded-full transition-all duration-500"
                          style={{ width: `${g.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Deep AI details */}
                    <div className="bg-white border border-stone-150 rounded-lg p-3.5 space-y-2 text-[11px] leading-relaxed">
                      <div className="flex items-start space-x-1">
                        <span className="font-mono text-[9px] font-bold text-stone-400 uppercase tracking-wider block mt-0.5">
                          AI Forecast:
                        </span>
                        <span className="text-stone-700">{g.aiForecast}</span>
                      </div>
                      <div className="flex items-start space-x-1">
                        <span className="font-mono text-[9px] font-bold text-stone-400 uppercase tracking-wider block mt-0.5">
                          AI Risk Check:
                        </span>
                        <span className="text-stone-700">{g.aiRiskAnalysis}</span>
                      </div>
                      <div className="flex items-start space-x-1">
                        <span className="font-mono text-[9px] font-bold text-stone-400 uppercase tracking-wider block mt-0.5">
                          AI Counsel:
                        </span>
                        <span className="text-emerald-700 font-medium">{g.aiRecommendations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-stone-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-stone-400 hover:text-red-500 transition font-mono text-[9px] uppercase font-bold flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => handleUpdateGoalProgress(g.id, g.progress)}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] font-bold px-3 py-1 rounded transition"
                      >
                        + Log progress
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECT WORKSPACE */}
        {activePlannerTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  Strategic Project Workspace
                </h2>
                <p className="text-xs text-stone-500">
                  Track timelines, resource budgets, stakeholder alignments, and progress forecasts
                </p>
              </div>

              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition self-start"
              >
                <Plus className="h-4 w-4" />
                <span>Initialize Project</span>
              </button>
            </div>

            {/* Create Project Form */}
            {showProjectForm && (
              <form onSubmit={handleAddProject} className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Project Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Project Jannah Core Kernel"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Priority level
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Timeline (e.g. June - Aug 2026)
                    </label>
                    <input
                      type="text"
                      placeholder="Specify boundaries"
                      value={newProject.timeline}
                      onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Budget (£)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1 col-span-3">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Resources Allocated (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ethan dev, Gabriel CoS, Qdrant db"
                      value={newProject.resources}
                      onChange={(e) => setNewProject({ ...newProject, resources: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Project Objectives
                    </label>
                    <textarea
                      placeholder="Describe high-level target criteria"
                      value={newProject.objectives}
                      onChange={(e) => setNewProject({ ...newProject, objectives: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900 h-16"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Core Deliverables
                    </label>
                    <textarea
                      placeholder="List core code or architecture aggregates"
                      value={newProject.deliverables}
                      onChange={(e) => setNewProject({ ...newProject, deliverables: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900 h-16"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="border border-stone-300 text-stone-700 px-3 py-1.5 rounded text-xs font-mono font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-mono font-bold"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            )}

            {/* List of Projects */}
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="bg-stone-50/50 border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono uppercase bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded font-bold">
                          {p.status || "In Progress"}
                        </span>
                        <span className="text-[9px] font-mono uppercase bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded font-bold">
                          {p.priority} priority
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">Timeline: {p.timeline}</span>
                      </div>

                      <h3 className="text-base font-bold text-stone-950 font-sans tracking-tight">{p.title}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed pt-1.5">
                        <div>
                          <span className="font-mono text-[9px] font-bold uppercase text-stone-400 block">Objectives</span>
                          <p className="text-stone-700 mt-0.5 font-medium">{p.objectives || "No objectives detailed."}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] font-bold uppercase text-stone-400 block">Deliverables</span>
                          <p className="text-stone-700 mt-0.5 font-medium">{p.deliverables || "No deliverables detailed."}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[10px] font-mono">
                        <div>
                          <span className="text-stone-400 uppercase font-bold">Resource Pool:</span>
                          <span className="text-stone-700 block mt-0.5">{p.resources?.join(", ") || "None"}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 uppercase font-bold">Stakeholders:</span>
                          <span className="text-stone-700 block mt-0.5">{p.stakeholders?.join(", ") || "None"}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 uppercase font-bold">Financial Budget:</span>
                          <span className="text-stone-900 font-bold block mt-0.5">£{p.budget?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Predictor block */}
                    <div className="bg-white border border-stone-150 rounded-xl p-4 md:w-80 shrink-0 space-y-2 text-[11px] leading-relaxed">
                      <div className="flex items-center space-x-1 text-emerald-700 font-bold font-mono text-[9px] uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Cognitive Predictor</span>
                      </div>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-800 font-mono text-[10px] uppercase">Summary:</span>{" "}
                        {p.aiSummary}
                      </p>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-800 font-mono text-[10px] uppercase">Completion prediction:</span>{" "}
                        <span className="text-emerald-700 font-medium">{p.progressPrediction}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-stone-200/60 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="text-stone-400 hover:text-red-500 transition font-mono text-[9px] uppercase font-bold flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Archive Project</span>
                    </button>

                    <button
                      onClick={() => setActivePlannerTab("tasks")}
                      className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Inspect Tasks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TASK ENGINE */}
        {activePlannerTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  Eisenhower Priority Task Board
                </h2>
                <p className="text-xs text-stone-500">
                  Manage tasks based on spiritual priority, mental energy, and deep-work blocks
                </p>
              </div>

              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition self-start"
              >
                <Plus className="h-4 w-4" />
                <span>Add Strategic Task</span>
              </button>
            </div>

            {/* Create Task Form */}
            {showTaskForm && (
              <form onSubmit={handleAddTask} className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Refactor MediatR Event Bus"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Associated Project
                    </label>
                    <select
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="">None (Independent Task)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Associated Goal / OKR
                    </label>
                    <select
                      value={newTask.goalId}
                      onChange={(e) => setNewTask({ ...newTask, goalId: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="">None</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Priority Level
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="Critical">Critical (Do First)</option>
                      <option value="High">High (Schedule)</option>
                      <option value="Medium">Medium (Delegate)</option>
                      <option value="Low">Low (Defer)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Energy Level Requirement
                    </label>
                    <select
                      value={newTask.energyLevel}
                      onChange={(e) => setNewTask({ ...newTask, energyLevel: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="High">High Focus</option>
                      <option value="Medium">Medium Focus</option>
                      <option value="Low">Low/Administrative</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Time Estimate (Mins)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-2 flex items-center h-full pt-4 pl-4">
                    <input
                      type="checkbox"
                      id="deepWorkCheck"
                      checked={newTask.deepWork}
                      onChange={(e) => setNewTask({ ...newTask, deepWork: e.target.checked })}
                      className="h-4 w-4 text-stone-900 border-stone-300 rounded focus:ring-stone-900"
                    />
                    <label htmlFor="deepWorkCheck" className="text-xs font-mono uppercase text-stone-500 font-bold ml-2">
                      Deep Work Block
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Context Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. deen, home, focus"
                      value={newTask.contextTags}
                      onChange={(e) => setNewTask({ ...newTask, contextTags: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Preferred Time Block (e.g. 09:00 - 10:30)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 - 10:30"
                      value={newTask.timeBlock}
                      onChange={(e) => setNewTask({ ...newTask, timeBlock: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="border border-stone-300 text-stone-700 px-3 py-1.5 rounded text-xs font-mono font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-mono font-bold"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            )}

            {/* Matrix View / Kanban columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {[
                { title: "Critical (Do)", priority: "Critical", desc: "Urgent & Important Invariants", border: "border-t-red-600 bg-red-50/10" },
                { title: "High (Schedule)", priority: "High", desc: "Long-term Value Builders", border: "border-t-indigo-600 bg-indigo-50/10" },
                { title: "Medium (Delegate)", priority: "Medium", desc: "Administrative & Chore Tasks", border: "border-t-amber-600 bg-amber-50/10" },
                { title: "Low (Defer)", priority: "Low", desc: "Low Energy Operations", border: "border-t-stone-600 bg-stone-50/10" }
              ].map((column) => {
                const colTasks = tasks.filter((t) => t.priority === column.priority);
                return (
                  <div
                    key={column.priority}
                    className={`border border-stone-200 border-t-4 ${column.border} rounded-xl p-4 min-h-[380px] flex flex-col`}
                  >
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wide">
                        {column.title}
                      </h3>
                      <p className="text-[10px] text-stone-500 mt-0.5">{column.desc}</p>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`bg-white border border-stone-200 rounded-xl p-3 shadow-sm hover:border-stone-400 transition flex flex-col justify-between min-h-[110px] ${
                            t.status === "completed" ? "opacity-60" : ""
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between">
                              <span className="text-[8px] font-mono bg-stone-100 text-stone-500 border border-stone-200 px-1 rounded uppercase">
                                {t.energyLevel} Energy
                              </span>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="text-stone-300 hover:text-red-500 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            <p
                              className={`text-xs font-semibold leading-snug text-stone-900 ${
                                t.status === "completed" ? "line-through text-stone-400" : ""
                              }`}
                            >
                              {t.title}
                            </p>
                          </div>

                          <div className="border-t border-stone-100 pt-2.5 mt-2 flex items-center justify-between text-[9px] font-mono">
                            <span className="text-stone-400">Est: {t.estimatedTime}m</span>
                            <button
                              onClick={() => handleToggleTask(t.id, t.status)}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono border transition ${
                                t.status === "completed"
                                  ? "bg-stone-900 text-white border-stone-950 font-bold"
                                  : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                              }`}
                            >
                              {t.status === "completed" ? "✓ Done" : "Complete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: ENTERPRISE CALENDAR */}
        {activePlannerTab === "calendar" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  Intelligent Enterprise Calendar
                </h2>
                <p className="text-xs text-stone-500 font-sans">
                  Dynamic scheduling shielding Fajr, Dhuhr, Asr, Maghrib, and Isha windows based on London timetables
                </p>
              </div>

              {/* Time block automation buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onAddSignalREvent("PlannerEngine: Automatic Time Blocking triggered. Shielding 5 daily prayers.");
                    alert("Intelligent scheduling algorithm complete. Blocked 5 spiritual shields.");
                  }}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                >
                  ⚡ Auto-Block deen
                </button>
                <button
                  onClick={() => {
                    onAddSignalREvent("PlannerEngine: Optimizing deep work blocks for high-energy windows.");
                    alert("Deep work optimized around metabolic indices.");
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                >
                  💻 Optimize Deep Work
                </button>
              </div>
            </div>

            {/* Enterprise view selectors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Daily calendar timeline */}
              <div className="md:col-span-3 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">Today's Agenda (London/UK)</h3>
                  <span className="font-mono text-[10px] text-stone-400 uppercase font-bold">MONDAY, JULY 6, 2026</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { time: "04:15 - 04:45", title: "Fajr Congregational Prayer (Deen Boundary Shield)", cat: "deen", isShield: true },
                    { time: "07:00 - 07:45", title: "Cardiovascular Workout & HRV logs", cat: "health", isShield: false },
                    { time: "09:00 - 10:30", title: "Review Halal Asset balance sheets & gold token validation", cat: "finance", isShield: false },
                    { time: "11:00 - 13:00", title: "Refactor MediatR Event Bus support", cat: "career", isShield: false },
                    { time: "13:10 - 13:40", title: "Dhuhr Prayer window consistency audit", cat: "deen", isShield: true },
                    { time: "15:30 - 16:30", title: "Study plan: Islamic Commercial Law reading", cat: "learning", isShield: false },
                    { time: "18:00 - 19:30", title: "Marital Chore Matrix sync - household transition assistance", cat: "marriage", isShield: false }
                  ].map((block, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 border rounded-xl flex items-center justify-between transition ${
                        block.isShield
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-stone-150 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono text-stone-500 tracking-tight font-bold w-24">
                          {block.time}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-stone-900">{block.title}</p>
                          <span className="text-[8px] font-mono text-stone-400 uppercase font-bold">
                            Category: {block.cat}
                          </span>
                        </div>
                      </div>

                      {block.isShield && (
                        <span className="text-[8px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-bold">
                          🔒 SHIELDED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Calendar widget mini representation */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">July 2026</h3>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="text-stone-400 font-bold uppercase">
                      {d}
                    </span>
                  ))}

                  {Array.from({ length: 31 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isToday = dayNum === 6;
                    return (
                      <button
                        key={idx}
                        className={`p-1.5 rounded-md text-[10px] font-mono font-bold transition ${
                          isToday
                            ? "bg-stone-900 text-white shadow"
                            : "bg-stone-50 text-stone-600 hover:bg-stone-150"
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar indicators */}
                <div className="space-y-2.5 pt-3 border-t border-stone-100 text-[11px] leading-relaxed">
                  <span className="font-mono text-[10px] uppercase text-stone-400 font-bold block mb-1">
                    System Legend
                  </span>
                  <div className="flex items-center space-x-2 text-stone-600">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block shrink-0"></span>
                    <span>Deen / Spiritual block</span>
                  </div>
                  <div className="flex items-center space-x-2 text-stone-600">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block shrink-0"></span>
                    <span>Deep Work refactoring</span>
                  </div>
                  <div className="flex items-center space-x-2 text-stone-600">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block shrink-0"></span>
                    <span>Family / Spousal time block</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: HABIT ENGINE */}
        {activePlannerTab === "habits" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  Atomic Habiteer Engine
                </h2>
                <p className="text-xs text-stone-500">
                  Build identity-based habits. Program morning, evening, and weekly routines.
                </p>
              </div>

              <button
                onClick={() => setShowHabitForm(!showHabitForm)}
                className="flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition self-start"
              >
                <Plus className="h-4 w-4" />
                <span>Initialize Habit</span>
              </button>
            </div>

            {/* Create Habit form */}
            {showHabitForm && (
              <form onSubmit={handleAddHabit} className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Read 15m Islamic Law"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Category
                    </label>
                    <select
                      value={newHabit.category}
                      onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="deen">Deen / Faith</option>
                      <option value="health">Health / Workout</option>
                      <option value="finance">Halal Finance</option>
                      <option value="learning">RAG Learning</option>
                      <option value="marriage">Marriage Care</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Routine Slot
                    </label>
                    <select
                      value={newHabit.routine}
                      onChange={(e) => setNewHabit({ ...newHabit, routine: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="Morning Routine">Morning Routine</option>
                      <option value="Evening Routine">Evening Routine</option>
                      <option value="Weekly Routine">Weekly Routine</option>
                      <option value="Monthly Routine">Monthly Routine</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Identity-based Affirmation (&quot;I am a...&quot;)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. I am a lifelong student seeking beneficial knowledge."
                      value={newHabit.identity}
                      onChange={(e) => setNewHabit({ ...newHabit, identity: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
                      Frequency target (e.g. 5 times/wk)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 times/wk"
                      value={newHabit.target}
                      onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowHabitForm(false)}
                    className="border border-stone-300 text-stone-700 px-3 py-1.5 rounded text-xs font-mono font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-mono font-bold"
                  >
                    Save Habit
                  </button>
                </div>
              </form>
            )}

            {/* Habit routines grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["Morning Routine", "Evening Routine", "Weekly Routine"].map((routineName) => {
                const routineHabits = habits.filter((h) => h.routine === routineName);
                return (
                  <div key={routineName} className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-stone-950 uppercase font-mono tracking-wider">
                        {routineName}
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        ACTIVE SECURE
                      </span>
                    </div>

                    <div className="space-y-3">
                      {routineHabits.map((h) => (
                        <div key={h.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-stone-900 leading-tight">{h.name}</h4>
                              <p className="text-[10px] text-stone-500 font-mono mt-1 italic">
                                Identity: &quot;{h.identity || "I am building consistency daily"}&quot;
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-mono uppercase text-stone-400 block font-bold">STREAK</span>
                              <span className="text-xs font-mono font-bold text-emerald-600">{h.streak} DAYS</span>
                            </div>
                          </div>

                          <div className="border-t border-stone-200 pt-2.5 mt-2.5 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-stone-500">Target: {h.target}</span>
                            <button
                              onClick={() => handleLogHabit(h.id)}
                              className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded transition"
                            >
                              ✓ Log habit completion
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 8: FOCUS MODE */}
        {activePlannerTab === "focus" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                Deep Work Focus Enclave
              </h2>
              <p className="text-xs text-stone-500">
                Silence cognitive notifications, set distraction shields, and track deep-work flow state
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pomodoro Timer */}
              <div className="lg:col-span-2 border border-stone-200 rounded-xl p-6 bg-stone-900 text-white flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                    <span>DISTRACTION_SHIELD_ACTIVE</span>
                  </div>

                  <div className="flex items-center space-x-3 text-stone-400 text-xs font-mono">
                    <span>Cycles Completed: {pomodoroCycles}</span>
                    <span>|</span>
                    <span>Session Interrupts: {interruptCount}</span>
                  </div>
                </div>

                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <h1 className="text-6xl font-extrabold tracking-tight font-mono">{formatTime(focusTimer)}</h1>
                  <div className="text-center">
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">ACTIVE ASSIGNMENT</span>
                    <p className="text-sm font-sans mt-0.5 font-medium text-stone-200">{timerSessionName}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(focusTimer / 1500) * 100}%` }}
                  ></div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-800 pt-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setInterruptCount((prev) => prev + 1)}
                      className="border border-stone-700 hover:bg-stone-800 text-stone-300 font-mono text-[10px] px-2.5 py-1 rounded transition uppercase font-bold"
                    >
                      ⚠️ Log Interrupt
                    </button>
                    <span className="text-[10px] text-stone-500 font-mono">FLOW CONCRETE PENALTY INDEX</span>
                  </div>

                  <div className="flex space-x-2">
                    {isTimerRunning ? (
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-mono text-xs px-4 py-2 rounded-lg font-bold transition flex items-center space-x-1.5"
                      >
                        <Pause className="h-4 w-4" />
                        <span>PAUSE</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartFocus}
                        className="bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-mono text-xs px-4 py-2 rounded-lg font-bold transition flex items-center space-x-1.5"
                      >
                        <Play className="h-4 w-4" />
                        <span>START SHIELDED SESSION</span>
                      </button>
                    )}

                    <button
                      onClick={handleResetTimer}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-mono text-xs px-3.5 py-2 rounded-lg transition"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Distraction block settings / Focus music */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-bold text-stone-950 uppercase font-mono tracking-wider">
                    Focus Parameters
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Website blocking simulator */}
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 font-sans">Website Blocklist (API)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDistractionBlocking(!distractionBlocking);
                          onAddSignalREvent(`FocusEngine website blocking API toggled: ${!distractionBlocking}`);
                        }}
                        className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded transition uppercase border ${
                          distractionBlocking
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-stone-200 border-stone-300 text-stone-600"
                        }`}
                      >
                        {distractionBlocking ? "Shield Enabled" : "Shield Disabled"}
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-normal font-sans">
                      Blocks access to non-productive websites (Slack, YouTube, Netflix, Twitter) during deep-work
                      blocks automatically.
                    </p>
                  </div>

                  {/* Focus Music Selector */}
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-stone-900 block font-sans">Focus Ambient Sound (RAG Synth)</span>
                    <select
                      value={selectedAmbientAudio}
                      onChange={(e) => {
                        setSelectedAmbientAudio(e.target.value);
                        onAddSignalREvent(`Ambient synthesizer re-routed: ${e.target.value}`);
                      }}
                      className="bg-white border border-stone-300 text-xs rounded px-3 py-1.5 focus:outline-none w-full text-stone-900"
                    >
                      <option value="none">Silence (Absolute block)</option>
                      <option value="rain">Deep Thunderstorm (Halal Binaural)</option>
                      <option value="white">Brownian Waves (Cognitive Focus)</option>
                      <option value="islamic">Islamic Vocal Harmonies (Non-instrumental)</option>
                    </select>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-stone-400 font-mono">STATUS: {selectedAmbientAudio !== "none" ? "READY" : "MUTED"}</span>
                      {selectedAmbientAudio !== "none" && (
                        <button
                          onClick={() => {
                            setIsPlayingAudio(!isPlayingAudio);
                            onAddSignalREvent(`Focus ambient audio playback toggled: ${!isPlayingAudio}`);
                          }}
                          className="text-stone-700 hover:text-stone-950 font-mono text-[10px] uppercase font-bold flex items-center space-x-1"
                        >
                          <Music className="h-3 w-3" />
                          <span>{isPlayingAudio ? "Mute" : "Play"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Focus Session Logs */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                      Deep Work Sessions History
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {focusSessions.map((fs) => (
                        <div key={fs.id} className="p-2 border border-stone-150 rounded text-[10px] flex items-center justify-between">
                          <div>
                            <span className="font-bold text-stone-900">{fs.title}</span>
                            <span className="text-stone-400 block font-mono text-[9px]">{fs.timestamp.split("T")[0]}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded">
                            {fs.flowScore}% Score
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DAILY BRIEFING & REVIEWS */}
        {activePlannerTab === "reviews" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                Gabriel AI Cognitive Briefing & Review Center
              </h2>
              <p className="text-xs text-stone-500">
                Analyze schedule efficiency and Spiritual Invariants with Gabriel AI chief of staff
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Briefing column */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">Gabriel Daily Briefing</h3>
                  </div>

                  <button
                    onClick={handleGenerateBriefing}
                    disabled={loadingBriefing}
                    className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded transition uppercase flex items-center space-x-1"
                  >
                    {loadingBriefing ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Compacting...</span>
                      </>
                    ) : (
                      <span>Synthesize Brief</span>
                    )}
                  </button>
                </div>

                {dailyBriefing ? (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs leading-relaxed text-stone-800 whitespace-pre-line font-sans space-y-3 prose max-w-none">
                    {dailyBriefing}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-400 font-mono text-xs">
                    No active briefing compiled. Click &quot;Synthesize Brief&quot; to prompt Gabriel.
                  </div>
                )}
              </div>

              {/* Reviews column */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-2 gap-2">
                  <div className="flex items-center space-x-1.5">
                    <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">Retrospective Review</h3>
                  </div>

                  <div className="flex space-x-1.5">
                    <select
                      value={selectedReviewType}
                      onChange={(e) => setSelectedReviewType(e.target.value as any)}
                      className="bg-white border border-stone-300 text-[10px] font-mono rounded px-2 py-1 focus:outline-none text-stone-900"
                    >
                      <option value="daily">Daily Review</option>
                      <option value="weekly">Weekly Review</option>
                      <option value="monthly">Monthly Review</option>
                    </select>

                    <button
                      onClick={handleGenerateReview}
                      disabled={loadingReview}
                      className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-mono text-[10px] font-bold px-3 py-1 rounded transition uppercase flex items-center space-x-1"
                    >
                      {loadingReview ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <span>Generate Report</span>
                      )}
                    </button>
                  </div>
                </div>

                {reviewReport ? (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs leading-relaxed text-stone-800 whitespace-pre-line font-sans space-y-3 prose max-w-none">
                    {reviewReport}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-400 font-mono text-xs">
                    Awaiting active retrospective inputs. Compile report to analyze achievements.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: EXECUTIVE ANALYTICS */}
        {activePlannerTab === "analytics" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                Executive Operating Analytics
              </h2>
              <p className="text-xs text-stone-500">
                Track scheduling metrics, planning accuracy, and spiritual invariants
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Deep Work & Habits */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  Productivity Trends (Deep Work & Routine Completes)
                </span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.productivityTrends}>
                      <defs>
                        <linearGradient id="colorDeep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" stroke="#78716c" fontSize={10} fontClassName="font-mono" />
                      <YAxis stroke="#78716c" fontSize={10} fontClassName="font-mono" />
                      <Tooltip />
                      <Legend fontSize={10} />
                      <Area
                        type="monotone"
                        dataKey="deepWorkHours"
                        name="Deep Work (Hrs)"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorDeep)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="habitsCompleted"
                        name="Habits Completed"
                        stroke="#f59e0b"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Deen / Salah Congregation metric */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  Spiritual Invariants (Prayers in Congregation/Masjid)
                </span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.productivityTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" stroke="#78716c" fontSize={10} fontClassName="font-mono" />
                      <YAxis stroke="#78716c" fontSize={10} fontClassName="font-mono" />
                      <Tooltip />
                      <Bar dataKey="prayersInCong" name="Congregational Prayers" fill="#0f172a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: OPENAPI SPECIFICATION / API PLAYGROUND */}
        {activePlannerTab === "api" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                Enterprise OpenAPI Playground
              </h2>
              <p className="text-xs text-stone-500">
                Direct integration schemas and specifications for the LifeOS Phase 5 backend API endpoints
              </p>
            </div>

            <div className="space-y-4 font-mono text-[11px]">
              {[
                { method: "GET", path: "/api/goals", desc: "Retrieve complete dynamic alignment hierarchy (SMART & OKR aggregates)." },
                { method: "POST", path: "/api/goals", desc: "Publish GoalCreatedEvent to register new OKRs in SQL databases." },
                { method: "POST", path: "/api/goals/update", desc: "Trigger GoalUpdatedEvent / GoalCompletedEvent." },
                { method: "GET", path: "/api/projects", desc: "Fetch project timelines, stakeholding allocations, and budgets." },
                { method: "POST", path: "/api/projects", desc: "Trigger ProjectCreatedEvent and sync portfolio aggregates." },
                { method: "GET", path: "/api/tasks", desc: "Query task lists sorted by Eisenhower priority matrix coefficients." },
                { method: "POST", path: "/api/tasks", desc: "Register a newTask and generate dynamic deep-work schedules." },
                { method: "POST", path: "/api/tasks/toggle", desc: "Change state boundaries on task completed flags." },
                { method: "GET", path: "/api/habits", desc: "Fetch habit consistency metrics and streak records." },
                { method: "POST", path: "/api/habits/log", desc: "Log single habit completion cues." },
                { method: "POST", path: "/api/planning/briefing", desc: "Retrieve intelligent Daily Briefing from Gabriel CoS AI." },
                { method: "POST", path: "/api/planning/review", desc: "Analyze daily/weekly retrospective performance metrics." }
              ].map((route, idx) => (
                <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${
                        route.method === "GET"
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      }`}
                    >
                      {route.method}
                    </span>
                    <span className="font-bold text-stone-900 font-mono">{route.path}</span>
                  </div>
                  <span className="text-stone-500 font-sans text-xs md:text-right">{route.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: UNIT & INTEGRATION TESTING */}
        {activePlannerTab === "testing" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                  System Test Runner (Unit & Integration)
                </h2>
                <p className="text-xs text-stone-500">
                  Execute test coverage validating OKR trees, scheduling blocks, and invariant engines
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase">
                MIN COVERAGE TARGET: 90% | CURRENT: 92.8%
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Control Panel */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  C# xUnit CLI Executor
                </span>
                <p className="text-xs text-stone-600 leading-normal font-sans">
                  Run simulated end-to-end integration tests confirming MediatR CQRS aggregates, event retry buffers, and Qdrant DB synchronizations.
                </p>

                <button
                  onClick={handleRunTests}
                  disabled={runningTests}
                  className="bg-stone-900 hover:bg-stone-800 disabled:opacity-55 text-white font-mono text-xs font-bold w-full py-2 rounded-lg transition uppercase flex items-center justify-center space-x-2"
                >
                  {runningTests ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Running CQRS Test Suite...</span>
                    </>
                  ) : (
                    <span>Execute Test Suite</span>
                  )}
                </button>
              </div>

              {/* Console logs */}
              <div className="lg:col-span-2 bg-stone-950 text-stone-300 font-mono text-[11px] p-5 rounded-xl border border-stone-900 min-h-[220px] flex flex-col justify-between">
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  <span className="text-stone-500 block">LifeOS Test Command Console online. Awaiting signal...</span>
                  {testResults.map((log, idx) => (
                    <span key={idx} className="block text-emerald-400 font-semibold leading-normal">
                      {log}
                    </span>
                  ))}
                </div>

                {!runningTests && testResults.length > 0 && (
                  <div className="border-t border-stone-800 pt-3 mt-4 flex items-center justify-between text-emerald-400 font-bold">
                    <span>STATUS: ALL 7 TEST SUITES PASSED</span>
                    <span>100% INVARIANT INTEGRITY SECURED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: DOCUMENTATION HUB */}
        {activePlannerTab === "docs" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight font-sans">
                Planning Architecture & Specifications
              </h2>
              <p className="text-xs text-stone-500">
                Mermaid-driven core system specifications and database design SOPs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
              {/* Architecture text */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-stone-950 font-mono uppercase tracking-wide">
                  Strategic Cascade Blueprint
                </h3>

                <p className="text-xs text-stone-700 font-sans">
                  Project Jannah operates as a pure event-sourced life operating system. The domain entities are divided into micro-aggregates to ensure high-velocity, lightweight compilations.
                </p>

                <div className="space-y-2.5 text-xs text-stone-800 font-sans">
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 mt-2"></span>
                    <span><strong>Goal Alignment Tree:</strong> Resolves parent objectives down to daily tasks through strict transactional integrity locks.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 mt-2"></span>
                    <span><strong>Scheduler Shields:</strong> Blocks non-productive events during sacred congregational windows (Salah, Marriage Reviews).</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 mt-2"></span>
                    <span><strong>Atomic routines:</strong> Morning and Evening prompts use identity anchors (&quot;I am a dev devout believer&quot;) to eliminate decision friction.</span>
                  </div>
                </div>
              </div>

              {/* Diagram / Technical Specs */}
              <div className="p-5 bg-stone-950 text-stone-300 rounded-xl border border-stone-900 font-mono text-[10.5px] space-y-3.5">
                <span className="text-[10px] font-mono text-stone-500 font-bold block uppercase tracking-wider">
                  Topological Entity Graph
                </span>

                <div className="p-3 bg-stone-900 border border-stone-850 rounded text-[10px] space-y-1.5 leading-normal">
                  <span className="text-emerald-400 block font-bold">[Life Vision]</span>
                  <span className="text-stone-400 block pl-4">└── inherits [Core Values]</span>
                  <span className="text-stone-400 block pl-8">└── governs [Annual Objectives]</span>
                  <span className="text-stone-400 block pl-12">└── tracks [SMART OKR Goals]</span>
                  <span className="text-stone-400 block pl-16">└── spawns [Halal Projects]</span>
                  <span className="text-stone-400 block pl-20">└── schedules [Deep Work Tasks]</span>
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                    C# Invariant Aggregates SOP
                  </span>
                  <p className="text-[10px] text-stone-400 mt-1 font-sans">
                    All updates validate invariant safety policies. For example, scheduling a corporate meeting over the Dhuhr prayer block triggers a <code>PolicyViolationException</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
