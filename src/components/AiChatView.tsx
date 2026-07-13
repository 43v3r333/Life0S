import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Pin, Bookmark, Shield, BookOpen, Layers, Info, Download, Trash, ChevronDown, Check, RefreshCw } from "lucide-react";
import { ChatMessage, UserProfile } from "../types";

interface AiChatViewProps {
  userProfile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string, activeAgent: string) => void;
  sendingMessage: boolean;
  onClearHistory: () => void;
  onAddSignalREvent: (msg: string) => void;
}

export default function AiChatView({
  userProfile,
  messages,
  onSendMessage,
  sendingMessage,
  onClearHistory,
  onAddSignalREvent
}: AiChatViewProps) {
  const [inputValue, setInputValue] = useState("");
  const [activeAgent, setActiveAgent] = useState("gabriel_cos");
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sendingMessage) return;
    onSendMessage(inputValue, activeAgent);
    setInputValue("");
  };

  const exportConversation = () => {
    const formatted = messages
      .map((m) => `## ${m.role === "user" ? "User" : activeAgent.toUpperCase()}\n\n${m.content}`)
      .join("\n\n");
    
    const blob = new Blob([formatted], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ProjectJannah-Conversation-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const getAgentLabel = (id: string) => {
    switch (id) {
      case "deen_auditor":
        return "Deen Auditor Agent";
      case "wealth_architect":
        return "Wealth Architect Agent";
      case "health_sentinel":
        return "Health Sentinel Agent";
      default:
        return "Gabriel (Chief of Staff)";
    }
  };

  const getAgentDescription = (id: string) => {
    switch (id) {
      case "deen_auditor":
        return "Specializes in prayer times, quran, halal principles and islamic jurisprudence consistency audits.";
      case "wealth_architect":
        return "Specializes in halal financial portfolios, double-entry ledgers, and budget compliance boundaries.";
      case "health_sentinel":
        return "Specializes in athletic metrics, bio-telemetry, sleep, and HRV recovery curve analysis.";
      default:
        return "The primary coordinator orchestrating all life domains. Allocates focus indices and enforces system policies.";
    }
  };

  const activeMsg = messages.find((m) => m.id === selectedMsgId) || messages[messages.length - 1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
      
      {/* Left Col: Chat Space (Cols 1-3) */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between min-h-[580px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="border-b border-stone-150 px-6 py-4 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h3 className="text-sm font-semibold text-stone-950 flex items-center space-x-2">
                <span>{getAgentLabel(activeAgent)}</span>
              </h3>
              <p className="text-[10px] text-stone-500 font-mono">ROLE DOCK ACTIVE • MODEL: gemini-3.5-flash</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 font-mono text-[10px]">
            <button
              onClick={exportConversation}
              className="px-2.5 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 bg-white transition flex items-center space-x-1.5 text-stone-600"
              title="Export as Markdown"
            >
              {exportSuccess ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Download className="h-3.5 w-3.5" />}
              <span>{exportSuccess ? "EXPORTED" : "EXPORT"}</span>
            </button>
            <button
              onClick={onClearHistory}
              className="p-1.5 border border-stone-200 rounded-lg hover:bg-red-50 hover:text-red-600 bg-white transition text-stone-400"
              title="Clear chat history"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Scrolling Body */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[380px] bg-white text-sm">
          {messages.length === 0 ? (
            <div className="py-24 text-center text-stone-400 text-xs font-mono">
              Initialize a cognitive strategic query with {getAgentLabel(activeAgent)}.
            </div>
          ) : (
            messages.map((m) => {
              const isAssistant = m.role === "assistant";
              const isSelected = selectedMsgId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMsgId(m.id)}
                  className={`flex flex-col cursor-pointer p-3.5 rounded-xl border transition ${
                    isAssistant
                      ? isSelected
                        ? "bg-stone-50 border-stone-400"
                        : "bg-stone-50/50 border-stone-150 hover:border-stone-300"
                      : "bg-white border-transparent hover:bg-stone-50/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase opacity-55">
                      {isAssistant ? getAgentLabel(activeAgent) : "User Context"}
                    </span>
                    <div className="flex space-x-1">
                      {m.isPinned && (
                        <Pin className="h-3 w-3 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="mt-1.5 whitespace-pre-wrap text-xs text-stone-850 font-serif leading-relaxed select-text">
                    {m.content}
                  </div>

                  {isAssistant && m.reasoningTrace && m.reasoningTrace.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100/60 text-[10px] text-stone-500">
                      <div className="flex items-center space-x-1.5 font-bold font-mono text-[9px] uppercase tracking-wider text-stone-400">
                        <Sparkles className="h-3 w-3" />
                        <span>Reasoning Trace (CoS Enclave)</span>
                      </div>
                      <div className="space-y-1 mt-1.5 font-mono text-[9px] leading-normal pl-4 border-l border-stone-200">
                        {m.reasoningTrace.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start space-x-1.5">
                            <span className="text-emerald-500 font-bold">&gt;</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {sendingMessage && (
            <div className="flex justify-start">
              <div className="bg-stone-50 rounded-2xl p-4 rounded-tl-sm border border-stone-200 max-w-[85%]">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Prompts Row */}
        <div className="px-6 py-2.5 bg-stone-50/50 border-t border-b border-stone-150 flex flex-wrap gap-2 shrink-0">
          <span className="text-[10px] font-semibold text-stone-400 uppercase font-mono flex items-center pr-1">Prompts:</span>
          {[
            { text: "Analyze today's sleep & workout metrics compliance and formulate schedule", label: "Vitality Review" },
            { text: "Verify halal portfolio compliance and review ledger logs", label: "Wealth Audit" },
            { text: "Audit today's Salah consistency & construct next action CQRS", label: "Salah Audit" }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (!sendingMessage) {
                  onSendMessage(item.text, activeAgent);
                }
              }}
              disabled={sendingMessage}
              className="text-[10px] bg-white border border-stone-200 px-2.5 py-1 rounded-full hover:border-stone-400 hover:bg-stone-50 transition text-stone-600 font-medium font-mono"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSubmit} className="p-4 bg-stone-50 border-t border-stone-200 flex items-center space-x-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={sendingMessage}
            placeholder={`Ask ${getAgentLabel(activeAgent)} to optimize lifestyle aggregates...`}
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 shadow-sm"
          />
          <button
            type="submit"
            disabled={sendingMessage || !inputValue.trim()}
            className="bg-stone-900 text-white rounded-xl p-2.5 hover:bg-stone-800 transition shadow disabled:opacity-50"
          >
            {sendingMessage ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>

      </div>

      {/* Right Col: Strategic Context & Inpector (Col 4) */}
      <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
        
        {/* Agent Select Panel */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3 shrink-0">
          <h4 className="text-[10px] font-bold text-stone-400 uppercase font-mono tracking-wider">Strategic Sub-Agent Swapper</h4>
          <div className="space-y-1.5 font-mono text-[10px]">
            {[
              { id: "gabriel_cos", label: "Gabriel (Chief of Staff)", icon: Sparkles },
              { id: "deen_auditor", label: "Deen Auditor", icon: Shield },
              { id: "wealth_architect", label: "Wealth Architect", icon: Layers },
              { id: "health_sentinel", label: "Health Sentinel", icon: Info }
            ].map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setActiveAgent(agent.id);
                  onAddSignalREvent(`Gabriel router routed focus context to: ${agent.id}`);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition border flex items-center space-x-2 ${
                  activeAgent === agent.id
                    ? "bg-stone-900 border-stone-950 text-white font-bold"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <agent.icon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{agent.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-500 leading-normal pt-1.5 font-serif italic">
            {getAgentDescription(activeAgent)}
          </p>
        </div>

        {/* Context inspector block */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold text-stone-400 uppercase font-mono tracking-wider mb-3">Grounding Context Viewer</h4>
            
            <div className="space-y-3 text-[10.5px] leading-relaxed">
              {/* Goal */}
              <div className="flex items-start space-x-2">
                <Bookmark className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 font-mono text-[9px] block uppercase">Referenced Goal</strong>
                  <span className="text-stone-500 font-sans block">{userProfile.currentGoal}</span>
                </div>
              </div>

              {/* Memory */}
              <div className="flex items-start space-x-2 pt-2 border-t border-stone-100">
                <BookOpen className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 font-mono text-[9px] block uppercase">Referenced Memories (Qdrant)</strong>
                  <span className="text-stone-500 font-serif block italic">
                    "{activeMsg?.referencedMemories?.[0] || "Sleep rebound rule, Shariah venture filter criteria."}"
                  </span>
                </div>
              </div>

              {/* Policy */}
              <div className="flex items-start space-x-2 pt-2 border-t border-stone-100">
                <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 font-mono text-[9px] block uppercase">Referenced Invariant Policies</strong>
                  <span className="text-stone-500 font-sans block">{activeMsg?.referencedPolicies?.[0] || "Prayer window override, Halal capital preservation limit."}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 font-mono text-[9px] text-stone-400 text-center uppercase tracking-wider mt-4">
            Grounding Sync: 100% Verified
          </div>
        </div>

      </div>

    </div>
  );
}
