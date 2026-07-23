import React, { useState, useEffect } from "react";
import {
  Cpu,
  Layers,
  Smartphone,
  ShieldAlert,
  Terminal,
  Activity,
  History,
  TrendingUp,
  Sliders,
  Sparkles,
  Download,
  Info,
  Flame,
  Binary,
  ArrowRight,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  Server,
  Cloud,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Plus,
  Compass,
  FileText,
  Search,
  Book,
  Code,
  Settings,
  AlertTriangle,
  Key,
  Database,
  Lock,
  Boxes,
  HelpCircle,
  Copy,
  ChevronRight,
  Clock,
  WifiOff,
  UserCheck,
  Check,
  Send,
  Workflow
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
  LineChart as RechartsLineChart,
  Line
} from "recharts";

interface ProductionOperationsViewProps {
  onAddSignalREvent?: (msg: string) => void;
  onUpdateScore?: () => void;
}

export default function ProductionOperationsView({
  onAddSignalREvent = () => {},
  onUpdateScore = () => {}
}: ProductionOperationsViewProps) {
  // Navigation tabs for the Operations Center
  const [activeSubTab, setActiveSubTab] = useState<
    "devsecops" | "mobile" | "security" | "observability" | "dr" | "performance" | "evolving_ai" | "plugins"
  >("devsecops");

  // Local Storage state helper
  const STORAGE_KEY_PREFIX = "lifeos_p10_";
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

  // State definitions
  const [offlineMode, setOfflineMode] = useState(() => loadState("offlineMode", false));
  const [selectedMobileApp, setSelectedMobileApp] = useState<"life" | "islam" | "business">("life");
  const [mobileSyncQueue, setMobileSyncQueue] = useState<any[]>(() => loadState("mobileSyncQueue", [
    { id: "q_1", module: "IslamOS", action: "Salah congregation record", status: "Synced", payload: { prayer: "Asr", congregation: true } },
    { id: "q_2", module: "Vault", action: "Audit wallet signature", status: "Synced", payload: { amount: "£1,400", destination: "Purification Purge" } },
    { id: "q_3", module: "EnterpriseOS", action: "Chore balancing logs", status: "Pending Sync", payload: { partner: "Aisha", ratio: "50/50" } }
  ]));

  const [deploymentStrategy, setDeploymentStrategy] = useState<"blue-green" | "canary">("blue-green");
  const [deploymentProgress, setDeploymentProgress] = useState(100);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [activeDeploymentCluster, setActiveDeploymentCluster] = useState("Blue Cluster (Active)");

  const [threatLevel, setThreatLevel] = useState("Low Risk");
  const [securityScore, setSecurityScore] = useState(99.4);
  const [passkeysRegistered, setPasskeysRegistered] = useState(() => loadState("passkeysRegistered", true));
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [keyRotationLog, setKeyRotationLog] = useState<string[]>([]);

  const [activeTraces, setActiveTraces] = useState<any[]>(() => loadState("activeTraces", [
    { id: "t_1", span: "HTTP GET /api/v1/twin/state", latency: "14ms", status: "200 OK", traceId: "0fa23e...98" },
    { id: "t_2", span: "SignalR Publish: DailyScoreUpdate", latency: "8ms", status: "Delivered", traceId: "3df120...bb" },
    { id: "t_3", span: "Vector DB Query: Shariah Compliance Check", latency: "42ms", status: "Resolved", traceId: "ca7710...ff" },
    { id: "t_4", span: "Background Worker: Habit Consistency Engine", latency: "112ms", status: "Completed", traceId: "8ee442...ee" }
  ]));

  const [selectedDRScope, setSelectedDRScope] = useState("All Databases");
  const [drRecoveryLog, setDrRecoveryLog] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);

  // Performance Benchmarking
  const [latencyData, setLatencyData] = useState([
    { name: "Concurrent: 100", dbLatency: 4, aiLatency: 280, networkLatency: 12 },
    { name: "Concurrent: 500", dbLatency: 8, aiLatency: 310, networkLatency: 18 },
    { name: "Concurrent: 1000", dbLatency: 15, aiLatency: 360, networkLatency: 28 },
    { name: "Concurrent: 5000", dbLatency: 38, aiLatency: 480, networkLatency: 52 },
    { name: "Concurrent: 10000", dbLatency: 72, aiLatency: 690, networkLatency: 84 }
  ]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [activeBenchmarkMetric, setActiveBenchmarkMetric] = useState("");

  // Evolving AI
  const [promptVersions, setPromptVersions] = useState<any[]>(() => loadState("promptVersions", [
    { id: "p_1", agent: "Gabriel Strategist", version: "v4.2.0", accuracy: "98.8%", tokenSaving: "-24%", active: true },
    { id: "p_2", agent: "Durable Ledgers Auditor", version: "v2.1.4", accuracy: "99.9%", tokenSaving: "-15%", active: true },
    { id: "p_3", agent: "Halaal Screener Bot", version: "v3.0.1", accuracy: "97.5%", tokenSaving: "-30%", active: true }
  ]));
  const [aiEvaluations, setAiEvaluations] = useState<any[]>(() => loadState("aiEvaluations", [
    { id: "e_1", evaluation: "Strategic Vision Alignment Rule #4", rating: "Excellent", date: "Just now", status: "Policy Synced" },
    { id: "e_2", evaluation: "Islamic Juristic Halal Stock Screening Validation", rating: "Verified", date: "02 Hours Ago", status: "Policy Synced" },
    { id: "e_3", evaluation: "Double-Entry Bookkeeping Ledger Integrity Checks", rating: "Excellent", date: "04 Hours Ago", status: "Verified" }
  ]));

  // Modular Plugins
  const [installedPlugins, setInstalledPlugins] = useState<any[]>(() => loadState("installedPlugins", [
    { id: "pl_1", name: "Fitbit IoT Ingestion Adapter", version: "1.0.4", creator: "LifeOS Core", rating: "5.0", permissions: "Health, Location", status: "Active" },
    { id: "pl_2", name: "Stripe Halal Purifier Processor", version: "2.1.0", creator: "Project Jannah Devs", rating: "4.9", permissions: "Finances, Ledger", status: "Active" },
    { id: "pl_3", name: "WhatsApp Notification Gateway", version: "3.2.1", creator: "Gabriel Labs", rating: "4.8", permissions: "Messaging", status: "Active" }
  ]));
  const [availablePlugins, setAvailablePlugins] = useState<any[]>([
    { id: "pl_4", name: "Obsidian Vector Sync", version: "1.1.2", creator: "Community Contributors", description: "Real-time sync of Obsidian vault directly into Qdrant vectors.", permissions: "Knowledge Hub", rating: "4.7" },
    { id: "pl_5", name: "Google Calendar Event Broker", version: "2.0.0", creator: "Google API Workspace", description: "Durable bi-directional exchange broker with Microsoft Exchange.", permissions: "Calendar, Core Scheduler", rating: "5.0" },
    { id: "pl_6", name: "Quranic Daily Verse Engine", version: "1.5.0", creator: "IslamOS Foundation", description: "Contextual verse parsing corresponding to current focal stresses.", permissions: "Faith Records", rating: "4.9" }
  ]);

  // Code Template Viewer
  const [activeCodeViewer, setActiveCodeViewer] = useState<"docker" | "k8s" | "helm" | "nginx">("docker");
  const codeTemplates = {
    docker: `# MULTI-STAGE HIGHLY OPTIMIZED DOCKERFILE FOR LIFEOS CORE
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /app

# Copy csproj and restore distinct layers
COPY src/LifeOS.Core/*.csproj ./src/LifeOS.Core/
RUN dotnet restore ./src/LifeOS.Core/

# Copy everything else and build release
COPY . ./
RUN dotnet publish src/LifeOS.Core/LifeOS.Core.csproj -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build-env /app/out .

# Configure security headers and non-root user
RUN groupadd -r lifeos_user && useradd -r -g lifeos_user lifeos_user
USER lifeos_user

ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["dotnet", "LifeOS.Core.dll"]`,
    k8s: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: lifeos-core-deployment
  namespace: project-jannah-prod
  labels:
    app: lifeos-core
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lifeos-core
  template:
    metadata:
      labels:
        app: lifeos-core
    spec:
      containers:
      - name: lifeos-core
        image: projectjannah.azurecr.io/lifeos-core:v1.0.0
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "1"
            memory: "1024Mi"
          requests:
            cpu: "250m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10`,
    helm: `# HELM CHART CONFIGURATION - VALUES.YAML
global:
  environment: production
  tenantMode: multi-tenant

replicaCount: 3

image:
  repository: projectjannah.azurecr.io/lifeos-core
  pullPolicy: IfNotPresent
  tag: "v1.0.0"

service:
  type: ClusterIP
  port: 3000

ingress:
  enabled: true
  className: traefik
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: prod.lifeos.io
      paths:
        - path: /
          pathType: ImplementationSpecific`,
    nginx: `# TRAEFIK / NGINX REVERSE PROXY LAYER
server {
    listen 80;
    server_name prod.lifeos.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name prod.lifeos.io;

    ssl_certificate /etc/letsencrypt/live/prod.lifeos.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prod.lifeos.io/privkey.pem;
    
    # Secure parameters
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    location / {
        proxy_pass http://lifeos-core-service:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`
  };

  // State save hooks
  useEffect(() => { saveState("offlineMode", offlineMode); }, [offlineMode]);
  useEffect(() => { saveState("mobileSyncQueue", mobileSyncQueue); }, [mobileSyncQueue]);
  useEffect(() => { saveState("passkeysRegistered", passkeysRegistered); }, [passkeysRegistered]);
  useEffect(() => { saveState("promptVersions", promptVersions); }, [promptVersions]);
  useEffect(() => { saveState("aiEvaluations", aiEvaluations); }, [aiEvaluations]);
  useEffect(() => { saveState("installedPlugins", installedPlugins); }, [installedPlugins]);

  // Execute Canary/Blue-Green Deployments
  const triggerProductionDeployment = () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentLog([]);
    onAddSignalREvent(`Triggered enterprise ${deploymentStrategy} zero-downtime deployment.`);

    const steps = [
      `Initializing production pipeline validation for Version 1.0.0 (Codename: Project Jannah)...`,
      `Auditing security headers & verification hashes across EF Core, SQL Server schema.`,
      `Validating Docker container images against Azure container registry.`,
      deploymentStrategy === "blue-green"
        ? `Bootstrapping Green Cluster. Synchronizing environment variables with Vault.`
        : `Spinning up Canary pods. Routing 10% of global traffic to Canary...`,
      `Applying database migration scripts. Seed schema verified...`,
      `Warming up cache layers. Distributed trace diagnostic pinging Jaeger...`,
      deploymentStrategy === "blue-green"
        ? `Switching active Traefik gateway from Blue to Green Cluster.`
        : `Scaling Canary deployment to 100%. Dismantling previous version pods.`,
      `Enterprise release successfully rolled out. Zero downtime achieved.`
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setDeploymentLog(prev => [...prev, `[DEPLOYMENT] ${steps[current]}`]);
        setDeploymentProgress(Math.floor(((current + 1) / steps.length) * 100));
        current++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        setActiveDeploymentCluster(
          deploymentStrategy === "blue-green" ? "Green Cluster (Active)" : "Global Cluster (V1.0.0 Canary Stable)"
        );
        onAddSignalREvent(`Production deployment for Project Jannah complete! Version 1.0.0 online.`);
        onUpdateScore();
      }
    }, 400);
  };

  // Cryptographic key rotation
  const triggerKeyRotation = () => {
    setIsRotatingKeys(true);
    setKeyRotationLog([]);
    onAddSignalREvent("Triggered automated cryptographic key rotation.");

    const steps = [
      "Accessing vault key storage vault://keys/jannah_production_rsa...",
      "Generating new 4096-bit private keys...",
      "Encrypting current database secrets with new generation key...",
      "Updating JWT token signers without breaking active mobile sessions...",
      "Rotating encryption passkeys for Local Mobile offline databases.",
      "Destructively overwriting old keys in storage memory.",
      "Rotation process complete. Keys successfully propagated to all micro-tenants."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setKeyRotationLog(prev => [...prev, `[VAULT] ${steps[current]}`]);
        current++;
      } else {
        clearInterval(interval);
        setIsRotatingKeys(false);
        setSecurityScore(99.8);
        onAddSignalREvent("Vault rotated keys cleanly. System security status upgraded to 99.8%.");
        onUpdateScore();
      }
    }, 350);
  };

  // Disaster Recovery Simulator
  const triggerDisasterRecovery = () => {
    setIsRestoring(true);
    setDrRecoveryLog([]);
    onAddSignalREvent(`Disaster Recovery sequence initiated for: ${selectedDRScope}`);

    const steps = [
      `Enacting DR playbook: Emergency Point-In-Time Restore...`,
      `Isolating active production clusters to prevent replication drift.`,
      `Acquiring cloud cold snapshot dated [2026-07-06 00:00:00 UTC] from Azure Blob storage.`,
      `Validating backup hash: SHA-256 integrity verified.`,
      `Reconstructing relational tables in SQL Server...`,
      `Rebuilding 12.4M Qdrant vector dimensions...`,
      `Restoring user Ethan's cognitive and faith profiles...`,
      `Verifying Shariah compliant Ledger consistency values: Matches perfectly.`,
      `Restoration successfully finished. Systems brought back online.`
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setDrRecoveryLog(prev => [...prev, `[DR PLAYBOOK] ${steps[current]}`]);
        current++;
      } else {
        clearInterval(interval);
        setIsRestoring(false);
        onAddSignalREvent("Disaster recovery restoration successfully verified. Integrity check: Passed.");
        onUpdateScore();
      }
    }, 400);
  };

  // Performance Load Testing
  const triggerBenchmark = (type: string) => {
    setIsBenchmarking(true);
    setActiveBenchmarkMetric(`Running ${type}...`);
    onAddSignalREvent(`Dispatched performance load tests targeting ${type}.`);

    setTimeout(() => {
      setIsBenchmarking(false);
      setActiveBenchmarkMetric(`${type} Completed: 9,450 req/sec | Avg Latency: 12.4ms.`);
      onAddSignalREvent(`Performance benchmark completed. 100% request success rate.`);
      onUpdateScore();
    }, 1200);
  };

  // Add simulated mobile sync event
  const simulateMobileAction = (action: string) => {
    const newItem = {
      id: "q_" + Date.now(),
      module: selectedMobileApp === "life" ? "LifeOS Mobile" : selectedMobileApp === "islam" ? "IslamOS Mobile" : "BusinessOS Mobile",
      action: action,
      status: "Synced",
      payload: { timestamp: new Date().toLocaleTimeString(), client: "iPhone 15 Pro" }
    };

    setMobileSyncQueue(prev => [newItem, ...prev]);
    onAddSignalREvent(`Mobile Sync Event: ${action} pushed from client.`);
    onUpdateScore();
  };

  // Self Evolving AI: Evaluate & Promote
  const promotePromptVersion = (id: string) => {
    setPromptVersions(prev =>
      prev.map(p => (p.id === id ? { ...p, version: `v${parseFloat(p.version.substring(1)) + 0.1}`.substring(0, 5) } : p))
    );
    const updated = promptVersions.find(p => p.id === id);
    onAddSignalREvent(`Promoted Agent: ${updated?.agent} to next self-evolved prompt version.`);
    onUpdateScore();
  };

  // Plugin Marketplace install
  const installPlugin = (plugin: any) => {
    setInstalledPlugins(prev => [...prev, { ...plugin, status: "Active" }]);
    setAvailablePlugins(prev => prev.filter(p => p.id !== plugin.id));
    onAddSignalREvent(`Successfully installed & sandboxed plugin: ${plugin.name}`);
    onUpdateScore();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-mono text-xs uppercase tracking-wider font-bold">
            <Cpu className="h-4 w-4" />
            <span>Operational Console • Phase 10 Enterprise Release</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            LifeOS Production Operations & DevSecOps Platform
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-3xl font-mono">
            CODENAME: PROJECT JANNAH • KUBERNETES MICRO-SERVICES • OFFLINE SYNC SYSTEM • AUTOMATED DISASTER RECOVERY • PLUGINS
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center space-x-4">
          <div className="text-right font-mono">
            <span className="text-[9px] text-stone-400 block uppercase font-bold">Security Compliance</span>
            <span className="text-sm font-bold text-emerald-600">{securityScore}% Checked</span>
          </div>
          <div className="text-right font-mono border-l border-stone-200 pl-4">
            <span className="text-[9px] text-stone-400 block uppercase font-bold">Active Cluster</span>
            <span className="text-xs font-bold text-indigo-600">{activeDeploymentCluster.split(" ")[0]}</span>
          </div>
        </div>
      </div>

      {/* Nav Sub-Tabs */}
      <div className="flex flex-wrap gap-1 bg-stone-50 border border-stone-200 p-1.5 rounded-xl">
        {[
          { id: "devsecops", label: "DevSecOps & Cluster Deployment", icon: Server },
          { id: "mobile", label: "Mobile Apps & Offline-First Sync", icon: Smartphone },
          { id: "security", label: "Enterprise Identity & Keys", icon: ShieldCheck },
          { id: "observability", label: "Distributed Trace & Loki", icon: Activity },
          { id: "dr", label: "Disaster Recovery Playbooks", icon: RotateCcw },
          { id: "performance", label: "Performance Benchmarks", icon: Sliders },
          { id: "evolving_ai", label: "Evolving Prompt Framework", icon: Sparkles },
          { id: "plugins", label: "Plugin Marketplace & SDK", icon: Boxes }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                onAddSignalREvent(`Navigated to Operations Center: ${tab.label}`);
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

      {/* Main Viewport Content Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* SUBTAB 1: DEVSECOPS & DEPLOYMENT CENTER */}
            {activeSubTab === "devsecops" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Zero-Downtime Deployment & Kubernetes Ecosystem</h2>
                  <p className="text-xs text-stone-500 font-mono">Manage continuous delivery pipelines, scale micro-service replicas, and run blue-green infrastructure transitions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Deployment Trigger */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Release Control Enclave</span>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Target Cluster Strategy</label>
                        <select
                          value={deploymentStrategy}
                          onChange={(e) => setDeploymentStrategy(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                        >
                          <option value="blue-green">Blue-Green Release (Zero Downtime)</option>
                          <option value="canary">Canary 10% Segment Deployment</option>
                        </select>
                      </div>

                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-stone-500 uppercase font-bold">Active Cluster:</span>
                          <span className="font-bold text-indigo-700">{activeDeploymentCluster}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-stone-500 uppercase font-bold">Ready Replicas:</span>
                          <span className="font-bold text-emerald-600">3 / 3 Healthy pods</span>
                        </div>
                      </div>

                      {isDeploying && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>Deploying Release...</span>
                            <span>{deploymentProgress}%</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full transition-all duration-300"
                              style={{ width: `${deploymentProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={triggerProductionDeployment}
                        disabled={isDeploying}
                        className="w-full py-2 bg-stone-950 text-white rounded-lg font-bold text-[10px] flex items-center justify-center space-x-2 hover:bg-stone-800 transition disabled:opacity-50"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Deploy Version 1.0.0 Release</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Terminal Log */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">Deployment Actions & Logs</span>
                      <span className="text-[9px] text-stone-400 font-mono">Kubernetes Pipeline Active</span>
                    </div>

                    <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-48 overflow-y-auto">
                      {deploymentLog.length === 0 ? (
                        <span className="text-stone-500">System idle. Ready to deploy production-grade Project Jannah container.</span>
                      ) : (
                        deploymentLog.map((log, index) => (
                          <div key={index} className="leading-relaxed">
                            <span className="text-indigo-400">{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Docker, Kubernetes & Helm Templates Viewer */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase">Production Manifests & CI/CD Config Files</span>
                    <div className="flex space-x-1.5">
                      {(["docker", "k8s", "helm", "nginx"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setActiveCodeViewer(mode)}
                          className={`px-2.5 py-1 rounded font-mono text-[9px] uppercase font-bold transition ${
                            activeCodeViewer === mode
                              ? "bg-stone-900 text-white"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {mode === "docker"
                            ? "Dockerfile"
                            : mode === "k8s"
                            ? "K8s Deployment"
                            : mode === "helm"
                            ? "Helm Values"
                            : "Nginx Gateway"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="bg-stone-50 text-stone-800 text-[10px] font-mono p-5 rounded-xl overflow-x-auto border border-stone-200 leading-relaxed max-h-80">
                      {codeTemplates[activeCodeViewer]}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeTemplates[activeCodeViewer]);
                        onAddSignalREvent(`Copied active configuration template: ${activeCodeViewer}`);
                      }}
                      className="absolute right-3 top-3 p-1.5 bg-white border border-stone-300 rounded hover:bg-stone-50 transition text-stone-600"
                      title="Copy code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: MOBILE PLATFORM & OFFLINE-FIRST SYNC */}
            {activeSubTab === "mobile" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Mobile Applications & Offline Ingestion Synchronizer</h2>
                  <p className="text-xs text-stone-500 font-mono">Test offline caching, simulate native devices (LifeOS, IslamOS, BusinessOS), and inspect background synchronization queues</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Interactive Mobile Phone frame */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-[310px] h-[610px] bg-stone-950 rounded-[40px] border-8 border-stone-800 shadow-xl relative overflow-hidden flex flex-col">
                      {/* Speaker / Camera Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-xl z-20 flex items-center justify-center">
                        <div className="w-10 h-1 bg-stone-900 rounded-full" />
                      </div>

                      {/* Phone Screen Internal */}
                      <div className="flex-1 bg-stone-900 text-stone-100 p-5 pt-8 flex flex-col overflow-y-auto">
                        {/* Status bar */}
                        <div className="flex items-center justify-between text-[8px] font-mono text-stone-400 mb-4">
                          <span>04:46 AM</span>
                          <div className="flex items-center space-x-1">
                            {offlineMode ? <WifiOff className="h-2.5 w-2.5 text-rose-500" /> : <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                            <span>{offlineMode ? "Offline" : "5G"}</span>
                          </div>
                        </div>

                        {/* App Switcher Inside phone */}
                        <div className="flex border-b border-stone-800 pb-2 mb-4 gap-1.5">
                          {(["life", "islam", "business"] as const).map((app) => (
                            <button
                              key={app}
                              onClick={() => setSelectedMobileApp(app)}
                              className={`flex-1 py-1 text-[8px] uppercase tracking-wider font-bold rounded text-center transition ${
                                selectedMobileApp === app
                                  ? "bg-indigo-600 text-white"
                                  : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                              }`}
                            >
                              {app === "life" ? "Life" : app === "islam" ? "Islam" : "Biz"}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Mobile Application Interface views */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            {selectedMobileApp === "life" && (
                              <div className="space-y-3">
                                <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1">
                                  <span className="text-[8px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">LifeOS Mobile Widget</span>
                                  <p className="text-[11px] font-bold">Focus Engine Score: 94%</p>
                                  <p className="text-[9px] text-stone-400">Sleep: 8.2 Hours • Habits: 8/10 Complete</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => simulateMobileAction("Logged daily calorie goal")}
                                    className="p-2 bg-stone-800 rounded-lg text-[9px] text-left hover:bg-stone-700 transition"
                                  >
                                    + Log Nutrition
                                  </button>
                                  <button
                                    onClick={() => simulateMobileAction("Completed high intensity run")}
                                    className="p-2 bg-stone-800 rounded-lg text-[9px] text-left hover:bg-stone-700 transition"
                                  >
                                    + Log Workout
                                  </button>
                                </div>
                              </div>
                            )}

                            {selectedMobileApp === "islam" && (
                              <div className="space-y-3">
                                <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-900/50 space-y-1">
                                  <span className="text-[8px] uppercase tracking-wider font-mono text-teal-400 block font-bold">IslamOS Mobile Companion</span>
                                  <p className="text-[11px] font-bold">Next Prayer: Fajr (04:15 AM)</p>
                                  <p className="text-[9px] text-stone-400">Today: 5/5 Prayers Congregation Logged</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => simulateMobileAction("Congregation prayer verified Fajr")}
                                    className="p-2 bg-stone-800 rounded-lg text-[9px] text-left hover:bg-stone-700 transition"
                                  >
                                    + Fajr Congregation
                                  </button>
                                  <button
                                    onClick={() => simulateMobileAction("Logged 100x Morning Dhikr")}
                                    className="p-2 bg-stone-800 rounded-lg text-[9px] text-left hover:bg-stone-700 transition"
                                  >
                                    + Log Dhikr Task
                                  </button>
                                </div>
                              </div>
                            )}

                            {selectedMobileApp === "business" && (
                              <div className="space-y-3">
                                <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1">
                                  <span className="text-[8px] uppercase tracking-wider font-mono text-orange-400 block font-bold">BusinessOS Mobile CRM</span>
                                  <p className="text-[11px] font-bold">Contracts: 3 Active clients</p>
                                  <p className="text-[9px] text-stone-400">Wonderware line tag OEE: 87.5%</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => simulateMobileAction("Generated quick business invoice")}
                                    className="p-2 bg-stone-800 rounded-lg text-[9px] text-left hover:bg-stone-700 transition"
                                  >
                                    $ Invoice Client
                                  </button>
                                  <button
                                    onClick={() => simulateMobileAction("Logged MES tag variance event")}
                                    className="p-2 bg-stone-800 rounded-lg text-[9px] text-left hover:bg-stone-700 transition"
                                  >
                                    ! Flag OEE Variance
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Voice Capture, document scanner simulation */}
                            <div className="border border-stone-800 p-2.5 rounded-xl space-y-2 text-[9px] font-mono">
                              <span className="text-stone-400 uppercase font-bold text-[7px] block">Capture Core Enclave</span>
                              <div className="flex space-x-1.5">
                                <button
                                  onClick={() => simulateMobileAction("Captured raw voice notes memo")}
                                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 rounded text-center text-rose-400"
                                >
                                  🎤 Dictation Memo
                                </button>
                                <button
                                  onClick={() => simulateMobileAction("Scanned corporate invoice PDF")}
                                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 rounded text-center text-teal-400"
                                >
                                  📄 Scan Document
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Biometrics FaceID mock */}
                          <div className="mt-6 border-t border-stone-800 pt-3 flex items-center justify-between text-[9px] text-stone-400 font-mono">
                            <span className="flex items-center space-x-1">
                              <UserCheck className="h-3 w-3 text-emerald-500" />
                              <span>FaceID Trusted</span>
                            </span>
                            <span>Battery: 88%</span>
                          </div>
                        </div>
                      </div>

                      {/* Phone Bottom Pill bar */}
                      <div className="h-5 bg-stone-950 flex items-center justify-center pb-2 z-20">
                        <div className="w-24 h-1 bg-stone-700 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Ingestion Sync parameters */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-900 font-mono uppercase">Offline Ingestion Sync Queue</span>
                        
                        {/* Offline Mode Toggle switcher */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-stone-500">Offline Mode Simulation:</span>
                          <button
                            onClick={() => {
                              setOfflineMode(!offlineMode);
                              onAddSignalREvent(`Mobile Network status changed: ${!offlineMode ? "Offline" : "Online"}`);
                            }}
                            className={`w-10 h-5 rounded-full p-0.5 transition ${
                              offlineMode ? "bg-rose-500" : "bg-stone-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                offlineMode ? "translate-x-5" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {offlineMode && (
                        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs font-mono">
                          <strong>Offline Cache Activated:</strong> Write events will pile up in the IndexedDB synchronization pipeline queue until network signal is restored.
                        </div>
                      )}

                      <div className="space-y-3 overflow-y-auto max-h-72">
                        {mobileSyncQueue.map((item) => (
                          <div key={item.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-stone-900">{item.module}</span>
                                <span className="text-[8px] font-mono bg-stone-100 text-stone-500 px-1 py-0.5 rounded uppercase">{item.action}</span>
                              </div>
                              <span className="text-[8px] text-stone-400 font-mono block mt-0.5">Payload: {JSON.stringify(item.payload)}</span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold ${
                              item.status === "Synced" ? "text-emerald-700" : "text-amber-700 animate-pulse"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {offlineMode && (
                        <button
                          onClick={() => {
                            setOfflineMode(false);
                            setMobileSyncQueue(prev =>
                              prev.map(q => ({ ...q, status: "Synced" }))
                            );
                            onAddSignalREvent("Restored mobile network. Flushed IndexedDB sync queue into Azure cluster.");
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg font-mono flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Restore Connections & Sync Queue</span>
                        </button>
                      )}
                    </div>

                    <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">SQL Mobile Cache Schema Contract</span>
                      <pre className="bg-stone-50 p-4 rounded-xl text-[10px] text-stone-700 font-mono border border-stone-200 leading-relaxed overflow-x-auto">
{`// SQLITE MOBILE LOCAL DATABASE ENGINE - jan_local_cache.db
CREATE TABLE IF NOT EXISTS local_offline_queue (
    id TEXT PRIMARY KEY,
    module VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(12) DEFAULT 'PENDING'
);`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: ENTERPRISE SECURITY & PASSKEYS */}
            {activeSubTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Enterprise Security Center & Cryptographic Enclave</h2>
                  <p className="text-xs text-stone-500 font-mono">Configure WebAuthn Passkeys, trigger automated database decryption key rotations, and review network threat logs</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* WebAuthn Credentials registration */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">WebAuthn / Passkey Provisioning</span>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-stone-500 font-bold uppercase">Passkey Enclave:</span>
                          <span className={`font-bold ${passkeysRegistered ? "text-emerald-700" : "text-amber-700"}`}>
                            {passkeysRegistered ? "Active & Registered" : "Not Configured"}
                          </span>
                        </div>
                        <p className="text-[9px] text-stone-400 font-normal leading-relaxed">
                          Secure hardware-backed credential storage (WebAuthn / Apple TouchID) protects the core ledgers.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setPasskeysRegistered(!passkeysRegistered);
                          onAddSignalREvent(
                            !passkeysRegistered
                              ? "Registered FIDO2 hardware passkey credentials."
                              : "Deregistered hardware-backed trust keys."
                          );
                        }}
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-[10px] transition"
                      >
                        {passkeysRegistered ? "Revoke Hardware Trust Key" : "Register Mobile TouchID Passkey"}
                      </button>
                    </div>
                  </div>

                  {/* Key Rotation Portal */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Vault Key Rotation</span>

                    <div className="space-y-3 font-mono text-xs">
                      <p className="text-[10px] text-stone-500 leading-relaxed">
                        Trigger on-demand RSA-4096 / AES-256 database decryption key rotation. This is compliance-certified under Shariah transaction audit rules.
                      </p>

                      {isRotatingKeys && (
                        <div className="space-y-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                          {keyRotationLog.map((log, i) => (
                            <p key={i} className="text-[8px] text-indigo-700 leading-snug">{log}</p>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={triggerKeyRotation}
                        disabled={isRotatingKeys}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition disabled:opacity-50"
                      >
                        <span>Rotate Encryption Keys Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Threat Detection Dashboard */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Active Network Threat Log</span>

                    <div className="space-y-2.5 font-mono text-[9px]">
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between">
                        <span>Shield Integrity Engine: Active</span>
                        <span className="font-bold">OK</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between">
                        <span>ABAC Row-Level Enforce: OK</span>
                        <span className="font-bold">OK</span>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center justify-between">
                        <span>Intrusion Alert: Brute Force block IP 192.12.8.</span>
                        <span className="font-bold">Blocked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: OBSERVABILITY PLATFORM */}

            {/* SUBTAB 4.1: FALLBACK IN CASE USER DOES NOT HAVE GENERIC OPEN */}
            {activeSubTab === "observability" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Unified Observability Engine (OpenTelemetry)</h2>
                  <p className="text-xs text-stone-500 font-mono">Trace requests across SQL Server, Qdrant cluster, and ASP.NET Core endpoints</p>
                </div>

                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Distributed Micro-Service Spans (Jaeger tracer)</span>

                  <div className="space-y-3 font-mono text-[10px]">
                    {activeTraces.map((trace) => (
                      <div key={trace.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-indigo-900">{trace.span}</span>
                            <span className="text-[8px] bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded font-bold">{trace.traceId}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-emerald-700 font-bold">{trace.latency}</span>
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-bold">{trace.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5: DISASTER RECOVERY & BACKUPS */}
            {activeSubTab === "dr" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Disaster Recovery, Snapshot restores & PITR</h2>
                  <p className="text-xs text-stone-500 font-mono">Schedule backups, trigger point-in-time state recoveries (PITR), and simulate global disaster restoration playbooks</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Restore Wizard */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Restore parameters</span>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="block text-stone-500 uppercase font-bold text-[9px] mb-1">Backup Target Scope</label>
                        <select
                          value={selectedDRScope}
                          onChange={(e) => setSelectedDRScope(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                        >
                          <option>All Databases (Full System Restructure)</option>
                          <option>SQL Server Transactional Ledger</option>
                          <option>Qdrant Vector Embedding Store</option>
                          <option>IslamOS Spiritual Progress Log</option>
                        </select>
                      </div>

                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5">
                        <span className="text-stone-400 font-bold uppercase text-[8px] block">Cloud Snapshot Target</span>
                        <p className="font-bold text-stone-900">jannah_snapshot_latest.tar.gz</p>
                        <span className="text-[8px] text-stone-400 block">Daterange: 2026-07-06 00:00:00 UTC</span>
                      </div>

                      <button
                        onClick={triggerDisasterRecovery}
                        disabled={isRestoring}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition disabled:opacity-50"
                      >
                        <span>Initiate Point-in-Time Restore</span>
                      </button>
                    </div>
                  </div>

                  {/* Disaster Recovery terminal */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Disaster Restore Console Logs</span>

                    <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-48 overflow-y-auto">
                      {drRecoveryLog.length === 0 ? (
                        <span className="text-stone-500">Restore pipeline ready. Safe recovery sandbox is initialized.</span>
                      ) : (
                        drRecoveryLog.map((log, i) => (
                          <div key={i} className="leading-snug">
                            <span className="text-emerald-400">{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 6: PERFORMANCE LAB */}
            {activeSubTab === "performance" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Performance Lab & Stress Testing</h2>
                  <p className="text-xs text-stone-500 font-mono">Run high-density concurrent transaction benchmarks, verify database execution latency, and monitor API bottlenecks</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="border border-stone-200 rounded-xl p-5 space-y-3 font-mono text-xs">
                    <span className="text-[9px] text-stone-400 block uppercase font-bold border-b border-stone-100 pb-1.5">Load Testing suite</span>
                    <p className="text-stone-500 leading-relaxed text-[10px]">
                      Benchmark 10,000 concurrent virtual users hitting the DuckDB and Qdrant vector lookup pipelines simultaneously.
                    </p>
                    <button
                      onClick={() => triggerBenchmark("Concurrency Load Test")}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px] rounded"
                    >
                      Trigger Stress Test
                    </button>
                  </div>

                  <div className="border border-stone-200 rounded-xl p-5 space-y-3 font-mono text-xs">
                    <span className="text-[9px] text-stone-400 block uppercase font-bold border-b border-stone-100 pb-1.5">Vector Database Latency</span>
                    <p className="text-stone-500 leading-relaxed text-[10px]">
                      Measure cosine similarity and hybrid keyword-vector search execution speeds across 12.4M features.
                    </p>
                    <button
                      onClick={() => triggerBenchmark("Vector Database Audit")}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px] rounded"
                    >
                      Audit Qdrant Index
                    </button>
                  </div>

                  <div className="border border-stone-200 rounded-xl p-5 space-y-3 font-mono text-xs">
                    <span className="text-[9px] text-stone-400 block uppercase font-bold border-b border-stone-100 pb-1.5">Database Query Benchmarks</span>
                    <p className="text-stone-500 leading-relaxed text-[10px]">
                      Trigger stress execution on EF Core SQL Server index allocations and double-entry reconciler schemas.
                    </p>
                    <button
                      onClick={() => triggerBenchmark("EF Core SQL Benchmarking")}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px] rounded"
                    >
                      Run DB Index test
                    </button>
                  </div>
                </div>

                {isBenchmarking && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs flex items-center justify-between text-indigo-700 animate-pulse">
                    <span>Stress Pipeline active. Compiling metrics...</span>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  </div>
                )}

                {activeBenchmarkMetric && !isBenchmarking && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-mono text-xs font-bold text-center">
                    {activeBenchmarkMetric}
                  </div>
                )}

                {/* Graph Area */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Load Test Latency Curve</span>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyData}>
                        <defs>
                          <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                        <YAxis stroke="#888888" fontSize={10} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Area type="monotone" dataKey="dbLatency" stroke="#4f46e5" fillOpacity={1} fill="url(#colorDb)" name="Database Latency (ms)" />
                        <Area type="monotone" dataKey="aiLatency" stroke="#d97706" fillOpacity={1} fill="url(#colorAi)" name="AI Inference latency (ms)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 7: EVOLVING AI ENGINE */}
            {activeSubTab === "evolving_ai" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Self-Evolving AI, Prompt Versioning & Reinforcement Evaluations</h2>
                  <p className="text-xs text-stone-500 font-mono">Review agent prompt regression scores, optimize contextual model memories, and update system feedback loops</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Prompt versions */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Production Agent Prompt Enclave</span>

                    <div className="space-y-3">
                      {promptVersions.map((p) => (
                        <div key={p.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-stone-900 font-mono">{p.agent}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[9px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">{p.version}</span>
                              <span className="text-[9px] font-mono text-emerald-700 font-bold">Accuracy: {p.accuracy}</span>
                              <span className="text-[9px] font-mono text-stone-400">Tokens: {p.tokenSaving}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => promotePromptVersion(p.id)}
                            className="px-2.5 py-1.5 bg-stone-950 text-white rounded text-[10px] font-mono font-bold hover:bg-stone-800 transition"
                          >
                            Promote Prompt
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reinforcement learning metrics & evaluations */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Active Policy Evaluations & Islamic Compliance checks</span>

                    <div className="space-y-3">
                      {aiEvaluations.map((e) => (
                        <div key={e.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-stone-800 font-mono leading-snug block">{e.evaluation}</span>
                            <span className="text-[8px] text-stone-400 font-mono">{e.date}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase block">
                              {e.rating}
                            </span>
                            <span className="text-[8px] text-stone-400 font-mono block mt-1">{e.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 8: PLUGINS MARKETPLACE & SDK */}
            {activeSubTab === "plugins" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-base font-bold text-stone-900">Modular Plugin Marketplace & Developer SDK</h2>
                  <p className="text-xs text-stone-500 font-mono">Extend LifeOS with third-party tool adapters, browse community plugin sandboxes, and view developer integrations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Installed Plugins */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Active Sandboxed Plugins</span>

                    <div className="space-y-3">
                      {installedPlugins.map((pl) => (
                        <div key={pl.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-stone-900">{pl.name}</span>
                            <p className="text-[9px] text-stone-400 font-mono mt-1">Creator: {pl.creator} • Version: {pl.version} • Permissions: {pl.permissions}</p>
                          </div>
                          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                            {pl.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Available Marketplace plugins */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">Available Extensions</span>

                    <div className="space-y-3">
                      {availablePlugins.map((pl) => (
                        <div key={pl.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-stone-900">{pl.name}</span>
                            <p className="text-[9px] text-stone-600 leading-normal">{pl.description}</p>
                            <p className="text-[8px] text-stone-400 font-mono">Version: {pl.version} • Permissions: {pl.permissions}</p>
                          </div>

                          <button
                            onClick={() => installPlugin(pl)}
                            className="ml-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-mono font-bold shrink-0 transition"
                          >
                            Install Sandbox
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Developer SDK Docs */}
                <div className="border border-stone-200 rounded-xl p-5 space-y-3">
                  <span className="text-xs font-bold text-stone-900 font-mono uppercase block border-b border-stone-100 pb-2">LifeOS Plugin SDK Integration Guide</span>
                  <pre className="bg-stone-50 p-4 rounded-xl text-[10px] text-stone-700 font-mono border border-stone-200 leading-relaxed overflow-x-auto">
{`// SAMPLE CLIENT-SIDE PLUGIN ENTRYPOINT IN TYPESCRIPT - SDK VERSION 1.0.0
import { LifeOSPlugin, PluginContext } from "@projectjannah/lifeos-sdk";

export default class FitbitIngesterPlugin implements LifeOSPlugin {
    id = "fitbit-ingester";
    version = "1.0.4";
    permissions = ["health", "location"];

    async initialize(ctx: PluginContext): Promise<void> {
        ctx.logger.info("Initializing Fitbit synchronization worker thread...");
        ctx.scheduler.registerCron("*/15 * * * *", async () => {
            const telemetry = await ctx.device.fetchHeartrate();
            await ctx.database.insert("fact_physical_telemetry", {
                bpm: telemetry.resting_bpm,
                steps_count: telemetry.steps_since_midnight
            });
        });
    }
}`}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
