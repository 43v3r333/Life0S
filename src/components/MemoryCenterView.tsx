import React, { useEffect, useMemo, useState } from "react";
import { Archive, Brain, CheckCircle2, Clock3, Edit3, History, Plus, RefreshCw, Search, ShieldCheck, Undo2, X } from "lucide-react";
import { PageHeader, SegmentedTabs } from "../ui/primitives";
import { readSection, updateSection } from "../ui/navigation";
import { confirmLifeOs, promptLifeOs } from "../ui/feedback";

type Memory = {
  id: string; content: string; category: string; memoryType: string; verificationStatus: string;
  lifecycleStatus: string; confidence: number; sourceType?: string; validFrom?: string;
  expiresAt?: string | null; supersededBy?: string | null; createdAt: string; updatedAt: string;
  freshness?: string; ageDays?: number; whyRemembered?: string; linkedEntity?: { type:string; name:string } | null;
};
type Candidate = { id: string; content: string; category: string; memoryType: string; confidence: number; reason: string; createdAt: string; possibleConflict?: { memoryId: string; content: string; overlap: number } | null };

const label = (value?: string) => String(value || "unknown").replaceAll("-", " ");
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "No expiry";

export default function MemoryCenterView({ onActivity }: { onActivity: (message: string) => void }) {
  const [data, setData] = useState<{ memories: Memory[]; candidates: Candidate[]; summary: Record<string, number> } | null>(null);
  const [tab, setTab] = useState<"active" | "review" | "history">("active");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ content: "", category: "preference", expiresAt: "" });
  const [quality, setQuality] = useState<any>(null);
  const [forgetTopic, setForgetTopic] = useState("");
  const [decisions, setDecisions] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const sections=[{id:"coverage",label:"Coverage"},{id:"confirmed",label:"Confirmed"},{id:"review",label:"Review"},{id:"conflicts",label:"Conflicts"},{id:"history",label:"History"},{id:"privacy",label:"Privacy"}];
  const [section,setSection]=useState(()=>readSection("section",sections.map(item=>item.id),"coverage"));

  const load = async () => {
    const response = await fetch("/api/ai/memories");
    if (!response.ok) throw new Error("Could not load AI memory.");
    setData(await response.json());
    const qualityResponse = await fetch("/api/ai/data-quality"); if (qualityResponse.ok) setQuality(await qualityResponse.json());
    const decisionResponse = await fetch("/api/ai/decisions"); if (decisionResponse.ok) setDecisions(await decisionResponse.json());
    const diagnosticResponse = await fetch("/api/ai/diagnostics"); if (diagnosticResponse.ok) setDiagnostics(await diagnosticResponse.json());
  };
  useEffect(() => { void load(); }, []);
  useEffect(()=>{updateSection("section",section);if(section==="history")setTab("history");else if(["review","conflicts"].includes(section))setTab("review");else setTab("active")},[section]);
  const syncSystem = async () => { setSyncing(true); try { const response = await fetch("/api/ai/memories/sync-system", { method: "POST" }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "System memory sync failed."); await load(); onActivity(`AI memory synchronized across ${result.totalDomains} LifeOS domains.`); } finally { setSyncing(false); } };

  const update = async (memory: Memory, changes: Partial<Memory>, activity: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/ai/memories/${memory.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: memory.content, category: memory.category, ...changes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Memory update failed.");
      await load(); onActivity(activity);
    } finally { setBusy(false); }
  };
  const decideCandidate = async (candidate: Candidate, decision: "approve" | "reject") => {
    setBusy(true);
    try {
      let content = candidate.content;
      if (decision === "approve") { const corrected = await promptLifeOs("Confirm or correct this memory", content); if (!corrected?.trim()) return; content = corrected.trim(); }
      let replaceMemoryId: string | undefined;
      if (decision === "approve" && candidate.possibleConflict && await confirmLifeOs(`This may conflict with an existing memory:\n\n${candidate.possibleConflict.content}\n\nReplace the older memory?`)) replaceMemoryId = candidate.possibleConflict.memoryId;
      const response = await fetch(`/api/ai/memory-candidates/${candidate.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, content, replaceMemoryId }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Decision failed.");
      await load(); onActivity(`${decision === "approve" ? "Approved" : "Rejected"} a conversation memory candidate.`);
    } finally { setBusy(false); }
  };

  const categories = useMemo(() => ["all", ...new Set((data?.memories || []).map(item => item.category))], [data]);
  const visible = useMemo(() => (data?.memories || []).filter(memory => {
    const inTab = section === "confirmed" ? memory.lifecycleStatus === "active" && memory.verificationStatus === "user-confirmed" : tab === "active" ? memory.lifecycleStatus === "active" : tab === "review" ? memory.lifecycleStatus === "active" && memory.verificationStatus !== "user-confirmed" : memory.lifecycleStatus !== "active";
    const matchesQuery = `${memory.content} ${memory.category} ${memory.memoryType}`.toLowerCase().includes(query.toLowerCase());
    return inTab && matchesQuery && (category === "all" || memory.category === category);
  }), [data, tab, section, query, category]);

  if (!data) return <div className="bg-white border rounded-2xl p-6 text-sm text-stone-500">Loading your AI memory centre…</div>;
  const stats = [
    ["Active", data.summary.active, Brain, "text-purple-700 bg-purple-50"],
    ["Needs review", data.summary.needsReview, Clock3, "text-amber-700 bg-amber-50"],
    ["Confirmed", data.summary.confirmed, ShieldCheck, "text-emerald-700 bg-emerald-50"],
    ["History", data.summary.superseded + data.summary.archived, History, "text-blue-700 bg-blue-50"]
  ] as const;

  return <div className="space-y-4">
    <PageHeader eyebrow="Controlled AI knowledge" title="Memory" description="Review what LifeOS can retrieve. Current records always take priority over older memory." actions={<><button disabled={syncing} onClick={() => void syncSystem()} className="life-button-secondary flex items-center gap-2"><RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}/>{syncing ? "Syncing…" : "Sync context"}</button><button onClick={() => setAdding(true)} className="life-button-primary flex items-center gap-2"><Plus className="h-4 w-4"/>Add memory</button></>}/>
    <SegmentedTabs label="Memory sections" items={sections} value={section} onChange={setSection}/>

    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map(([name, value, Icon, tone]) => <div key={name} className="bg-white border rounded-xl p-3 flex items-center gap-3"><span className={`h-9 w-9 rounded-lg flex items-center justify-center ${tone}`}><Icon className="h-4 w-4"/></span><div><span className="text-[10px] uppercase text-stone-500">{name}</span><strong className="block text-lg leading-5">{value}</strong></div></div>)}</section>

    {quality && <section className="bg-white border rounded-2xl p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Data quality · {quality.score}%</h3><p className="text-xs text-stone-500 mt-1">Missing or stale records that reduce AI reliability.</p></div><span className={`text-xs font-bold rounded-full px-3 py-1 ${quality.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{quality.findings.length} findings</span></div>{quality.findings.length > 0 && <details className="mt-3"><summary className="text-xs text-purple-700 cursor-pointer">Review findings</summary><div className="grid md:grid-cols-2 gap-2 mt-2">{quality.findings.map((item:any)=><div key={item.id} className="border rounded-lg p-3"><strong className="text-xs">{item.title}</strong><p className="text-[10px] text-stone-500 mt-1">{item.area} · {item.action}</p></div>)}</div></details>}</section>}

    {diagnostics && <details className="bg-white border rounded-2xl p-4"><summary className="text-sm font-semibold cursor-pointer">AI diagnostics · {diagnostics.provider.provider}</summary><div className="mt-3 space-y-3"><div className="flex flex-wrap gap-2 text-[10px]"><span className={`rounded-full px-2 py-1 ${diagnostics.provider.connected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{diagnostics.provider.connected ? "Provider connected" : "Deterministic fallback"}</span><span className="bg-stone-100 rounded-full px-2 py-1">Current records take priority</span><span className="bg-stone-100 rounded-full px-2 py-1">Writes require approval</span><span className="bg-stone-100 rounded-full px-2 py-1">Raw documents excluded</span></div><div className="grid grid-cols-2 lg:grid-cols-6 gap-2">{diagnostics.coverage.map((item:any)=><div key={item.domain} className={`rounded-lg border p-2 ${item.covered ? "bg-emerald-50/50" : "bg-amber-50/60"}`}><span className="block text-[10px] uppercase text-stone-500">{item.label}</span><strong className="text-sm">{item.recordCount + item.memoryCount}</strong><span className="block text-[9px] text-stone-500">{item.confirmedCount} confirmed</span></div>)}</div><p className="text-[10px] text-stone-500">{diagnostics.memory.excludedStale} stale linked memories excluded · {diagnostics.memory.conflicts} confirmed conflicts · {diagnostics.pendingActions.length} pending AI actions · as of {new Date(diagnostics.generatedAt).toLocaleString("en-ZA")}</p>{diagnostics.conflicts.length > 0 && <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs text-amber-900">Review {diagnostics.conflicts.length} confirmed memor{diagnostics.conflicts.length === 1 ? "y" : "ies"} that conflict with newer authoritative records.</div>}</div></details>}

    <details className="bg-white border rounded-2xl p-4"><summary className="text-sm font-semibold cursor-pointer">Privacy and topic deletion</summary><p className="text-xs text-stone-500 mt-2">Archive active memories, reject pending suggestions, and delete saved conversations containing a topic. Audit history records only a one-way topic fingerprint.</p><form onSubmit={async event=>{event.preventDefault();if(forgetTopic.trim().length<3||!await confirmLifeOs(`Forget everything connected to “${forgetTopic}”? This deletes matching conversations.`))return;setBusy(true);try{const response=await fetch("/api/ai/privacy/forget-topic",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:forgetTopic,confirm:true})});const result=await response.json();if(!response.ok)throw new Error(result.error);setForgetTopic("");await load();onActivity(`Topic forgotten: ${result.memoriesArchived} memories archived and ${result.conversationsDeleted} conversations deleted.`);}finally{setBusy(false);}}} className="flex gap-2 mt-3"><input value={forgetTopic} onChange={event=>setForgetTopic(event.target.value)} placeholder="Topic to forget" className="border rounded-lg px-3 py-2 text-sm flex-1"/><button disabled={busy||forgetTopic.trim().length<3} className="border border-red-300 text-red-700 rounded-lg px-3 text-xs font-bold disabled:opacity-40">Forget topic</button></form></details>

    {decisions.length > 0 && <details className="bg-white border rounded-2xl p-4"><summary className="text-sm font-semibold cursor-pointer">Recorded decisions · {decisions.length}</summary><div className="space-y-2 mt-3">{decisions.map(decision=><div key={decision.id} className="border rounded-lg p-3 flex justify-between gap-3"><div><p className="text-xs">{decision.content}</p><span className="text-[9px] uppercase text-stone-400">{label(decision.status)} · {date(decision.createdAt)}</span></div>{!decision.taskId&&<button disabled={busy} onClick={async()=>{const dueDate=await promptLifeOs("Optional task due date (YYYY-MM-DD)","");const response=await fetch(`/api/ai/decisions/${decision.id}/create-task`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dueDate:dueDate||""})});if(response.ok){await load();onActivity("Created a task from an approved decision.");}}} className="border border-purple-200 text-purple-700 rounded-lg px-3 text-[10px] shrink-0">Create task</button>}</div>)}</div></details>}

    {adding && <form onSubmit={async event => { event.preventDefault(); if (!draft.content.trim()) return; setBusy(true); try { const response = await fetch("/api/ai/memories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, expiresAt: draft.expiresAt || null }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setDraft({ content: "", category: "preference", expiresAt: "" }); setAdding(false); await load(); onActivity("Added a user-confirmed AI memory."); } finally { setBusy(false); } }} className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
      <div className="flex justify-between"><h3 className="font-semibold text-sm">Add a fact or preference</h3><button type="button" onClick={() => setAdding(false)}><X className="h-4 w-4"/></button></div>
      <textarea required value={draft.content} onChange={event => setDraft(value => ({ ...value, content: event.target.value }))} rows={3} placeholder="What should LifeOS remember?" className="w-full border rounded-xl px-3 py-2 text-sm bg-white"/>
      <div className="grid sm:grid-cols-2 gap-3"><input value={draft.category} onChange={event => setDraft(value => ({ ...value, category: event.target.value }))} placeholder="Category" className="border rounded-lg px-3 py-2 text-sm"/><label className="text-xs text-stone-500">Optional expiry<input type="date" value={draft.expiresAt} onChange={event => setDraft(value => ({ ...value, expiresAt: event.target.value }))} className="block w-full border rounded-lg px-3 py-2 mt-1 text-sm text-stone-800"/></label></div>
      <button disabled={busy} className="bg-purple-700 text-white rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50">Save confirmed memory</button>
    </form>}

    <section className="bg-white border rounded-2xl overflow-hidden">
      <div className="p-4 border-b flex flex-wrap gap-3 justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{section === "confirmed" ? "User-confirmed memories" : section === "review" ? "Memories awaiting review" : section === "conflicts" ? "Potential conflicts" : section === "history" ? "Archived and superseded history" : "Active AI knowledge"}</div>
        <div className="flex gap-2 flex-1 sm:flex-none"><label className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search memory" className="border rounded-lg pl-8 pr-3 py-2 text-xs w-full sm:w-56"/></label><select value={category} onChange={event => setCategory(event.target.value)} className="border rounded-lg px-2 text-xs max-w-36">{categories.map(value => <option key={value} value={value}>{label(value)}</option>)}</select><button onClick={() => void load()} title="Refresh" className="border rounded-lg w-9 flex justify-center items-center"><RefreshCw className="h-3.5 w-3.5"/></button></div>
      </div>
      {tab === "review" && data.candidates?.length > 0 && <div className="border-b bg-amber-50/60 p-4"><div className="flex items-center gap-2 mb-3"><Clock3 className="h-4 w-4 text-amber-700"/><h3 className="text-sm font-semibold">Learned from recent conversations</h3><span className="text-[10px] bg-amber-200 text-amber-900 rounded-full px-2 py-0.5">{data.candidates.length}</span></div><div className="space-y-2">{data.candidates.map(candidate => <div key={candidate.id} className="bg-white border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-3"><div><p className="text-sm leading-5">{candidate.content}</p><p className="text-[10px] text-stone-500 mt-1">{label(candidate.memoryType)} · {Math.round(candidate.confidence * 100)}% extraction confidence · {candidate.reason}</p>{candidate.possibleConflict && <p className="text-[10px] text-red-700 mt-2 bg-red-50 rounded p-2">Possible conflict with: “{candidate.possibleConflict.content}”</p>}</div><div className="flex gap-1 shrink-0"><button disabled={busy} onClick={() => decideCandidate(candidate, "approve")} title="Review and approve" className="h-8 px-2 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5"/>Approve</button><button disabled={busy} onClick={() => decideCandidate(candidate, "reject")} title="Reject" className="h-8 w-8 border border-red-200 text-red-700 rounded-lg flex items-center justify-center"><X className="h-3.5 w-3.5"/></button></div></div>)}</div></div>}
      <div className="max-h-[560px] overflow-y-auto divide-y">{visible.length === 0 ? <p className="p-8 text-center text-sm text-stone-500">{tab === "review" && data.candidates?.length ? "No other memories need review." : "No memories match this view."}</p> : visible.map(memory => {
        const superseded = memory.lifecycleStatus === "superseded";
        return <article key={memory.id} className="p-4 hover:bg-stone-50/60">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap gap-1.5 mb-2"><span className="bg-stone-100 rounded px-2 py-0.5 text-[9px] uppercase">{label(memory.category)}</span><span className={`rounded px-2 py-0.5 text-[9px] uppercase ${memory.verificationStatus === "user-confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{label(memory.verificationStatus)}</span><span className="bg-blue-50 text-blue-700 rounded px-2 py-0.5 text-[9px] uppercase">{label(memory.lifecycleStatus)}</span></div><p className="text-sm leading-6 text-stone-800">{memory.content}</p><p className="text-[10px] text-stone-400 mt-2">{label(memory.memoryType)} · {Math.round(Number(memory.confidence || 0) * 100)}% confidence · valid {date(memory.validFrom)} · {memory.expiresAt ? `expires ${date(memory.expiresAt)}` : "no expiry"}</p></div>
            <div className="flex gap-1 shrink-0">{memory.lifecycleStatus === "active" && <><button disabled={busy} title="Edit" onClick={async () => { const content = await promptLifeOs("Correct this memory", memory.content); if (content?.trim()) await update(memory, { content, verificationStatus: "user-confirmed", confidence: 1 }, "Corrected and confirmed an AI memory."); }} className="border rounded-lg h-8 w-8 flex items-center justify-center"><Edit3 className="h-3.5 w-3.5"/></button>{memory.verificationStatus !== "user-confirmed" && <button disabled={busy} title="Confirm" onClick={() => update(memory, { verificationStatus: "user-confirmed", confidence: 1 }, "Confirmed an AI memory.")} className="border border-emerald-200 text-emerald-700 rounded-lg h-8 w-8 flex items-center justify-center"><CheckCircle2 className="h-3.5 w-3.5"/></button>}<button disabled={busy} title="Archive" onClick={() => update(memory, { lifecycleStatus: "archived" }, "Archived an AI memory.")} className="border border-stone-200 text-stone-600 rounded-lg h-8 w-8 flex items-center justify-center"><Archive className="h-3.5 w-3.5"/></button></>}{memory.lifecycleStatus === "archived" && <button disabled={busy} title="Restore" onClick={() => update(memory, { lifecycleStatus: "active" }, "Restored an archived AI memory.")} className="border border-blue-200 text-blue-700 rounded-lg h-8 w-8 flex items-center justify-center"><Undo2 className="h-3.5 w-3.5"/></button>}</div>
          </div><div className="mt-2 rounded-lg bg-stone-50 p-2 text-[10px] text-stone-500"><strong className="text-stone-700">Why LifeOS remembers this:</strong> {memory.whyRemembered || `Evidence source: ${label(memory.sourceType)}`}<span className={`ml-2 rounded px-1.5 py-0.5 uppercase ${memory.freshness==="current"?"bg-emerald-100 text-emerald-700":memory.freshness==="aging"?"bg-amber-100 text-amber-700":"bg-stone-200"}`}>{memory.freshness||"unknown freshness"}</span>{memory.linkedEntity&&<span className="ml-2">Linked {label(memory.linkedEntity.type)}: {memory.linkedEntity.name}</span>}</div>{superseded && <p className="text-[10px] text-blue-700 mt-2">Retained for audit only. A newer memory replaced this record, so it cannot be restored directly.</p>}
        </article>;
      })}</div>
    </section>
  </div>;
}
