import React, { useState, useEffect } from "react";
import { Key, ShieldAlert, Check, RefreshCw, Eye, EyeOff, Save, Database, Mail, Terminal } from "lucide-react";
import { SecretVault } from "../types";

export default function VaultView() {
  const [vault, setVault] = useState<SecretVault>({
    openaiKey: "",
    geminiKey: "",
    anthropicKey: "",
    githubToken: "",
    microsoftToken: "",
    googleToken: "",
    dbConnectionString: "",
    smtpConnectionString: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  // Fetch secrets from backend (server-side handles masking)
  const fetchSecrets = async () => {
    try {
      const res = await fetch("/api/vault");
      if (res.ok) {
        const data = await res.json();
        setVault(data);
      }
    } catch (err) {
      console.error("Could not fetch secrets", err);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

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

      if (!res.ok) {
        throw new Error("Failed to write to encrypted vault.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      fetchSecrets(); // Refresh to get masked values
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
    <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-stone-900 flex items-center space-x-2">
            <Key className="h-5 w-5 text-amber-600" />
            <span>Encrypted Secret Vault</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            AES-256 encrypted server-side wallet. Credentials never exposed to frontend.
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
          <span>Vault synchronized. Secrets re-encrypted and persisted securely.</span>
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
                  placeholder="sk-proj-••••••••"
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
                  placeholder="sk-ant-••••••••"
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
            {/* Google */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">GOOGLE_CLIENT_TOKEN</label>
              <div className="relative">
                <input
                  type={revealedFields.googleToken ? "text" : "password"}
                  value={getMaskedValue("googleToken", vault.googleToken)}
                  onChange={(e) => handleFieldChange("googleToken", e.target.value)}
                  placeholder="G-OAUTH-••••••••"
                  className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs pr-8"
                />
                <button
                  type="button"
                  onClick={() => toggleReveal("googleToken")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                >
                  {revealedFields.googleToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Microsoft */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">MICROSOFT_OFFICE_TOKEN</label>
              <div className="relative">
                <input
                  type={revealedFields.microsoftToken ? "text" : "password"}
                  value={getMaskedValue("microsoftToken", vault.microsoftToken)}
                  onChange={(e) => handleFieldChange("microsoftToken", e.target.value)}
                  placeholder="MSFT-SEC-••••••••"
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
                  placeholder="ghp_••••••••"
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
                  placeholder="Server=tcp:sqlserver.io;Database=LifeOS;User=..."
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
                  placeholder="smtps://user:pass@smtp.mailtrap.io:465"
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
            className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-semibold py-2.5 px-6 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>ENCRYPT AND HARVEST SECRETS</span>
          </button>
        </div>

      </form>

    </div>
  );
}
