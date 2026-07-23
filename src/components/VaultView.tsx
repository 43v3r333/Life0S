import React, { useState, useEffect } from "react";
import { Key, ShieldAlert, Check, RefreshCw, Eye, EyeOff, Save, Database, Mail, Terminal } from "lucide-react";
import { SecretVault } from "../types";
import { PageHeader } from "../ui/primitives";
import GoogleWorkspaceView from "./GoogleWorkspaceView";

export default function VaultView() {
  const [vault, setVault] = useState<SecretVault>({
    nvidiaKey: "",
    openaiKey: "",
    geminiKey: "",
    anthropicKey: "",
    githubToken: "",
    microsoftToken: "",
    googleToken: "",
    googleClientId: "",
    googleClientSecret: "",
    googleRefreshToken: "",
    googleGrantedScopes: "",
    dbConnectionString: "",
    smtpConnectionString: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [googleStatus, setGoogleStatus] = useState<any>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const callbackUrl = googleStatus?.redirectUri || `${window.location.origin}/api/google/oauth/callback`;

  const fetchGoogleStatus = async () => { const response = await fetch("/api/google/status"); if (response.ok) setGoogleStatus(await response.json()); };

  // Fetch secrets from backend (server-side handles masking)
  const fetchSecrets = async () => {
    try {
      const res = await fetch("/api/vault");
      if (res.ok) {
        const data = await res.json();
        // The API intentionally returns presence booleans, never secret values.
        // Convert configured fields to a sentinel string that the form can render
        // and safely send back without overwriting the in-memory credential.
        setVault((current) => Object.fromEntries(Object.keys(current).map((key) => [key, data[key] === true ? "[Masked]" : ""])) as unknown as SecretVault);
      }
    } catch (err) {
      console.error("Could not fetch secrets", err);
    }
  };

  useEffect(() => {
    fetchSecrets();
    fetchGoogleStatus();
  }, []);

  const connectGoogle = async () => { setGoogleBusy(true);setError("");try{const response=await fetch("/api/google/oauth/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({redirectUri:callbackUrl,returnTo:window.location.origin})}),result=await response.json();if(!response.ok)throw new Error(result.message||"Google connection could not start.");window.location.assign(result.authorizationUrl)}catch(error:any){setError(error.message)}finally{setGoogleBusy(false)}};
  const syncGoogle = async () => { setGoogleBusy(true);setError("");try{const response=await fetch("/api/google/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),result=await response.json();if(!response.ok)throw new Error(result.message||"Google sync failed.");setGoogleStatus(result);setSuccess(true)}catch(error:any){setError(error.message)}finally{setGoogleBusy(false)}};
  const disconnectGoogle = async () => { setGoogleBusy(true);setError("");try{const response=await fetch("/api/google/disconnect",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});if(!response.ok)throw new Error("Google disconnect failed.");setGoogleStatus(await response.json());await fetchSecrets()}catch(error:any){setError(error.message)}finally{setGoogleBusy(false)}};
  const googleAction = async (url:string,method="POST",body:any={}) => { setGoogleBusy(true);setError("");try{const response=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),result=await response.json();if(!response.ok)throw new Error(result.message||"Google action failed.");setGoogleStatus(result);setSuccess(true)}catch(error:any){setError(error.message)}finally{setGoogleBusy(false)}};
  const today = new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Johannesburg",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/vault/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vault)
      });

      if (!res.ok) { const result = await res.json().catch(() => ({})); throw new Error(result.error || "Provider key validation failed."); }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      fetchSecrets(); // Refresh to get masked values
      fetchGoogleStatus();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (field: string) => {
    setRevealedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getMaskedValue = (key: keyof SecretVault, rawValue: string) => {
    if (revealedFields[key]) return rawValue;
    if (!rawValue) return "";
    if (rawValue.startsWith("[Masked]")) return rawValue;
    return "••••••••••••••••••••••••••••••••";
  };

  const handleFieldChange = (key: keyof SecretVault, value: string) => {
    setVault((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4"><PageHeader eyebrow="System" title="Connections" description="Configure optional AI providers and integrations. Secret values never appear in normal AI context."/><div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm">
      
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-stone-900 flex items-center space-x-2">
            <Key className="h-5 w-5 text-amber-600" />
            <span>Encrypted Secret Vault</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Provider keys are stored only on this computer in a private LifeOS secrets file.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-[10px] bg-red-50 text-red-700 font-mono font-semibold px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">
            HIGH_SECURITY_ENCLAVE
          </span>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Provider key validated and saved locally. AI will remain connected after restarts.</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core AI SDK Keys */}
        <div>
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-3 flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-stone-400" />
            <span>AI Platform Secrets</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            {/* NVIDIA NIM */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-emerald-700 uppercase font-mono mb-1">NVIDIA_API_KEY · PRIMARY</label>
              <div className="relative">
                <input
                  type={revealedFields.nvidiaKey ? "text" : "password"}
                  value={getMaskedValue("nvidiaKey", vault.nvidiaKey)}
                  onChange={(e) => handleFieldChange("nvidiaKey", e.target.value)}
                  placeholder="Paste NVIDIA API key from build.nvidia.com"
                  className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-800 text-xs pr-8"
                />
                <button type="button" onClick={() => toggleReveal("nvidiaKey")} className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700">
                  {revealedFields.nvidiaKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">Used first for the grounded LifeOS Assistant. Default model: NVIDIA Nemotron 3 Super.</p>
            </div>
            {/* Gemini */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">GEMINI_API_KEY</label>
              <div className="relative">
                <input
                  type={revealedFields.geminiKey ? "text" : "password"}
                  value={getMaskedValue("geminiKey", vault.geminiKey)}
                  onChange={(e) => handleFieldChange("geminiKey", e.target.value)}
                  placeholder="Insert Gemini API Key"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("geminiKey")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.geminiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* OpenAI */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">OPENAI_API_KEY</label>
              <div className="relative">
                <input
                  type={revealedFields.openaiKey ? "text" : "password"}
                  value={getMaskedValue("openaiKey", vault.openaiKey)}
                  onChange={(e) => handleFieldChange("openaiKey", e.target.value)}
                  placeholder="OpenAI key configured externally"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("openaiKey")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.openaiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Anthropic */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">ANTHROPIC_API_KEY</label>
              <div className="relative">
                <input
                  type={revealedFields.anthropicKey ? "text" : "password"}
                  value={getMaskedValue("anthropicKey", vault.anthropicKey)}
                  onChange={(e) => handleFieldChange("anthropicKey", e.target.value)}
                  placeholder="Anthropic key configured externally"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("anthropicKey")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.anthropicKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* OAuth / Workspace integration tokens */}
        <div>
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-3 flex items-center space-x-2">
            <Mail className="h-4 w-4 text-stone-400" />
            <span>Workspace & OAuth Tokens</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <section className="md:col-span-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-stone-900">Google Workspace</h4><p className="mt-1 text-[10px] text-stone-600">Calendar events, Gmail and Drive metadata. Raw documents and complete email bodies are excluded from ordinary AI prompts.</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${googleStatus?.connected?"bg-emerald-100 text-emerald-800":"bg-stone-200 text-stone-700"}`}>{googleStatus?.connected?`Connected${googleStatus.account?.email?` · ${googleStatus.account.email}`:""}`:googleStatus?.configured?"Ready to connect":"Setup required"}</span></div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-[10px] font-bold uppercase text-stone-500">OAuth client ID<input type="password" value={getMaskedValue("googleClientId",vault.googleClientId)} onChange={e=>handleFieldChange("googleClientId",e.target.value)} placeholder="Google Web application client ID" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs normal-case"/></label>
                <label className="text-[10px] font-bold uppercase text-stone-500">OAuth client secret<input type="password" value={getMaskedValue("googleClientSecret",vault.googleClientSecret)} onChange={e=>handleFieldChange("googleClientSecret",e.target.value)} placeholder="Google Web application client secret" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs normal-case"/></label>
              </div>
              <div className="mt-3 rounded-lg border bg-white p-3"><span className="block text-[9px] font-bold uppercase text-stone-500">Authorized redirect URI</span><code className="mt-1 block break-all text-[10px] text-blue-800">{callbackUrl}</code></div>
              {googleStatus?.lastSyncAt&&<p className="mt-2 text-[10px] text-stone-600">Last sync {new Date(googleStatus.lastSyncAt).toLocaleString()} · {googleStatus.counts.calendarEvents} events · {googleStatus.counts.gmailMessages} messages · {googleStatus.counts.driveFiles} files</p>}
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={googleBusy||!googleStatus?.configured} onClick={connectGoogle} className="life-button-primary">{googleBusy?<RefreshCw className="h-4 w-4 animate-spin"/>:null}{googleStatus?.connected?"Reconnect Google":"Connect Google"}</button>{googleStatus?.connected&&<><button type="button" disabled={googleBusy} onClick={syncGoogle} className="life-button-secondary">Sync now</button><button type="button" disabled={googleBusy} onClick={disconnectGoogle} className="life-button-secondary text-red-700">Disconnect</button></>}</div>
              {googleStatus?.needsReconnect&&<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[10px] text-amber-900">Reconnect Google once to approve Calendar publishing and Drive file creation. Nothing will be written until you separately approve a proposal.</div>}
              {googleStatus?.connected&&<div className="mt-4 grid gap-3 lg:grid-cols-3"><section className="rounded-xl border bg-white p-3"><h5 className="text-xs font-semibold">Important email</h5><div className="mt-2 space-y-2">{(googleStatus.importantEmails||[]).slice(0,5).map((mail:any)=><div key={mail.id} className="border-t pt-2 first:border-0 first:pt-0"><strong className="block truncate text-[10px]">{mail.subject||"No subject"}</strong><span className="block truncate text-[9px] text-stone-500">{mail.from} · {mail.importance}</span></div>)}{!googleStatus.importantEmails?.length&&<p className="text-[10px] text-stone-500">No important, starred, or unread messages in the current sync.</p>}</div></section><section className="rounded-xl border bg-white p-3"><h5 className="text-xs font-semibold">Publish LifeOS plan</h5><p className="mt-1 text-[10px] text-stone-500">Prepare today’s health, study, routine, meal, and relaxation blocks for Calendar review.</p><button type="button" disabled={googleBusy} onClick={()=>googleAction("/api/google/proposals/calendar-plan","POST",{date:today})} className="life-button-secondary mt-3 w-full">Prepare calendar plan</button></section><section className="rounded-xl border bg-white p-3"><h5 className="text-xs font-semibold">43v3r Drive workspace</h5><p className="mt-1 text-[10px] text-stone-500">Prepare a business plan, product roadmap, and customer-validation plan from current records.</p><button type="button" disabled={googleBusy} onClick={()=>googleAction("/api/google/proposals/business-pack")} className="life-button-secondary mt-3 w-full">Prepare business files</button></section></div>}
              {googleStatus?.proposals?.length>0&&<div className="mt-4 space-y-2"><h5 className="text-xs font-semibold">Google changes awaiting approval</h5>{googleStatus.proposals.map((proposal:any)=><article key={proposal.id} className="rounded-xl border border-violet-200 bg-violet-50 p-3"><strong className="text-xs">{proposal.title}</strong><p className="mt-1 text-[10px] text-stone-600">{proposal.summary}</p><details className="mt-2"><summary className="cursor-pointer text-[10px] font-bold">Review exact changes</summary><ul className="mt-2 space-y-1 text-[10px]">{(proposal.preview||[]).map((item:string)=><li key={item}>• {item}</li>)}</ul></details><div className="mt-3 flex gap-2"><button type="button" disabled={googleBusy} onClick={()=>googleAction(`/api/google/proposals/${proposal.id}`,"PATCH",{decision:"approve"})} className="life-button-primary">Approve</button><button type="button" disabled={googleBusy} onClick={()=>googleAction(`/api/google/proposals/${proposal.id}`,"PATCH",{decision:"reject"})} className="life-button-secondary">Reject</button></div></article>)}</div>}
              {googleStatus?.createdResources?.length>0&&<div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><h5 className="text-xs font-semibold text-emerald-900">Created by LifeOS</h5><div className="mt-2 grid gap-2 sm:grid-cols-2">{googleStatus.createdResources.map((resource:any)=><a key={resource.id} href={resource.link} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[10px] font-semibold text-emerald-800 hover:border-emerald-400">{resource.name||"Open Google item"}</a>)}</div></div>}
              {!googleStatus?.configured&&<p className="mt-2 text-[10px] text-amber-800">Enter the credentials, select “Validate and save connections,” then return here to connect.</p>}
            </section>

            {/* Microsoft */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">MICROSOFT_OFFICE_TOKEN</label>
              <div className="relative">
                <input
                  type={revealedFields.microsoftToken ? "text" : "password"}
                  value={getMaskedValue("microsoftToken", vault.microsoftToken)}
                  onChange={(e) => handleFieldChange("microsoftToken", e.target.value)}
                  placeholder="Microsoft token configured externally"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("microsoftToken")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.microsoftToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">GITHUB_ACCESS_TOKEN</label>
              <div className="relative">
                <input
                  type={revealedFields.githubToken ? "text" : "password"}
                  value={getMaskedValue("githubToken", vault.githubToken)}
                  onChange={(e) => handleFieldChange("githubToken", e.target.value)}
                  placeholder="GitHub token configured externally"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("githubToken")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.githubToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure binding strings */}
        <div>
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-3 flex items-center space-x-2">
            <Database className="h-4 w-4 text-stone-400" />
            <span>Infrastructure Bindings</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            {/* Database string */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">SQL_SERVER_CONNECTION_STRING</label>
              <div className="relative">
                <input
                  type={revealedFields.dbConnectionString ? "text" : "password"}
                  value={getMaskedValue("dbConnectionString", vault.dbConnectionString)}
                  onChange={(e) => handleFieldChange("dbConnectionString", e.target.value)}
                  placeholder="Database connection string configured externally"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("dbConnectionString")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.dbConnectionString ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* SMTP string */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">SMTP_CREDENTIALS_STRING</label>
              <div className="relative">
                <input
                  type={revealedFields.smtpConnectionString ? "text" : "password"}
                  value={getMaskedValue("smtpConnectionString", vault.smtpConnectionString)}
                  onChange={(e) => handleFieldChange("smtpConnectionString", e.target.value)}
                  placeholder="SMTP URL configured externally"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("smtpConnectionString")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.smtpConnectionString ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="life-button-primary flex items-center justify-center space-x-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Validate and save connections</span>
          </button>
        </div>

      </form>

    </div><GoogleWorkspaceView /></div>
  );
}
