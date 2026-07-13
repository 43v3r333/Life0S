import React, { useState, useEffect, useRef } from "react";
import { Search, Terminal, Zap, Shield, Sparkles, Navigation, X, Book, Database, Layers, CheckSquare } from "lucide-react";
import { UnifiedSearchItem } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string, params?: any) => void;
}

export default function CommandPalette({ isOpen, onClose, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<UnifiedSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle key listeners for navigation and escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, combinedItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = combinedItems[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query, searchResults]);

  // Dynamic simulated hybrid/vector search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const delay = setTimeout(() => {
      // Direct mock indexing search
      const mockDatabase: UnifiedSearchItem[] = [
        { id: "g1", title: "Establish Foundation Stage Scaffold", type: "Goal", description: "Establish complete architectural scaffold of Project Jannah (LifeOS) with clean MediatR domain logic.", relevance: 0.98, link: "goals" },
        { id: "g2", title: "Complete Halal Portfolio Model", type: "Goal", description: "Define and double-entry log compliant financial asset growth criteria.", relevance: 0.92, link: "goals" },
        { id: "p1", title: "Project Jannah Phase 3 Presentation Layer", type: "Project", description: "Build full Bloomberg-style, distraction-free React console UI and API proxies.", relevance: 0.95, link: "projects" },
        { id: "t1", title: "Review Isha prayer window consistency", type: "Task", description: "Review daily compliance and telemetry stats for peak productivity alignment.", relevance: 0.89, link: "islam" },
        { id: "j1", title: "Morning Reflection - Cognitive Alignment", type: "Journal", description: "Journal entry assessing deep strategic vision vs current work energy variables.", relevance: 0.87, link: "journal" },
        { id: "m1", title: "Rule of 70% Sleep Rebound Limit", type: "Memory", description: "Vector memory noting that sleep beneath 6.5 hours forces immediate next day workload compaction.", relevance: 0.96, link: "ai" },
        { id: "pol1", title: "Deen Non-Negotiable Core Policy", type: "Policy", description: "System invariant enforcing immediate freeze of workspace tasks when prayer is active.", relevance: 0.99, link: "islam" },
        { id: "meet1", title: "Family Synergy Council Meeting", type: "Meeting", description: "Weekly review of marital chore audits and mutual support goals.", relevance: 0.84, link: "marriage" },
        { id: "b1", title: "Islamic Commercial Law: Principles and Practice", type: "Book", description: "Reading study plan on classical commercial contract validity guidelines.", relevance: 0.81, link: "learning" },
        { id: "d1", title: "LifeOS Architecture Blueprint v0.3", type: "Document", description: "Clean Architecture, CQRS schemas, and Qdrant memory node guidelines.", relevance: 0.91, link: "explorer" }
      ];

      const lowercaseQuery = query.toLowerCase();
      const filtered = mockDatabase
        .filter(
          (item) =>
            item.title.toLowerCase().includes(lowercaseQuery) ||
            item.description.toLowerCase().includes(lowercaseQuery) ||
            item.type.toLowerCase().includes(lowercaseQuery)
        )
        // Add a slight variance to the relevance based on match
        .map((item) => {
          const matchFactor = item.title.toLowerCase().startsWith(lowercaseQuery) ? 0.05 : 0;
          return { ...item, relevance: Math.min(0.99, Number((item.relevance + matchFactor).toFixed(2))) };
        })
        .sort((a, b) => b.relevance - a.relevance);

      setSearchResults(filtered);
      setSearching(false);
    }, 180);

    return () => clearTimeout(delay);
  }, [query]);

  // Combined action list + search results
  const staticActions = [
    { id: "act_log_salah", title: "Log Salah telemetry", type: "Action" as const, description: "Log prayer consistency & timings to SQL database", icon: Shield, shortcut: "S" },
    { id: "act_log_workout", title: "Log physical workout", type: "Action" as const, description: "Track biometrics, HRV, sleep and athletic records", icon: Zap, shortcut: "W" },
    { id: "act_record_expense", title: "Record Halal expense / income", type: "Action" as const, description: "Add transaction to double-entry ledger", icon: Database, shortcut: "E" },
    { id: "act_ask_gabriel", title: "Ask Gabriel Strategy Advisor", type: "Action" as const, description: "Start strategic cognitive conversation", icon: Sparkles, shortcut: "G" },
    { id: "act_create_goal", title: "Create new strategic goal", type: "Action" as const, description: "Define a hierarchical objective tree node", icon: Layers, shortcut: "O" },
    { id: "act_create_journal", title: "Write journal reflection", type: "Action" as const, description: "Add vectorized personal journal entry", icon: Book, shortcut: "J" },
    { id: "act_nav_dashboard", title: "Navigate to Dashboard", type: "Action" as const, description: "Open Executive Command Center", icon: Navigation, shortcut: "D" },
    { id: "act_nav_settings", title: "Navigate to Settings", type: "Action" as const, description: "Adjust theme, API keys, and system parameters", icon: Terminal, shortcut: "T" }
  ];

  const filteredActions = query
    ? staticActions.filter(
        (act) =>
          act.title.toLowerCase().includes(query.toLowerCase()) ||
          act.description.toLowerCase().includes(query.toLowerCase())
      )
    : staticActions;

  const combinedItems = [
    ...filteredActions.map((act) => ({
      id: act.id,
      title: act.title,
      type: "Action" as const,
      description: act.description,
      relevance: 1.0,
      link: act.id,
      icon: act.icon,
      shortcut: act.shortcut
    })),
    ...searchResults
  ];

  const handleSelect = (item: any) => {
    if (item.type === "Action") {
      onSelectAction(item.id);
    } else {
      onSelectAction("navigate", { target: item.link, searchItem: item });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-start justify-center pt-28 px-4 z-50">
      {/* Container */}
      <div className="w-full max-w-2xl bg-[#fafaf9] border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[480px]">
        
        {/* Search Header */}
        <div className="border-b border-stone-200 px-4 py-3.5 flex items-center space-x-3 bg-white">
          <Search className="h-5 w-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search across Deen, Goals, Memories, Secrets..."
            className="w-full text-sm text-stone-900 bg-transparent border-none focus:outline-none placeholder-stone-400"
          />
          <span className="text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-stone-500 font-mono">
            ESC
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="bg-stone-50 px-4 py-1.5 border-b border-stone-150 flex items-center justify-between text-[9px] font-mono text-stone-400 uppercase tracking-wider">
          <span>Search Engine: Hybrid Vector + Keyword</span>
          <div className="flex items-center space-x-2">
            <span>INDEXED: 1,024 NODES</span>
            <span>•</span>
            <span className="text-emerald-500">QDRANT COGNITIVE RETRIEVAL READY</span>
          </div>
        </div>

        {/* Results / Commands List */}
        <div className="flex-1 overflow-y-auto max-h-[350px] divide-y divide-stone-100 bg-white">
          {combinedItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs font-mono">
              {searching ? "Consulting local memory index..." : "No items or actions found matching query."}
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const IconComponent = item.icon || (item.type === "Goal" ? Layers : item.type === "Memory" ? Database : Book);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 cursor-pointer flex items-center justify-between transition ${
                    isSelected ? "bg-stone-900 text-white" : "hover:bg-stone-50 text-stone-800"
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`p-1.5 rounded-lg border mt-0.5 ${
                      isSelected ? "bg-stone-850 border-stone-700 text-emerald-400" : "bg-stone-50 border-stone-200 text-stone-500"
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${isSelected ? "text-white" : "text-stone-900"}`}>
                          {item.title}
                        </span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 rounded border ${
                          isSelected ? "bg-stone-800 border-stone-700 text-stone-300" : "bg-stone-100 border-stone-200 text-stone-500"
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate leading-normal mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right hand metadata or shortcuts */}
                  <div className="flex items-center space-x-3 font-mono text-[10px] shrink-0">
                    {item.shortcut && (
                      <div className="flex items-center space-x-0.5 text-stone-400">
                        <span className="text-[9px]">⌥</span>
                        <span className={`border px-1.5 py-0.2 rounded ${
                          isSelected ? "bg-stone-800 border-stone-700 text-white" : "bg-stone-50 border-stone-200 text-stone-500"
                        }`}>
                          {item.shortcut}
                        </span>
                      </div>
                    )}
                    {item.type !== "Action" && (
                      <span className={`font-semibold ${isSelected ? "text-emerald-400" : "text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 text-[9px]"}`}>
                        {(item.relevance * 100).toFixed(0)}% sim
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">
                        ⏎
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Help footer */}
        <div className="bg-stone-50 px-4 py-2.5 text-[10px] font-mono text-stone-400 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span>↑↓ to navigate</span>
            <span>⏎ to select</span>
            <span>ESC to dismiss</span>
          </div>
          <span className="text-[9px] text-stone-500">RAYCAST PROTOCOL ACTIVE</span>
        </div>

      </div>
    </div>
  );
}
