import React, { useState } from "react";
import { Cpu, Server, Activity, Users, Zap, Shield, HelpCircle, HardDrive } from "lucide-react";
import { CognitiveAgent } from "../types";

export default function AgentView() {
  const [agents, setAgents] = useState<CognitiveAgent[]>([
    {
      id: "gabriel_cos",
      name: "Gabriel",
      role: "AI Chief of Staff & Commander",
      status: "running",
      currentTask: "Orchestrating daily focus vectors & monitoring policy bounds",
      memoryUsage: "128 KB / 512 KB",
      responseTime: 180,
      health: 100,
      capabilities: ["Context compaction", "Sub-agent routing", "Decision tree optimization", "Enterprise CQRS schema creation"],
      recentDecision: "Allocated 70% energy index to Phase 3 Presentation Layer, freezing non-essential background tasks",
      stats: { tasksCompleted: 1420, accuracy: 99.4 }
    },
    {
      id: "deen_auditor",
      name: "Deen Auditor",
      role: "Salah consistency & Islamic Policy Sentinel",
      status: "idle",
      currentTask: "Awaiting next prayer window boundary transition (Asr)",
      memoryUsage: "48 KB / 256 KB",
      responseTime: 45,
      health: 98,
      capabilities: ["Prayer calculation modeling", "Islamic commercial contract validation", "Zakat ledger tracking"],
      recentDecision: "Issued notice: Maghrib log is outstanding in user context history",
      stats: { tasksCompleted: 830, accuracy: 100.0 }
    },
    {
      id: "wealth_architect",
      name: "Wealth Architect",
      role: "Halal Assets & Double-Entry Accountant",
      status: "running",
      currentTask: "Analyzing local index of mutual fund compliance benchmarks",
      memoryUsage: "64 KB / 256 KB",
      responseTime: 120,
      health: 95,
      capabilities: ["Compliance analysis", "Double-entry books verification", "Retirement yield projection"],
      recentDecision: "Audited 'Jannah Venture Fund' and endorsed status as Shariah compliant",
      stats: { tasksCompleted: 450, accuracy: 98.2 }
    },
    {
      id: "health_sentinel",
      name: "Health Sentinel",
      role: "Athletic log, sleep, HRV, and nutrition analyst",
      status: "sleeping",
      currentTask: "Ingesting fitbit bio-telemetry sleep arrays",
      memoryUsage: "96 KB / 256 KB",
      responseTime: 95,
      health: 100,
      capabilities: ["HRV baseline modeling", "Sleep rebound computation", "Workload compaction trigger"],
      recentDecision: "Triggered 1.5hr workout goal due to positive HRV recovery curve",
      stats: { tasksCompleted: 610, accuracy: 97.8 }
    },
    {
      id: "marriage_caretaker",
      name: "Marriage Caretaker",
      role: "Family harmony & relationship objective sync",
      status: "idle",
      currentTask: "Polling outstanding chore list",
      memoryUsage: "32 KB / 256 KB",
      responseTime: 150,
      health: 92,
      capabilities: ["Relationship audit modeling", "Shared calendar synchronization", "Chore allocation matrix"],
      recentDecision: "Flagged 'Groceries and meal prep' task as nearing due boundary",
      stats: { tasksCompleted: 190, accuracy: 96.5 }
    },
    {
      id: "knowledge_weaver",
      name: "Knowledge Weaver",
      role: "Qdrant Vector database sync & search indexing engine",
      status: "running",
      currentTask: "Syncing localized daily memories with dense embedding cloud",
      memoryUsage: "112 KB / 512 KB",
      responseTime: 65,
      health: 100,
      capabilities: ["Hybrid text search", "Vector embedding indexing", "Context pipeline retrieval"],
      recentDecision: "Completed dense indexing of 24 memory aggregates with zero metadata conflicts",
      stats: { tasksCompleted: 1890, accuracy: 99.9 }
    }
  ]);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("gabriel_cos");
  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const getStatusColor = (status: CognitiveAgent["status"]) => {
    switch (status) {
      case "running":
        return "bg-emerald-400 text-emerald-900 border-emerald-500 animate-pulse";
      case "idle":
        return "bg-blue-400 text-blue-900 border-blue-500";
      case "sleeping":
        return "bg-indigo-400 text-indigo-900 border-indigo-500";
      default:
        return "bg-stone-300 text-stone-700 border-stone-400";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-stone-900 text-white rounded-xl">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase">ACTIVE_AGENTS</h4>
            <p className="text-lg font-semibold text-stone-900 mt-0.5">6 / 6 ONLINE</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-stone-900 text-white rounded-xl">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase">MEMORY_POOL</h4>
            <p className="text-lg font-semibold text-stone-900 mt-0.5">480 KB / 2 MB</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-stone-900 text-white rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase">AVG_RESPONSE</h4>
            <p className="text-lg font-semibold text-stone-900 mt-0.5">109 ms</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-stone-900 text-white rounded-xl">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase">ORCHESTRATOR_HEALTH</h4>
            <p className="text-lg font-semibold text-stone-900 mt-0.5">99.2% READY</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: Agent Grid */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono px-1">Agent Team Roster</h3>
          <div className="space-y-2">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? "bg-stone-900 text-[#fafaf9] border-stone-950 shadow-md"
                      : "bg-white text-stone-950 border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${agent.status === "running" ? "bg-emerald-400 animate-pulse" : agent.status === "idle" ? "bg-blue-400" : agent.status === "sleeping" ? "bg-indigo-400" : "bg-stone-300"}`}></div>
                    <div>
                      <h4 className="text-xs font-semibold">{agent.name}</h4>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>{agent.role}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-stone-800 text-stone-300" : "bg-stone-100 text-stone-600"
                  }`}>
                    {agent.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right pane: Agent Inspector Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-md font-semibold text-stone-900">{activeAgent.name}</h3>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getStatusColor(activeAgent.status)}`}>
                    {activeAgent.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{activeAgent.role}</p>
              </div>

              <div className="text-right font-mono text-[10px] text-stone-400">
                <span>HEALTH: </span>
                <span className="font-bold text-stone-800">{activeAgent.health}%</span>
              </div>
            </div>

            {/* Current Task Detail */}
            <div>
              <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Current Cognitive Task</h4>
              <p className="text-xs text-stone-800 bg-stone-50 p-3 rounded-lg border border-stone-150 font-serif leading-relaxed">
                {activeAgent.currentTask}
              </p>
            </div>

            {/* Recent Strategic Decision */}
            <div>
              <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Recent Core Strategic Decision</h4>
              <p className="text-xs text-stone-800 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 font-mono leading-relaxed">
                {activeAgent.recentDecision}
              </p>
            </div>

            {/* Capabilities */}
            <div>
              <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase mb-2">Capability Protocols (MCP mapping)</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeAgent.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-stone-100 border border-stone-200 text-stone-600 font-mono px-2 py-0.5 rounded-md"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-stone-100 pt-5">
              <div>
                <h5 className="text-[9px] font-mono text-stone-400 uppercase">COMPLETED_TASKS</h5>
                <p className="text-sm font-semibold text-stone-800 mt-0.5">{activeAgent.stats.tasksCompleted}</p>
              </div>
              <div>
                <h5 className="text-[9px] font-mono text-stone-400 uppercase">PRECISION_RATE</h5>
                <p className="text-sm font-semibold text-stone-800 mt-0.5">{activeAgent.stats.accuracy}%</p>
              </div>
              <div>
                <h5 className="text-[9px] font-mono text-stone-400 uppercase">MEMORY_FOOTPRINT</h5>
                <p className="text-sm font-semibold text-stone-800 mt-0.5">{activeAgent.memoryUsage}</p>
              </div>
            </div>

          </div>

          {/* Diagnostics Actions */}
          <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end space-x-2">
            <button
              onClick={() => {
                alert(`Triggered full diagnostic cycle for ${activeAgent.name}. Status check: OK.`);
              }}
              className="text-[11px] font-mono font-bold uppercase text-stone-600 hover:text-stone-900 px-3 py-1.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 rounded-lg transition"
            >
              Run Diagnostic
            </button>
            <button
              onClick={() => {
                alert(`Rebuilding cognitive embeddings pipeline for ${activeAgent.name}.`);
              }}
              className="text-[11px] font-mono font-bold uppercase text-[#fafaf9] bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg transition"
            >
              Force Sync
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
