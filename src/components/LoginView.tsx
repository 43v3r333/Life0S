import React, { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function LoginView({ onAuthenticated }: { onAuthenticated: (username: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, rememberMe }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Login failed.");
      setPassword(""); onAuthenticated(result.username || "LifeOS user");
    } catch (failure: any) { setError(failure.message); } finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-stone-950 px-5 py-12 text-stone-900">
    <div className="mx-auto mt-[8vh] max-w-md overflow-hidden rounded-3xl border border-stone-800 bg-white shadow-2xl">
      <header className="bg-stone-900 p-6 text-white"><div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-400/10 p-3"><ShieldCheck className="h-6 w-6 text-emerald-400"/></span><div><h1 className="text-xl font-bold">LifeOS</h1><p className="text-xs text-stone-400">Private personal system</p></div></div></header>
      <form onSubmit={submit} className="space-y-4 p-6">
        <div><h2 className="font-semibold">Sign in</h2><p className="mt-1 text-xs leading-5 text-stone-500">Your financial records, plans, and AI memory are protected by this login.</p></div>
        {error&&<p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <label className="block text-xs font-semibold">Email<input required autoComplete="username" type="email" value={email} onChange={event=>setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"/></label>
        <label className="block text-xs font-semibold">Password<input required autoComplete="current-password" type="password" value={password} onChange={event=>setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"/></label>
        <label className="flex items-center gap-2 text-xs text-stone-600"><input type="checkbox" checked={rememberMe} onChange={event=>setRememberMe(event.target.checked)}/>Keep me signed in on this device for 7 days</label>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><LockKeyhole className="h-4 w-4"/>{busy?"Signing in…":"Unlock LifeOS"}</button>
        <p className="text-center text-[10px] text-stone-400">Use only on a device you trust. LifeOS never asks for banking passwords or PINs.</p>
      </form>
    </div>
  </main>;
}
