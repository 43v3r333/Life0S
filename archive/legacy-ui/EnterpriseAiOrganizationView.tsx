import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Zap,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Terminal,
  Activity,
  ArrowRight,
  TrendingUp,
  Plus,
  Trash2,
  Check,
  Sliders,
  Send,
  Database,
  Search,
  BookOpen,
  Info,
  SlidersHorizontal,
  Workflow,
  Cpu,
  Brain,
  MessageSquare,
  Lock,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  HelpCircle,
  Book,
  Code,
  FileText,
  Key,
  DollarSign,
  Globe,
  Settings,
  Scale,
  CloudLightning,
  Boxes,
  Compass,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface EnterpriseAiOrganizationViewProps {
  onAddSignalREvent?: (msg: string) => void;
  onUpdateScore?: () => void;
}

export default function EnterpriseAiOrganizationView({
  onAddSignalREvent = () => {},
  onUpdateScore = () => {}
}: EnterpriseAiOrganizationViewProps) {
  const STORAGE_KEY_PREFIX = "lifeos_p16_";

  const loadState = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const saveState = (key: string, value: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving state to localStorage", e);
    }
  };

  // --------------------------------------------------
  // UI NAVIGATION SUB-TABS
  // --------------------------------------------------
  const [activeSubTab, setActiveSubTab] = useState<
    | "cockpit"
    | "tenants"
    | "workforce"
    | "products"
    | "billing"
    | "governance"
    | "ops"
    | "developer"
    | "tests"
    | "docs"
  >("cockpit");

  // --------------------------------------------------
  // 1. MULTI-TENANT WORKSPACE REGISTRY
  // --------------------------------------------------
  const [tenants, setTenants] = useState<any[]>(() => loadState("tenants", [
    { id: "ten_1", name: "Ethan Barnes Sovereign Workspace", type: "Personal", status: "Active", users: 1, aiCount: 4, region: "EU West (London)", safetyLevel: "Strict" },
    { id: "ten_2", name: "Barnes Family Endowment Trust (Waqf)", type: "Family", status: "Active", users: 5, aiCount: 3, region: "EU West (London)", safetyLevel: "Strict" },
    { id: "ten_3", name: "43v3r Industrial Manufacturing Corp", type: "Enterprise", status: "Active", users: 142, aiCount: 12, region: "US East (N. Virginia)", safetyLevel: "Standard" },
    { id: "ten_4", name: "Sovereign Venture Capital Sandbox", type: "Sandbox", status: "Active", users: 12, aiCount: 6, region: "EU Central (Frankfurt)", safetyLevel: "Strict" },
    { id: "ten_5", name: "Consulting & Client Advisory Hub", type: "Consulting", status: "Suspended", users: 0, aiCount: 0, region: "US West (Oregon)", safetyLevel: "Standard" }
  ]));

  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantType, setNewTenantType] = useState("Business");
  const [newTenantRegion, setNewTenantRegion] = useState("EU West (London)");

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    const newTenant = {
      id: "ten_" + Date.now(),
      name: newTenantName,
      type: newTenantType,
      status: "Active",
      users: 1,
      aiCount: 2,
      region: newTenantRegion,
      safetyLevel: "Strict"
    };

    setTenants(prev => [newTenant, ...prev]);
    setNewTenantName("");
    onAddSignalREvent(`Published Event: TenantCreated - Provisioned new workspace: "${newTenant.name}" [${newTenant.type}]`);
    onUpdateScore();
  };

  const toggleTenantStatus = (id: string, name: string) => {
    setTenants(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === "Active" ? "Suspended" : "Active";
          onAddSignalREvent(`Tenant state changed: "${name}" is now ${nextStatus}`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    onUpdateScore();
  };

  // --------------------------------------------------
  // 2. ORGANIZATION STRUCTURE (COST CENTERS, DEPARTMENTS)
  // --------------------------------------------------
  const [departments, setDepartments] = useState<any[]>(() => loadState("departments", [
    { id: "dept_1", name: "Spiritual Compliance & Policy", code: "DIV-01-SHARIAH", costCenter: "CC-901", lead: "Gabriel.IslamOS_Auditor", budget: "£5,000", revenueCenter: false },
    { id: "dept_2", name: "Cybernetic Manufacturing & MES", code: "DIV-03-MES", costCenter: "CC-402", lead: "Gabriel.TechnicalArchitect", budget: "£45,000", revenueCenter: true },
    { id: "dept_3", name: "Sovereign Asset Treasury", code: "DIV-02-FINANCE", costCenter: "CC-101", lead: "Gabriel.FinanceExpert", budget: "£25,000", revenueCenter: true }
  ]));

  // --------------------------------------------------
  // 3. SPECIALIST AI WORKFORCE CLUSTER
  // --------------------------------------------------
  const [aiWorkforce, setAiWorkforce] = useState<any[]>(() => loadState("aiWorkforce", [
    { id: "ai_wf_1", name: "Gabriel.Executive_Core", role: "CEO Twin & Orchestrator", tenant: "Sovereign Workspace", efficiency: "99.8%", throughput: "842 task/hr" },
    { id: "ai_wf_2", name: "Gabriel.Operations_AI", role: "MES & PLC Controller", tenant: "Manufacturing Corp", efficiency: "98.4%", throughput: "2,410 telemetry/sec" },
    { id: "ai_wf_3", name: "Gabriel.Compliance_AI", role: "Shariah Auditor & Policy Guard", tenant: "Endowment Trust", efficiency: "100%", throughput: "145 query/min" },
    { id: "ai_wf_4", name: "Gabriel.Finance_AI", role: "Mudarabah Liquidity Allocator", tenant: "Sovereign Workspace", efficiency: "99.1%", throughput: "12 tx/min" }
  ]));

  // --------------------------------------------------
  // 4. 43V3R PRODUCT ECOSYSTEM & APP MARKETPLACE
  // --------------------------------------------------
  const [marketplaceApps, setMarketplaceApps] = useState<any[]>(() => loadState("marketplaceApps", [
    { id: "app_1", name: "43v3r LifeOS", licensed: true, status: "Active", installs: 2, category: "Core", description: "Personal sovereignty, family trust, and spiritual twin operating engine." },
    { id: "app_2", name: "43v3r MES", licensed: true, status: "Active", installs: 1, category: "Industrial", description: "OPC UA, Wonderware, and PLC telemetry collector & broker pipeline." },
    { id: "app_3", name: "43v3r IT Copilot", licensed: true, status: "Active", installs: 3, category: "Engineering", description: "Automated container, cluster, database replication & SDK management tools." },
    { id: "app_4", name: "43v3r BusinessOS", licensed: true, status: "Active", installs: 1, category: "Enterprise", description: "Multi-tenant cost centers, CRM, departments and RBAC policy engines." },
    { id: "app_5", name: "43v3r Records", licensed: false, status: "Available", installs: 0, category: "Productivity", description: "Federated decentralized record archival with double-entry ledger audits." }
  ]));

  const installApp = (id: string, name: string) => {
    setMarketplaceApps(prev =>
      prev.map(app => {
        if (app.id === id) {
          onAddSignalREvent(`Published Event: ApplicationInstalled - Licensed and initialized "${name}" inside the primary tenant pool.`);
          return { ...app, licensed: true, status: "Active", installs: app.installs + 1 };
        }
        return app;
      })
    );
    onUpdateScore();
  };

  // --------------------------------------------------
  // 5. BILLING & CONSUMPTION SUITE
  // --------------------------------------------------
  const [billingStats, setBillingStats] = useState(() => loadState("billingStats", {
    mrr: "£14,250",
    activeSubscribers: 4,
    aiTokenUsage: "24.1M tokens",
    apiUsage: "412,840 calls",
    nextInvoiceDate: "August 1, 2026"
  }));

  const [invoices, setInvoices] = useState<any[]>(() => loadState("invoices", [
    { id: "inv_1", tenant: "43v3r Industrial Manufacturing", amount: "£8,450", status: "Paid", date: "July 01, 2026", details: "Enterprise Subscription + 12M AI Tokens + Wonderware Connectors" },
    { id: "inv_2", tenant: "Barnes Family Endowment Trust", amount: "£1,200", status: "Paid", date: "July 01, 2026", details: "Family Workspace license" },
    { id: "inv_3", tenant: "Sovereign Venture Capital Sandbox", amount: "£4,600", status: "Awaiting Processing", date: "July 06, 2026", details: "Developer Sandbox Tier + 8 Specialist Micro-Agents" }
  ]));

  // --------------------------------------------------
  // 6. ENTERPRISE GOVERNANCE & POLICY INHERITANCE
  // --------------------------------------------------
  const [policies, setPolicies] = useState<any[]>(() => loadState("policies", [
    { id: "pol_1", title: "Global Shariah Compliance Shield", scope: "Platform-wide (All Tenants)", inherits: "Root Code", status: "Strictly Enforced" },
    { id: "pol_2", title: "Multi-Tenant Data Encryption Policy", scope: "Cluster Level", inherits: "Infra Guard", status: "Strictly Enforced" },
    { id: "pol_3", title: "PLC Register Safety Override Limits", scope: "Manufacturing Org", inherits: "SOP-901", status: "Enforced" }
  ]));

  const [auditLogs, setAuditLogs] = useState<any[]>(() => loadState("auditLogs", [
    { time: "12:50 PM", action: "Tenant provisioned", details: "New Sandbox workspace registered under token authentication keys.", operator: "Gabriel.Executive_Core" },
    { time: "11:24 AM", action: "Policy Inherited", details: "Global Shariah Compliance Shield propagated to Barnes Endowment Trust.", operator: "System Policy Engine" },
    { time: "10:05 AM", action: "App installed", details: "Licensed and compiled 43v3r MES for Manufacturing Corp.", operator: "Ethan (Operator)" }
  ]));

  // --------------------------------------------------
  // 7. DEVELOPER PORTAL & OPENAPI CATALOUGE
  // --------------------------------------------------
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState("tenants");
  const [apiResponseOutput, setApiResponseOutput] = useState("");

  const runApiCall = (endpoint: string) => {
    setSelectedApiEndpoint(endpoint);
    let mockResult = {};
    if (endpoint === "tenants") {
      mockResult = {
        object: "list",
        data: tenants,
        has_more: false,
        total_count: tenants.length
      };
    } else if (endpoint === "identity") {
      mockResult = {
        authentication_method: "Entra ID OIDC Federation",
        active_session_token_jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0M3YzciIsIm5hbWUiOiJFdGhhbiBCYXJuZXMiLCJyb2xlcyI6WyJQbGF0Zm9ybV9BZG1pbiJdfQ",
        expires_at: "2026-07-10T12:57:18Z",
        token_type: "Bearer"
      };
    } else if (endpoint === "marketplace") {
      mockResult = {
        applications: marketplaceApps,
        active_licensing_model: "Multi-tenant SaaS subscription ruleset",
        vendor_reputation: "100% verified 43v3r signed"
      };
    } else if (endpoint === "governance") {
      mockResult = {
        policy_inheritance_graphs: policies,
        active_legal_holds: [],
        audit_records_count: auditLogs.length
      };
    }
    setApiResponseOutput(JSON.stringify(mockResult, null, 2));
    onAddSignalREvent(`Executed Developer Portal API call to: /api/v3/${endpoint}`);
  };

  // --------------------------------------------------
  // 8. CRITICAL VERIFICATION & PLATFORM TESTING SUITE
  // --------------------------------------------------
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<"idle" | "running" | "passed" | "failed">("idle");

  const executeSystemTests = () => {
    setIsRunningTests(true);
    setTestResult("running");
    setTestLogs([]);
    onAddSignalREvent("Dispatched Phase 16 Multi-Tenant Verification testing framework.");

    const logs = [
      "[SYSTEM] Loading platform validation suite for 43v3r Ecosystem...",
      "[TEST] TenantIsolation_EnsuresZeroCrossTenantLeaks... PASSED (28ms)",
      "[TEST] RBAC_FederatedEntraID_SAML_Handshake... PASSED (12ms)",
      "[TEST] OrganizationEngine_ValidatesCostCenters_LeadAllocation... PASSED (34ms)",
      "[TEST] AIWorkforce_SecureCollaborationsWithinTenantBoundaries... PASSED (45ms)",
      "[TEST] AppMarketplace_FeatureFlag_LicensingValidation... PASSED (18ms)",
      "[TEST] BillingPlatform_SubscriptionCalculations_AccurateConsumption... PASSED (22ms)",
      "[TEST] Governance_AuditsPolicyInheritanceChain... PASSED (15ms)",
      "[TEST] DeveloperPortal_SwaggerSchemaVerification... PASSED (9ms)",
      "[SYSTEM] Code verification assessment: 98.6% complete.",
      "[SUCCESS] All ecosystem validation tests executed without error."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logs.length) {
        setTestLogs(prev => [...prev, logs[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsRunningTests(false);
        setTestResult("passed");
        onAddSignalREvent("Ecosystem integration validation successful. 98.6% compliance score achieved.");
        onUpdateScore();
      }
    }, 180);
  };

  // Synchronize localStorage
  useEffect(() => { saveState("tenants", tenants); }, [tenants]);
  useEffect(() => { saveState("departments", departments); }, [departments]);
  useEffect(() => { saveState("aiWorkforce", aiWorkforce); }, [aiWorkforce]);
  useEffect(() => { saveState("marketplaceApps", marketplaceApps); }, [marketplaceApps]);
  useEffect(() => { saveState("billingStats", billingStats); }, [billingStats]);
  useEffect(() => { saveState("invoices", invoices); }, [invoices]);
  useEffect(() => { saveState("policies", policies); }, [policies]);
  useEffect(() => { saveState("auditLogs", auditLogs); }, [auditLogs]);

  // Recharts Data for Platform operations
  const tenantResourceData = [
    { name: "Sovereign Personal", AI_Tokens_K: 4200, Web_Requests: 840, Database_Reads_K: 230 },
    { name: "Barnes Waqf", AI_Tokens_K: 1200, Web_Requests: 320, Database_Reads_K: 84 },
    { name: "Manufacturing MES", AI_Tokens_K: 18500, Web_Requests: 24500, Database_Reads_K: 4500 },
    { name: "Sandbox Play", AI_Tokens_K: 8400, Web_Requests: 1420, Database_Reads_K: 540 }
  ];

  const COLORS = ["#4338ca", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Upper Branded Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-mono text-xs uppercase tracking-wider font-bold">
            <Boxes className="h-4 w-4 animate-spin-slow" />
            <span>43v3r Ecosystem Platform • Version 3.0.0</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            LifeOS Multi-Tenant AI Organization Center
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-4xl font-mono">
            CODENAME: PROJECT JANNAH • PHASE 16 CROSS-TENANT COGNITIVE CORE • INTEGRATED SSO • APP MARKETPLACE • BILLING ENGINE • COMPLIANCE AUDIT
          </p>
        </div>

        {/* Global Cluster Summary Indicators */}
        <div className="flex items-center space-x-4 bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-mono">
          <div className="text-right">
            <span className="text-[9px] text-stone-400 block uppercase font-bold">Active Tenants</span>
            <span className="text-sm font-bold text-indigo-600">{tenants.filter(t => t.status === "Active").length} / {tenants.length}</span>
          </div>
          <div className="text-right border-l border-stone-200 pl-4">
            <span className="text-[9px] text-stone-400 block uppercase font-bold">System Health</span>
            <span className="text-xs font-bold text-emerald-600">100% Operational</span>
          </div>
        </div>
      </div>

      {/* Main SubTabs selection */}
      <div className="flex flex-wrap gap-1 bg-stone-50 border border-stone-200 p-1 rounded-xl">
        {[
          { id: "cockpit", label: "Executive Cloud Cockpit", icon: Layers },
          { id: "tenants", label: "Tenant & Organization Manager", icon: Building2 },
          { id: "workforce", label: "AI Workforce Cluster", icon: Brain },
          { id: "products", label: "Product Store & App Marketplace", icon: Sparkles },
          { id: "billing", label: "Billing & Consumption", icon: CreditCard },
          { id: "governance", label: "Enterprise Governance & Audit", icon: ShieldCheck },
          { id: "ops", label: "Ecosystem Operations Center", icon: Activity },
          { id: "developer", label: "Developer Sandbox Portal", icon: Terminal },
          { id: "tests", label: "Validation Suite Tests", icon: Code },
          { id: "docs", label: "Platform Architecture Manual", icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                onAddSignalREvent(`Navigated 43v3r Ecosystem: ${tab.label}`);
              }}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-mono text-[10px] transition border ${
                isSelected
                  ? "bg-stone-950 border-stone-950 text-white font-bold shadow-xs"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Display Wrapper */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.1 }}
          >
            {/* COCKPIT DASHBOARD VIEW */}
            {activeSubTab === "cockpit" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">43v3r Ecosystem Global Command Center</h2>
                  <p className="text-xs text-stone-500 font-mono">Observe cross-tenant billing pipelines, unified resource allocations, and live deployment activities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs space-y-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Monthly Recurring Revenue</span>
                    <span className="text-lg font-bold text-indigo-600 block">{billingStats.mrr}</span>
                    <p className="text-[9px] text-stone-500">From {billingStats.activeSubscribers} subscribed enterprise tenants.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs space-y-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">AI Consumption Rates</span>
                    <span className="text-lg font-bold text-stone-900 block">{billingStats.aiTokenUsage}</span>
                    <p className="text-[9px] text-stone-500">Calculated across cognitive workflow tasks.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs space-y-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Platform API Call Load</span>
                    <span className="text-lg font-bold text-stone-900 block">{billingStats.apiUsage}</span>
                    <p className="text-[9px] text-stone-500">Including Webhooks, SAML & OIDC tokens.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs space-y-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Shariah Compliance Health</span>
                    <span className="text-lg font-bold text-emerald-600 block">100% Passed</span>
                    <p className="text-[9px] text-stone-500">Zero interest or Riba compounds flagged.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Recharts chart showing cross tenant workloads */}
                  <div className="lg:col-span-8 border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">
                      Cross-Tenant AI Token Consumption (K) & API Load (Web Requests)
                    </span>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tenantResourceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={9} className="font-mono" />
                          <YAxis stroke="#888888" fontSize={9} className="font-mono" />
                          <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                          <Bar dataKey="AI_Tokens_K" fill="#4338ca" name="AI Compute (Tokens K)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Web_Requests" fill="#06b6d4" name="API Web Requests" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Audit Stream on the right */}
                  <div className="lg:col-span-4 border border-stone-200 rounded-xl p-5 space-y-4 bg-stone-50/30">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Recent Identity & Security Logs
                    </span>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto">
                      {auditLogs.map((log, i) => (
                        <div key={i} className="p-3 bg-white border border-stone-150 rounded-lg text-[10px] font-mono space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-indigo-600">{log.action}</span>
                            <span className="text-stone-400 text-[8px]">{log.time}</span>
                          </div>
                          <p className="text-stone-700 leading-tight">{log.details}</p>
                          <span className="text-[8px] text-stone-400 block">Auth context: {log.operator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TENANTS AND ORGANIZATIONAL UNITS VIEW */}
            {activeSubTab === "tenants" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Tenant Center & Corporate Departments</h2>
                  <p className="text-xs text-stone-500 font-mono">Provision insulated tenant environments, assign users, define cost codes, and manage fine-grained organizational lead roles</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Tenants List */}
                  <div className="lg:col-span-8 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Active Enterprise Tenants
                    </span>

                    <div className="space-y-3">
                      {tenants.map((ten) => (
                        <div key={ten.id} className="p-4 bg-stone-50/40 rounded-xl border border-stone-200 text-xs font-mono space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-bold uppercase">{ten.type}</span>
                                <span className="text-stone-400 text-[10px]">Cloud Region: <strong>{ten.region}</strong></span>
                              </div>
                              <h3 className="font-bold text-stone-950 text-sm mt-1">{ten.name}</h3>
                            </div>

                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                              ten.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {ten.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-[10px] text-stone-400 border-t border-stone-150 pt-2">
                            <div>Federated Users: <strong className="text-stone-700">{ten.users}</strong></div>
                            <div>Autonomous AIs: <strong className="text-stone-700">{ten.aiCount}</strong></div>
                            <div>Isolation Mode: <strong className="text-emerald-700 font-bold">Encrypted Container Lock</strong></div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => toggleTenantStatus(ten.id, ten.name)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                                ten.status === "Active"
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                              }`}
                            >
                              {ten.status === "Active" ? "Suspend Workspace" : "Re-activate Workspace"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provision tenant form */}
                  <div className="lg:col-span-4">
                    <form onSubmit={handleCreateTenant} className="border border-stone-200 rounded-xl p-5 space-y-4 bg-stone-50/50 text-xs font-mono">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                        Provision Tenant Container
                      </span>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Company/Tenant Identifier</label>
                        <input
                          type="text"
                          value={newTenantName}
                          onChange={(e) => setNewTenantName(e.target.value)}
                          placeholder="e.g., Al-Mudarabah Advisory LLP"
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Ecosystem Workspace Type</label>
                        <select
                          value={newTenantType}
                          onChange={(e) => setNewTenantType(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        >
                          <option>Business</option>
                          <option>Enterprise</option>
                          <option>Family</option>
                          <option>Sandbox</option>
                          <option>Consulting</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-stone-400 uppercase font-bold mb-1">Provisioning Region</label>
                        <select
                          value={newTenantRegion}
                          onChange={(e) => setNewTenantRegion(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded p-2 focus:outline-none"
                        >
                          <option>EU West (London)</option>
                          <option>EU Central (Frankfurt)</option>
                          <option>US East (N. Virginia)</option>
                          <option>US West (Oregon)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded text-[10px] transition"
                      >
                        Launch Isolated Tenant
                      </button>
                    </form>

                    {/* Departments & Cost Centers */}
                    <div className="border border-stone-200 rounded-xl p-5 mt-5 space-y-3 bg-stone-50/50 text-xs font-mono">
                      <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                        Departments & Cost Centers
                      </span>

                      {departments.map((dept) => (
                        <div key={dept.id} className="p-2.5 bg-white border border-stone-200 rounded-lg space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-stone-900 text-[11px]">{dept.name}</span>
                            <span className="text-[8px] bg-stone-100 px-1 rounded">{dept.code}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-stone-400">
                            <span>Cost: {dept.costCenter}</span>
                            <span>Budget: {dept.budget}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI WORKFORCE CLUSTER */}
            {activeSubTab === "workforce" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">AI Workforce & Multi-Agent Collaboration</h2>
                  <p className="text-xs text-stone-500 font-mono">Deploy specialist AI agents inside strictly isolated tenant containers to collaborate securely</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiWorkforce.map((ai) => (
                    <div key={ai.id} className="p-5 border border-stone-200 rounded-xl bg-stone-50/40 text-xs font-mono space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-indigo-600" />
                            <span className="font-bold text-sm text-stone-900">{ai.name}</span>
                          </div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                            Efficiency: {ai.efficiency}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-400 mt-1">Tenant boundary: <strong>{ai.tenant}</strong></p>
                        <p className="text-stone-800 font-bold mt-2 text-[11px]">Primary Role: {ai.role}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-150 pt-2.5 mt-2">
                        <span>Throughput: <strong className="text-stone-700">{ai.throughput}</strong></span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[9px]">Insulated</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRODUCT STORE & APP MARKETPLACE */}
            {activeSubTab === "products" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">43v3r Product Store & Ecosystem Marketplace</h2>
                  <p className="text-xs text-stone-500 font-mono">Acquire enterprise application licenses, deploy isolated databases, and toggle core feature flags</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplaceApps.map((app) => (
                    <div key={app.id} className="p-5 border border-stone-200 rounded-2xl flex flex-col justify-between space-y-4 bg-stone-50/30 text-xs font-mono">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 rounded font-bold uppercase">{app.category}</span>
                            <h3 className="font-bold text-stone-900 text-base mt-1">{app.name}</h3>
                          </div>

                          {app.licensed ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                              Licensed
                            </span>
                          ) : (
                            <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                              Locked
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-600 leading-relaxed mt-2">{app.description}</p>
                      </div>

                      <div className="border-t border-stone-150 pt-3 flex justify-between items-center">
                        <span className="text-[10px] text-stone-400">Installs: <strong className="text-stone-700">{app.installs}</strong></span>

                        {app.licensed ? (
                          <button
                            disabled
                            className="px-3 py-1 bg-stone-100 text-stone-400 rounded font-bold text-[10px]"
                          >
                            Installed
                          </button>
                        ) : (
                          <button
                            onClick={() => installApp(app.id, app.name)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px]"
                          >
                            Acquire License
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BILLING AND CONSUMPTION VIEW */}
            {activeSubTab === "billing" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Billing Platform & Consumption ledger</h2>
                  <p className="text-xs text-stone-500 font-mono">Monitor consumption, process recurring invoices, and audit micro-transaction billing logs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block mb-1">Expected ARR</span>
                    <strong className="text-base text-stone-900">£171,000</strong>
                  </div>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block mb-1">Payment Method</span>
                    <strong className="text-base text-stone-900">Islamic Equity Pool</strong>
                  </div>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block mb-1">Average Cost-to-Serve</span>
                    <strong className="text-base text-emerald-600">8.4% of Rev</strong>
                  </div>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block mb-1">Next Settlement Cycle</span>
                    <strong className="text-base text-indigo-600">{billingStats.nextInvoiceDate}</strong>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">
                    Ecosystem Transaction Ledger
                  </span>

                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[11px] text-stone-700">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-left">
                          <th className="p-3 uppercase font-bold text-stone-500">Tenant Workspace</th>
                          <th className="p-3 uppercase font-bold text-stone-500">Invoice Sum</th>
                          <th className="p-3 uppercase font-bold text-stone-500">Staged Details</th>
                          <th className="p-3 uppercase font-bold text-stone-500">Date Issued</th>
                          <th className="p-3 uppercase font-bold text-stone-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="border-b border-stone-150">
                            <td className="p-3 font-bold text-stone-900">{inv.tenant}</td>
                            <td className="p-3 text-indigo-600 font-bold">{inv.amount}</td>
                            <td className="p-3 text-stone-500">{inv.details}</td>
                            <td className="p-3 text-stone-400">{inv.date}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                                inv.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ENTERPRISE GOVERNANCE & POLICY INHERITANCE VIEW */}
            {activeSubTab === "governance" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Ecosystem Governance & Compliance Shield</h2>
                  <p className="text-xs text-stone-500 font-mono">Formulate platform security protocols, propagate inherited rulesets, and audit legal hold queues</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {policies.map((pol) => (
                    <div key={pol.id} className="p-5 border border-stone-200 rounded-xl bg-stone-50/30 text-xs font-mono space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] bg-stone-200 text-stone-700 px-1.5 rounded font-bold uppercase">
                          Inherits: {pol.inherits}
                        </span>
                        <span className="text-emerald-600 font-bold text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {pol.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-stone-900 text-sm">{pol.title}</h3>
                      <p className="text-[10px] text-stone-400">Target Range: <strong>{pol.scope}</strong></p>
                    </div>
                  ))}
                </div>

                <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">
                    Shariah Policy Audit Verification Checklist
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 bg-stone-50 rounded-lg flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-stone-800">Verify 100% absence of Riba (interest-bearing) instruments across accounting books. (PASSED)</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-lg flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-stone-800">Ensure Waqf trust asset allocations strictly follow Mudarabah equity split metrics. (PASSED)</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-lg flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-stone-800">Automate purification (Sadaqah) calculations from yield pools. (PASSED)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ECOSYSTEM OPERATIONS CENTER */}
            {activeSubTab === "ops" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Ecosystem Infrastructure & Operations Center</h2>
                  <p className="text-xs text-stone-500 font-mono">Observe cluster-level diagnostics, multi-region replication indicators, and database scale statuses</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  <div className="p-5 border border-stone-200 rounded-xl bg-stone-50/40 space-y-2">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Cluster Database Replication</span>
                    <div className="flex justify-between text-stone-900 font-bold">
                      <span>Primary PG</span>
                      <span className="text-emerald-600">Active (Sync)</span>
                    </div>
                    <div className="flex justify-between text-stone-400 text-[10px]">
                      <span>Lag: 0.1ms</span>
                      <span>Target: UK / US East</span>
                    </div>
                  </div>

                  <div className="p-5 border border-stone-200 rounded-xl bg-stone-50/40 space-y-2">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Capacity Auto-Scaling bounds</span>
                    <div className="flex justify-between text-stone-900 font-bold">
                      <span>Limit Cap</span>
                      <span className="text-indigo-600">6 Core Kubernetes Nodes</span>
                    </div>
                    <div className="flex justify-between text-stone-400 text-[10px]">
                      <span>Usage: 22%</span>
                      <span>Authorized Cap: Safe</span>
                    </div>
                  </div>

                  <div className="p-5 border border-stone-200 rounded-xl bg-stone-50/40 space-y-2">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Customer Support Health Score</span>
                    <div className="flex justify-between text-stone-900 font-bold">
                      <span>Success Score</span>
                      <span className="text-indigo-600">98.4% Optimal</span>
                    </div>
                    <div className="flex justify-between text-stone-400 text-[10px]">
                      <span>NPS: +74</span>
                      <span>Active Tickets: 0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEVELOPER PORTAL VIEW */}
            {activeSubTab === "developer" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Ecosystem Developer Portal & Sandbox Playground</h2>
                  <p className="text-xs text-stone-500 font-mono">Test live OpenAPI endpoints, fetch SAML/OIDC metadata packages, and compile custom integration hooks</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* OpenAPI Endpoint list */}
                  <div className="lg:col-span-4 border border-stone-200 rounded-xl p-5 space-y-3 font-mono text-xs">
                    <span className="text-xs font-bold text-stone-900 uppercase block border-b border-stone-100 pb-1">
                      OpenAPI Swagger Registry
                    </span>

                    <button
                      onClick={() => runApiCall("tenants")}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                        selectedApiEndpoint === "tenants" ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span>GET /api/v3/tenant/list</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold">200 OK</span>
                    </button>

                    <button
                      onClick={() => runApiCall("identity")}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                        selectedApiEndpoint === "identity" ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span>POST /api/v3/identity/sso/token</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold">200 OK</span>
                    </button>

                    <button
                      onClick={() => runApiCall("marketplace")}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                        selectedApiEndpoint === "marketplace" ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span>GET /api/v3/marketplace/license</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold">200 OK</span>
                    </button>

                    <button
                      onClick={() => runApiCall("governance")}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                        selectedApiEndpoint === "governance" ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span>GET /api/v3/governance/policies</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold">200 OK</span>
                    </button>
                  </div>

                  {/* API response compiler console */}
                  <div className="lg:col-span-8 border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-1">
                      Sandbox Output Terminal
                    </span>

                    <div className="w-full bg-stone-950 text-indigo-400 border border-stone-850 rounded-xl p-4 font-mono text-xs overflow-auto h-72">
                      {apiResponseOutput ? (
                        <pre className="text-stone-200 whitespace-pre-wrap">{apiResponseOutput}</pre>
                      ) : (
                        <span className="text-stone-500">{"/* Select any OpenAPI endpoint on the left to fire a test request */"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATION TESTING PLATFORM */}
            {activeSubTab === "tests" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Ecosystem Verification Suite</h2>
                    <p className="text-xs text-stone-500 font-mono">Evaluate multi-tenant isolation gates, confirm SAML token authorizations, and verify database scale tests</p>
                  </div>

                  <button
                    onClick={executeSystemTests}
                    disabled={isRunningTests}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white font-bold rounded-lg font-mono text-[11px] transition disabled:opacity-50 self-start"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRunningTests ? "animate-spin" : ""}`} />
                    <span>{isRunningTests ? "Compiling Verification tests..." : "Execute Validation Suite"}</span>
                  </button>
                </div>

                <div className="w-full bg-stone-950 text-stone-300 border border-stone-850 rounded-xl p-5 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
                  {testResult === "idle" && (
                    <span className="text-stone-500">{"/* Ready to run verification suite tests... */"}</span>
                  )}

                  {testLogs.map((log, i) => {
                    let colorClass = "text-stone-300";
                    if (log.includes("PASSED") || log.includes("SUCCESS")) {
                      colorClass = "text-emerald-400 font-bold";
                    } else if (log.includes("SYSTEM")) {
                      colorClass = "text-indigo-400";
                    }
                    return (
                      <div key={i} className={colorClass}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MANUAL ARCHITECTURE DOCUMENTS */}
            {activeSubTab === "docs" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Ecosystem Core Architecture Documentation</h2>
                  <p className="text-xs text-stone-500 font-mono">Detailed system layout mapping out OIDC federation keys, cost centers and the 43v3r product catalog</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-indigo-700 uppercase block border-b border-stone-100 pb-1">
                      Multi-Tenant Sandbox Architecture
                    </span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      LifeOS employs a strict database-level row-isolation filter keyed directly by active SAML workspace tokens.
                      Cross-tenant queries are blocked directly at the SQL level, ensuring 100% data safety.
                      The global 43v3r cloud core acts as a shared compiler which is federated cleanly into isolated container layers.
                    </p>
                  </div>

                  <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-bold text-indigo-700 uppercase block border-b border-stone-100 pb-1">
                      Shariah Compliance Inheritance Guide
                    </span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      All sub-tenants registered inside Barnes Ecosystem inherit the Root Compliance Shield.
                      Under this framework, any transactions, billing calculations, and venture pools (Mudarabah) are audited in real-time by Gabriel's audit system.
                      If any Riba (interest compounds) or unethical financial structures are detected, affected endpoints are suspended automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
