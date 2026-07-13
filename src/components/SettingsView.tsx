import React, { useState, useEffect } from "react";
import { Terminal, Moon, Monitor, Database, Shield, RefreshCw, Layers, Sliders, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { UserProfile, TelemetryMetric } from "../types";

interface SettingsViewProps {
  userProfile: UserProfile;
  onChangeProfile: (p: UserProfile) => void;
  onAddSignalREvent: (msg: string) => void;
  theme: "light" | "dark" | "high-contrast";
  onChangeTheme: (theme: "light" | "dark" | "high-contrast") => void;
}

export default function SettingsView({
  userProfile,
  onChangeProfile,
  onAddSignalREvent,
  theme,
  onChangeTheme
}: SettingsViewProps) {
  const [provider, setProvider] = useState("gemini");
  const [compactThreshold, setCompactThreshold] = useState(80);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryMetric[]>([]);
  const [cpu, setCpu] = useState(24);
  const [memory, setMemory] = useState(48);

  // Generate simulated historical telemetry
  useEffect(() => {
    const initial: TelemetryMetric[] = Array.from({ length: 12 }).map((_, idx) => {
      const minAgo = 11 - idx;
      return {
        timestamp: `${minAgo}m ago`,
        cpuUsage: Math.floor(Math.random() * 20) + 15,
        memoryUsage: Math.floor(Math.random() * 5) + 45,
        dbPoolActive: Math.floor(Math.random() * 3) + 2,
        mcpRequestRate: Math.floor(Math.random() * 8) + 4
      };
    });
    setTelemetryHistory(initial);

    const timer = setInterval(() => {
      const curCpu = Math.floor(Math.random() * 18) + 14;
      const curMem = Math.floor(Math.random() * 4) + 46;
      setCpu(curCpu);
      setMemory(curMem);

      setTelemetryHistory((prev) => {
        const sliced = prev.slice(1);
        return [
          ...sliced,
          {
            timestamp: "now",
            cpuUsage: curCpu,
            memoryUsage: curMem,
            dbPoolActive: Math.floor(Math.random() * 3) + 2,
            mcpRequestRate: Math.floor(Math.random() * 10) + 5
          }
        ];
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleTogglePrivacy = (key: keyof UserProfile["privacy"]) => {
    const updated = {
      ...userProfile,
      privacy: {
        ...userProfile.privacy,
        [key]: !userProfile.privacy[key]
      }
    };
    onChangeProfile(updated);
    onAddSignalREvent(`KernelSettings updated privacy variable: ${key} = ${updated.privacy[key]}`);
  };

  const handleToggleNotification = (key: keyof UserProfile["notifications"]) => {
    const updated = {
      ...userProfile,
      notifications: {
        ...userProfile.notifications,
        [key]: !userProfile.notifications[key]
      }
    };
    onChangeProfile(updated);
    onAddSignalREvent(`KernelSettings updated notification variable: ${key} = ${updated.notifications[key]}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Col 1 & 2: General & Preference Settings */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Core preferences form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-4 flex items-center space-x-1.5">
            <Sliders className="h-4 w-4" />
            <span>General & Cognitive Preferences</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* AI Providers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">DEFAULT_AI_PROVIDER</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    onAddSignalREvent(`Orchestrator switch: Default cognitive model provider set to: ${e.target.value}`);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none text-stone-700 text-xs font-mono"
                >
                  <option value="gemini">Google Gemini (Chief Agent)</option>
                  <option value="openai">OpenAI GPT-4o (Reasoning Enclave)</option>
                  <option value="anthropic">Anthropic Claude Sonnet (Synthesis Weaver)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-1">AI_PERSONALITY_MOCK</label>
                <select
                  value={userProfile.preferences.aiPersonality}
                  onChange={(e) => {
                    onChangeProfile({
                      ...userProfile,
                      preferences: { ...userProfile.preferences, aiPersonality: e.target.value }
                    });
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none text-stone-700 text-xs font-mono"
                >
                  <option value="strategic">Strategic Executive Advisor (Gabriel Default)</option>
                  <option value="humble">Sufi / Devoted Spiritual Guide</option>
                  <option value="brutalist">Ultra-Direct Brutalist Productivity Commander</option>
                </select>
              </div>
            </div>

            {/* Layout Appearance theme toggles */}
            <div className="border-t border-stone-100 pt-4">
              <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono mb-2">INTERFACE_APPEARANCE_THEME</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                {[
                  { id: "light" as const, label: "Warm Light", desc: "Refined paper cream" },
                  { id: "dark" as const, label: "Cosmic Slate", desc: "Distraction-free dark" },
                  { id: "high-contrast" as const, label: "Bloomberg Terminal", desc: "Solid monochrome" }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      onChangeTheme(th.id);
                      onAddSignalREvent(`Visual engine theme switched to: ${th.id}`);
                    }}
                    className={`p-3 rounded-lg border text-left transition ${
                      theme === th.id
                        ? "bg-stone-900 border-stone-950 text-[#fafaf9] shadow-md"
                        : "bg-stone-50 border-stone-200 hover:border-stone-400 text-stone-600"
                    }`}
                  >
                    <div className="font-bold uppercase flex items-center space-x-1.5">
                      <Moon className="h-3.5 w-3.5" />
                      <span>{th.label}</span>
                    </div>
                    <p className="text-[8px] mt-0.5 opacity-60">{th.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliding parameters for dynamic compaction */}
            <div className="border-t border-stone-100 pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-[9px] font-bold text-stone-400 uppercase font-mono">CONTEXT_COMPACTION_THRESHOLD</label>
                <span className="font-mono text-[10px] font-bold text-stone-800">{compactThreshold}% capacity</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={compactThreshold}
                onChange={(e) => setCompactThreshold(Number(e.target.value))}
                className="w-full mt-2 accent-stone-900 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Specifies the memory limit boundary that automatically triggers the Cognitive Memory Core compression pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Privacy Settings */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-4">
            Security & Permission Boundaries
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notifications */}
            <div className="space-y-3.5 text-xs">
              <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase">Subsystem Notification Pipes</h4>
              {[
                { key: "policyViolations" as const, label: "Live Policy Violations & Bounds Alerts" },
                { key: "goalProgress" as const, label: "Hierarchical Goal Tree Progress updates" },
                { key: "prayerReminders" as const, label: "Salah boundary calculations & warnings" },
                { key: "learningReminders" as const, label: "Curriculum study plan alerts" },
                { key: "healthAlerts" as const, label: "Bio-metric sleep deficit Warnings" }
              ].map((not) => (
                <label key={not.key} className="flex items-center space-x-3 text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userProfile.notifications[not.key]}
                    onChange={() => handleToggleNotification(not.key)}
                    className="rounded border-stone-200 accent-stone-900"
                  />
                  <span>{not.label}</span>
                </label>
              ))}
            </div>

            {/* Privacy */}
            <div className="space-y-3.5 text-xs border-l border-stone-100 pl-6">
              <h4 className="text-[10px] font-mono font-bold text-stone-400 uppercase">Cryptographic Consent Protocols</h4>
              {[
                { key: "developerLogsEnabled" as const, label: "Enable Verbose Developer Invariant Telemetry logs" },
                { key: "telemetrySharing" as const, label: "Transmit CPU & Database statistics to remote health nodes" },
                { key: "vectorDbSync" as const, label: "Authorize automatic background sync to Qdrant Cloud Cluster" }
              ].map((priv) => (
                <label key={priv.key} className="flex items-center space-x-3 text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userProfile.privacy[priv.key]}
                    onChange={() => handleTogglePrivacy(priv.key)}
                    className="rounded border-stone-200 accent-stone-900"
                  />
                  <span>{priv.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Col 3: Developer Telemetry Graphs & Systems Metrics */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono flex items-center space-x-1.5">
              <Monitor className="h-4 w-4 text-emerald-500" />
              <span>Kernel Live Telemetry</span>
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Key values */}
          <div className="grid grid-cols-2 gap-4 text-center font-mono text-[11px] leading-relaxed">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-400 uppercase block text-[9px]">Kernel CPU LOAD</span>
              <span className="text-lg font-bold text-stone-900 block mt-0.5">{cpu}%</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-stone-400 uppercase block text-[9px]">MEM FOOTPRINT</span>
              <span className="text-lg font-bold text-stone-900 block mt-0.5">{memory} MB</span>
            </div>
          </div>

          {/* Charts container */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="timestamp" stroke="#a3a3a3" style={{ fontSize: "8px", fontFamily: "monospace" }} />
                <YAxis stroke="#a3a3a3" style={{ fontSize: "8px", fontFamily: "monospace" }} />
                <Tooltip contentStyle={{ fontSize: "10px", fontFamily: "monospace", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="cpuUsage" stroke="#10b981" strokeWidth={1.5} dot={false} name="CPU %" />
                <Line type="monotone" dataKey="memoryUsage" stroke="#6366f1" strokeWidth={1.5} dot={false} name="Memory MB" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 font-mono text-[10px] leading-normal text-stone-600">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <span>DB Connection Pool:</span>
              <span className="font-bold text-stone-800">12 Active (SQLServer)</span>
            </div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <span>MCP RPC Requests/sec:</span>
              <span className="font-bold text-stone-800">8.2 rps</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span>Telemetry sync latency:</span>
              <span className="font-bold text-stone-800">14ms</span>
            </div>
          </div>
        </div>

        {/* System actions */}
        <div className="border-t border-stone-100 pt-4 mt-6 space-y-2 text-center">
          <button
            onClick={() => {
              onAddSignalREvent("SystemBackupTriggeredEvent: Core DB dumped and zipped to secure S3 storage.");
              alert("System snapshot backup compiled and compressed safely to offline tape enclave.");
            }}
            className="w-full bg-stone-50 hover:bg-stone-100 text-stone-800 font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-stone-200 transition"
          >
            SNAPSHOT SYSTEM SNOWBALL BACKUP
          </button>
        </div>

      </div>

    </div>
  );
}
