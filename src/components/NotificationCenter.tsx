import React, { useState, useEffect } from "react";
import { Bell, ShieldAlert, Sparkles, AlertTriangle, Clock, RefreshCw, Layers, CheckCircle2, Info } from "lucide-react";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  category: "policy" | "goal" | "prayer" | "health" | "ai" | "critical" | "system";
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
}

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onAddSample: (category: "policy" | "goal" | "prayer" | "health" | "ai" | "critical" | "system") => void;
  isOpen: boolean;
  onToggle: () => void;
  signalREvents: string[];
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onClearAll,
  onAddSample,
  isOpen,
  onToggle,
  signalREvents
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.category === filter;
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case "policy":
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />;
      case "goal":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "prayer":
        return <Clock className="h-4 w-4 text-indigo-500" />;
      case "health":
        return <Info className="h-4 w-4 text-teal-500" />;
      case "ai":
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      default:
        return <Layers className="h-4 w-4 text-stone-400" />;
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "high":
        return "border-l-2 border-red-500 bg-red-50/40";
      case "medium":
        return "border-l-2 border-amber-500 bg-amber-50/40";
      default:
        return "border-l border-stone-200";
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={onToggle}
        id="notification-trigger"
        className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        )}
      </button>

      {/* Flyout Center */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[580px]">
          {/* Header */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">Kernel Notifications (SignalR)</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearAll}
                className="text-[10px] text-stone-400 hover:text-white transition font-mono uppercase underline decoration-stone-600"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Real-time SignalR Event Stream Status */}
          <div className="bg-stone-950 border-b border-stone-850 px-4 py-2 text-[10px] font-mono text-stone-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>SIGNALR_CONNECTED</span>
            </span>
            <span className="text-[9px] uppercase text-stone-500">Live Domain Bus</span>
          </div>

          {/* Quick Action Simulator Panel */}
          <div className="bg-stone-50 p-2.5 border-b border-stone-200 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-stone-400 font-mono uppercase px-1.5">Kernel Event Injectors:</span>
            <div className="flex flex-wrap gap-1.5 p-1">
              <button
                onClick={() => onAddSample("prayer")}
                className="text-[9px] bg-white border border-stone-200 rounded px-1.5 py-0.5 hover:border-indigo-400 hover:bg-indigo-50 transition text-stone-600 font-mono"
              >
                + Salah
              </button>
              <button
                onClick={() => onAddSample("policy")}
                className="text-[9px] bg-white border border-stone-200 rounded px-1.5 py-0.5 hover:border-amber-400 hover:bg-amber-50 transition text-stone-600 font-mono"
              >
                + Policy Violation
              </button>
              <button
                onClick={() => onAddSample("critical")}
                className="text-[9px] bg-white border border-stone-200 rounded px-1.5 py-0.5 hover:border-red-400 hover:bg-red-50 transition text-stone-600 font-mono"
              >
                + Alert
              </button>
              <button
                onClick={() => onAddSample("ai")}
                className="text-[9px] bg-white border border-stone-200 rounded px-1.5 py-0.5 hover:border-purple-400 hover:bg-purple-50 transition text-stone-600 font-mono"
              >
                + Gabriel rec
              </button>
              <button
                onClick={() => onAddSample("goal")}
                className="text-[9px] bg-white border border-stone-200 rounded px-1.5 py-0.5 hover:border-emerald-400 hover:bg-emerald-50 transition text-stone-600 font-mono"
              >
                + Goal Comp
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex border-b border-stone-200 text-[10px] font-mono font-semibold bg-stone-50">
            {["all", "unread", "policy", "prayer", "ai"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex-1 text-center py-2 uppercase transition border-b-2 border-transparent ${
                  filter === cat
                    ? "text-stone-900 border-stone-900 bg-white font-bold"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main List */}
          <div className="flex-1 overflow-y-auto max-h-[250px] divide-y divide-stone-100 bg-white">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs font-mono">
                No telemetry alerts currently listed.
              </div>
            ) : (
              filteredNotifications.map((noti) => (
                <div
                  key={noti.id}
                  onClick={() => onMarkRead(noti.id)}
                  className={`p-3.5 transition hover:bg-stone-50 cursor-pointer ${getPriorityStyle(
                    noti.priority
                  )} ${noti.isRead ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{getIcon(noti.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-900 truncate">
                          {noti.title}
                        </span>
                        {!noti.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                        {noti.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-[9px] font-mono text-stone-400">
                        <span>{noti.timestamp}</span>
                        <span>•</span>
                        <span className="uppercase text-[8px] px-1 bg-stone-100 text-stone-500 rounded font-semibold border border-stone-200">
                          {noti.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Real-time Event Logger Feed (SignalR) */}
          <div className="border-t border-stone-200 bg-stone-950 p-3 max-h-[160px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase tracking-wide border-b border-stone-850 pb-1.5 mb-2">
              <span>Live Domain Bus (SignalR Hub)</span>
              <RefreshCw className="h-3 w-3 text-stone-500 animate-spin" />
            </div>
            <div className="font-mono text-[9px] space-y-1.5 text-stone-300 overflow-y-auto max-h-[100px] select-text">
              {signalREvents.length === 0 ? (
                <span className="text-stone-500 italic block">Awaiting Event stream telemetry...</span>
              ) : (
                signalREvents.map((ev, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500">&gt;</span>
                    <span className="break-all">{ev}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
