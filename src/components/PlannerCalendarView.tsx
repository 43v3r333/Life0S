import React, { useState, useEffect } from "react";
import { Clock, Plus, Layers, DollarSign, Heart, Activity, CheckCircle2, Moon, Sparkles, Star } from "lucide-react";
import { ScheduledItem } from "../types";

interface PlannerCalendarProps {
  onAddSignalREvent: (msg: string) => void;
  onUpdateScore: () => void;
}

export default function PlannerCalendarView({ onAddSignalREvent, onUpdateScore }: PlannerCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [calcMethod, setCalcMethod] = useState("ISNA");
  const [location, setLocation] = useState("London, UK");

  // Logging States
  const [salahLogs, setSalahLogs] = useState({
    Fajr: true,
    Dhuhr: true,
    Asr: false,
    Maghrib: false,
    Isha: false
  });

  const [workoutType, setWorkoutType] = useState("Cardio");
  const [workoutDuration, setWorkoutDuration] = useState("30");
  const [hrvValue, setHrvValue] = useState("75");

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("learning");
  const [expenseDesc, setExpenseDesc] = useState("");

  const [schedule, setSchedule] = useState<ScheduledItem[]>([
    { id: "s1", time: "04:15", title: "Fajr Congregational Prayer (Deen Boundary)", category: "deen", status: "completed" },
    { id: "s2", time: "07:00", title: "Cardiovascular Workout & HRV telemetry log", category: "health", status: "completed" },
    { id: "s3", time: "09:00", title: "Halal Assets portfolio rebalancing & double check", category: "finance", status: "pending" },
    { id: "s4", time: "11:00", title: "Technical Architecture refactoring - Core Command", category: "career", status: "pending" },
    { id: "s5", time: "13:10", title: "Dhuhr Prayer window consistency audit", category: "deen", status: "completed" },
    { id: "s6", time: "15:30", title: "Study plan: Islamic Commercial Law reading", category: "learning", status: "pending" },
    { id: "s7", time: "18:00", title: "Marital Chore Matrix sync - dinner & kitchen help", category: "family", status: "pending" }
  ]);

  // Handle logging Salah
  const handleSalahToggle = async (prayer: keyof typeof salahLogs) => {
    const updated = !salahLogs[prayer];
    setSalahLogs((prev) => ({ ...prev, [prayer]: updated }));

    // Send domain event to backend
    try {
      const res = await fetch("/api/deen/salah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayer, status: updated })
      });
      if (res.ok) {
        onAddSignalREvent(`Malki (Salah Tracker) published SalahLoggedEvent { Prayer = "${prayer as string}", ConsistencyScore = 95.8 }`);
        onUpdateScore();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Workout Log
  const handleWorkoutLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/health/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: workoutType, duration: workoutDuration, hrv: hrvValue })
      });
      if (res.ok) {
        onAddSignalREvent(`HealthSentinel published AthleticMetricsLoggedEvent { Workout = "${workoutType}", Duration = ${workoutDuration}m, HRV = ${hrvValue}ms }`);
        onUpdateScore();
        alert("Workout metrics logged securely to database.");
        setWorkoutDuration("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle expense log
  const handleExpenseLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(Number(expenseAmount))) {
      alert("Please provide a valid transaction amount.");
      return;
    }
    try {
      const res = await fetch("/api/finance/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(expenseAmount), category: expenseCategory, description: expenseDesc })
      });
      if (res.ok) {
        onAddSignalREvent(`WealthArchitect published LedgerTransactionAddedEvent { Amount = £${expenseAmount}, Category = "${expenseCategory}", ShariahCheck = "PASSED" }`);
        onUpdateScore();
        alert("Halal transaction added to double-entry ledger.");
        setExpenseAmount("");
        setExpenseDesc("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSchedule = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "completed" ? "pending" : "completed" }
          : item
      )
    );
    onAddSignalREvent(`PlannerEngine updated task ${id} status transition.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Col 1 & 2: Planner Schedule & Calendar */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Date Selection Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-stone-500" />
            <div>
              <h3 className="text-xs font-semibold text-stone-900 font-mono">PLANNER CONSOLE</h3>
              <p className="text-[10px] text-stone-500 uppercase font-mono mt-0.5">ACTIVE HORIZON: JULY 2026</p>
            </div>
          </div>

          <div className="flex space-x-1.5 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, idx) => {
              const dayNum = 6 + idx;
              const isSelected = selectedDay === dayNum;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`w-9 h-9 rounded-lg font-mono text-xs flex flex-col items-center justify-center transition ${
                    isSelected ? "bg-stone-900 text-white font-bold shadow-md" : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-150"
                  }`}
                >
                  <span className="text-[8px] font-bold uppercase opacity-60">Mon</span>
                  <span className="mt-0.5">{dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Schedule List */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
            <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono">Today's Focus Horizon</h3>
            <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200 font-mono">
              7 SCHEDULE_ENTITIES
            </span>
          </div>

          <div className="space-y-3">
            {schedule.map((item) => {
              const isComp = item.status === "completed";
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleSchedule(item.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isComp ? "bg-stone-50/75 border-stone-150 opacity-65" : "bg-[#fbfbfa] border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <span className="text-[11px] font-mono text-stone-400 mt-0.5">{item.time}</span>
                    <div>
                      <h4 className={`text-xs font-semibold ${isComp ? "line-through text-stone-500" : "text-stone-900"}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                          item.category === "deen" ? "bg-emerald-50 text-emerald-800" : item.category === "health" ? "bg-red-50 text-red-800" : item.category === "finance" ? "bg-amber-50 text-amber-800" : "bg-stone-100 text-stone-600"
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CheckCircle2 className={`h-5 w-5 ${isComp ? "text-emerald-500" : "text-stone-300 hover:text-stone-500"}`} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Col 3: Calculation config & Logging telemetry metrics */}
      <div className="space-y-6">
        
        {/* Prayer Time Config Panel */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-4 flex items-center space-x-1.5">
            <Moon className="h-4 w-4" />
            <span>Salah Horizons</span>
          </h3>

          <div className="space-y-4 text-xs leading-normal">
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">CALCULATION_METHOD</label>
              <select
                value={calcMethod}
                onChange={(e) => {
                  setCalcMethod(e.target.value);
                  onAddSignalREvent(`DeenAuditor updated prayer calculation method to: ${e.target.value}`);
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1.5 focus:outline-none text-stone-700 text-xs font-mono"
              >
                <option value="ISNA">Islamic Society of North America (ISNA)</option>
                <option value="MWL">Muslim World League (MWL)</option>
                <option value="UmmAlQura">Umm al-Qura, Makkah</option>
                <option value="Karachi">University of Islamic Sciences, Karachi</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">LOCATION_DOCK</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London, UK"
                className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1.5 focus:outline-none text-stone-700 text-xs font-mono"
              />
            </div>

            {/* Salah Checklist Tracker */}
            <div className="pt-3 border-t border-stone-100">
              <span className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-2">Today's Prayer Telemetry Logs</span>
              <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
                {(Object.keys(salahLogs) as Array<keyof typeof salahLogs>).map((prayer) => {
                  const active = salahLogs[prayer];
                  return (
                    <button
                      key={prayer}
                      onClick={() => handleSalahToggle(prayer)}
                      className={`py-2 rounded-lg border transition ${
                        active ? "bg-emerald-950 text-emerald-400 border-emerald-500/50" : "bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <div className="font-bold">{(prayer as string)[0]}</div>
                      <div className="text-[8px] mt-0.5 uppercase opacity-60">{(prayer as string).slice(1, 3)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bio-metric logs */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-3.5 flex items-center space-x-1.5">
            <Heart className="h-4 w-4 text-red-500" />
            <span>Health & Vitality Logger</span>
          </h3>

          <form onSubmit={handleWorkoutLog} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">ACTIVITY</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none text-stone-700 font-mono text-[11px]"
                >
                  <option value="Cardio">Cardio / Run</option>
                  <option value="Weightlifting">Strength Training</option>
                  <option value="HIIT">HIIT Interval</option>
                  <option value="Cycling">Cycling</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">DURATION (MIN)</label>
                <input
                  type="text"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none text-stone-700 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">HRV SCORE (MS)</label>
              <input
                type="text"
                value={hrvValue}
                onChange={(e) => setHrvValue(e.target.value)}
                placeholder="75"
                className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none text-stone-700 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-stone-950 transition uppercase flex items-center justify-center space-x-1"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Log Biometrics</span>
            </button>
          </form>
        </div>

        {/* Ledger transaction logs */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-3.5 flex items-center space-x-1.5">
            <DollarSign className="h-4 w-4 text-amber-600" />
            <span>Double-Entry Ledger</span>
          </h3>

          <form onSubmit={handleExpenseLog} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">VALUE (£)</label>
                <input
                  type="text"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 24.50"
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none text-stone-700 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">CATEGORY</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none text-stone-700 font-mono text-[11px]"
                >
                  <option value="learning">Books / Courses</option>
                  <option value="charity">Zakat / Sadaqah</option>
                  <option value="household">Household bills</option>
                  <option value="halal_portfolio">Halal Equity Asset</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">MEMO / DESCRIPTION</label>
              <input
                type="text"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Purchase study textbooks"
                className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none text-stone-700 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-stone-950 transition uppercase flex items-center justify-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Transaction</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
