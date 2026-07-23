import React, { useEffect, useRef, useState } from "react";
import { Archive, Download, Edit3, MessageSquarePlus, Pin, RefreshCw, Search, Send, Trash } from "lucide-react";
import { ChatMessage, UserProfile } from "../types";
import MarkdownMessage from "./MarkdownMessage";
import AiActionCenter from "./AiActionCenter";

interface Props {
  userProfile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string, activeAgent: string) => void;
  sendingMessage: boolean;
  onClearHistory: () => void;
  onAddSignalREvent: (msg: string) => void;
  conversations: any[];
  activeConversationId: string | null;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string) => void;
  onArchiveConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export default function AiChatView({ userProfile, messages, onSendMessage, sendingMessage, onClearHistory, onAddSignalREvent, conversations, activeConversationId, onCreateConversation, onSelectConversation, onRenameConversation, onArchiveConversation, onDeleteConversation }: Props) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [lifeContext, setLifeContext] = useState<any>(null);
  const [integration, setIntegration] = useState<any>(null);
  const [mode,setMode]=useState("today"),[folder,setFolder]=useState("all");
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sendingMessage]);
  useEffect(() => { void fetch("/api/ai/status").then((response) => response.ok ? response.json() : null).then(setAiStatus).catch(() => setAiStatus(null)); }, []);
  useEffect(() => { void fetch("/api/ai/life-context").then((response) => response.ok ? response.json() : null).then(setLifeContext).catch(() => setLifeContext(null)); }, [messages]);
  useEffect(() => { void fetch("/api/ai/integration-briefing").then((response) => response.ok ? response.json() : null).then(setIntegration).catch(() => setIntegration(null)); }, [messages]);

  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() || sendingMessage) return; onSendMessage(input, `lifeos_assistant:${mode}`); setInput(""); };
  const exportChat = () => {
    const body = messages
      .map((m) => `## ${m.role === "user" ? userProfile.name : "LifeOS Assistant"}\n\n${m.content}`)
      .join("\n\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/markdown" }));
    const a = document.createElement("a"); a.href = url; a.download = `LifeOS-chat-${new Date().toISOString().slice(0, 10)}.md`; a.click(); URL.revokeObjectURL(url);
    onAddSignalREvent("Chat exported locally.");
  };

  const folders=["all",...new Set(conversations.map(item=>item.folder||"General"))],filtered = conversations.filter(item => (folder==="all"||(item.folder||"General")===folder)&&item.title.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(Boolean(b.pinned))-Number(Boolean(a.pinned))||String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const togglePin=async(item:any)=>{await fetch(`/api/ai/conversations/${item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({pinned:!item.pinned})});onAddSignalREvent(item.pinned?"Conversation unpinned.":"Conversation pinned.");onSelectConversation(item.id)};
  return <div className="max-w-6xl mx-auto bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden grid md:grid-cols-[230px_minmax(0,1fr)] min-h-[650px]">
    <aside className="border-r bg-stone-50 p-3 hidden md:flex flex-col gap-3"><button onClick={onCreateConversation} className="bg-stone-900 text-white rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-2"><MessageSquarePlus className="h-4 w-4"/>New conversation</button><label className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400"/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search chats" className="w-full border rounded-lg pl-8 pr-2 py-2 text-xs bg-white"/></label><select value={folder} onChange={event=>setFolder(event.target.value)} className="rounded-lg border bg-white px-2 py-2 text-xs">{folders.map(value=><option key={value} value={value}>{value==="all"?"All folders":value}</option>)}</select><div className="overflow-y-auto space-y-1 flex-1">{filtered.map(item=><div key={item.id} className={`group rounded-lg p-2 cursor-pointer ${activeConversationId===item.id?"bg-purple-100 text-purple-950":"hover:bg-white"}`} onClick={()=>onSelectConversation(item.id)}><p className="flex items-center gap-1 text-xs font-medium truncate">{item.pinned&&<Pin className="h-3 w-3 fill-current"/>}{item.title}</p><div className="flex items-center justify-between mt-1"><span className="text-[9px] text-stone-400">{item.messageCount} · {item.folder||"General"}</span><span className="hidden group-hover:flex gap-1"><button onClick={event=>{event.stopPropagation();void togglePin(item)}} title={item.pinned?"Unpin":"Pin"}><Pin className="h-3 w-3"/></button><button onClick={event=>{event.stopPropagation();onRenameConversation(item.id);}} title="Rename"><Edit3 className="h-3 w-3"/></button><button onClick={event=>{event.stopPropagation();onArchiveConversation(item.id);}} title="Archive"><Archive className="h-3 w-3"/></button><button onClick={event=>{event.stopPropagation();onDeleteConversation(item.id);}} title="Delete" className="text-red-600"><Trash className="h-3 w-3"/></button></span></div></div>)}</div><p className="text-[9px] leading-4 text-stone-400">Chats and their source provenance are saved locally.</p></aside>
    <div className="min-w-0 flex flex-col">
    <div className="md:hidden p-3 border-b bg-stone-50 flex gap-2"><select value={activeConversationId || ""} onChange={event=>onSelectConversation(event.target.value)} className="border rounded-lg px-2 py-2 text-xs flex-1 min-w-0"><option value="" disabled>Select conversation</option>{conversations.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><button onClick={onCreateConversation} className="bg-stone-900 text-white rounded-lg px-3"><MessageSquarePlus className="h-4 w-4"/></button></div>
    <header className="p-5 border-b border-stone-200 flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">LifeOS Command Centre</h2>{aiStatus && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${aiStatus.connected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{aiStatus.connected ? `${aiStatus.provider} · ${aiStatus.model}` : "Local capability only"}</span>}{integration&&<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-800">{integration.coverage.connected}/{integration.coverage.total} domains grounded</span>}</div><p className="text-xs text-stone-500 mt-1">Current records override older memory. Every proposed write waits for your approval.</p>{lifeContext&&<div className="flex flex-wrap gap-1.5 mt-2 text-[9px] uppercase"><span className="bg-blue-50 text-blue-700 rounded px-2 py-1">{lifeContext.goals.active} goals</span><span className="bg-purple-50 text-purple-700 rounded px-2 py-1">{lifeContext.tasks.open} open tasks</span><span className="bg-emerald-50 text-emerald-700 rounded px-2 py-1">{lifeContext.finance.verification.pendingReview} finance pending</span><span className="bg-stone-100 rounded px-2 py-1">{lifeContext.memory.userConfirmed} confirmed memories</span></div>}{integration&&<details className="mt-2"><summary className="cursor-pointer text-[10px] font-medium text-stone-600">View AI sources and attention ({integration.attention.reduce((sum:number,item:any)=>sum+item.count,0)})</summary><div className="mt-2 flex flex-wrap gap-1.5">{integration.coverage.domains.map((domain:any)=><span key={domain.id} title={`${domain.authoritativeSource} · ${domain.recordCount} records · ${domain.asOf||"no dated record"}`} className={`rounded px-2 py-1 text-[9px] ${domain.availableToAi?"bg-emerald-50 text-emerald-800":"bg-stone-100 text-stone-500"}`}>{domain.label}: {domain.recordCount}</span>)}</div></details>}</div><div className="flex gap-2"><button onClick={exportChat} className="p-2 border rounded-lg" title="Export"><Download className="h-4 w-4"/></button><button onClick={onClearHistory} className="p-2 border rounded-lg" title="New conversation"><MessageSquarePlus className="h-4 w-4"/></button></div></header>
    <div className="flex gap-1 overflow-x-auto border-b bg-stone-50 px-4 py-2" aria-label="Assistant mode">{[["today","Today"],["finance","Finance"],["debt","Debt Coach"],["goals","Goals"],["work","Work"],["career","Career"],["business","Business"],["system","System Help"]].map(([id,label])=><button key={id} onClick={()=>setMode(id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${mode===id?"bg-stone-900 text-white":"border bg-white"}`}>{label}</button>)}</div><AiActionCenter onActivity={onAddSignalREvent}/>
    <main className="p-6 space-y-4 min-h-[420px] max-h-[560px] overflow-y-auto">{messages.map((m) => <div key={m.id} className={`rounded-xl p-4 text-sm ${m.role === "user" ? "bg-stone-900 text-white ml-10" : "bg-stone-50 border border-stone-200 mr-10"}`}><div className="text-[9px] uppercase tracking-wider opacity-60 mb-2">{m.role === "user" ? userProfile.name : "LifeOS Assistant"}</div><MarkdownMessage content={m.content} inverted={m.role === "user"} /></div>)}{sendingMessage && <div className="text-xs text-stone-500">Waiting for assistant…</div>}<div ref={bottom}/></main>
    <div className="px-6 py-3 border-t bg-stone-50 flex flex-wrap gap-2">{["What needs my attention now?", "Use my current records to recommend the next action", "What information is missing or stale?"].map((p) => <button key={p} onClick={() => onSendMessage(p, `lifeos_assistant:${mode}`)} disabled={sendingMessage} className="text-xs bg-white border rounded-full px-3 py-1.5 text-left">{p}</button>)}</div>
    <form onSubmit={submit} className="p-4 border-t flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask across finance, work, goals, tasks, routines and memory" className="flex-1 border rounded-xl px-4 py-3 text-sm"/><button disabled={sendingMessage || !input.trim()} className="bg-stone-900 text-white rounded-xl p-3 disabled:opacity-40">{sendingMessage ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</button></form>
    </div>
  </div>;
}
