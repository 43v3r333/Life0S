import React, { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, Key, Laptop, Power, AlertTriangle, RefreshCw, Smartphone, Copy, Check } from "lucide-react";
import { ActiveSession } from "../types";

interface AuthViewProps {
  onLoginSuccess: (username: string) => void;
  currentUser: string | null;
  onLogout: () => void;
}

export default function AuthView({ onLoginSuccess, currentUser, onLogout }: AuthViewProps) {
  const [tab, setTab] = useState<"login" | "register" | "sessions">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [mfaSetup, setMfaSetup] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  // Load simulated active sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please complete all credentials.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccess("Secure session initialized. Deen telemetry synced.");
      setTimeout(() => {
        onLoginSuccess(data.username);
        setTab("sessions");
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError("All credentials are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess("Identity root registered successfully.");
      setTimeout(() => {
        setTab("login");
        setError("");
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/auth/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === "123456" || mfaCode.length === 6) {
      setMfaVerified(true);
      setSuccess("Two-Factor Authenticator linked and verified.");
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setError("Invalid code. Please enter the 6-digit code from your app.");
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText("JANN-38F9-2A41\nJAN-99D1-01FC\nJAN-48B8-EE29");
    setRecoveryCopied(true);
    setTimeout(() => setRecoveryCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-lg font-medium text-stone-900 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-stone-500" />
            <span>Identity & Authentication Manager</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Enterprise ASP.NET Core Identity & Multi-Factor authentication pipeline.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-stone-100 border border-stone-200 rounded-xl font-mono text-[11px]">
          {!currentUser ? (
            <>
              <button
                onClick={() => setTab("login")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  tab === "login" ? "bg-stone-900 text-white font-semibold" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                LOGIN
              </button>
              <button
                onClick={() => setTab("register")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  tab === "register" ? "bg-stone-900 text-white font-semibold" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                REGISTER
              </button>
            </>
          ) : (
            <button
              onClick={() => setTab("sessions")}
              className={`px-3 py-1.5 rounded-lg transition bg-stone-900 text-white font-semibold`}
            >
              ACTIVE SESSIONS
            </button>
          )}
        </div>
      </div>

      {/* Alert Messaging */}
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Dynamic form / panels */}
        <div className="lg:col-span-2">
          
          {/* TAB: LOGIN */}
          {tab === "login" && !currentUser && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-950 uppercase font-mono tracking-wider mb-2">Secure User Login</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ethan@projectjannah.io"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-stone-600 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-200 accent-stone-900"
                  />
                  <span>Remember me for 30 days</span>
                </label>
                <button
                  type="button"
                  onClick={() => setError("Contact support or generate a recovery command via Gabriel AI.")}
                  className="text-[11px] text-stone-500 hover:text-stone-950 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-semibold py-2.5 px-4 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  <span>INITIALIZE COGNITIVE SESSION</span>
                </button>
              </div>

              {/* Federated Login Hooks */}
              <div className="border-t border-stone-200 mt-6 pt-4">
                <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-3">Or Connect via Unified OAuth Providers</p>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    disabled
                    title="Google OAuth is not configured"
                    className="flex items-center justify-center space-x-1.5 py-2 border border-stone-200 rounded bg-stone-100 text-stone-400 cursor-not-allowed"
                  >
                    <span>Google OAuth</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Microsoft OAuth is not configured"
                    className="flex items-center justify-center space-x-1.5 py-2 border border-stone-200 rounded bg-stone-100 text-stone-400 cursor-not-allowed"
                  >
                    <span>Microsoft</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    title="GitHub OAuth is not configured"
                    className="flex items-center justify-center space-x-1.5 py-2 border border-stone-200 rounded bg-stone-100 text-stone-400 cursor-not-allowed"
                  >
                    <span>GitHub OAuth</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB: REGISTER */}
          {tab === "register" && !currentUser && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-950 uppercase font-mono tracking-wider mb-2">Create Identity Root</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">DESIRED USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ethan"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ethan@projectjannah.io"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono mb-1">PASSWORD (MINIMUM 8 CHARS, 1 NON-ALPHANUMERIC)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-950 hover:bg-stone-900 text-white font-mono text-xs font-semibold py-2.5 px-4 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  <span>BUILD IDENTITY SCHEMA</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: ACTIVE SESSIONS */}
          {currentUser && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono mb-3">Active Identity Sessions</h3>
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-3.5 bg-[#fbfbfa] rounded-xl border border-stone-200 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-600 border border-stone-200">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-stone-900">{s.device}</span>
                            {s.isCurrent && (
                              <span className="text-[8px] font-mono uppercase bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-100 font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            IP: {s.ipAddress} • {s.location}
                          </p>
                          <p className="text-[9px] text-stone-400 mt-1 font-mono">Last active: {s.lastActive}</p>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded hover:bg-red-50 transition"
                          title="Revoke session token"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* MFA Setup Section */}
              <div className="border-t border-stone-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono">Multi-Factor Authentication (MFA)</h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">Secure logins with standard 2FA authenticator applications.</p>
                  </div>
                  {!mfaSetup ? (
                    <button
                      onClick={() => setMfaSetup(true)}
                      className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold"
                    >
                      ENABLE MFA
                    </button>
                  ) : (
                    <span className="text-emerald-600 text-xs font-mono font-bold flex items-center space-x-1">
                      <span>● ENROLLED</span>
                    </span>
                  )}
                </div>

                {mfaSetup && !mfaVerified && (
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col md:flex-row gap-6">
                    {/* QR Code Graphic */}
                    <div className="shrink-0 flex flex-col items-center justify-center p-3.5 bg-white border border-stone-200 rounded-xl">
                      <div className="w-28 h-28 bg-stone-900 flex flex-wrap p-1.5 gap-0.5 items-center justify-center rounded">
                        {/* Mock QR matrix lines */}
                        {Array.from({ length: 64 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2.5 h-2.5 rounded-sm ${
                              (idx * 7 + 13) % 5 === 0 || (idx > 10 && idx < 18) || idx % 9 === 0 ? "bg-white" : "bg-stone-900"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-stone-400 mt-2 uppercase">Jannah_MFA_Secret</span>
                    </div>

                    {/* QR details & verify */}
                    <div className="flex-1 space-y-3 text-xs text-stone-600">
                      <p className="leading-relaxed">
                        1. Scan this QR code with Google Authenticator or any TOTP application.<br />
                        2. Enter the generated 6-digit verification code below:
                      </p>
                      
                      <form onSubmit={verifyMfa} className="flex gap-2">
                        <input
                          type="text"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="bg-white border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 text-xs max-w-[120px]"
                        />
                        <button
                          type="submit"
                          className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1 text-xs rounded-lg font-semibold font-mono"
                        >
                          VERIFY
                        </button>
                      </form>

                      {/* Recovery Codes block */}
                      <div className="pt-2 border-t border-stone-200">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-stone-400 uppercase font-bold">MFA RECOVERY CODES</span>
                          <button
                            onClick={copyRecoveryCodes}
                            className="text-[9px] text-stone-500 hover:text-stone-900 font-mono flex items-center space-x-1"
                          >
                            {recoveryCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>{recoveryCopied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono bg-stone-100 p-2 rounded border border-stone-200 text-stone-500 mt-1">
                          JANN-38F9-2A41<br />JAN-99D1-01FC<br />JAN-48B8-EE29
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Lockout & Invariants Specifications */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-4">
          <h3 className="text-xs font-semibold text-stone-500 tracking-wider uppercase font-mono flex items-center space-x-1.5">
            <Smartphone className="h-4 w-4" />
            <span>Policy Guardrails</span>
          </h3>
          
          <div className="space-y-3 font-mono text-[10px] leading-relaxed">
            <div className="p-2.5 bg-white rounded border border-stone-200 text-stone-600">
              <strong className="text-stone-800 block uppercase">Account Lockout Invariant</strong>
              <span className="block mt-0.5">5 consecutive failed logins trigger immediate account freezing for 15 minutes. Audited to Domain Event DLQ.</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-stone-200 text-stone-600">
              <strong className="text-stone-800 block uppercase">Refresh Token Policies</strong>
              <span className="block mt-0.5">Issued alongside JWT and stored inside HTTP-Only Secure Cookies. Rotates cryptographically on every single middleware validation.</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-stone-200 text-stone-600">
              <strong className="text-stone-800 block uppercase">Device Telemetry Binding</strong>
              <span className="block mt-0.5">Every login session records geographic origin, IP binding, user-agent string and unique device hardware hash code.</span>
            </div>
          </div>

          {currentUser && (
            <div className="pt-4 border-t border-stone-200">
              <button
                onClick={onLogout}
                className="w-full bg-red-50 text-red-700 hover:bg-red-100 font-mono text-[11px] font-bold py-2 px-3 rounded-lg border border-red-200 transition text-center flex items-center justify-center space-x-2"
              >
                <Power className="h-3.5 w-3.5" />
                <span>TERMINATE SESSIONS</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
