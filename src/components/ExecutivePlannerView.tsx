import React, { useEffect, useState } from "react";
import { BarChart3, Calendar, CheckSquare, Compass, Flame, LayoutDashboard, RefreshCw, Target } from "lucide-react";
import ExecutiveAlignmentDashboard from "./ExecutiveAlignmentDashboard";
import GoalTaskWorkspace from "./GoalTaskWorkspace";
import PlannerSecondaryWorkspace from "./PlannerSecondaryWorkspace";
import UnifiedLifeVision from "./UnifiedLifeVision";
import { PageHeader, SegmentedTabs } from "../ui/primitives";

interface Props { onAddSignalREvent: (message: string) => void; onUpdateScore: () => void }
type PlannerTab = "dashboard" | "vision" | "goals" | "tasks" | "calendar" | "habits" | "focus" | "reviews" | "analytics";
type Goal = { id: string; title: string; status?: string; progress?: number; targetDate?: string; type?: string; [key: string]: unknown };
type Task = { id: string; title: string; status: string; dueDate?: string; goalId?: string; [key: string]: unknown };
const tabs: Array<{ id: PlannerTab; label: string; icon: React.ComponentType<{className?:string}> }> = [
  { id:"dashboard", label:"Dashboard", icon:LayoutDashboard }, { id:"vision", label:"Vision", icon:Compass }, { id:"goals", label:"Goals", icon:Target },
  { id:"tasks", label:"Tasks", icon:CheckSquare }, { id:"calendar", label:"Calendar", icon:Calendar }, { id:"habits", label:"Habits", icon:RefreshCw },
  { id:"focus", label:"Focus", icon:Flame }, { id:"reviews", label:"Reviews", icon:RefreshCw }, { id:"analytics", label:"Analytics", icon:BarChart3 }
];

export default function ExecutivePlannerView({ onAddSignalREvent, onUpdateScore }: Props) {
  const initial = new URLSearchParams(window.location.search).get("planner") as PlannerTab | null;
  const [tab, setTab] = useState<PlannerTab>(tabs.some(item=>item.id===initial) ? initial! : "dashboard");
  const [goals, setGoals] = useState<Goal[]>([]), [tasks, setTasks] = useState<Task[]>([]), [intelligence, setIntelligence] = useState<Record<string, unknown> | null>(null), [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const [goalResponse, taskResponse, intelligenceResponse] = await Promise.all([fetch("/api/legacy/goals"), fetch("/api/tasks"), fetch("/api/personal/goals/intelligence")]); if (goalResponse.ok) setGoals(await goalResponse.json()); if (taskResponse.ok) setTasks(await taskResponse.json()); if (intelligenceResponse.ok) setIntelligence(await intelligenceResponse.json()); } finally { setLoading(false); } };
  useEffect(()=>{ void load(); },[]);
  useEffect(()=>{ const url=new URL(window.location.href);url.searchParams.set("planner",tab);window.history.replaceState({},"",url);},[tab]);
  const toggleTask = async (id:string,status:string) => { const response=await fetch(`/api/tasks/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); if(!response.ok) return; await load(); onUpdateScore(); onAddSignalREvent(`Task marked ${status}.`); };
  return <div className="max-w-7xl mx-auto space-y-4">
    <PageHeader eyebrow="Vision to execution" title="Plan" description="Goals, tasks, habits and reviews from authoritative LifeOS records." actions={<button onClick={()=>void load()} disabled={loading} className="life-button-secondary flex items-center gap-2"><RefreshCw className={`h-3.5 w-3.5 ${loading?"animate-spin":""}`}/>Refresh</button>}/>
    <SegmentedTabs label="Planning sections" items={tabs.map(({id,label})=>({id,label}))} value={tab} onChange={value=>setTab(value as PlannerTab)}/>
    {loading && !goals.length ? <div className="bg-white border rounded-2xl p-8 text-center text-sm text-stone-500">Loading your plan…</div> : <>
      {tab==="dashboard"&&<ExecutiveAlignmentDashboard goals={goals} tasks={tasks} intelligence={intelligence} onNavigate={value=>setTab(value as PlannerTab)} onToggleTask={toggleTask}/>}
      {tab==="vision"&&<UnifiedLifeVision goals={goals} tasks={tasks} onNavigate={value=>setTab(value as PlannerTab)} onActivity={onAddSignalREvent}/>}
      {tab==="goals"&&<GoalTaskWorkspace initialView="goals" onActivity={onAddSignalREvent}/>}
      {tab==="tasks"&&<GoalTaskWorkspace initialView="tasks" onActivity={onAddSignalREvent}/>}
      {(["calendar","habits","focus","reviews","analytics"] as PlannerTab[]).includes(tab)&&<PlannerSecondaryWorkspace initialView={tab as "calendar"|"habits"|"focus"|"reviews"|"analytics"} onActivity={onAddSignalREvent}/>}
    </>}
  </div>;
}
