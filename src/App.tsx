import React, { lazy, Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";

// Components imports
import NotificationCenter, { SystemNotification } from "./components/NotificationCenter";
import SystemCopilot from "./components/SystemCopilot";
import CommandPalette from "./components/CommandPalette";
import { DesktopSidebar, MobileNavigation } from "./components/AppNavigation";
import { navigation, pageFromUrl, updatePageUrl, type LifeOsPage } from "./ui/navigation";
import { Dialog } from "./ui/primitives";
import { FeedbackHost } from "./ui/feedback";
import { apiErrorMessage } from "./ui/apiError";

const DashboardView = lazy(() => import("./components/DashboardView"));
const ExecutivePlannerView = lazy(() => import("./components/ExecutivePlannerView"));
const PlannerCalendarView = lazy(() => import("./components/PlannerCalendarView"));
const PersonalOperationsView = lazy(() => import("./components/PersonalOperationsView"));
const SchoolView = lazy(() => import("./components/SchoolView"));
const WorkView = lazy(() => import("./components/WorkView"));
const AiChatView = lazy(() => import("./components/AiChatView"));
const KnowledgeView = lazy(() => import("./components/KnowledgeView"));
const VaultView = lazy(() => import("./components/VaultView"));
const SettingsView = lazy(() => import("./components/SettingsView"));
const AutomationView = lazy(() => import("./components/AutomationView"));
const LoginView = lazy(() => import("./components/LoginView"));

// Types
import { UserProfile, SystemScore, ChatMessage } from "./types";
import { personalProfile } from "./config/personalization";
/* Legacy demonstration modules remain in source history but are intentionally
 * excluded from the active application until backed by real services. */

export default function App() {
  const [activeTab, setActiveTab] = useState<LifeOsPage>(()=>pageFromUrl());
  const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>localStorage.getItem("lifeos.sidebar.collapsed")==="true");
  const [commandOpen, setCommandOpen] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "required">("checking");
  const [authEnabled, setAuthEnabled] = useState(false);

  // Command & Notification panel state variables
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">(()=>{const saved=localStorage.getItem("lifeos.theme");return saved==="dark"||saved==="high-contrast"?saved:"light"});

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Local activity feed used only for concise save confirmations.
  const [signalREvents, setSignalREvents] = useState<string[]>([]);

  // Master scores calculated live by backend endpoint
  const [scores, setScores] = useState<SystemScore>({
    overall: 0,
    faith: 0,
    marriage: 0,
    health: 0,
    career: 0,
    business: 0,
    finance: 0,
    learning: 0,
    discipline: 0,
    consistency: 0
  });

  // Master profile parameters injected into assistant prompts
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: personalProfile.name,
    vision: personalProfile.vision,
    currentGoal: personalProfile.currentGoal,
    preferences: {
      aiPersonality: "strategic",
      compactThreshold: 80,
      speechEnabled: false,
      energyPreferences: "focused",
      workingHours: personalProfile.workPattern,
      learningPreferences: "visual"
    },
    notifications: {
      policyViolations: true,
      goalProgress: true,
      prayerReminders: true,
      learningReminders: false,
      healthAlerts: true
    },
    privacy: {
      developerLogsEnabled: false,
      telemetrySharing: false,
      vectorDbSync: false
    },
    islamicPreferences: {
      prayerCalculationMethod: "Muslim World League",
      timezone: personalProfile.timezone,
      location: personalProfile.location,
      language: personalProfile.language
    },
    personalInfo: {
      marriageStatus: "Married",
      emergencyContacts: "Not configured",
      occupation: personalProfile.occupation,
      education: personalProfile.education
    },
    strategic: {
      values: [...personalProfile.values],
      missionStatement: personalProfile.vision,
      corePrinciples: [...personalProfile.principles]
    }
  });

  // AI Chat Messages database list
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "chat_1",
      role: "assistant",
      content: `Assalamu alaykum, ${personalProfile.name}. I am your LifeOS assistant. I can help you build 43v3r Technology, improve your finances, plan around rotating shifts, grow as a developer, and keep Islamic priorities central. What should we focus on first?`,
      timestamp: "Just now",
      isPinned: false,
      referencedPolicies: [...personalProfile.principles],
      referencedMemories: [personalProfile.currentGoal]
    }
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationDialog,setConversationDialog]=useState<{kind:"rename"|"delete";id:string;value:string}|null>(null);

  useEffect(() => { void fetch("/api/auth/session").then(async response => { const result = await response.json().catch(() => ({})); setAuthEnabled(result.authRequired === true); setAuthState(response.ok && result.authenticated ? "authenticated" : "required"); }).catch(() => setAuthState("required")); }, []);
  useEffect(()=>{const listener=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setCommandOpen(value=>!value)}};window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener)},[]);
  useEffect(()=>{const listener=()=>setActiveTab(pageFromUrl());window.addEventListener("popstate",listener);return()=>window.removeEventListener("popstate",listener)},[]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("lifeos.theme",theme)},[theme]);
  useEffect(()=>{localStorage.setItem("lifeos.sidebar.collapsed",String(sidebarCollapsed))},[sidebarCollapsed]);
  const navigateTo=(page:LifeOsPage)=>{if(page!==activeTab)updatePageUrl(page);setActiveTab(page)};

  const loadConversations = async (preferredId?: string) => {
    const response = await fetch("/api/ai/conversations"); if (!response.ok) return;
    const list = await response.json(); setConversations(list);
    const id = preferredId || activeConversationId || list[0]?.id;
    if (id) { const detail = await fetch(`/api/ai/conversations/${id}`); if (detail.ok) { const saved = await detail.json(); setActiveConversationId(id); setMessages((saved.messages || []).map((item: any) => ({ id: item.id, role: item.role, content: item.content, timestamp: new Date(item.createdAt).toLocaleTimeString() }))); } }
  };
  useEffect(() => { void loadConversations(); }, []);

  const createConversation = async () => { const response = await fetch("/api/ai/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "New conversation" }) }); if (!response.ok) return null; const item = await response.json(); setActiveConversationId(item.id); setMessages([]); await loadConversations(item.id); return item.id as string; };
  const selectConversation = async (id: string) => { await loadConversations(id); };
  const renameConversation = async (id: string) => { const current = conversations.find(item => item.id === id);setConversationDialog({kind:"rename",id,value:current?.title||""}); };
  const archiveConversation = async (id: string) => { await fetch(`/api/ai/conversations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "archived" }) }); await loadConversations(id); };
  const deleteConversation = async (id: string) => { const current=conversations.find(item=>item.id===id);setConversationDialog({kind:"delete",id,value:current?.title||"Conversation"}); };
  const confirmConversationDialog=async()=>{if(!conversationDialog)return;if(conversationDialog.kind==="rename"){const title=conversationDialog.value.trim();if(!title)return;await fetch(`/api/ai/conversations/${conversationDialog.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title})});await loadConversations(conversationDialog.id)}else{await fetch(`/api/ai/conversations/${conversationDialog.id}`,{method:"DELETE"});setActiveConversationId(null);setMessages([]);await loadConversations()}setConversationDialog(null)};

  // Fetch current score aggregates from backend
  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (err) {
      console.error("Could not fetch score aggregates from server.", err);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    const loadRealNotifications = async () => {
      try {
        await fetch("/api/automation/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}).catch(()=>undefined);
        const response = await fetch("/api/notifications");
        if (!response.ok) return;
        const result = await response.json();
        setNotifications(result.records||[]);
      } catch { /* Local server may still be starting. */ }
    };
    void loadRealNotifications();
    const timer = window.setInterval(loadRealNotifications, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Add an entry to the local activity feed.
  const addSignalREvent = (msg: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setSignalREvents((prev) => [formatted, ...prev.slice(0, 18)]);
  };

  const handleSendMessage = async (text: string, activeAgentId: string) => {
    if (!text.trim() || sendingMessage) return;

    const userMsg: ChatMessage = {
      id: "msg_user_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setSendingMessage(true);

    try {
      let conversationId = activeConversationId;
      if (!conversationId) conversationId = await createConversation();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile,
          activeAgent: activeAgentId,
          conversationId
        })
      });

      if (!res.ok) { const result = await res.json().catch(() => ({})); throw new Error(apiErrorMessage(result, "The LifeOS assistant request failed.")); }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: "msg_assistant_" + Date.now(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString(),
        referencedPolicies: [...personalProfile.principles],
        referencedMemories: [personalProfile.currentGoal]
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActiveConversationId(data.conversationId || conversationId);
      void loadConversations(data.conversationId || conversationId);
      addSignalREvent(`LifeOS assistant responded.`);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: `⚠️ **Assistant unavailable**: ${err.message || "Check your API configuration."}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSendingMessage(false);
    }
  };


  if (authState === "checking") return <ViewLoading />;
  if (authState === "required") return <Suspense fallback={<ViewLoading/>}><LoginView onAuthenticated={() => setAuthState("authenticated")}/></Suspense>;

  const activePage=navigation.find(item=>item.id===activeTab)!;
  return (
    <div className="life-app">
      <FeedbackHost/>
      <div className="life-shell">
      <DesktopSidebar active={activeTab} onNavigate={navigateTo} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(value=>!value)}/>
      <div className="life-workspace">
      <header className="life-topbar">
          <div className="life-topbar-title"><span>Private local workspace</span><strong>{activePage.label}</strong></div>
          <div className="life-topbar-actions relative">
            <button onClick={()=>setCommandOpen(true)} className="life-topbar-button" title="Search LifeOS"><Search/><span>Search</span><kbd>⌘K</kbd></button>
            <NotificationCenter
              notifications={notifications}
              onAction={async(id,action)=>{const response=await fetch(`/api/notifications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});if(response.ok){const changed=await response.json();setNotifications(current=>action==="read"?current.map(item=>item.id===id?changed:item):current.filter(item=>item.id!==id));}}}
              onNavigate={(page,section)=>{if(section){const url=new URL(location.href);url.searchParams.set("section",section);history.replaceState({},"",url)}navigateTo(page as LifeOsPage)}}
              isOpen={showNotificationCenter}
              onToggle={() => setShowNotificationCenter(!showNotificationCenter)}
            />
            {authEnabled&&<button onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});setMessages([]);setAuthState("required")}} className="life-topbar-button"><span>Sign out</span></button>}
          </div>
      </header>

      {/* Main Section Area */}
      <main className="life-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            
            <Suspense fallback={<ViewLoading />}>
            {/* VIEW 1: EXECUTIVE DASHBOARD */}
            {activeTab === "dashboard" && (
              <DashboardView
                scores={scores}
                userProfile={userProfile}
                onChangeFocus={(f) => {
                  setUserProfile((prev) => ({ ...prev, currentGoal: f }));
                  addSignalREvent(`Goal target focus variable mutated to: "${f}"`);
                }}
                onNavigate={(t) => navigateTo(t as LifeOsPage)}
                onAddSignalREvent={addSignalREvent}
              />
            )}

            {/* VIEW 10: EXECUTIVE PLANNER PHASE 5 */}
            {activeTab === "executive_planner" && (
              <ExecutivePlannerView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {/* VIEW 2: PLANNER & CALENDAR LOGS */}
            {activeTab === "planner" && (
              <PlannerCalendarView
                onAddSignalREvent={addSignalREvent}
                onUpdateScore={fetchScores}
              />
            )}

            {activeTab === "operations" && (
              <PersonalOperationsView onActivity={addSignalREvent} />
            )}

            {activeTab === "school" && <SchoolView onActivity={addSignalREvent} onNavigate={(tab)=>navigateTo(tab as LifeOsPage)} />}

            {activeTab === "work" && <WorkView onActivity={addSignalREvent} onNavigate={(tab)=>navigateTo(tab as LifeOsPage)} />}

            {/* VIEW 3: GABRIEL AI CHAT WORKSPACE */}
            {activeTab === "chat" && (
              <AiChatView
                userProfile={userProfile}
                messages={messages}
                onSendMessage={handleSendMessage}
                sendingMessage={sendingMessage}
                onClearHistory={() => {
                  void createConversation();
                  addSignalREvent("Started a new saved conversation.");
                }}
                onAddSignalREvent={addSignalREvent}
                conversations={conversations}
                activeConversationId={activeConversationId}
                onCreateConversation={() => void createConversation()}
                onSelectConversation={(id) => void selectConversation(id)}
                onRenameConversation={(id) => void renameConversation(id)}
                onArchiveConversation={(id) => void archiveConversation(id)}
                onDeleteConversation={(id) => void deleteConversation(id)}
              />
            )}

            {activeTab === "memory" && <KnowledgeView onActivity={addSignalREvent} />}

            {/* VIEW 4: SECRET VAULT */}
            {activeTab === "vault" && <VaultView />}
            {activeTab === "automation" && <AutomationView />}

            {/* VIEW 8: KERNEL SETTINGS */}
            {activeTab === "settings" && (
              <SettingsView
                userProfile={userProfile}
                onChangeProfile={(p) => setUserProfile(p)}
                onAddSignalREvent={addSignalREvent}
                theme={theme}
                onChangeTheme={(t) => setTheme(t)}
              />
            )}

            </Suspense>

          </motion.div>
        </AnimatePresence>
      </main>

      <CommandPalette isOpen={commandOpen} onClose={()=>setCommandOpen(false)} onNavigate={target=>navigateTo(target as LifeOsPage)}/>
      <SystemCopilot activeTab={activeTab} messages={messages} sending={sendingMessage} onSend={handleSendMessage} onOpenChat={() => navigateTo("chat")} />
      <MobileNavigation active={activeTab} onNavigate={navigateTo}/>
      <Dialog open={Boolean(conversationDialog)} title={conversationDialog?.kind==="rename"?"Rename conversation":"Delete conversation?"} description={conversationDialog?.kind==="delete"?"This removes the saved conversation and rejects pending memories learned from it. This cannot be undone.":"Use a short name that makes this conversation easy to find."} confirmLabel={conversationDialog?.kind==="rename"?"Save name":"Delete conversation"} tone={conversationDialog?.kind==="delete"?"danger":"neutral"} onClose={()=>setConversationDialog(null)} onConfirm={()=>void confirmConversationDialog()}>{conversationDialog?.kind==="rename"&&<label className="mt-4 block text-xs font-semibold">Conversation name<input autoFocus value={conversationDialog.value} onChange={event=>setConversationDialog({...conversationDialog,value:event.target.value})} className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm"/></label>}</Dialog>
      </div>
      </div>
    </div>
  );
}

function ViewLoading() {
  return <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-stone-200 bg-white/70" role="status" aria-live="polite">
    <div className="text-center">
      <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-600" />
      <p className="mt-3 text-xs font-medium text-stone-500">Loading workspace…</p>
    </div>
  </div>;
}
