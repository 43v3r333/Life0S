import React, { useState } from "react";
import { Scale, Users, Heart, DollarSign, Flame, GraduationCap, ChevronRight, Activity, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Sliders } from "lucide-react";
import { SystemScore, UserProfile } from "../types";

interface DashboardViewProps {
  scores: SystemScore;
  userProfile: UserProfile;
  onChangeFocus: (focus: string) => void;
  onNavigate: (tab: string) => void;
  onAddSignalREvent: (msg: string) => void;
}

export default function DashboardView({
  scores,
  userProfile,
  onChangeFocus,
  onNavigate,
  onAddSignalREvent
}: DashboardViewProps) {
  const [editingFocus, setEditingFocus] = useState(false);
  const [focusInput, setFocusInput] = useState(userProfile.currentGoal);

  const handleFocusSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeFocus(focusInput);
    setEditingFocus(false);
    onAddSignalREvent(`ExecutiveFocusChangedEvent: New target set to "${focusInput}"`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-100";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner: Today's Focus & Critical Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Focus Card */}
        <div className="lg:col-span-2 bg-stone-900 text-[#fafaf9] rounded-2xl p-6 border border-stone-800 shadow-xl flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold mb-3">
              <span>EXECUTIVE_FOCUS_HORIZON</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>ENGAGED</span>
              </span>
            </div>

            {editingFocus ? (
              <form onSubmit={handleFocusSave} className="flex gap-2">
                <input
                  type="text"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  className="bg-stone-800 border border-stone-700 text-white rounded px-3 py-1.5 text-xs focus:outline-none w-full"
                />
                <button type="submit" className="bg-emerald-500 text-stone-950 font-mono text-xs px-3 py-1.5 rounded font-bold">
                  SAVE
                </button>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-medium tracking-tight font-sans leading-snug">
                  {userProfile.currentGoal}
                </h2>
                <button
                  onClick={() => setEditingFocus(true)}
                  className="p-1 rounded bg-stone-800 text-stone-400 hover:text-white transition text-[10px] font-mono shrink-0 uppercase border border-stone-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-stone-800 pt-3.5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-400 font-mono gap-2">
            <span>COGNITIVE CHIEF OF STAFF ASSIGNED: GABRIEL</span>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span>94% SCORE SYNCHRONIZED</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts & Policy Violations panel */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono flex items-center space-x-1.5">
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            <span>Active Signals & Alerts</span>
          </h3>

          <div className="space-y-2.5">
            <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-red-800 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block font-mono text-[10px] uppercase">Policy Violation detected</span>
                <span className="text-stone-600 block mt-0.5 leading-normal">Fajr prayer telemetry log indicates 15 min deficit from threshold.</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-amber-800 text-xs flex items-start space-x-2.5">
              <Activity className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block font-mono text-[10px] uppercase">Vitality Warning</span>
                <span className="text-stone-600 block mt-0.5 leading-normal">Sleep index fell to 5.8 hrs. Automatic context compaction engaged.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: 10 Sub-Scores */}
      <div>
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono">Dynamic Jannah Scores</h3>
          <span className="text-[10px] font-mono text-stone-400">CALCULATED SECURELY BY KERNEL</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { id: "overall", name: "Overall Life", val: scores.overall, icon: Sparkles, tab: "settings" },
            { id: "faith", name: "Deen (Faith)", val: scores.faith, icon: Scale, tab: "islam" },
            { id: "marriage", name: "Marriage Care", val: scores.marriage, icon: Users, tab: "marriage" },
            { id: "health", name: "Vitality (Health)", val: scores.health, icon: Heart, tab: "health" },
            { id: "finance", name: "Wealth (Finance)", val: scores.finance, icon: DollarSign, tab: "finance" },
            { id: "career", name: "Career Growth", val: scores.career, icon: Flame, tab: "career" },
            { id: "business", name: "Business Build", val: scores.business, icon: Sliders, tab: "business" },
            { id: "learning", name: "RAG Learning", val: scores.learning, icon: GraduationCap, tab: "learning" },
            { id: "discipline", name: "Discipline Rate", val: scores.discipline, icon: CheckCircle2, tab: "settings" },
            { id: "consistency", name: "Consistency", val: scores.consistency, icon: Activity, tab: "settings" }
          ].map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => onNavigate(sc.tab)}
                className="bg-white border border-stone-200 hover:border-stone-400 transition cursor-pointer rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[115px]"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg border ${getScoreColor(sc.val)}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-900">{sc.val}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900 mt-2.5">{sc.name}</h4>
                  <div className="w-full bg-stone-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-stone-900 h-1 rounded-full" style={{ width: `${sc.val}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Recommendations & Upcoming Decisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recommendation lists */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-stone-150 pb-3 mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono">
              Strategic AI Recommendations
            </h3>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-stone-600">
            <div className="flex items-start space-x-3">
              <span className="text-emerald-500 font-bold font-mono">1.</span>
              <p>
                <strong>Compact Daily Planner Horizon</strong>: Based on 5.8hr sleep metrics deficit, Gabriel recommends skipping the 16:00 technical reading sprint to safeguard Asr-to-Maghrib spiritual buffer.
              </p>
            </div>
            <div className="flex items-start space-x-3 pt-3 border-t border-stone-100">
              <span className="text-emerald-500 font-bold font-mono">2.</span>
              <p>
                <strong>Allocate Halal Equity Spill</strong>: Financial ledgers indicate a £1.2k surplus. Wealth Sentinel suggests depositing 40% into the active gold tracker node to hedge inflation thresholds.
              </p>
            </div>
            <div className="flex items-start space-x-3 pt-3 border-t border-stone-100">
              <span className="text-emerald-500 font-bold font-mono">3.</span>
              <p>
                <strong>Trigger Relationship Core Check</strong>: Marriage Caretaker notes zero shared chore completions logged for 3 consecutive intervals. Complete the 'Meal prep support' task to preserve marital synergy scores.
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming decisions */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-stone-150 pb-3 mb-4">
            <CheckCircle2 className="h-4 w-4 text-stone-500" />
            <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono">
              Pending Tactical Decisions
            </h3>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            {[
              { id: "dec1", title: "Approve Jannah Venture Fund compliance endorsement", deadline: "Today 18:00" },
              { id: "dec2", title: "Approve 4-week continuous learning curriculum compaction", deadline: "July 8" },
              { id: "dec3", title: "Authorize Google Workspace SMTP secret vault link", deadline: "July 12" }
            ].map((dec) => (
              <div key={dec.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <span className="font-semibold text-stone-900 block truncate">{dec.title}</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 block uppercase">Deadline: {dec.deadline}</span>
                </div>
                <button
                  onClick={() => {
                    alert(`Decision resolved: "${dec.title}" has been authorized and dispatched to domain events.`);
                    onAddSignalREvent(`DecisionResolvedEvent { DecisionId = "${dec.id}", Authorized = true }`);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-[#fafaf9] px-2.5 py-1 rounded text-[10px] font-bold"
                >
                  RESOLVE
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
