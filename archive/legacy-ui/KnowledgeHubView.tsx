import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Database,
  Search,
  Plus,
  FileText,
  Layers,
  Clock,
  Lock,
  MessageSquare,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Compass,
  Share2,
  Send,
  AlertCircle,
  Calendar,
  Mail,
  User,
  FolderOpen,
  Workflow,
  Tag,
  GraduationCap,
  Info,
  X,
  Check,
  Zap,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { KnowledgeObject, GraphNode, GraphEdge, IngestionPipelineStatus } from "../types";

export default function KnowledgeHubView() {
  const getPositionX = (id: string) => {
    const positions: Record<string, number> = {
      kn_1: 220, kn_2: 350, kn_3: 150, kn_4: 480, kn_5: 550,
      proj_jannah_core: 400, salah_tracker_goal: 180, wallet_vault_goal: 520,
      ethan_profile: 380, sarah_spouse: 120, amanah_wealth_advisor: 620
    };
    return positions[id] || 300;
  };

  const getPositionY = (id: string) => {
    const positions: Record<string, number> = {
      kn_1: 150, kn_2: 120, kn_3: 320, kn_4: 380, kn_5: 200,
      proj_jannah_core: 240, salah_tracker_goal: 220, wallet_vault_goal: 280,
      ethan_profile: 80, sarah_spouse: 420, amanah_wealth_advisor: 440
    };
    return positions[id] || 250;
  };

  const [activeSubTab, setActiveSubTab] = useState<
    "dashboard" | "explorer" | "ingestion" | "graph" | "assistant" | "learning" | "api"
  >("dashboard");

  // State elements
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeObject[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({
    nodes: [],
    edges: []
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [systemEvents, setSystemEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"Keyword" | "Semantic" | "Hybrid" | "Graph">("Hybrid");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter elements
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Selected document for split view
  const [activeDoc, setActiveDoc] = useState<KnowledgeObject | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // New relation builder
  const [relationSource, setRelationSource] = useState("");
  const [relationTarget, setRelationTarget] = useState("");
  const [relationLabel, setRelationLabel] = useState("references");
  const [relationType, setRelationType] = useState("references");

  // Ingestion form state
  const [ingestFilename, setIngestFilename] = useState("");
  const [ingestContent, setIngestContent] = useState("");
  const [ingestFileType, setIngestFileType] = useState("pdf");
  const [ingestStatus, setIngestStatus] = useState<IngestionPipelineStatus>({
    step: "Idle",
    progress: 0,
    logs: []
  });

  // WhatsApp & Email inputs
  const [whatsappFilename, setWhatsappFilename] = useState("whatsapp_domestic_sync.txt");
  const [whatsappContent, setWhatsappContent] = useState(
    `[05/07/2026, 09:30:15] Sarah: Did you review our Halal mutual fund allocation proposal?
[05/07/2026, 09:32:00] Ethan: Yes, reviewed. Let's allocate 20% into Shariah-compliant high-yield mutual funds.
[05/07/2026, 09:33:45] Sarah: Excellent, agreed. Remember to transfer £1,000 gold tokens on Friday as well.
[05/07/2026, 09:35:10] Ethan: Roger that, locked inside my planner.`
  );

  const [emailFilename, setEmailFilename] = useState("re_halal_investing_advisors.eml");
  const [emailContent, setEmailContent] = useState(
    `From: amanah_advisors@halalinvest.co
To: ethan@projectjannah.co
Subject: Proposal: Halal Fund Allocation & Gold Bullion
Date: Sun, 4 Jul 2026 15:45:00 +0100

Dear Ethan,
We have verified your liquid cash balance of £3,400. To minimize inflation impact while adhering to Islamic finance protocols:
1. Purchase physical gold bullion representing 40% value (£1,360).
2. Establish automatic transfer schedules to Riba-free wealth portfolios.
3. Calculate your yearly Zakat dues next Ramadan.`
  );

  // AI Assistant State
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantTaskType, setAssistantTaskType] = useState<"general" | "study_guide" | "sop" | "contradictions">("general");
  const [selectedDocsForAi, setSelectedDocsForAi] = useState<string[]>([]);
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Spaced Repetition deck state
  const [learningDeck, setLearningDeck] = useState<{ docId: string; docTitle: string; cardIdx: number; question: string; answer: string; ease: number; interval: number; nextDue?: string }[]>([]);
  const [currentDeckIdx, setCurrentDeckIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLeitnerReviewing, setIsLeitnerReviewing] = useState(false);

  // Manual Note creator state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState<any>("Note");
  const [noteTags, setNoteTags] = useState("");
  const [noteDescription, setNoteDescription] = useState("");

  // Graph state interaction
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Reload everything from backend
  const loadAllData = async () => {
    try {
      const kRes = await fetch("/api/knowledge");
      const kData = await kRes.json();
      setKnowledgeList(kData);

      const gRes = await fetch("/api/knowledge/graph");
      const gData = await gRes.json();
      setGraphData(gData);

      const aRes = await fetch("/api/knowledge/analytics");
      const aData = await aRes.json();
      setAnalytics(aData);

      const eRes = await fetch("/api/knowledge/events");
      const eData = await eRes.json();
      setSystemEvents(eData);

      // Recompile flashcard review deck
      const dueDeck: typeof learningDeck = [];
      kData.forEach((k: KnowledgeObject) => {
        if (k.aiFlashcards) {
          k.aiFlashcards.forEach((card, idx) => {
            // Include card if interval is 0, or nextDue is past due, or no nextDue
            const isDue = !card.nextDue || new Date(card.nextDue) <= new Date();
            dueDeck.push({
              docId: k.id,
              docTitle: k.title,
              cardIdx: idx,
              question: card.question,
              answer: card.answer,
              ease: card.ease || 2.5,
              interval: card.interval || 0,
              nextDue: card.nextDue
            });
          });
        }
      });
      setLearningDeck(dueDeck);

    } catch (err) {
      console.error("Failed to fetch knowledge hub data", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync editor content when selected doc changes
  useEffect(() => {
    if (activeDoc) {
      setEditorContent(activeDoc.description);
    } else {
      setEditorContent("");
    }
  }, [activeDoc]);

  // Execute hybrid search
  const triggerSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/knowledge/search?query=${encodeURIComponent(val)}&type=${searchType}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Submit manual note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          category: noteCategory,
          description: noteDescription,
          tags: noteTags.split(",").map(t => t.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        setNoteTitle("");
        setNoteTags("");
        setNoteDescription("");
        await loadAllData();
        setActiveSubTab("explorer");
      }
    } catch (err) {
      console.error("Failed to create manual note", err);
    }
  };

  // Trigger simulated file ingestion pipeline
  const runFileIngest = async () => {
    if (!ingestFilename.trim() || !ingestContent.trim()) return;

    setIngestStatus({ step: "Uploading", progress: 10, logs: ["Initiating secure file transport..."] });
    
    // Simulate pipeline triggers with timeouts
    const steps: { step: IngestionPipelineStatus["step"]; progress: number; log: string }[] = [
      { step: "Parsing", progress: 25, log: `Normalizing document structures for '${ingestFilename}'` },
      { step: "OCR_Scanning", progress: 40, log: "Running optical character alignment pipelines" },
      { step: "Language_Detecting", progress: 55, log: "Detecting natural language parameters (UTF-8 normalizations)" },
      { step: "Running_Duplicate_Detection", progress: 70, log: "Comparing content blocks against active LifeOS sqlite index" },
      { step: "AI_Summarizing", progress: 85, log: "Synthesizing executive summaries and extracting semantic metadata" },
      { step: "Creating_Flashcards", progress: 95, log: "Generating spaced repetition cards and testing alignment parameters" }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setIngestStatus(prev => ({
        step: step.step,
        progress: step.progress,
        logs: [...prev.logs, step.log]
      }));
    }

    try {
      const res = await fetch("/api/knowledge/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: ingestFilename,
          content: ingestContent,
          fileType: ingestFileType
        })
      });

      if (res.ok) {
        const result = await res.json();
        setIngestStatus(prev => ({
          step: "Completed",
          progress: 100,
          logs: [...prev.logs, `Completed successfully: ${result.message}`]
        }));
        setIngestFilename("");
        setIngestContent("");
        await loadAllData();
      } else {
        throw new Error("API returned non-200");
      }
    } catch (err: any) {
      setIngestStatus(prev => ({
        step: "Failed",
        progress: 100,
        logs: [...prev.logs, `Ingestion failed: ${err.message || "Endpoint error"}`]
      }));
    }
  };

  // Ingest WhatsApp chat log
  const handleWhatsappIngest = async () => {
    try {
      const res = await fetch("/api/knowledge/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: whatsappFilename, content: whatsappContent })
      });
      if (res.ok) {
        setWhatsappContent("");
        await loadAllData();
        setActiveSubTab("explorer");
      }
    } catch (err) {
      console.error("WhatsApp ingest failed", err);
    }
  };

  // Ingest Email EML
  const handleEmailIngest = async () => {
    try {
      const res = await fetch("/api/knowledge/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: emailFilename, content: emailContent })
      });
      if (res.ok) {
        setEmailContent("");
        await loadAllData();
        setActiveSubTab("explorer");
      }
    } catch (err) {
      console.error("Email ingest failed", err);
    }
  };

  // Connect two nodes manually in the Knowledge Graph
  const handleCreateEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relationSource || !relationTarget) return;

    try {
      const res = await fetch("/api/knowledge/graph/edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: relationSource,
          target: relationTarget,
          label: relationLabel,
          type: relationType
        })
      });
      if (res.ok) {
        setRelationSource("");
        setRelationTarget("");
        await loadAllData();
      }
    } catch (err) {
      console.error("Failed to connect nodes", err);
    }
  };

  // Spaced Repetition response rater
  const rateFlashcard = async (rating: "again" | "hard" | "good" | "easy") => {
    if (learningDeck.length === 0) return;
    const activeCard = learningDeck[currentDeckIdx];

    try {
      const res = await fetch("/api/knowledge/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCard.docId,
          flashcardIdx: activeCard.cardIdx,
          rating
        })
      });

      if (res.ok) {
        setShowAnswer(false);
        // Stagger to next card or wrap
        if (currentDeckIdx < learningDeck.length - 1) {
          setCurrentDeckIdx(prev => prev + 1);
        } else {
          setCurrentDeckIdx(0);
          setIsLeitnerReviewing(false);
        }
        await loadAllData();
      }
    } catch (err) {
      console.error("Failed to rate card", err);
    }
  };

  // Ask AI Assistant (Gabriel CoS Companion Panel)
  const askGabrielAssistant = async () => {
    if (!assistantPrompt.trim()) return;
    setIsAiResponding(true);
    setAssistantResponse("");

    try {
      const res = await fetch("/api/knowledge/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: assistantPrompt,
          taskType: assistantTaskType,
          selectedDocs: selectedDocsForAi
        })
      });
      const data = await res.json();
      setAssistantResponse(data.content);
    } catch (err) {
      console.error("AI Assistant response failed", err);
      setAssistantResponse("Failed to establish cognitive link with Gabriel.");
    } finally {
      setIsAiResponding(false);
    }
  };

  // Trigger editing save
  const saveDocumentDescription = async () => {
    if (!activeDoc) return;
    setIsSaving(true);
    try {
      // Simulate database save of the modified markdown description
      await new Promise(r => setTimeout(r, 600));
      
      const updatedList = knowledgeList.map((k) => {
        if (k.id === activeDoc.id) {
          return { ...k, description: editorContent, modified: new Date().toISOString() };
        }
        return k;
      });
      setKnowledgeList(updatedList);
      
      const newEvt = {
        id: "ev_save_" + Date.now(),
        title: "Knowledge Object Modified",
        message: `Content specifications saved for '${activeDoc.title}'. Version incremented locally.`,
        timestamp: new Date().toISOString()
      };
      setSystemEvents(prev => [newEvt, ...prev]);

      // Refresh the active doc with updated representation
      const refreshedDoc = updatedList.find(k => k.id === activeDoc.id);
      if (refreshedDoc) setActiveDoc(refreshedDoc);

    } catch (err) {
      console.error("Failed to save changes", err);
    } finally {
      setIsSaving(false);
    }
  };

  // File drop handler simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setIngestFilename(file.name);
      setIngestFileType(file.name.split(".").pop() || "pdf");
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIngestContent(event.target.result as string);
        }
      };
      reader.readAsText(file);
      setActiveSubTab("ingestion");
    }
  };

  // Extract all unique tags
  const allUniqueTags = Array.from(
    new Set(knowledgeList.flatMap((k) => k.tags || []))
  );

  // Filter list
  const filteredList = knowledgeList.filter((k) => {
    const matchesCategory = selectedCategory === "All" || k.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || k.lifecycleStatus === selectedStatus;
    const matchesTag = selectedTag === "All" || k.tags.includes(selectedTag);
    return matchesCategory && matchesStatus && matchesTag;
  });

  return (
    <div
      className="h-full flex flex-col bg-slate-900 text-slate-100 font-sans select-none overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 border-4 border-dashed border-emerald-500 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <Database className="w-16 h-16 text-emerald-400 animate-bounce mb-4" />
            <h2 className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              DROP SECURE BINARY TO INGEST
            </h2>
            <p className="text-slate-400 mt-2 font-mono text-sm">
              PDF • EML • WhatsApp Export • DOCX • JSON
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-emerald-500" />
          <div>
            <h1 className="text-lg font-bold tracking-tight font-mono">
              LifeOS Knowledge Hub <span className="text-xs text-emerald-500">v0.4.0</span>
            </h1>
            <p className="text-xs text-slate-400">
              Second Brain • Life Graph Explorer • AI Memory Pipeline
            </p>
          </div>
        </div>

        {/* Global Mini Search */}
        <div className="flex items-center space-x-3 w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Enterprise search (Keyword, Semantic, Hybrid)..."
              value={searchQuery}
              onChange={(e) => triggerSearch(e.target.value)}
              className="w-full bg-slate-900/80 text-xs text-slate-200 pl-9 pr-3 py-2 rounded border border-slate-800 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 absolute right-3 top-3 animate-spin" />
            )}
          </div>
          <select
            value={searchType}
            onChange={(e: any) => setSearchType(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xxs py-2 px-1.5 rounded border border-slate-800 focus:outline-none font-mono"
          >
            <option value="Hybrid">Hybrid</option>
            <option value="Semantic">Semantic</option>
            <option value="Keyword">Keyword</option>
            <option value="Graph">Graph</option>
          </select>
        </div>
      </header>

      {/* Search results popup dropdown */}
      {searchQuery && searchResults.length > 0 && (
        <div className="absolute top-16 right-6 w-[400px] max-h-96 bg-slate-950 border border-slate-800 rounded-md shadow-2xl z-40 overflow-y-auto flex flex-col p-2">
          <div className="flex items-center justify-between p-2 border-b border-slate-800">
            <span className="text-xxs font-mono text-slate-400 uppercase tracking-widest">
              Search Results ({searchResults.length})
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {searchResults.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const doc = knowledgeList.find((k) => k.id === item.id);
                if (doc) {
                  setActiveDoc(doc);
                  setActiveSubTab("explorer");
                }
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="w-full text-left p-3 hover:bg-slate-900 rounded border-b border-slate-900/50 flex flex-col space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{item.title}</span>
                <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  {(item.relevance * 100).toFixed(0)}% Match
                </span>
              </div>
              <p className="text-xxs text-slate-400 line-clamp-1">{item.summary}</p>
              <div className="flex items-center space-x-2 pt-1 text-xxs font-mono text-slate-500">
                <span className="bg-slate-800/60 px-1.5 py-0.5 rounded">{item.category}</span>
                <span>•</span>
                <span>Source: {item.source}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex space-x-1 py-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: Layers },
            { id: "explorer", label: "Knowledge Explorer", icon: FolderOpen },
            { id: "ingestion", label: "Document Ingestion", icon: Database },
            { id: "graph", label: "Knowledge Graph", icon: Network },
            { id: "assistant", label: "AI Assistant", icon: Sparkles },
            { id: "learning", label: "Spaced Repetition", icon: GraduationCap },
            { id: "api", label: "APIs", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  if (tab.id !== "explorer") setActiveDoc(null);
                }}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-mono border-b-2 transition-colors ${
                  isActive
                    ? "text-emerald-400 border-emerald-500 bg-slate-900/30"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global score pill */}
        {analytics && (
          <div className="flex items-center space-x-3 text-xxs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Memory Engine: Connected</span>
            </span>
            <span>•</span>
            <span>Graph Nodes: {analytics.summary.graphNodesCount}</span>
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* 1. DASHBOARD */}
          {activeSubTab === "dashboard" && analytics && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 h-full overflow-y-auto grid grid-cols-4 gap-6"
            >
              {/* Top Row: Mini Bento KPI Cards */}
              {[
                { title: "KNOWLEDGE OBJECTS", value: analytics.summary.docCount, subtitle: "Files, Notes & SOPs", icon: Database, color: "text-emerald-400 bg-emerald-950/20" },
                { title: "LIFE GRAPH CONNECTIONS", value: analytics.summary.graphEdgesCount, subtitle: "Direct & similarity edges", icon: Network, color: "text-blue-400 bg-blue-950/20" },
                { title: "KNOWLEDGE RETENTION", value: `${analytics.summary.learningHours} hrs`, subtitle: "Spaced repetition metrics", icon: GraduationCap, color: "text-amber-400 bg-amber-950/20" },
                { title: "SEARCH INDEX QUALITY", value: `${analytics.summary.searchEffectiveness}%`, subtitle: "Dense vector compliance", icon: Search, color: "text-pink-400 bg-pink-950/20" }
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xxs font-mono text-slate-500 uppercase tracking-wider">
                        {kpi.title}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-100 font-mono mt-1">
                        {kpi.value}
                      </h2>
                      <p className="text-xxs text-slate-400 mt-0.5">{kpi.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-md ${kpi.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}

              {/* Chart Grid */}
              <div className="col-span-3 bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300">
                    KNOWLEDGE REPOSITORY GROWTH INDEX
                  </h3>
                  <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">
                    +1% daily trajectory
                  </span>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.growthHistory}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderColor: "#1e293b",
                          color: "#cbd5e1"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown list */}
              <div className="col-span-1 bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex flex-col h-[280px]">
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 mb-3">
                  CATEGORY MIX
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {analytics.categories.map((cat: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-900/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-300 font-mono">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-200">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Bento: Most Connected Topics & Gaps */}
              <div className="col-span-2 bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex flex-col h-[240px]">
                <div className="flex items-center space-x-2 mb-3">
                  <Workflow className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold font-mono text-slate-300">
                    MOST CONNECTED MEMORY NODES
                  </h3>
                </div>
                <div className="space-y-2.5 overflow-y-auto flex-1">
                  {analytics.connectedTopics.map((topic: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 bg-slate-900/40 rounded border border-slate-800/60"
                    >
                      <span className="text-slate-200 line-clamp-1">{topic}</span>
                      <span className="text-purple-400 font-mono text-xxs">
                        {6 - i} active links
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex flex-col h-[240px]">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold font-mono text-slate-300">
                    COGNITIVE GAPS & STALE DOCUMENT ALERTS
                  </h3>
                </div>
                <div className="space-y-2.5 overflow-y-auto flex-1">
                  {analytics.gaps.map((gap: string, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-amber-950/10 border border-amber-900/30 flex items-start space-x-3 text-xs"
                    >
                      <div className="mt-0.5 p-1 bg-amber-950/30 rounded text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-300 font-mono">{gap}</h4>
                        <p className="text-xxs text-slate-400 mt-0.5">
                          Detected isolation score: 100%. No semantic connections or files present.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Stream */}
              <div className="col-span-4 bg-slate-950/40 border border-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold font-mono text-slate-300">
                      SECURE EVENTS BUS & SIGNALR ledgers
                    </h3>
                  </div>
                  <span className="text-xxs text-slate-500 font-mono">
                    Real-time transaction log (Phase 4 SignalR)
                  </span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-xxs">
                  {systemEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-2 bg-slate-900/30 rounded border-l-2 border-emerald-500"
                    >
                      <div>
                        <span className="text-slate-300 font-bold">[{evt.title}]</span>
                        <p className="text-slate-400 mt-1">{evt.message}</p>
                      </div>
                      <span className="text-slate-500 text-xxs">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. EXPLORER (SPLIT EDITOR & INSPECTOR) */}
          {activeSubTab === "explorer" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full overflow-hidden"
            >
              {/* Sidebar filter column */}
              <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono text-slate-300">FILTERS</span>
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xxs font-mono text-slate-500 uppercase">CATEGORY</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Document">Documents</option>
                    <option value="Note">Notes</option>
                    <option value="Journal">Journal</option>
                    <option value="Book">Books</option>
                    <option value="Course">Courses</option>
                    <option value="SOP">SOPs</option>
                    <option value="Meeting">Meetings</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xxs font-mono text-slate-500 uppercase">STATUS</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Drafts</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Tag list */}
                <div className="flex flex-col space-y-1 flex-1 overflow-hidden">
                  <label className="text-xxs font-mono text-slate-500 uppercase mb-1">POPULAR TAGS</label>
                  <div className="flex-1 overflow-y-auto flex flex-wrap gap-1 content-start">
                    <button
                      onClick={() => setSelectedTag("All")}
                      className={`text-xxs font-mono px-2 py-1 rounded transition-colors ${
                        selectedTag === "All"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      #all
                    </button>
                    {allUniqueTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-xxs font-mono px-2 py-1 rounded transition-colors ${
                          selectedTag === tag
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct creator note */}
                <button
                  onClick={() => {
                    setActiveDoc(null);
                    setNoteTitle("");
                    setNoteDescription("");
                    setNoteTags("");
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-100 py-2 rounded font-mono text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>NEW MANUAL NOTE</span>
                </button>
              </div>

              {/* Main List and Split Panel */}
              <div className="flex-1 flex overflow-hidden">
                {!activeDoc && (
                  <div className="w-full p-6 overflow-y-auto flex flex-col">
                    {/* Manual creator block or listing */}
                    {noteTitle !== undefined && noteTitle === "" && (
                      <div className="max-w-2xl mx-auto w-full bg-slate-950/40 border border-slate-800 p-6 rounded-lg mt-4">
                        <div className="flex items-center space-x-2 text-emerald-500 mb-4 border-b border-slate-800 pb-2">
                          <Plus className="w-5 h-5" />
                          <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
                            Create Manual Second Brain Entry
                          </h2>
                        </div>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1">
                              <label className="text-xxs font-mono text-slate-400">ENTRY TITLE</label>
                              <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Clean architecture rules..."
                                className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                                required
                              />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-xxs font-mono text-slate-400">CLASSIFICATION</label>
                              <select
                                value={noteCategory}
                                onChange={(e: any) => setNoteCategory(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                              >
                                <option value="Note">Note</option>
                                <option value="Journal">Journal</option>
                                <option value="SOP">SOP</option>
                                <option value="Research">Research</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-xxs font-mono text-slate-400">TAGS (COMMA SEPARATED)</label>
                            <input
                              type="text"
                              value={noteTags}
                              onChange={(e) => setNoteTags(e.target.value)}
                              placeholder="clean-code, dot-net, mediatr"
                              className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-xxs font-mono text-slate-400">DESCRIPTION & MARKDOWN CONTENT</label>
                            <textarea
                              value={noteDescription}
                              onChange={(e) => setNoteDescription(e.target.value)}
                              rows={8}
                              placeholder="Write your permanent notes here..."
                              className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                            ></textarea>
                          </div>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-mono font-bold text-xs py-2 px-4 rounded transition-colors"
                          >
                            Save Node
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Standard Files Grid */}
                    <div className="mt-6 flex-1">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="text-xs font-bold font-mono text-slate-300">
                          FILE REPOSITORY Mix ({filteredList.length} items)
                        </h3>
                        <span className="text-xxs text-slate-500 font-mono">
                          Double-click a file to inspect metadata and run AI flashcard reviews
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {filteredList.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => setActiveDoc(doc)}
                            className="p-4 bg-slate-950/40 border border-slate-800 hover:border-emerald-500 rounded-md cursor-pointer transition-colors flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xxs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/60 uppercase">
                                  {doc.category}
                                </span>
                                <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">
                                  Ver: {doc.version}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-100 mt-2 line-clamp-1">
                                {doc.title}
                              </h4>
                              <p className="text-xxs text-slate-400 mt-1 line-clamp-2">
                                {doc.summary}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xxs font-mono text-slate-500 pt-2 border-t border-slate-900">
                              <span>Source: {doc.source}</span>
                              <div className="flex space-x-1">
                                {doc.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="text-slate-400 bg-slate-900 px-1 py-0.2 rounded">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeDoc && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Split Editor */}
                    <div className="flex-1 border-r border-slate-800 flex flex-col bg-slate-950/10">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveDoc(null)}
                            className="text-slate-400 hover:text-white mr-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div>
                            <span className="text-xxs font-mono text-slate-500 uppercase">{activeDoc.category} EDITOR</span>
                            <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{activeDoc.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={saveDocumentDescription}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-mono text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "SAVE CHANGES"}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 p-4 flex flex-col space-y-2">
                        <label className="text-xxs font-mono text-slate-500 uppercase">
                          RAW TEXT / MARKDOWN SOURCE
                        </label>
                        <textarea
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                        ></textarea>
                      </div>
                    </div>

                    {/* Right Inspector & AI Panel */}
                    <div className="w-[450px] bg-slate-950/60 flex flex-col overflow-y-auto">
                      <div className="p-4 border-b border-slate-800 bg-slate-950">
                        <h4 className="text-xs font-bold font-mono text-emerald-400 tracking-wider">
                          KNOWLEDGE INSPECTOR PANEL
                        </h4>
                      </div>

                      <div className="p-4 space-y-5">
                        {/* Summary & Analytics */}
                        <div className="space-y-2">
                          <span className="text-xxs font-mono text-slate-500 uppercase">COGNITIVE COMPLIANCE INDEX</span>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                              <span className="text-xxs font-mono text-slate-400">Confidence Score</span>
                              <h5 className="text-lg font-bold text-emerald-400 font-mono">{activeDoc.confidenceScore}%</h5>
                            </div>
                            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                              <span className="text-xxs font-mono text-slate-400">Importance Rank</span>
                              <h5 className="text-lg font-bold text-amber-400 font-mono">{activeDoc.importanceScore}/100</h5>
                            </div>
                          </div>
                        </div>

                        {/* Metadata table */}
                        <div className="space-y-2">
                          <span className="text-xxs font-mono text-slate-500 uppercase">SEMANTIC METADATA</span>
                          <div className="bg-slate-900/40 border border-slate-800 rounded p-3 text-xxs font-mono text-slate-300 space-y-1.5">
                            <div className="flex justify-between"><span className="text-slate-500">Author:</span><span>{activeDoc.author}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Created:</span><span>{new Date(activeDoc.created).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Permissions:</span><span>{activeDoc.permissions}</span></div>
                            {Object.entries(activeDoc.metadata || {}).map(([k, v]: any) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-slate-500 capitalize">{k}:</span>
                                <span className="line-clamp-1 max-w-[240px] text-right">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Summary */}
                        <div className="space-y-2">
                          <span className="text-xxs font-mono text-slate-500 uppercase flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span>GABRIEL AI SUMMARY</span>
                          </span>
                          <div className="p-3 bg-slate-900/80 border border-slate-800 text-xxs text-slate-300 leading-relaxed rounded">
                            {activeDoc.aiSummary}
                          </div>
                        </div>

                        {/* Active Relationships */}
                        <div className="space-y-2">
                          <span className="text-xxs font-mono text-slate-500 uppercase">ACTIVE COGNITIVE LINKS</span>
                          <div className="space-y-1.5">
                            {activeDoc.relationships && activeDoc.relationships.length > 0 ? (
                              activeDoc.relationships.map((rel: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-2 bg-slate-900/40 rounded border border-slate-800 flex items-center justify-between text-xxs font-mono"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Workflow className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-slate-300">Target Node ID: {rel.targetId}</span>
                                  </div>
                                  <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                                    {rel.type} ({rel.confidence}%)
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 bg-slate-900/10 border border-slate-800 text-xxs text-slate-500 font-mono text-center rounded">
                                No direct relationships mapped. Run Search to find auto-matches.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Flashcards review */}
                        <div className="space-y-2">
                          <span className="text-xxs font-mono text-slate-500 uppercase">SPACED REPETITION ENCLAVE</span>
                          <div className="space-y-2">
                            {activeDoc.aiFlashcards && activeDoc.aiFlashcards.map((card, i) => (
                              <div key={i} className="p-2.5 bg-slate-900/30 border border-slate-800 rounded text-xxs">
                                <span className="font-bold text-slate-300 font-mono block">Q: {card.question}</span>
                                <span className="text-slate-400 mt-1 block">A: {card.answer}</span>
                                <div className="flex items-center space-x-3 text-xxs font-mono text-slate-500 mt-1.5 border-t border-slate-900 pt-1.5">
                                  <span>Interval: {card.interval || 0} days</span>
                                  <span>•</span>
                                  <span>Ease: {(card.ease || 2.5).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 3. DOCUMENT INGESTION */}
          {activeSubTab === "ingestion" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-6 h-full overflow-y-auto grid grid-cols-3 gap-6"
            >
              {/* Drag and Drop Box & Manual Uploader */}
              <div className="col-span-2 space-y-6">
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-lg flex flex-col justify-center items-center h-64 border-dashed border-slate-700 hover:border-emerald-500 transition-colors">
                  <Database className="w-12 h-12 text-slate-400 mb-2" />
                  <h4 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
                    DRAG & DROP FILE HERE TO INGEST
                  </h4>
                  <p className="text-xxs text-slate-500 mt-1 font-mono">
                    Any text, PDF, Excel, Obsidian, EML or WhatsApp chat export.
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded font-mono transition-colors">
                      CHOOSE FILE FROM WORKSPACE
                    </button>
                  </div>
                </div>

                {/* Simulated File creator */}
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-lg">
                  <h4 className="text-xs font-bold font-mono text-slate-300 mb-4 border-b border-slate-800 pb-2">
                    MANUAL FILE INGESTION SIMULATOR
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-xxs font-mono text-slate-400">FILENAME WITH EXTENSION</label>
                        <input
                          type="text"
                          value={ingestFilename}
                          onChange={(e) => setIngestFilename(e.target.value)}
                          placeholder="shariah_zakat_specifications.pdf"
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-xxs font-mono text-slate-400">DOCUMENT TYPE</label>
                        <select
                          value={ingestFileType}
                          onChange={(e) => setIngestFileType(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                        >
                          <option value="pdf">PDF Document</option>
                          <option value="docx">DOCX Document</option>
                          <option value="txt">TXT File</option>
                          <option value="md">Markdown Article</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xxs font-mono text-slate-400">DOCUMENT RAW BODY</label>
                      <textarea
                        value={ingestContent}
                        onChange={(e) => setIngestContent(e.target.value)}
                        rows={6}
                        placeholder="Paste document contents or transcribed strings..."
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      ></textarea>
                    </div>
                    <button
                      onClick={runFileIngest}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-mono font-bold text-xs py-2 px-4 rounded transition-colors"
                    >
                      TRIGGER INGESTION PIPELINE
                    </button>
                  </div>
                </div>

                {/* WhatsApp importer tab */}
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-lg">
                  <div className="flex items-center space-x-2 text-emerald-400 mb-4 border-b border-slate-800 pb-2">
                    <MessageSquare className="w-5 h-5" />
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                      WhatsApp Export Pipeline
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xxs font-mono text-slate-400">TRANSCRIPT IDENTIFIER</label>
                      <input
                        type="text"
                        value={whatsappFilename}
                        onChange={(e) => setWhatsappFilename(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xxs font-mono text-slate-400">WHATSAPP CHAT EXPORT STREAM</label>
                      <textarea
                        value={whatsappContent}
                        onChange={(e) => setWhatsappContent(e.target.value)}
                        rows={6}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      ></textarea>
                    </div>
                    <button
                      onClick={handleWhatsappIngest}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-mono font-bold text-xs py-2 px-4 rounded transition-colors"
                    >
                      PARSE WHATSAPP CHATS
                    </button>
                  </div>
                </div>

                {/* Email importer tab */}
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-400 mb-4 border-b border-slate-800 pb-2">
                    <Mail className="w-5 h-5" />
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                      Email EML Thread Ingestion
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xxs font-mono text-slate-400">FILE NAME IDENTIFIER</label>
                      <input
                        type="text"
                        value={emailFilename}
                        onChange={(e) => setEmailFilename(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xxs font-mono text-slate-400">RAW EML STRUCTURE (HEADERS & BODY)</label>
                      <textarea
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        rows={6}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      ></textarea>
                    </div>
                    <button
                      onClick={handleEmailIngest}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-mono font-bold text-xs py-2 px-4 rounded transition-colors"
                    >
                      DISPATCH EMAIL AGGREGATION
                    </button>
                  </div>
                </div>

              </div>

              {/* Sidebar pipeline logs */}
              <div className="col-span-1 bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex flex-col h-[500px]">
                <h4 className="text-xs font-bold font-mono text-slate-300 mb-2">
                  ACTIVE INGESTION STREAM
                </h4>
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded mb-4">
                  <span className="text-xxs font-mono text-slate-400">Pipeline Step:</span>
                  <span className="text-xxs font-mono font-bold text-emerald-400">
                    {ingestStatus.step}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${ingestStatus.progress}%` }}
                  ></div>
                </div>

                {/* Log list */}
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xxs">
                  {ingestStatus.logs.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-900/60 rounded border-l border-emerald-500">
                      <span className="text-slate-400">{log}</span>
                    </div>
                  ))}
                  {ingestStatus.logs.length === 0 && (
                    <div className="text-center text-slate-500 py-20">
                      No files are currently traversing the vector ingestion gates.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. KNOWLEDGE GRAPH */}
          {activeSubTab === "graph" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full flex space-x-6 overflow-hidden"
            >
              {/* Interactive SVG canvas */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden flex flex-col justify-between">
                <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/40">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-300">
                      LIFE GRAPH RELATIONSHIP TOPOLOGY Map
                    </h3>
                    <p className="text-xxs text-slate-400">
                      Click nodes to review connections and add manual edge paths
                    </p>
                  </div>
                  <span className="text-xxs font-mono text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded">
                    Dense Index Connected
                  </span>
                </div>

                {/* Render Custom Mock Interactive SVG Graph */}
                <div className="flex-1 relative flex items-center justify-center p-4">
                  <svg className="w-full h-full min-h-[400px]" viewBox="0 0 800 500">
                    {/* Render Edge Lines */}
                    {graphData.edges.map((edge) => {
                      const srcNode = graphData.nodes.find((n) => n.id === edge.source);
                      const tgtNode = graphData.nodes.find((n) => n.id === edge.target);
                      if (!srcNode || !tgtNode) return null;

                      // Map positions
                      const srcX = getPositionX(srcNode.id);
                      const srcY = getPositionY(srcNode.id);
                      const tgtX = getPositionX(tgtNode.id);
                      const tgtY = getPositionY(tgtNode.id);

                      return (
                        <g key={edge.id}>
                          <line
                            x1={srcX}
                            y1={srcY}
                            x2={tgtX}
                            y2={tgtY}
                            stroke="#334155"
                            strokeWidth={1.5}
                            className="transition-colors hover:stroke-emerald-500"
                          />
                          <text
                            x={(srcX + tgtX) / 2}
                            y={(srcY + tgtY) / 2 - 4}
                            fill="#64748b"
                            fontSize={7}
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {edge.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Render Node Circles */}
                    {graphData.nodes.map((node) => {
                      const x = getPositionX(node.id);
                      const y = getPositionY(node.id);
                      const isSelected = selectedGraphNode?.id === node.id;

                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedGraphNode(node)}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={isSelected ? node.val + 4 : node.val}
                            fill={node.color || "#64748b"}
                            stroke={isSelected ? "#10b981" : "#1e293b"}
                            strokeWidth={2}
                          />
                          <text
                            x={x}
                            y={y + node.val + 12}
                            fill={isSelected ? "#10b981" : "#cbd5e1"}
                            fontSize={9}
                            fontFamily="monospace"
                            textAnchor="middle"
                            fontWeight={isSelected ? "bold" : "normal"}
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legend overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded text-xxs font-mono space-y-1.5">
                    <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span><span>Documents & SOPs</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span><span>Meetings & Chat Parsers</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span><span>Literature & Notes</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-[#ec4899]"></span><span>Projects & Goals</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span><span>People (Contacts)</span></div>
                  </div>
                </div>
              </div>

              {/* Relation controller and node inspector */}
              <div className="w-80 flex flex-col space-y-6">
                {/* Node Inspector */}
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-lg">
                  <h4 className="text-xs font-bold font-mono text-slate-300 border-b border-slate-800 pb-2 mb-3">
                    NODE INSPECTOR
                  </h4>
                  {selectedGraphNode ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-xxs font-mono text-slate-500 uppercase">LABEL</span>
                        <h5 className="text-xs font-bold font-mono text-slate-200">{selectedGraphNode.label}</h5>
                      </div>
                      <div>
                        <span className="text-xxs font-mono text-slate-500 uppercase">ENTITY ID</span>
                        <p className="text-xxs font-mono text-slate-400 bg-slate-900 p-1 rounded border border-slate-800">
                          {selectedGraphNode.id}
                        </p>
                      </div>
                      <div>
                        <span className="text-xxs font-mono text-slate-500 uppercase">CLASSIFICATION TYPE</span>
                        <span className="inline-block text-xxs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded mt-1">
                          {selectedGraphNode.type}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const doc = knowledgeList.find((k) => k.id === selectedGraphNode.id);
                          if (doc) {
                            setActiveDoc(doc);
                            setActiveSubTab("explorer");
                          }
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 py-1.5 rounded font-mono transition-colors"
                      >
                        VIEW CORRESPONDING FILE
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-8 text-xs font-mono">
                      No node selected. Click a bubble on the canvas map.
                    </div>
                  )}
                </div>

                {/* Create Edge Relationship Builder */}
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-lg">
                  <h4 className="text-xs font-bold font-mono text-slate-300 border-b border-slate-800 pb-2 mb-3">
                    ADD MANUAL RELATIONSHIP EDGE
                  </h4>
                  <form onSubmit={handleCreateEdge} className="space-y-3 font-mono text-xxs">
                    <div className="flex flex-col space-y-1">
                      <label className="text-slate-400">SOURCE NODE</label>
                      <select
                        value={relationSource}
                        onChange={(e) => setRelationSource(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                        required
                      >
                        <option value="">Select source...</option>
                        {graphData.nodes.map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-slate-400">TARGET NODE</label>
                      <select
                        value={relationTarget}
                        onChange={(e) => setRelationTarget(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                        required
                      >
                        <option value="">Select target...</option>
                        {graphData.nodes.map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-slate-400">RELATION LABEL</label>
                      <input
                        type="text"
                        value={relationLabel}
                        onChange={(e) => setRelationLabel(e.target.value)}
                        placeholder="associated, similar_to..."
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-100 py-2 rounded font-bold tracking-wider"
                    >
                      CONNECT ENTITIES
                    </button>
                  </form>
                </div>
              </div>

            </motion.div>
          )}

          {/* 5. GABRIEL AI ASSISTANT (STRATEGIC DIALOGUE) */}
          {activeSubTab === "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full flex space-x-6 overflow-hidden"
            >
              {/* Context Selector Side Column */}
              <div className="w-80 border border-slate-800 bg-slate-950/40 p-4 rounded-lg flex flex-col space-y-4 overflow-y-auto">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold font-mono text-slate-300">
                    SELECT CONTEXT NODES
                  </h3>
                </div>
                <p className="text-xxs text-slate-500 font-mono leading-relaxed">
                  Toggle documents to inject directly into Gabriel's reasoning context buffer before executing prompts.
                </p>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {knowledgeList.map((doc) => {
                    const isSelected = selectedDocsForAi.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDocsForAi(prev =>
                            isSelected ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                          );
                        }}
                        className={`w-full text-left p-2.5 rounded border transition-colors flex flex-col ${
                          isSelected
                            ? "bg-emerald-950/20 border-emerald-500 text-slate-100"
                            : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xxs font-bold font-mono line-clamp-1">{doc.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                          {doc.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Prompts & Answers Panel */}
              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-lg space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold font-mono text-slate-300">
                      GABRIEL INTELLECTUAL SECOND BRAIN QUERIES
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "general", label: "Answer From Documents", desc: "Consult selected indexes" },
                      { id: "study_guide", label: "Generate Study Guide", desc: "Build quizzes & flashcards" },
                      { id: "sop", label: "Generate SOP", desc: "Create enterprise procedures" },
                      { id: "contradictions", label: "Find Contradictions", desc: "Audit conflicts & anomalies" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setAssistantTaskType(mode.id as any)}
                        className={`p-3 rounded border text-left font-mono transition-colors flex flex-col justify-between ${
                          assistantTaskType === mode.id
                            ? "bg-emerald-950/30 border-emerald-500 text-emerald-400"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <span className="text-xxs font-bold">{mode.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 leading-normal">{mode.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Prompt input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask Gabriel anything regarding your second brain..."
                      value={assistantPrompt}
                      onChange={(e) => setAssistantPrompt(e.target.value)}
                      className="w-full bg-slate-900/80 text-xs text-slate-200 pl-4 pr-12 py-3 rounded border border-slate-800 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && askGabrielAssistant()}
                    />
                    <button
                      onClick={askGabrielAssistant}
                      disabled={isAiResponding}
                      className="absolute right-2 top-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Response area */}
                <div className="flex-1 bg-slate-950/30 border border-slate-800 rounded-lg p-6 overflow-y-auto relative min-h-[250px]">
                  {isAiResponding && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <span className="text-xxs font-mono text-slate-400 mt-2">
                        Gabriel compiling selected knowledge segments...
                      </span>
                    </div>
                  )}

                  {assistantResponse ? (
                    <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed font-sans space-y-4">
                      {assistantResponse.split("\n").map((line, idx) => {
                        if (line.startsWith("###")) {
                          return <h3 key={idx} className="text-sm font-bold font-mono text-emerald-400 border-b border-slate-800 pb-2 mt-4">{line.replace("###", "")}</h3>;
                        }
                        if (line.startsWith("####")) {
                          return <h4 key={idx} className="text-xs font-bold font-mono text-slate-200 mt-3">{line.replace("####", "")}</h4>;
                        }
                        if (line.startsWith("-")) {
                          return <li key={idx} className="ml-4 list-disc text-slate-300 mt-1">{line.replace("-", "").trim()}</li>;
                        }
                        return <p key={idx} className="mt-1">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20 font-mono text-xs text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-slate-600" />
                      <span>Ready for Jannah AI alignment. Select context and issue prompt above.</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 6. SPACED REPETITION ENGINE */}
          {activeSubTab === "learning" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full flex space-x-6 overflow-hidden"
            >
              {/* Active reviewing Flashcard Box */}
              <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-800 rounded-lg p-6 relative justify-between min-h-[350px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-300">
                      LEITNER DECK SPACED REPETITION REVIEWER
                    </h3>
                    <p className="text-xxs text-slate-400">
                      Strengthen memory pathways through scheduled SM2 iterations
                    </p>
                  </div>
                  <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                    Due Flashcards: {learningDeck.length}
                  </span>
                </div>

                {learningDeck.length > 0 && isLeitnerReviewing ? (
                  <div className="flex-1 flex flex-col justify-center items-center py-10 space-y-6">
                    {/* Flashcard Frame */}
                    <div className="w-[450px] bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative flex flex-col justify-between min-h-[220px]">
                      <div>
                        <span className="text-xxs font-mono text-slate-500 block uppercase mb-2">
                          Source Doc: {learningDeck[currentDeckIdx].docTitle}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100 font-sans leading-relaxed">
                          Q: {learningDeck[currentDeckIdx].question}
                        </h4>
                      </div>

                      <AnimatePresence>
                        {showAnswer && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 pt-6 border-t border-slate-800"
                          >
                            <span className="text-xxs font-mono text-emerald-400 block uppercase mb-1">
                              System Verified Answer
                            </span>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed">
                              {learningDeck[currentDeckIdx].answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!showAnswer && (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="mt-8 bg-slate-800 hover:bg-slate-700 text-xs font-mono py-2 rounded text-slate-300 transition-colors w-full"
                        >
                          SHOW VERIFIED ANSWER
                        </button>
                      )}
                    </div>

                    {/* Ratings Controls */}
                    {showAnswer && (
                      <div className="flex space-x-2 w-[450px]">
                        {[
                          { id: "again", label: "Again", style: "bg-red-950/50 text-red-400 hover:bg-red-900/60 border-red-800" },
                          { id: "hard", label: "Hard", style: "bg-orange-950/50 text-orange-400 hover:bg-orange-900/60 border-orange-800" },
                          { id: "good", label: "Good", style: "bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60 border-emerald-800" },
                          { id: "easy", label: "Easy", style: "bg-blue-950/50 text-blue-400 hover:bg-blue-900/60 border-blue-800" }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => rateFlashcard(btn.id as any)}
                            className={`flex-1 py-2 rounded border font-mono text-xxs transition-colors ${btn.style}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center py-20 text-center space-y-4">
                    <GraduationCap className="w-12 h-12 text-slate-600" />
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-400">
                        {learningDeck.length > 0 ? "REVIEW SESSIONS PENDING" : "REPETITIONS CLEAR"}
                      </h4>
                      <p className="text-xxs text-slate-500 font-mono mt-1 max-w-sm mx-auto leading-normal">
                        {learningDeck.length > 0
                          ? `You have ${learningDeck.length} flashcards waiting. Strengthen synaptic integration loops now.`
                          : "Your active memory enclaves are completely synced. No review cards due today."}
                      </p>
                    </div>
                    {learningDeck.length > 0 && (
                      <button
                        onClick={() => {
                          setIsLeitnerReviewing(true);
                          setCurrentDeckIdx(0);
                          setShowAnswer(false);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-6 py-2 rounded font-bold transition-colors"
                      >
                        BEGIN SPACED REVIEW ({learningDeck.length} CARDS)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Learning recommendations side panels */}
              <div className="w-80 flex flex-col space-y-6">
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex-1 flex flex-col">
                  <h4 className="text-xs font-bold font-mono text-slate-300 border-b border-slate-800 pb-2 mb-3">
                    MEMORY COMPLIANCE RADAR
                  </h4>
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-xxs font-mono text-slate-500 uppercase">Leitner Level Index</span>
                      <h5 className="text-lg font-bold text-emerald-400 font-mono mt-0.5">Level 3 / Safe</h5>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-2">
                      <span className="text-xxs font-mono text-slate-500 uppercase">Gabriel's Strategic Advice</span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Your retention factor on **MediatR aggregates** is sitting safe at 94%. We recommend refreshing Zakat physical gold ledger calculations to bridge the current domestic financial planning gap.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 7. OPENAPI SPECIFICATION VIEWER */}
          {activeSubTab === "api" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 h-full overflow-y-auto space-y-6"
            >
              <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xs font-bold font-mono text-slate-300">
                    Jannah LifeOS Phase 4 OpenAPI Specifications (Swagger spec)
                  </h3>
                </div>

                <div className="space-y-4 font-mono text-xxs">
                  {[
                    { method: "GET", path: "/api/knowledge", desc: "Retrieve active list of Second Brain knowledge elements, filtered by category, status, tags.", params: "category, tag, status" },
                    { method: "POST", path: "/api/knowledge", desc: "Add a manual raw markdown/text note or journal node into the memory database.", params: "title, category, description, tags" },
                    { method: "POST", path: "/api/knowledge/ingest", desc: "Trigger multi-stage file ingestion pipeline (Parsing, OCR scanning, Language detection, Embedding, AI Summarization, Leitner flashcard extraction).", params: "filename, content, fileType" },
                    { method: "POST", path: "/api/knowledge/whatsapp", desc: "Ingest exported WhatsApp transcripts. Extracts participants, chronological timeline, decisions, pending action lists, and links them to core goals.", params: "filename, content" },
                    { method: "POST", path: "/api/knowledge/email", desc: "Digest raw EML files. Processes header paths, thread context, attachment schemas, and maps contact profiles.", params: "filename, content" },
                    { method: "GET", path: "/api/knowledge/graph", desc: "Fetch complete Jannah Life Graph representation (node parameters and edge relation links).", params: "None" },
                    { method: "POST", path: "/api/knowledge/graph/edge", desc: "Establish relationship vector between two graph entities manually.", params: "source, target, label, type" },
                    { method: "GET", path: "/api/knowledge/search", desc: "Perform dense vector, keyword or semantic hybrid searches across the entire knowledge base.", params: "query, type (Keyword, Semantic, Hybrid, Graph)" },
                    { method: "POST", path: "/api/knowledge/review", desc: "Record Leitner Spaced Repetition card reviews using SM2 parameters.", params: "id, flashcardIdx, rating (again, hard, good, easy)" },
                    { method: "GET", path: "/api/knowledge/analytics", desc: "Fetch dynamic totals, category mixers, growth indexes, connected nodes, and stale gap alerts.", params: "None" }
                  ].map((api, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/40 border border-slate-800 rounded flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-0.5 rounded text-white font-bold text-[9px] ${
                            api.method === "GET" ? "bg-emerald-700" : "bg-blue-700"
                          }`}
                        >
                          {api.method}
                        </span>
                        <div>
                          <span className="text-slate-200 font-bold text-xs">{api.path}</span>
                          <p className="text-slate-400 mt-1 max-w-2xl leading-normal">{api.desc}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col">
                        <span className="text-slate-500">Parameters:</span>
                        <span className="text-slate-300 font-bold">{api.params}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
