import React, { useEffect, useState } from "react";
import { Bot, ChevronDown, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "../types";
import MarkdownMessage from "./MarkdownMessage";

const workspaceNames: Record<string, string> = { dashboard: "Dashboard", executive_planner: "Goals & Tasks", planner: "Daily", operations: "Finance", work: "Work & Business", chat: "Assistant", memory: "Memory", vault: "Connections", settings: "Preferences" };

export default function SystemCopilot({ activeTab, messages, sending, onSend, onOpenChat }: { activeTab: string; messages: ChatMessage[]; sending: boolean; onSend: (text: string, agent: string) => void; onOpenChat: () => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [context, setContext] = useState<any>(null);
  useEffect(() => { void fetch("/api/ai/status").then((response) => response.ok ? response.json() : null).then(setStatus).catch(() => setStatus(null)); }, [open]);
  useEffect(() => { if (!open) return; void fetch(`/api/ai/context-map?workspace=${encodeURIComponent(activeTab)}`).then((response) => response.ok ? response.json() : null).then(setContext).catch(() => setContext(null)); }, [open, activeTab, messages.length]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!input.trim() || sending) return; onSend(input.trim(), `lifeos_copilot:${activeTab}`); setInput(""); };
  const recent = messages.slice(-4);
  return <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">
    {open && <div className="w-[min(92vw,420px)] bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden">
      <header className="bg-stone-900 text-white p-4 flex justify-between gap-3"><div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-400"/><strong>LifeOS Copilot</strong></div><p className="text-[11px] text-stone-400 mt-1">Context: {workspaceNames[activeTab] || activeTab} · {status?.connected ? `${status.provider}` : "deterministic local guidance"}</p>{context?.domains?.length>0&&<p className="mt-1 text-[9px] text-stone-500">Using {context.domains.map((domain:any)=>domain.label).join(" · ")} · as of {new Date(context.generatedAt).toLocaleString()}</p>}</div><button onClick={() => setOpen(false)} aria-label="Close copilot"><ChevronDown className="h-5 w-5"/></button></header>
      <div className="p-4 max-h-72 overflow-y-auto space-y-3">{recent.map((message) => <div key={message.id} className={`text-sm rounded-xl p-3 ${message.role === "user" ? "bg-stone-900 text-white ml-8" : "bg-stone-50 border mr-5"}`}><MarkdownMessage content={message.content} inverted={message.role === "user"} /></div>)}{sending && <p className="text-xs text-stone-500">NVIDIA is checking your LifeOS records…</p>}</div>
      <div className="px-4 flex flex-wrap gap-2">{(context?.prompts?.slice(0,3)||["What needs my attention here?", "Explain this page using my saved records", "What is my safest next action?"]).map((prompt:string) => <button key={prompt} onClick={() => onSend(prompt, `lifeos_copilot:${activeTab}`)} disabled={sending} className="text-[10px] border rounded-full px-2 py-1 text-left">{prompt}</button>)}</div>
      <form onSubmit={submit} className="p-4 flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask about ${workspaceNames[activeTab] || "this screen"}`} className="border rounded-xl px-3 py-2 flex-1 text-sm"/><button disabled={sending || !input.trim()} className="bg-emerald-600 text-white rounded-xl p-2.5 disabled:opacity-40"><Send className="h-4 w-4"/></button></form>
      <button onClick={onOpenChat} className="w-full border-t py-2 text-xs text-stone-600 hover:bg-stone-50">Open full conversation</button>
    </div>}
    <button onClick={() => setOpen((value) => !value)} className="bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-xl px-4 py-3 flex items-center gap-2"><Bot className="h-5 w-5 text-emerald-400"/><span className="text-xs font-bold">Ask LifeOS</span>{status?.connected && <span className="w-2 h-2 rounded-full bg-emerald-400"/>}</button>
  </div>;
}
