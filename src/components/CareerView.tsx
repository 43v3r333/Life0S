import React, { useEffect, useState } from "react";
import { Award, BriefcaseBusiness, CheckCircle2, Download, ExternalLink, FileText, GraduationCap, LoaderCircle, Plus, Sparkles } from "lucide-react";
import { Badge, EmptyState, MetricCard, Notice } from "../ui/primitives";
import { notifyLifeOs } from "../ui/feedback";

const input = "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm";

export default function CareerView({ onNavigate, onActivity }: { onNavigate: (tab: string) => void; onActivity: (message: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState("");
  const [direction, setDirection] = useState("");
  const load = async () => {
    const response = await fetch("/api/personal/career");
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || "Career profile could not be loaded.");
    setData(result);
    setDirection(result.profile.targetDirection || "");
  };
  useEffect(() => { void load(); }, []);

  const run = async (label: string, url: string, method = "POST", body?: any) => {
    setBusy(label);
    try {
      const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Career update failed.");
      const message = label === "tasks" || label === "evidence-tasks" ? `${result.created.length} career-development tasks added.` : label === "github-refresh" ? `${result.projects.length} GitHub repositories audited.` : "Career direction saved.";
      notifyLifeOs(message, "success");
      onActivity(message);
      await load();
    } catch (error: any) {
      notifyLifeOs(error.message, "danger");
    } finally { setBusy(""); }
  };

  if (!data) return <div className="life-state"><LoaderCircle className="animate-spin"/><span>Loading verified career records…</span></div>;
  const { profile, readiness, documents, careerTasks, githubEvidence = [], githubSummary = {} } = data;
  return <div className="space-y-4">
    <Notice tone="authoritative" title="Verified career profile">
      Résumé facts are saved as authoritative records. AI receives a compact career snapshot only when your question is career-related.
    </Notice>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <MetricCard label="Career readiness" value={`${readiness.score}%`} detail="Evidence and execution"/>
      <MetricCard label="GitHub repositories" value={githubSummary.total || githubEvidence.length} detail={`${githubSummary.verifiedBuilds || 0} verified builds`}/>
      <MetricCard label="Career tasks" value={readiness.careerTasks} detail={`${readiness.completedCareerTasks} completed`}/>
      <MetricCard label="Qualifications" value={profile.education.length} detail="Education record"/>
    </div>
    <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="life-eyebrow">Personal career identity</span><h2 className="mt-1 text-xl font-semibold">{profile.name}</h2><p className="mt-1 text-sm text-stone-600">{profile.headline}</p><p className="mt-1 text-xs text-stone-400">{profile.location}</p></div><Badge tone="authoritative">Résumé verified</Badge></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{[profile.currentRole, profile.founderRole].map((role: any) => <article key={role.organization} className="rounded-xl bg-stone-50 p-3"><BriefcaseBusiness className="h-4 w-4 text-blue-700"/><strong className="mt-2 block text-sm">{role.title}</strong><p className="mt-1 text-xs text-stone-600">{role.organization}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-stone-400">{role.status}</p></article>)}</div>
        <div className="mt-4 flex flex-wrap gap-2">{profile.links.map((link: any) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="life-button-secondary inline-flex items-center gap-2"><ExternalLink className="h-3.5 w-3.5"/>{link.label}</a>)}{documents.map((document: any) => <a key={document.id} href="/api/personal/career/resume" className="life-button-secondary inline-flex items-center gap-2"><Download className="h-3.5 w-3.5"/>{document.label}</a>)}</div>
      </section>
      <form onSubmit={event => { event.preventDefault(); void run("direction", "/api/personal/career", "PATCH", { targetDirection: direction }); }} className="rounded-2xl border bg-white p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-violet-700"/>Career direction</h3><p className="mt-1 text-xs leading-5 text-stone-500">This guides career planning and AI recommendations. It does not change the verified résumé.</p>
        <textarea className={`${input} mt-4 min-h-28`} value={direction} onChange={event => setDirection(event.target.value)}/>
        <div className="mt-3 flex flex-wrap gap-2"><button disabled={busy === "direction"} className="life-button-primary">{busy === "direction" ? "Saving…" : "Save direction"}</button><button type="button" onClick={() => onNavigate("chat")} className="life-button-secondary">Ask career coach</button></div>
      </form>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-2xl border bg-white p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><GraduationCap className="h-4 w-4 text-blue-700"/>Education & certification</h3><div className="mt-3 space-y-2">{profile.education.map((item: any) => <div key={item.qualification} className="border-b pb-2 text-xs last:border-0"><strong>{item.qualification}</strong><p className="mt-1 text-stone-500">{[item.institution, item.period, item.status].filter(Boolean).join(" · ")}</p></div>)}</div><details className="mt-3 rounded-lg bg-stone-50 p-3"><summary className="cursor-pointer text-xs font-semibold">{profile.certifications.length} certifications</summary><ul className="mt-2 space-y-1">{profile.certifications.map((item: string) => <li key={item} className="text-xs text-stone-600">• {item}</li>)}</ul></details></section>
      <section className="rounded-2xl border bg-white p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4 text-amber-700"/>Evidence & strengths</h3><div className="mt-3 space-y-2">{profile.strengths.map((item: string) => <p key={item} className="flex gap-2 text-xs leading-5 text-stone-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"/>{item}</p>)}</div><details className="mt-3 rounded-lg bg-stone-50 p-3"><summary className="cursor-pointer text-xs font-semibold">Skills by evidence area</summary>{Object.entries(profile.skillGroups).map(([group, skills]: any) => <div key={group} className="mt-3"><strong className="text-[10px] uppercase text-stone-500">{group}</strong><div className="mt-1 flex flex-wrap gap-1">{skills.map((skill: string) => <Badge key={skill}>{skill}</Badge>)}</div></div>)}</details></section>
      <section className="rounded-2xl border bg-white p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-violet-700"/>Next career moves</h3>{readiness.gaps.length ? <div className="mt-3 space-y-2">{readiness.gaps.map((gap: string) => <div key={gap} className="rounded-lg bg-amber-50 p-3 text-xs text-amber-950">{gap}</div>)}</div> : <EmptyState title="Career basics covered" description="Continue completing saved career tasks."/>}<button disabled={busy === "tasks"} onClick={() => void run("tasks", "/api/personal/career/task-pack")} className="life-button-primary mt-4 w-full"><Plus className="mr-1 inline h-3.5 w-3.5"/>{busy === "tasks" ? "Adding…" : "Add recommended task pack"}</button></section>
    </div>
    <section className="rounded-2xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">GitHub proof audit</h3><p className="mt-1 text-xs text-stone-500">Code and README claims are not proof. Projects remain concepts or prototypes until repeatable, tested evidence is recorded.</p></div><div className="flex gap-2"><button disabled={busy === "github-refresh"} onClick={() => void run("github-refresh", "/api/personal/career/github-evidence/refresh")} className="life-button-secondary">{busy === "github-refresh" ? "Checking…" : "Refresh GitHub"}</button><button disabled={busy === "evidence-tasks"} onClick={() => void run("evidence-tasks", "/api/personal/career/github-evidence/task-pack")} className="life-button-primary">{busy === "evidence-tasks" ? "Adding…" : "Add proof task pack"}</button></div></div>
      <div className="mt-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-950"><strong>Recommended sequence:</strong> finish and prove <strong>{githubSummary.recommendedFlagship || "Life0S"}</strong> first, then build one narrow <strong>{githubSummary.nextDomainProject || "43v3rMES"}</strong> case study. Keep the other repositories secondary until the flagship has demonstrable evidence.</div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">{githubEvidence.map((project: any) => {
        const verified = Object.values(project.verifiedEvidence || {}).filter(Boolean).length;
        return <article key={project.repo} className="rounded-xl border p-3">
          <div className="flex items-start justify-between gap-3"><div><a href={project.url} target="_blank" rel="noreferrer" className="text-sm font-semibold hover:underline">{project.repo}<ExternalLink className="ml-1 inline h-3 w-3"/></a><p className="mt-1 text-xs text-stone-500">{project.description}</p></div><Badge tone={project.maturity === "concept" ? "warning" : ["verified-build", "portfolio-ready", "outcome-backed"].includes(project.maturity) ? "success" : "neutral"}>{String(project.maturity).replaceAll("-", " ")}</Badge></div>
          <div className="mt-3 flex items-end justify-between gap-3"><div className="flex flex-wrap gap-1">{project.publicSignals?.hasReadme && <Badge>README</Badge>}{project.publicSignals?.repeatableSetup && <Badge>setup files</Badge>}{project.publicSignals?.hasTests && <Badge>tests present</Badge>}{project.publicSignals?.hasCi && <Badge>CI present</Badge>}{project.publicSignals?.hasRelease && <Badge tone="success">release</Badge>}{project.publicSignals?.hasLiveDemo && <Badge tone="success">live demo</Badge>}</div><strong className="text-lg">{project.evidenceScore}%</strong></div>
          <p className="mt-2 text-[11px] leading-5 text-stone-500">{project.auditStatus}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">{verified}/5 verified evidence types</p>
        </article>;
      })}</div>
      {careerTasks.length > 0 && <p className="mt-3 text-xs text-stone-500">{careerTasks.length} linked career task{careerTasks.length === 1 ? "" : "s"} are tracked in Plan.</p>}
    </section>
  </div>;
}
