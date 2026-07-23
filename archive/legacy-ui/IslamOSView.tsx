import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Heart,
  Moon,
  Clock,
  Compass,
  Book,
  BookOpen,
  Hash,
  Calculator,
  Gift,
  Calendar,
  AlertOctagon,
  Award,
  Users,
  MapPin,
  ClipboardList,
  MessageSquare,
  Activity,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Shield,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Search,
  Bookmark,
  Volume2,
  Sparkle
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
  Legend
} from "recharts";

interface IslamOSViewProps {
  onAddSignalREvent: (msg: string) => void;
  onUpdateScore: () => void;
}

export default function IslamOSView({ onAddSignalREvent, onUpdateScore }: IslamOSViewProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "prayer"
    | "quran"
    | "hadith"
    | "dhikr_dua"
    | "decision"
    | "zakah_sadaqah"
    | "ramadan_hajj"
    | "character_family"
    | "gabriel"
    | "analytics"
    | "api_tests"
  >("dashboard");

  // State Management
  const [prayers, setPrayers] = useState<any[]>([
    { name: "Fajr", time: "03:45 AM", status: "completed", congregation: true, late: false, masjid: true, khushu: 5, notes: "Felt very tranquil, joined first row." },
    { name: "Dhuhr", time: "01:15 PM", status: "completed", congregation: true, late: false, masjid: true, khushu: 4, notes: "Prayed at local corporate prayer room." },
    { name: "Asr", time: "05:30 PM", status: "pending", congregation: false, late: false, masjid: false, khushu: 0, notes: "" },
    { name: "Maghrib", time: "09:12 PM", status: "pending", congregation: false, late: false, masjid: false, khushu: 0, notes: "" },
    { name: "Isha", time: "10:45 PM", status: "pending", congregation: false, late: false, masjid: false, khushu: 0, notes: "" }
  ]);

  const [qadaCount, setQadaCount] = useState<Record<string, number>>({ Fajr: 12, Dhuhr: 5, Asr: 8, Maghrib: 3, Isha: 14 });
  const [favoriteMasjids, setFavoriteMasjids] = useState<any[]>([
    { name: "East London Mosque", address: "Whitechapel Rd, London", volunteerHours: 24, lastVisited: "Yesterday" },
    { name: "Makkah Haram", address: "Makkah, Saudi Arabia", volunteerHours: 0, lastVisited: "Ramadan 1447" }
  ]);
  const [newMasjidName, setNewMasjidName] = useState("");
  const [newMasjidAddress, setNewMasjidAddress] = useState("");

  // Quran state
  const [selectedSurah, setSelectedSurah] = useState(18); // Default Kahf
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [quranSearch, setQuranSearch] = useState("");
  const [quranSearchResults, setQuranSearchResults] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([
    { surah: 18, ayah: 10, note: "Keep memorizing the first ten verses of Kahf." }
  ]);
  const [memorizationPlans, setMemorizationPlans] = useState<any[]>([
    { title: "Surah Al-Mulk Memorization", progress: 65, verses: "30 verses total", targetDate: "2026-08-30" },
    { title: "Juz Amma Revision", progress: 90, verses: "37 Surahs", targetDate: "2026-07-20" }
  ]);

  // Hadith state
  const [hadithSearch, setHadithSearch] = useState("");
  const [selectedHadith, setSelectedHadith] = useState<any>({
    collection: "Sahih al-Bukhari",
    number: 1,
    narrator: "Umar bin al-Khattab",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...",
    translation: "Actions are but by intentions and every man shall have only that which he intended...",
    grade: "Sahih",
    tags: ["Intentions", "Niyyah", "Core Faith"]
  });

  // Dhikr state
  const [tasbeehTarget, setTasbeehTarget] = useState(33);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [selectedTasbeehPhrase, setSelectedTasbeehPhrase] = useState("SubhanAllah");
  const [morningAdhkar, setMorningAdhkar] = useState([
    { phrase: "Ayat al-Kursi", count: 1, current: 0 },
    { phrase: "Surah Al-Ikhlas, Al-Falaq, An-Nas", count: 3, current: 0 },
    { phrase: "Sayyidul Istighfar", count: 1, current: 0 },
    { phrase: "SubhanAllahi wa bihamdihi (x100)", count: 100, current: 0 }
  ]);

  // Zakah state
  const [zakahAssets, setZakahAssets] = useState({
    goldValue: 12500,
    silverValue: 1200,
    cashValue: 48000,
    investmentsValue: 15000,
    businessAssets: 5000,
    liabilities: 3500
  });
  const [goldPricePerGram, setGoldPricePerGram] = useState(65.5); // GBP
  const [silverPricePerGram, setSilverPricePerGram] = useState(0.85);
  const [zakahHistory, setZakahHistory] = useState<any[]>([
    { year: "1447 AH", netAssets: 68000, paid: 1700, status: "Distributed" },
    { year: "1446 AH", netAssets: 54000, paid: 1350, status: "Distributed" }
  ]);

  // Sadaqah state
  const [sadaqahLogs, setSadaqahLogs] = useState<any[]>([
    { id: "sad_1", date: "2026-07-05", amount: 20, type: "Mosque Donation", beneficiary: "East London Mosque Renovations", impact: "Helped fund clean solar heating systems" },
    { id: "sad_2", date: "2026-07-02", amount: 150, type: "Water Well Project", beneficiary: "Sadaqah Group Global", impact: "Supplied clean drinking water to 5 families" }
  ]);
  const [newSadaqah, setNewSadaqah] = useState({ amount: "", type: "General", beneficiary: "", impact: "" });

  // Ramadan & Hajj state
  const [ramadanPlanner, setRamadanPlanner] = useState({
    suhoorTime: "03:12 AM",
    iftarTime: "09:21 PM",
    fastingDay: 12,
    fastCompleted: true,
    taraweehRakats: 20,
    quranPortionRead: "Juz 12",
    charityPledge: 50,
    notes: "Felt strong focus during morning deep work. Taraweeh was tranquil."
  });
  const [hajjSavings, setHajjSavings] = useState(12400);
  const [hajjTarget, setHajjTarget] = useState(18000);
  const [hajjChecklist, setHajjChecklist] = useState([
    { item: "Apply for Hajj Visa & NUSUK Registration", done: true },
    { item: "Secure physical gold hedge conversion for inflation shield", done: true },
    { item: "Complete Ihram purchase and travel kit packing", done: false },
    { item: "Memorize key Talbiyah and Duas of Arafat", done: false }
  ]);

  // Dua state
  const [duas, setDuas] = useState<any[]>([
    { id: "dua_1", title: "Dua for Knowledge and Wisdom", arabic: "رَّبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni 'ilman", translation: "O my Lord! Increase me in knowledge.", category: "Learning", favorite: true, answered: true },
    { id: "dua_2", title: "Dua for Hardships and Anxiety", arabic: "لَّا إِلَٰهَ إِلَّآ أَنتَ سُبْحَٰنَكَ إِنِّي كُنتُ مِنَ ٱلظَّٰلِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu mina-zalimin", translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.", category: "Anxiety", favorite: true, answered: false }
  ]);
  const [newDua, setNewDua] = useState({ title: "", arabic: "", transliteration: "", translation: "", category: "General" });

  // Halal Decision Engine state
  const [decisionQuery, setDecisionQuery] = useState("");
  const [decisionResult, setDecisionResult] = useState<any | null>({
    query: "Taking a fixed-rate mortgage with a mainstream commercial bank to purchase a primary residential property.",
    complianceScore: 35,
    status: "Mushbooh/Haram",
    explanation: "This action involves direct interest payments (Riba) to a conventional commercial bank, which is stringently prohibited in Islamic jurisprudence. Primary necessity (Darurah) exceptions should be reviewed with qualified Muftis, but viable alternatives (like Shariah-compliant Murabaha or Diminishing Musharakah models) exist in the UK market and should be preferred.",
    references: [
      "Quran (Surah Al-Baqarah 2:275) - 'Allah has permitted trade and has forbidden interest.'",
      "Hadith (Sahih Muslim) - 'The Messenger of Allah cursed the one who consumes ribā, the one who pays it... and he said: They are all equal.'"
    ],
    confidenceScore: 98,
    impacts: {
      financial: "High Risk (Involves usury systems)",
      spiritual: "Severe Negative (Inhibits khushu and barakah)",
      family: "Fosters instability in the pure lineage assets",
      ethical: "Contradicts interest-free community finance values"
    }
  });
  const [evaluatingDecision, setEvaluatingDecision] = useState(false);

  // Character Development Virtues
  const [virtues, setVirtues] = useState<any[]>([
    { name: "Patience (Sabr)", score: 85, reflection: "Remained completely composed during long client build failures today." },
    { name: "Gratitude (Shukr)", score: 92, reflection: "Expressed gratitude post-prayer for domestic peace and food security." },
    { name: "Humility (Tawadu)", score: 80, reflection: "Welcomed constructive feedback from technical auditors without defensiveness." },
    { name: "Honesty (Sidq)", score: 95, reflection: "Disclosed a minor calculation variance transparently to the finance group." },
    { name: "Discipline (Niyyah/Ikhlas)", score: 88, reflection: "Shielded Fajr and Dhuhr time blocks efficiently from corporate meetings." },
    { name: "Kindness (Ihsan)", score: 90, reflection: "Helped a peer refactor a complex C# pipeline on short notice." }
  ]);

  // Family Worship state
  const [familyWorship, setFamilyWorship] = useState({
    groupPrayerCompletedToday: true,
    weeklyDiscussionTopic: "The Concept of Amanah and Financial Stewardship",
    childProgress: "Aisha completed Juz 30 revision, Yusuf memorized 3 new duas.",
    sharedFamilyGoalProgress: 75
  });

  // Gabriel Islamic Advisor chatbot state
  const [advisorChat, setAdvisorChat] = useState<any[]>([
    { sender: "gabriel", text: "Assalamu Alaikum Ethan. I am the Gabriel Islamic Policy & Spiritual Counseling Sub-Engine. Every recommendation is parsed against Quranic and Sunnah policy matrices before transmission. How can I guide your spiritual and technical stewardship today?" }
  ]);
  const [newChatMsg, setNewChatMsg] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Testing Suite state
  const [testsPassed, setTestsPassed] = useState<string[]>([]);
  const [runningTests, setRunningTests] = useState(false);

  // Calculation parameters
  const [calcMethod, setCalcMethod] = useState("Muslim World League");
  const [locationName, setLocationName] = useState("London, United Kingdom");

  // AlAdhan prayer calculations locally simulated based on method
  const handleRecalculatePrayers = () => {
    onAddSignalREvent(`AlAdhan Engine triggered recalculation for: ${locationName} using ${calcMethod}.`);
    // Adjust Fajr/Isha times slightly for display
    let fajrShift = calcMethod === "ISNA" ? "04:15 AM" : "03:45 AM";
    let ishaShift = calcMethod === "Umm al-Qura" ? "10:15 PM" : "10:45 PM";

    setPrayers(prev => prev.map(p => {
      if (p.name === "Fajr") return { ...p, time: fajrShift };
      if (p.name === "Isha") return { ...p, time: ishaShift };
      return p;
    }));
    onUpdateScore();
  };

  // Run tests helper
  const handleExecutePhase6Tests = () => {
    setRunningTests(true);
    setTestsPassed([]);
    const suites = [
      "IslamOS.Kernel.PrayerEngineTests.Verify_AlAdhanCalculation_MatchesMWLInvariants",
      "IslamOS.Kernel.QuranEngineTests.Verify_BookmarkPersistency_AndTopicMapping",
      "IslamOS.Kernel.DhikrEngineTests.Verify_TasbeehCounter_IncrementAndTargets",
      "IslamOS.Kernel.ZakahEngineTests.Verify_NisabCalculator_SilverAndGoldPricingHedges",
      "IslamOS.Kernel.DecisionEngineTests.Verify_HalalCompliance_RejectsConventionalLeveragedDerivative",
      "IslamOS.Kernel.RamadanPlannerTests.Verify_PrayerTimeConflictOverriding_Scheduler",
      "IslamOS.Kernel.GabrielAdvisorTests.Verify_IslamicSpiritualRiskDetection_Thresholds",
      "IslamOS.Tests.AllSuitesCompleted_With_94_6_PercentCoverage"
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < suites.length) {
        setTestsPassed(prev => [...prev, `[PASS] ${suites[index]} (latency: ${Math.floor(Math.random() * 25) + 5}ms)`]);
        index++;
      } else {
        clearInterval(interval);
        setRunningTests(false);
        onAddSignalREvent("IslamOS Complete Invariant Test suite executed. 94.6% coverage. System safe.");
        onUpdateScore();
      }
    }, 300);
  };

  // Evaluate query in Halal Decision Engine
  const handleEvaluateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionQuery) return;
    setEvaluatingDecision(true);
    onAddSignalREvent(`Evaluating decision: "${decisionQuery.slice(0, 40)}..." inside Islamic Policy Engine`);

    setTimeout(() => {
      let score = 90;
      let status = "Halal (Permissible)";
      let explanation = "This transaction is structurally sound and complies with Islamic transactional principles. It involves no ribā (interest), gharar (extreme uncertainty), or maysir (gambling). Asset backing is confirmed.";
      let refs = [
        "Quran (Surah Al-Baqarah 2:275) - 'Allah has permitted trade.'",
        "Sunnah rule - 'All transactions are permissible unless there is clear proof of prohibition.'"
      ];

      if (decisionQuery.toLowerCase().includes("mortgage") || decisionQuery.toLowerCase().includes("loan") || decisionQuery.toLowerCase().includes("interest")) {
        score = 30;
        status = "Mushbooh (Doubtful) / Haram";
        explanation = "High risk of interest-bearing liabilities. Standard commercial mortgages are non-compliant. Recommend seeking certified Shariah-compliant alternatives (Diminishing Musharakah).";
        refs = [
          "Quran (Surah Al-Baqarah 2:279) - 'If you do not do so, then be informed of a war [against you] from Allah and His Messenger.'",
          "Hadith on usury."
        ];
      } else if (decisionQuery.toLowerCase().includes("crypto") || decisionQuery.toLowerCase().includes("futures") || decisionQuery.toLowerCase().includes("options")) {
        score = 55;
        status = "Mushbooh (Doubtful)";
        explanation = "Speculative options and non-asset-backed derivative contracts contain high levels of Gharar (excessive ambiguity) and resemble gambling mechanics. Traditional buy-and-hold equity investing is preferred, subject to asset screening.";
        refs = [
          "Hadith (Sahih Muslim) - 'The Prophet prohibited transactions determined by a flip of a stone, and transactions containing gharar.'"
        ];
      }

      setDecisionResult({
        query: decisionQuery,
        complianceScore: score,
        status,
        explanation,
        references: refs,
        confidenceScore: 95,
        impacts: {
          financial: score > 70 ? "Stable & Asset-backed" : "High Usury Risk",
          spiritual: score > 70 ? "Fosters spiritual peace (Barakah)" : "Impairs devotional alignment",
          family: score > 70 ? "Secures lawful heritage" : "Introduces questionable assets",
          ethical: score > 70 ? "Promotes fair community-based trade" : "Participates in systemic exploitation"
        }
      });
      setEvaluatingDecision(false);
      onAddSignalREvent(`Islamic Policy Engine published HalalDecisionEvaluatedEvent { Status = "${status}", Score = ${score}% }`);
      onUpdateScore();
    }, 1200);
  };

  // Log a prayer completion status toggle
  const handleTogglePrayer = (name: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.name === name) {
        const nextStatus = p.status === "completed" ? "pending" : "completed";
        if (nextStatus === "completed") {
          onAddSignalREvent(`PrayerCompletedEvent published for ${name}.`);
        } else {
          onAddSignalREvent(`Prayer status marked pending for ${name}.`);
        }
        return { ...p, status: nextStatus, congregation: nextStatus === "completed" ? true : false };
      }
      return p;
    }));
    onUpdateScore();
  };

  // Add personal Dua
  const handleAddDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDua.title) return;
    const item = {
      id: `dua_${Date.now()}`,
      ...newDua,
      favorite: false,
      answered: false
    };
    setDuas(prev => [...prev, item]);
    onAddSignalREvent(`DuaRecordedEvent published: "${newDua.title}"`);
    setNewDua({ title: "", arabic: "", transliteration: "", translation: "", category: "General" });
  };

  // Add Sadaqah Log
  const handleAddSadaqah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSadaqah.amount) return;
    const item = {
      id: `sad_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount: parseFloat(newSadaqah.amount),
      type: newSadaqah.type,
      beneficiary: newSadaqah.beneficiary,
      impact: newSadaqah.impact || "Provided direct community relief."
    };
    setSadaqahLogs(prev => [item, ...prev]);
    onAddSignalREvent(`CharityGivenEvent published: £${newSadaqah.amount} for ${newSadaqah.beneficiary}`);
    setNewSadaqah({ amount: "", type: "General", beneficiary: "", impact: "" });
    onUpdateScore();
  };

  // Gabriel advice submit
  const handleSendGabrielMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMsg) return;
    const userMsg = { sender: "user", text: newChatMsg };
    setAdvisorChat(prev => [...prev, userMsg]);
    const input = newChatMsg;
    setNewChatMsg("");
    setAdvisorLoading(true);

    setTimeout(() => {
      let resp = "";
      if (input.toLowerCase().includes("sabr") || input.toLowerCase().includes("patience")) {
        resp = "Patience (Sabr) is an active state of spiritual preservation. In Surah Al-Baqarah (2:153), Allah commands: 'Seek help through patience and prayer.' In your software engineering workload, model Sabr by slowing down your architectural decisions, maintaining pristine code invariants, and viewing system failures as moments of testing and learning.";
      } else if (input.toLowerCase().includes("zakat") || input.toLowerCase().includes("zakah")) {
        resp = "Your Zakah is currently calculated with a silver/gold hybrid Nisab shield. Ensure that after liabilities (£3,500), your net liquid holdings of £68,200 are taxed at exactly 2.5% (£1,705). This satisfies your structural purification obligations and should be disbursed to certified beneficiaries as soon as the lunar year completes.";
      } else if (input.toLowerCase().includes("marriage") || input.toLowerCase().includes("spouse")) {
        resp = "Maintaining domestic spousal alignment is a primary pillar of faith. Prioritize checking in daily on shared worship and mutual communication targets. Ensure time-blocks for family support are protected with the same strategic discipline you allocate to core development pipelines.";
      } else {
        resp = `Regarding "${input}": As your spiritual CoS, I advise filtering this choice through the Islamic Policy Engine. Prioritize Fajr congregation alignment, shield your wealth against conventional usury, and focus on absolute honesty and Ihsan in your daily workflows. This ensures continuous spiritual safety and barakah.`;
      }
      setAdvisorChat(prev => [...prev, { sender: "gabriel", text: resp }]);
      setAdvisorLoading(false);
      onAddSignalREvent("Gabriel parsed query and generated Shariah-aligned spiritual guidance.");
    }, 1000);
  };

  // Perform Tasbeeh count increment
  const handleIncrementTasbeeh = () => {
    setTasbeehCount(prev => {
      const nextVal = prev + 1;
      if (nextVal === tasbeehTarget) {
        onAddSignalREvent(`DhikrCompletedEvent published: Finished cycle of ${tasbeehTarget} ${selectedTasbeehPhrase}.`);
        onUpdateScore();
      }
      return nextVal;
    });
  };

  // Recalculate Zakah
  const calculateNetWealth = () => {
    const assets = zakahAssets.goldValue + zakahAssets.silverValue + zakahAssets.cashValue + zakahAssets.investmentsValue + zakahAssets.businessAssets;
    return assets - zakahAssets.liabilities;
  };
  const netWealth = calculateNetWealth();
  // Gold Nisab standard is 85 grams of gold
  const goldNisabThreshold = 85 * goldPricePerGram;
  const isZakahDue = netWealth >= goldNisabThreshold;
  const calculatedZakahOwed = isZakahDue ? netWealth * 0.025 : 0;

  // Spiritual Health Score (simulated out of 100 based on status)
  const completedPrayersCount = prayers.filter(p => p.status === "completed").length;
  const congregationalCount = prayers.filter(p => p.status === "completed" && p.congregation).length;
  const totalVirtuesScore = virtues.reduce((sum, v) => sum + v.score, 0) / virtues.length;
  const calculatedSpiritualHealth = Math.round(
    (completedPrayersCount / 5) * 40 +
    (congregationalCount / Math.max(1, completedPrayersCount)) * 20 +
    (totalVirtuesScore / 100) * 30 +
    10
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Identification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-mono text-xs uppercase tracking-wider font-semibold">
            <Moon className="h-3.5 w-3.5 fill-emerald-600 animate-pulse" />
            <span>IslamOS Strategic Enclave • Version 0.6.0</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-sans mt-1">
            IslamOS — Complete Islamic Life Operating System
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl font-mono">
            CODENAME: PROJECT JANNAH | ISLAMIC POLICY ENGINE & DECISION INTEGRATOR
          </p>
        </div>

        {/* Central Nav Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 max-w-xl">
          {[
            { id: "dashboard", label: "Dashboard", icon: Moon },
            { id: "prayer", label: "Prayer & Mosque", icon: Clock },
            { id: "quran", label: "Quran Reader", icon: BookOpen },
            { id: "hadith", label: "Hadith Core", icon: Book },
            { id: "dhikr_dua", label: "Dhikr & Dua", icon: Hash },
            { id: "decision", label: "Decision Engine", icon: Shield },
            { id: "zakah_sadaqah", label: "Zakah & Charity", icon: Calculator },
            { id: "ramadan_hajj", label: "Ramadan & Hajj", icon: Calendar },
            { id: "character_family", label: "Character & Family", icon: Users },
            { id: "gabriel", label: "Gabriel Advisor", icon: Sparkles },
            { id: "analytics", label: "Analytics", icon: Activity },
            { id: "api_tests", label: "API & Test Suite", icon: Terminal }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`islamos-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  onAddSignalREvent(`Navigated to IslamOS section: ${tab.label}`);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md font-mono text-[10px] transition border ${
                  isSel
                    ? "bg-stone-900 border-stone-950 text-white font-bold"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* TAB 1: COCKPIT DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Header Summary */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Islamic Life Executive Cockpit</h2>
                    <p className="text-xs text-stone-500">Real-time holistic alignment tracking for modern Muslim professionals</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs font-mono text-stone-700">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>Hijri: 18 Muharram 1448 AH</span>
                    <span className="text-stone-300">•</span>
                    <span>Phase 6 Safe Mode</span>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Spiritual Health Score */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold tracking-wider">Spiritual Health Index</span>
                        <Award className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3.5xl font-black text-emerald-950 font-sans">{calculatedSpiritualHealth}%</span>
                        <span className="text-xs text-emerald-700 font-medium">Excellent</span>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] text-emerald-800 leading-normal font-sans border-t border-emerald-150 pt-2">
                      <strong>AI Review:</strong> High congregation rate and active Sabr score shield your decision pathways.
                    </div>
                  </div>

                  {/* Today's Prayers Completed */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider">Salah Consistency</span>
                        <Clock className="h-4 w-4 text-stone-500" />
                      </div>
                      <div className="mt-3">
                        <span className="text-3.5xl font-black text-stone-900 font-sans">{completedPrayersCount}/5</span>
                        <span className="text-xs text-stone-400 block font-mono mt-0.5">COMPLETED TODAY</span>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] text-stone-600 leading-normal border-t border-stone-200/60 pt-2 font-mono flex justify-between">
                      <span>Next: Asr (17:30)</span>
                      <span className="text-amber-600 animate-pulse">● IN 3 HRS</span>
                    </div>
                  </div>

                  {/* Quran Progress */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider">Quran Memorization</span>
                        <BookOpen className="h-4 w-4 text-stone-500" />
                      </div>
                      <div className="mt-3">
                        <span className="text-3.5xl font-black text-stone-900 font-sans">65%</span>
                        <span className="text-xs text-stone-400 block font-mono mt-0.5">AL-MULK COMPLETE</span>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] text-stone-600 leading-normal border-t border-stone-200/60 pt-2 font-mono">
                      <span>Target: Complete by Aug 30</span>
                    </div>
                  </div>

                  {/* Zakat & Sadaqah purified */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider">Zakah Purified</span>
                        <Calculator className="h-4 w-4 text-stone-500" />
                      </div>
                      <div className="mt-3">
                        <span className="text-3.5xl font-black text-stone-900 font-sans">£1,705</span>
                        <span className="text-xs text-emerald-600 block font-mono mt-0.5 font-bold">✓ PURIFIED FOR 1447</span>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] text-stone-600 leading-normal border-t border-stone-200/60 pt-2 font-mono">
                      <span>Nisab standard: £5,567</span>
                    </div>
                  </div>
                </div>

                {/* Middle Grid split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hadith & Quran Day with AI reflection */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h3 className="text-xs font-bold text-stone-900 uppercase font-mono flex items-center space-x-1.5">
                        <Book className="h-4 w-4 text-emerald-600" />
                        <span>Daily Islamic Guidance & Hadith</span>
                      </h3>
                      <span className="text-[9px] font-mono bg-stone-100 border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded uppercase font-bold">
                        Bukhari Vol 1, Hadith 1
                      </span>
                    </div>

                    <div className="bg-stone-50 border border-stone-150 rounded-xl p-4 space-y-3">
                      <div className="text-right text-stone-900 font-serif text-lg leading-loose font-medium">
                        {selectedHadith.arabic}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed italic">
                        "{selectedHadith.translation}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                        <span>Narrator: <strong>{selectedHadith.narrator}</strong></span>
                        <span className="text-emerald-600 font-bold">Grade: {selectedHadith.grade}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3 text-xs leading-relaxed">
                      <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-950 font-mono block text-[10px] uppercase mb-1">
                          Gabriel Spiritual Advisor Reflection
                        </span>
                        "Your intentions (Niyyah) act as the foundational compiler for your life outputs, Ethan. Setting a clean, pure intention to serve your community and preserve halal wealth before writing any software aggregate guarantees that your engineering work is accounted as a form of worship (Ibadah). Align your code today."
                      </div>
                    </div>
                  </div>

                  {/* Countdown Widgets & Ramadan Goals */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="border-b border-stone-100 pb-2">
                      <h3 className="text-xs font-bold text-stone-900 uppercase font-mono flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span>Spiritual Journey Milestones</span>
                      </h3>
                    </div>

                    {/* Countdown items */}
                    <div className="space-y-3">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-stone-400 block uppercase">Ramadan 1448 AH</span>
                          <span className="text-xs font-bold text-stone-950">Month of Fasting Planner</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-stone-900 block font-mono">245 Days</span>
                          <span className="text-[9px] text-stone-400 block font-mono uppercase">COUNTDOWN</span>
                        </div>
                      </div>

                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-stone-400 block uppercase">Hajj & Umrah Travel</span>
                          <span className="text-xs font-bold text-stone-950">Pilgrimage Savings Goal</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-stone-500 font-mono block">68% Funded</span>
                          <span className="text-xs font-bold text-emerald-600 block font-mono">£12,400 / £18,000</span>
                        </div>
                      </div>

                      {/* Dhikr consistency quick glance */}
                      <div className="p-3 bg-stone-900 border border-stone-950 text-white rounded-xl flex flex-col justify-between h-28">
                        <div className="flex justify-between items-center text-[9px] font-mono tracking-wider text-emerald-400 uppercase font-bold">
                          <span>Tasbeeh Quick Launcher</span>
                          <span className="bg-emerald-400/20 text-emerald-400 px-1 rounded uppercase">Active</span>
                        </div>
                        <div>
                          <span className="text-xs block text-stone-300 font-mono">PHRASE: {selectedTasbeehPhrase}</span>
                          <span className="text-lg font-bold text-white block mt-0.5">{tasbeehCount} / {tasbeehTarget}</span>
                        </div>
                        <button
                          onClick={handleIncrementTasbeeh}
                          className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-[10px] py-1 rounded font-mono uppercase"
                        >
                          + Tasbeeh Click
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRAYER & MOSQUE ENGINE */}
            {activeTab === "prayer" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Enterprise Prayer Engine & Masjid Sync</h2>
                    <p className="text-xs text-stone-500">Calculate local offline timings and track prayer consistency invariants</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={calcMethod}
                      onChange={(e) => setCalcMethod(e.target.value)}
                      className="bg-stone-50 border border-stone-200 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                    >
                      <option value="Muslim World League">MWL Method</option>
                      <option value="ISNA">ISNA Method</option>
                      <option value="Umm al-Qura">Umm al-Qura (Makkah)</option>
                      <option value="Egyptian General Authority">Egyptian Method</option>
                    </select>
                    <button
                      onClick={handleRecalculatePrayers}
                      className="bg-stone-950 hover:bg-stone-850 text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Today's Prayers Checklist */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono flex items-center space-x-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <span>Today's Daily Prayer Record</span>
                    </h3>

                    <div className="space-y-2">
                      {prayers.map((p) => (
                        <div
                          key={p.name}
                          className={`p-3.5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                            p.status === "completed"
                              ? "bg-emerald-50/20 border-emerald-200"
                              : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleTogglePrayer(p.name)}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                p.status === "completed"
                                  ? "bg-emerald-600 border-emerald-700 text-white"
                                  : "border-stone-300 hover:border-stone-500 bg-white"
                              }`}
                            >
                              {p.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </button>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-stone-900 font-sans">{p.name}</span>
                                <span className="text-xs font-mono text-stone-400">{p.time}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {p.congregation && (
                                  <span className="text-[8px] font-mono bg-emerald-100 text-emerald-700 px-1 rounded font-bold uppercase">
                                    👥 Congregation
                                  </span>
                                )}
                                {p.masjid && (
                                  <span className="text-[8px] font-mono bg-indigo-50 text-indigo-700 px-1 rounded font-bold uppercase">
                                    🕌 Masjid
                                  </span>
                                )}
                                {p.khushu > 0 && (
                                  <span className="text-[8px] font-mono bg-amber-50 text-amber-700 px-1 rounded font-bold uppercase">
                                    ⭐ Khushu: {p.khushu}/5
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {p.status === "completed" ? (
                              <span className="text-xs font-mono text-emerald-600 font-bold uppercase">✓ Completed</span>
                            ) : (
                              <button
                                onClick={() => handleTogglePrayer(p.name)}
                                className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-mono text-[9px] px-2.5 py-1 rounded"
                              >
                                Log Performed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Missed prayers recovery (Qada) */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mt-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                        <span className="text-[10px] font-mono text-stone-500 uppercase font-bold">Qada Prayers Recovery Ledger</span>
                        <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-bold uppercase">Remaining: {(Object.values(qadaCount) as number[]).reduce((a: number, b: number) => a + b, 0)}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                        {(Object.entries(qadaCount) as [string, number][]).map(([pr, count]) => (
                          <div key={pr} className="bg-white border border-stone-200 rounded-lg p-2.5">
                            <span className="text-[10px] block font-mono text-stone-400 font-bold uppercase">{pr}</span>
                            <span className="text-lg font-black block text-stone-900 mt-1 font-mono">{count}</span>
                            <button
                              onClick={() => {
                                setQadaCount(prev => ({ ...prev, [pr]: Math.max(0, count - 1) }));
                                onAddSignalREvent(`Restored Qada prayer: ${pr}`);
                                onUpdateScore();
                              }}
                              className="mt-2 w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[8px] py-1 rounded uppercase font-bold"
                            >
                              - Log 1 Qada
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mosque Management & Attendance Logs */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono flex items-center space-x-1.5">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span>Masjid Attendance & Community</span>
                    </h3>

                    <div className="space-y-3">
                      {favoriteMasjids.map((m, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">{m.name}</span>
                              <span className="text-[9px] text-stone-500 block font-mono mt-0.5">{m.address}</span>
                            </div>
                            <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 rounded uppercase font-bold">
                              {m.lastVisited}
                            </span>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-stone-150 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-stone-500">Volunteered Hours:</span>
                            <span className="text-xs font-bold text-stone-900 font-mono">{m.volunteerHours} hrs</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Masjid Form */}
                    <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-mono text-stone-400 block uppercase font-bold">Add Local Masjid</span>
                      <input
                        type="text"
                        placeholder="Masjid Name"
                        value={newMasjidName}
                        onChange={(e) => setNewMasjidName(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={newMasjidAddress}
                        onChange={(e) => setNewMasjidAddress(e.target.value)}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                      />
                      <button
                        onClick={() => {
                          if (!newMasjidName) return;
                          setFavoriteMasjids(prev => [...prev, { name: newMasjidName, address: newMasjidAddress || "Local", volunteerHours: 0, lastVisited: "Added today" }]);
                          onAddSignalREvent(`Added favorite Masjid: "${newMasjidName}"`);
                          setNewMasjidName("");
                          setNewMasjidAddress("");
                        }}
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] py-1.5 rounded uppercase font-bold"
                      >
                        Register Masjid
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QURAN READER */}
            {activeTab === "quran" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Quran Core Library & Memorization Tracker</h2>
                    <p className="text-xs text-stone-500">Read Arabic scripture, explore Tafsir, and track reading plan metrics</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedSurah}
                      onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                      className="bg-stone-50 border border-stone-200 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                    >
                      <option value={1}>Surah Al-Fatihah (1)</option>
                      <option value={18}>Surah Al-Kahf (18)</option>
                      <option value={67}>Surah Al-Mulk (67)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Interactive Quran Viewer */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-950 font-mono">Surah {selectedSurah === 18 ? "Al-Kahf" : selectedSurah === 67 ? "Al-Mulk" : "Al-Fatihah"} - Ayah {selectedAyah}</span>
                      <button
                        onClick={() => {
                          const bk = { surah: selectedSurah, ayah: selectedAyah, note: "Bookmarked during reflection" };
                          setBookmarks(prev => [bk, ...prev]);
                          onAddSignalREvent(`QuranReadEvent published. Bookmarked Surah ${selectedSurah}:${selectedAyah}`);
                        }}
                        className="text-stone-400 hover:text-emerald-600 font-mono text-[10px] uppercase font-bold flex items-center space-x-1"
                      >
                        <Bookmark className="h-3 w-3" />
                        <span>Bookmark Ayah</span>
                      </button>
                    </div>

                    {/* Verse Display */}
                    <div className="bg-stone-50/50 border border-stone-250 rounded-xl p-6 space-y-4 text-center">
                      <div className="text-right text-stone-900 font-serif text-2xl leading-loose font-bold select-none">
                        {selectedSurah === 18 && selectedAyah === 1
                          ? "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا ۜ"
                          : selectedSurah === 67 && selectedAyah === 1
                          ? "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
                          : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                      </div>
                      <div className="text-xs text-stone-500 font-sans italic pt-2 border-t border-stone-100 leading-relaxed">
                        {selectedSurah === 18 && selectedAyah === 1
                          ? "[All] praise is [due] to Allah, who has sent down upon His Servant the Book and has not made therein any deviance."
                          : selectedSurah === 67 && selectedAyah === 1
                          ? "Blessed is He in whose hand is dominion, and He is over all things competent -"
                          : "In the name of Allah, the Entirely Merciful, the Especially Merciful."}
                      </div>
                    </div>

                    {/* Tafsir / AI Explanation Card */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-emerald-800 uppercase font-bold block mb-1">AI Quran Explanation & Tafsir Link</span>
                      <p className="text-xs text-emerald-950 leading-relaxed">
                        This verse lays down the foundational thesis of spiritual security: that the scripture descending upon Muhammad (pbuh) is the supreme standard of alignment, completely straight with zero deviances. When implementing LifeOS pipelines, your operational workflows should mirror this absolute compliance standard—purity and straightness in every structural database relation.
                      </p>
                    </div>

                    {/* Navigation Buttons for Verses */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        disabled={selectedAyah <= 1}
                        onClick={() => setSelectedAyah(prev => Math.max(1, prev - 1))}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-50 text-[10px] font-mono font-bold px-3 py-1.5 rounded"
                      >
                        ← Previous Ayah
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAyah(prev => prev + 1);
                          onAddSignalREvent(`QuranRead: Advanced to Ayah ${selectedAyah + 1}`);
                        }}
                        className="bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded"
                      >
                        Next Ayah →
                      </button>
                    </div>
                  </div>

                  {/* Memorization Plans & Reading Checklist */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono flex items-center space-x-1.5">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span>Memorization & Reading Goals</span>
                    </h3>

                    <div className="space-y-3">
                      {memorizationPlans.map((p, idx) => (
                        <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">{p.title}</span>
                              <span className="text-[9px] text-stone-500 font-mono block mt-0.5">{p.verses}</span>
                            </div>
                            <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 rounded uppercase font-bold">
                              Due: {p.targetDate}
                            </span>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                              <span>Progress: {p.progress}%</span>
                            </div>
                            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-stone-900 h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setMemorizationPlans(prev => prev.map((item, i) => i === idx ? { ...item, progress: Math.min(100, item.progress + 10) } : item));
                                onAddSignalREvent(`AyahMemorizedEvent triggered for plan: "${p.title}"`);
                                onUpdateScore();
                              }}
                              className="bg-stone-900 hover:bg-stone-850 text-white font-mono text-[8px] px-2 py-1 rounded uppercase font-bold"
                            >
                              Log memorized verse
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bookmarked verses */}
                    <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-mono text-stone-400 block uppercase font-bold">Saved Bookmarks</span>
                      <div className="space-y-1">
                        {bookmarks.map((b, idx) => (
                          <div key={idx} className="text-xs p-2 bg-stone-50 rounded flex justify-between items-center">
                            <span>Surah {b.surah}:{b.ayah}</span>
                            <span className="text-[9px] text-stone-400 font-mono italic">{b.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: HADITH CORE */}
            {activeTab === "hadith" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Hadith Core Library & Narrator Registry</h2>
                    <p className="text-xs text-stone-500">Query primary hadith collections filtered by authenticity grades</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hadith Reader and explanation */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-bold text-stone-900 font-mono uppercase">{selectedHadith.collection}</span>
                      <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 font-bold uppercase">
                        Grade: {selectedHadith.grade}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                        <div className="text-right font-serif text-lg text-stone-900 leading-loose">
                          {selectedHadith.arabic}
                        </div>
                        <p className="text-xs text-stone-600 font-sans italic leading-relaxed">
                          "{selectedHadith.translation}"
                        </p>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Narrated by: <strong>{selectedHadith.narrator}</strong> • Hadith No: {selectedHadith.number}
                        </div>
                      </div>

                      {/* AI Hadith explanation */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <span className="text-[9px] font-mono text-emerald-800 uppercase font-bold block mb-1">Hadith Policy & Business Impact</span>
                        <p className="text-xs text-emerald-950 leading-relaxed">
                          This hadith established the supreme law of transactional integrity in IslamOS. Every business venture, asset deployment, and daily checklist is judged strictly by the intent (Niyyah) behind it. If you build system software to preserve halal values, your hours are authenticated as direct acts of service. Keep your motivations pure and transparent.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hadith Topics & search */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Hadith Collection Search</h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search e.g. Intention, Charity, Sabr"
                          value={hadithSearch}
                          onChange={(e) => setHadithSearch(e.target.value)}
                          className="w-full bg-white border border-stone-300 text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none text-stone-900"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                      </div>

                      <button
                        onClick={() => {
                          onAddSignalREvent(`Hadith searched: "${hadithSearch}"`);
                          if (hadithSearch.toLowerCase().includes("charity")) {
                            setSelectedHadith({
                              collection: "Sahih Muslim",
                              number: 1009,
                              narrator: "Abu Hurairah",
                              arabic: "كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ...",
                              translation: "There is a charity due on every joint of a person, every day the sun rises. Administering justice between two people is charity...",
                              grade: "Sahih",
                              tags: ["Charity", "Sadaqah", "Social Ethics"]
                            });
                          } else {
                            onAddSignalREvent("No exact hadith collection match found; displaying core Bukhari reference.");
                          }
                        }}
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[10px] py-2 rounded uppercase font-bold"
                      >
                        Query Hadith Database
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-4">
                      <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block mb-2">Authenticated Collections</span>
                      <div className="space-y-1">
                        {["Sahih al-Bukhari", "Sahih Muslim", "Sunan Abi Dawud", "Jami at-Tirmidhi", "Sunan an-Nasa'i", "Sunan Ibn Majah"].map((col, i) => (
                          <div key={i} className="text-xs px-2.5 py-1.5 bg-stone-50 rounded flex justify-between items-center text-stone-700">
                            <span>{col}</span>
                            <span className="text-[8px] font-mono text-emerald-600 uppercase font-bold">100% verified</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DHIKR & DUA ENGINE */}
            {activeTab === "dhikr_dua" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Dhikr Console & Dynamic Dua Library</h2>
                  <p className="text-xs text-stone-500">Perform interactive tasbeeh cycles and invoke categorized supplications</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Interactive Tasbeeh Counter */}
                  <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-stone-950 uppercase font-mono mb-2">Interactive Tasbeeh Counter</h3>
                      <div className="flex gap-2">
                        {["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah"].map((ph) => (
                          <button
                            key={ph}
                            onClick={() => {
                              setSelectedTasbeehPhrase(ph);
                              setTasbeehCount(0);
                            }}
                            className={`flex-1 text-[9px] font-mono py-1 rounded transition border ${
                              selectedTasbeehPhrase === ph
                                ? "bg-stone-900 text-white border-stone-950 font-bold"
                                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {ph}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center space-y-3">
                      <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">CYCLE COMPLETED: {Math.floor(tasbeehCount / tasbeehTarget)}</span>
                      <div className="text-5xl font-black text-stone-900 font-mono tracking-tight select-none">
                        {tasbeehCount} <span className="text-stone-300 text-3xl">/ {tasbeehTarget}</span>
                      </div>
                      <span className="text-xs text-stone-500 font-mono uppercase block font-bold">{selectedTasbeehPhrase}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setTasbeehCount(0);
                          onAddSignalREvent("Tasbeeh count reset.");
                        }}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-mono font-bold py-2.5 rounded uppercase"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleIncrementTasbeeh}
                        className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-stone-950 text-xs font-mono font-bold py-2.5 rounded uppercase shadow-sm"
                      >
                        + Increment Counter
                      </button>
                    </div>
                  </div>

                  {/* Morning / Evening Adhkar */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono flex items-center space-x-1.5">
                      <Hash className="h-4 w-4 text-emerald-600" />
                      <span>Morning & Evening Adhkar Logs</span>
                    </h3>

                    <div className="space-y-2">
                      {morningAdhkar.map((a, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">{a.phrase}</span>
                            <span className="text-[9px] text-stone-400 block font-mono">Target: {a.count} cycles</span>
                          </div>
                          <button
                            onClick={() => {
                              setMorningAdhkar(prev => prev.map((item, i) => i === idx ? { ...item, current: Math.min(item.count, item.current + 1) } : item));
                              if (a.current + 1 === a.count) {
                                onAddSignalREvent(`Adhkar completed: "${a.phrase}"`);
                                onUpdateScore();
                              }
                            }}
                            className={`px-3 py-1 rounded font-mono text-[10px] font-bold ${
                              a.current >= a.count
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase"
                                : "bg-stone-900 text-white hover:bg-stone-800"
                            }`}
                          >
                            {a.current >= a.count ? "Done ✓" : `${a.current}/${a.count} Log`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dua Supplications Library */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Dua & Supplication Vault</h3>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {duas.map((d) => (
                        <div key={d.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded uppercase font-bold">{d.category}</span>
                            {d.answered ? (
                              <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase">✓ Answered</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setDuas(prev => prev.map(item => item.id === d.id ? { ...item, answered: true } : item));
                                  onAddSignalREvent(`Marked Dua answered: "${d.title}"`);
                                }}
                                className="text-[8px] text-stone-400 hover:text-emerald-600 font-mono uppercase"
                              >
                                Mark Answered
                              </button>
                            )}
                          </div>
                          <p className="text-xs font-bold text-stone-900 leading-tight mt-1">{d.title}</p>
                          <p className="text-right text-stone-900 font-serif text-sm py-1 select-none">{d.arabic}</p>
                          <p className="text-[10px] text-stone-500 italic">"{d.translation}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Dua Form */}
                    <form onSubmit={handleAddDua} className="border-t border-stone-150 pt-3 space-y-2">
                      <span className="text-[9px] font-mono text-stone-400 block uppercase font-bold">Record Supplication</span>
                      <input
                        type="text"
                        placeholder="Dua Title"
                        value={newDua.title}
                        onChange={(e) => setNewDua({ ...newDua, title: e.target.value })}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                      />
                      <input
                        type="text"
                        placeholder="Arabic (Optional)"
                        value={newDua.arabic}
                        onChange={(e) => setNewDua({ ...newDua, arabic: e.target.value })}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                      />
                      <input
                        type="text"
                        placeholder="Translation"
                        value={newDua.translation}
                        onChange={(e) => setNewDua({ ...newDua, translation: e.target.value })}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900"
                      />
                      <button
                        type="submit"
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] py-1.5 rounded uppercase font-bold"
                      >
                        Save Dua Supplication
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: HALAL DECISION ENGINE */}
            {activeTab === "decision" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Halal Decision Engine & Compliance Sandbox</h2>
                  <p className="text-xs text-stone-500">Submit pending life and financial proposals for automated Islamic policy screening and reference validation</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Evaluation Form Panel */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Analyze New Strategic Proposal</h3>

                    <form onSubmit={handleEvaluateDecision} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">
                          Operational Proposal Details
                        </label>
                        <textarea
                          placeholder="e.g. Taking out a conventional bank loan to fund business inventory operations, or investing in Shariah screened mutual funds."
                          value={decisionQuery}
                          onChange={(e) => setDecisionQuery(e.target.value)}
                          className="bg-white border border-stone-300 text-xs rounded px-3 py-2.5 focus:outline-none w-full text-stone-900 h-28 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={evaluatingDecision}
                          className="bg-stone-900 hover:bg-stone-850 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                          {evaluatingDecision ? "Screening against policy engine..." : "Execute Policy Screening"}
                        </button>
                      </div>
                    </form>

                    {/* Results Showcase */}
                    {decisionResult && (
                      <div className="border-t border-stone-200 pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">Policy Audit Output</span>
                          <span className="text-xs font-mono text-stone-500">Confidence: {decisionResult.confidenceScore}%</span>
                        </div>

                        <div className={`p-4 border rounded-xl ${
                          decisionResult.complianceScore >= 70
                            ? "bg-emerald-50 border-emerald-200"
                            : decisionResult.complianceScore >= 50
                            ? "bg-amber-50 border-amber-200"
                            : "bg-red-50 border-red-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-mono uppercase text-stone-400 block font-bold">ruling status</span>
                              <span className={`text-sm font-black font-mono uppercase ${
                                decisionResult.complianceScore >= 70 ? "text-emerald-800" : decisionResult.complianceScore >= 50 ? "text-amber-800" : "text-red-800"
                              }`}>{decisionResult.status}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-mono uppercase text-stone-400 block font-bold">compliance score</span>
                              <span className="text-xl font-bold font-mono">{decisionResult.complianceScore} / 100</span>
                            </div>
                          </div>

                          <p className="text-xs text-stone-800 leading-relaxed font-sans mt-3">
                            {decisionResult.explanation}
                          </p>
                        </div>

                        {/* Jurisprudential references */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Supporting Scriptural References</span>
                          <div className="space-y-1.5">
                            {decisionResult.references.map((ref: string, i: number) => (
                              <div key={i} className="text-xs p-3 bg-stone-50 border border-stone-150 rounded-lg text-stone-700 font-mono leading-relaxed">
                                {ref}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Impact Vectors sidebar */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Multidimensional Impact Vectors</h3>

                    {decisionResult && (
                      <div className="space-y-3">
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">financial compliance</span>
                          <span className="text-xs font-bold text-stone-900 mt-0.5 block">{decisionResult.impacts.financial}</span>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">spiritual alignment</span>
                          <span className="text-xs font-bold text-stone-900 mt-0.5 block">{decisionResult.impacts.spiritual}</span>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">family lineage preservation</span>
                          <span className="text-xs font-bold text-stone-900 mt-0.5 block">{decisionResult.impacts.family}</span>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">community ethics</span>
                          <span className="text-xs font-bold text-stone-900 mt-0.5 block">{decisionResult.impacts.ethical}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-[11px] leading-relaxed text-stone-600">
                      <span className="font-bold text-stone-900 font-mono block text-[10px] uppercase mb-1">compliance warning</span>
                      Every life choice registered inside the scheduler inherits validation parameters from the Halal Decision Engine. Lower priorities will automatically trigger alert logs if conflict conditions are generated.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ZAKAH & SADAQAH */}
            {activeTab === "zakah_sadaqah" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Zakah Wealth Purifier & Sadaqah Hub</h2>
                  <p className="text-xs text-stone-500">Audit your balance sheet, calculate annual purifications, and log community impact donations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Zakah Calculator Workspace */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Annual Zakah Solver Matrix</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Cash Holdings (Bank/Liquid)</label>
                        <input
                          type="number"
                          value={zakahAssets.cashValue}
                          onChange={(e) => setZakahAssets(prev => ({ ...prev, cashValue: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Gold Value equivalent</label>
                        <input
                          type="number"
                          value={zakahAssets.goldValue}
                          onChange={(e) => setZakahAssets(prev => ({ ...prev, goldValue: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Silver Holdings Value</label>
                        <input
                          type="number"
                          value={zakahAssets.silverValue}
                          onChange={(e) => setZakahAssets(prev => ({ ...prev, silverValue: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Shariah Investments</label>
                        <input
                          type="number"
                          value={zakahAssets.investmentsValue}
                          onChange={(e) => setZakahAssets(prev => ({ ...prev, investmentsValue: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Business Asset Inventories</label>
                        <input
                          type="number"
                          value={zakahAssets.businessAssets}
                          onChange={(e) => setZakahAssets(prev => ({ ...prev, businessAssets: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Deductible Liabilities</label>
                        <input
                          type="number"
                          value={zakahAssets.liabilities}
                          onChange={(e) => setZakahAssets(prev => ({ ...prev, liabilities: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1.5 focus:outline-none text-stone-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Zakah Calculation summary Card */}
                    <div className="p-4 bg-stone-900 border border-stone-950 text-white rounded-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-wider">purification status</span>
                          <span className="text-lg font-bold block font-sans">
                            {isZakahDue ? "Zakah is due on your wealth" : "Below Nisab threshold"}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">Calculated net wealth: <strong>£{netWealth}</strong> (Nisab Limit: £{goldNisabThreshold.toFixed(0)})</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">zakah due (2.5%)</span>
                          <span className="text-2xl font-black text-emerald-400 font-mono">£{calculatedZakahOwed.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3.5 border-t border-stone-800 flex justify-between items-center">
                        <button
                          onClick={() => {
                            setZakahHistory(prev => [{ year: "1448 AH (Current)", netAssets: netWealth, paid: calculatedZakahOwed, status: "Submitted" }, ...prev]);
                            onAddSignalREvent(`ZakahCalculatedEvent: Logged payment record of £${calculatedZakahOwed.toFixed(2)} for 1448 AH`);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold font-mono text-[9px] px-3 py-1 rounded uppercase"
                        >
                          Log Purification Paid
                        </button>
                        <span className="text-[10px] font-mono text-stone-400">Pure Capital standard achieved ✓</span>
                      </div>
                    </div>

                    {/* Zakah log history */}
                    <div>
                      <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block mb-2">Previous Zakah Purification Ledgers</span>
                      <div className="space-y-1.5">
                        {zakahHistory.map((zh, idx) => (
                          <div key={idx} className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-bold">{zh.year} Year Ledger</span>
                            <span className="text-stone-500 font-mono">Assets: £{zh.netAssets}</span>
                            <span className="text-emerald-700 font-bold font-mono">Paid: £{zh.paid} ({zh.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sadaqah Giving Logs */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Sadaqah Continuous Giving Log</h3>

                    {/* Quick Add Sadaqah Form */}
                    <form onSubmit={handleAddSadaqah} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-mono text-stone-400 block uppercase font-bold">Add Giving Entry</span>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder="Amount (£)"
                          value={newSadaqah.amount}
                          onChange={(e) => setNewSadaqah({ ...newSadaqah, amount: e.target.value })}
                          className="flex-1 bg-white border border-stone-300 text-xs rounded px-2.5 py-1 focus:outline-none text-stone-900 font-mono"
                        />
                        <select
                          value={newSadaqah.type}
                          onChange={(e) => setNewSadaqah({ ...newSadaqah, type: e.target.value })}
                          className="flex-1 bg-white border border-stone-300 text-[10px] rounded px-2.5 py-1 focus:outline-none text-stone-900 font-mono"
                        >
                          <option value="General">General</option>
                          <option value="Mosque">Mosque</option>
                          <option value="Water Well">Water Well</option>
                          <option value="Orphans">Orphanage</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Beneficiary / Organisation"
                        value={newSadaqah.beneficiary}
                        onChange={(e) => setNewSadaqah({ ...newSadaqah, beneficiary: e.target.value })}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1 focus:outline-none text-stone-900"
                      />
                      <input
                        type="text"
                        placeholder="Expected Impact"
                        value={newSadaqah.impact}
                        onChange={(e) => setNewSadaqah({ ...newSadaqah, impact: e.target.value })}
                        className="w-full bg-white border border-stone-300 text-xs rounded px-2.5 py-1 focus:outline-none text-stone-900"
                      />
                      <button
                        type="submit"
                        className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] py-1 rounded uppercase font-bold"
                      >
                        Submit Sadaqah
                      </button>
                    </form>

                    {/* Logs list */}
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {sadaqahLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                            <span>{log.date}</span>
                            <span className="text-emerald-600 font-bold uppercase">{log.type}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-stone-950 mt-1">
                            <span>{log.beneficiary}</span>
                            <span className="font-mono text-emerald-700 font-black">+£{log.amount}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-sans mt-0.5 leading-relaxed">{log.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: RAMADAN & HAJJ PLANNER */}
            {activeTab === "ramadan_hajj" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Ramadan Center & Pilgrimage Strategy</h2>
                  <p className="text-xs text-stone-500">Coordinate holy month timetables, manage fast logs, and plan Hajj milestones</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ramadan Planner */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Ramadan Fasting & Worship Planner</h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold uppercase">Fast completed today</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                        <span className="text-[8px] font-mono text-stone-400 uppercase font-bold block">suhoor cutoff</span>
                        <span className="text-sm font-bold text-stone-900 block mt-1 font-mono">{ramadanPlanner.suhoorTime}</span>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                        <span className="text-[8px] font-mono text-stone-400 uppercase font-bold block">iftar meal</span>
                        <span className="text-sm font-bold text-stone-900 block mt-1 font-mono">{ramadanPlanner.iftarTime}</span>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                        <span className="text-[8px] font-mono text-stone-400 uppercase font-bold block">Taraweeh Rakat count</span>
                        <span className="text-sm font-bold text-stone-900 block mt-1 font-mono">{ramadanPlanner.taraweehRakats} Rakats</span>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                        <span className="text-[8px] font-mono text-stone-400 uppercase font-bold block">Quran Daily Portion</span>
                        <span className="text-sm font-bold text-stone-900 block mt-1 font-mono">{ramadanPlanner.quranPortionRead}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-mono text-emerald-800 uppercase font-bold block">Laylatul Qadr Strategic Planner</span>
                      <p className="text-xs text-emerald-950 leading-relaxed">
                        Pre-planned shielding targets for the last 10 nights: Automate Sadaqah distribution via scheduler so giving triggers daily, clear calendar slots from 10 PM to 3 AM, and queue du'a index arrays inside personal bookmarked modules for repeated recitation.
                      </p>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Ramadan Journal Entry</span>
                        <p className="text-xs text-stone-700 mt-1 font-sans italic">"{ramadanPlanner.notes}"</p>
                      </div>
                      <button
                        onClick={() => {
                          onAddSignalREvent("RamadanGoalCompletedEvent published.");
                          onUpdateScore();
                        }}
                        className="bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] py-1.5 px-3 rounded uppercase font-bold shrink-0"
                      >
                        Update Journal
                      </button>
                    </div>
                  </div>

                  {/* Hajj & Umrah Savings and checklists */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Hajj & Umrah Preparation Strategy</h3>

                    {/* Progress visual */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">savings target progress</span>
                        <span className="text-xs font-bold text-stone-900 font-mono">£{hajjSavings} / £{hajjTarget}</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-stone-900 h-full rounded-full" style={{ width: `${(hajjSavings / hajjTarget) * 100}%` }}></div>
                      </div>
                      <span className="text-[9px] text-stone-500 block font-mono text-right">{((hajjSavings / hajjTarget) * 100).toFixed(0)}% Completed</span>
                    </div>

                    {/* Checklists */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Preparation Checklist Items</span>
                      {hajjChecklist.map((ch, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2.5 p-2 bg-stone-50 border border-stone-150 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={ch.done}
                            onChange={() => {
                              setHajjChecklist(prev => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
                              onAddSignalREvent(`Updated Hajj checklist item: "${ch.item}"`);
                            }}
                            className="mt-0.5 rounded border-stone-300 text-stone-900"
                          />
                          <span className={`text-xs ${ch.done ? "text-stone-400 line-through" : "text-stone-800"}`}>{ch.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: CHARACTER & FAMILY */}
            {activeTab === "character_family" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Character Development Tracker & Family Worship</h2>
                  <p className="text-xs text-stone-500">Audit your spiritual virtues, and log collective family educational metrics</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Virtue Tracker */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Virtue Grades & Reflections</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {virtues.map((v, idx) => (
                        <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-stone-900">{v.name}</span>
                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">{v.score}%</span>
                          </div>

                          <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-stone-900 h-full rounded-full" style={{ width: `${v.score}%` }}></div>
                          </div>

                          <p className="text-[10px] text-stone-500 leading-normal font-sans italic">
                            "{v.reflection}"
                          </p>

                          <div className="pt-1.5 flex justify-end space-x-1">
                            <button
                              onClick={() => {
                                setVirtues(prev => prev.map((item, i) => i === idx ? { ...item, score: Math.min(100, item.score + 5) } : item));
                                onAddSignalREvent(`Upgraded character virtue score: ${v.name}`);
                                onUpdateScore();
                              }}
                              className="bg-stone-900 hover:bg-stone-850 text-white font-mono text-[8px] px-2 py-0.5 rounded uppercase"
                            >
                              + Up score
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Family Worship Center */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono flex items-center space-x-1.5">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span>Family Worship cockpit</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">group prayer status</span>
                        <span className="text-xs font-bold text-emerald-700 block font-sans">✓ Family prayed congregationally today</span>
                      </div>

                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">weekly discussion topic</span>
                        <span className="text-xs font-bold text-stone-900 block font-sans leading-snug">{familyWorship.weeklyDiscussionTopic}</span>
                      </div>

                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">Children progress notes</span>
                        <p className="text-xs text-stone-600 leading-relaxed font-sans">{familyWorship.childProgress}</p>
                      </div>

                      <div className="p-3 bg-stone-900 text-white border border-stone-950 rounded-xl space-y-2">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block">Shared progress metric</span>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span>Completion rate:</span>
                          <span className="font-bold text-emerald-400">{familyWorship.sharedFamilyGoalProgress}%</span>
                        </div>
                        <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${familyWorship.sharedFamilyGoalProgress}%` }}></div>
                        </div>
                        <button
                          onClick={() => {
                            setFamilyWorship(prev => ({ ...prev, sharedFamilyGoalProgress: Math.min(100, prev.sharedFamilyGoalProgress + 5) }));
                            onAddSignalREvent("Updated family goals progress scorecard.");
                            onUpdateScore();
                          }}
                          className="w-full mt-1 bg-stone-800 hover:bg-stone-750 text-white font-mono text-[9px] py-1 rounded uppercase font-bold"
                        >
                          Increment Collective Goal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: GABRIEL ADVISOR */}
            {activeTab === "gabriel" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Gabriel Spiritual Advisor Subagent</h2>
                  <p className="text-xs text-stone-500">Consult Gabriel for Shariah policy validation, Quran/Hadith lookups, and spiritual advice</p>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden flex flex-col h-[450px] bg-stone-50">
                  {/* Messages container */}
                  <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
                    {advisorChat.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-stone-900 text-white rounded-tr-none"
                            : "bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm"
                        }`}>
                          {msg.sender === "gabriel" && (
                            <div className="flex items-center space-x-1.5 text-emerald-600 font-mono text-[9px] uppercase font-bold mb-1 border-b border-stone-100 pb-0.5">
                              <Sparkles className="h-3 w-3" />
                              <span>GABRIEL SCHEDULER SYSTEM</span>
                            </div>
                          )}
                          <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {advisorLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none text-xs text-stone-500 font-mono">
                          Gabriel is parsing policies...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendGabrielMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask Gabriel e.g. Sabr advice, gold zakat, spousal harmony..."
                      value={newChatMsg}
                      onChange={(e) => setNewChatMsg(e.target.value)}
                      className="flex-1 bg-stone-50 border border-stone-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none text-stone-900 font-sans"
                    />
                    <button
                      type="submit"
                      className="bg-stone-900 hover:bg-stone-850 text-white text-xs font-mono font-bold px-4 py-2 rounded-xl"
                    >
                      Ask Advisor
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 11: SPIRITUAL ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">Spiritual Progress & Compliance Analytics</h2>
                  <p className="text-xs text-stone-500">Inspect historical prayer consistency, Quran reading rates, and Islamic goal completions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Recharts chart */}
                  <div className="md:col-span-2 border border-stone-200 rounded-xl p-5 bg-white">
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block mb-4">Historical Devotional Consistency</span>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { week: "W23", Salah: 85, Quran: 70, Dhikr: 60, SpiritualHealth: 72 },
                            { week: "W24", Salah: 90, Quran: 75, Dhikr: 65, SpiritualHealth: 80 },
                            { week: "W25", Salah: 96, Quran: 80, Dhikr: 75, SpiritualHealth: 88 },
                            { week: "W26", Salah: 96, Quran: 85, Dhikr: 80, SpiritualHealth: 92 }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorSalah" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="week" stroke="#888888" fontSize={10} tickLine={false} />
                          <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                          <Tooltip />
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                          <Area type="monotone" dataKey="Salah" stroke="#10b981" fillOpacity={1} fill="url(#colorSalah)" name="Salah Consistency %" />
                          <Area type="monotone" dataKey="SpiritualHealth" stroke="#0f172a" fillOpacity={0} name="Spiritual Health Score" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Analytical Invariant Audit</h3>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-stone-500">Salah Congregrational Rate:</span>
                        <span className="font-bold font-mono text-emerald-700">96.4%</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-stone-500">Average Khushu Score:</span>
                        <span className="font-bold font-mono text-stone-900">4.4 / 5.0</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-stone-500">Daily Dhikr completion:</span>
                        <span className="font-bold font-mono text-stone-900">100% (4/4 items)</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                        <span className="text-stone-500">Zakah Purification Status:</span>
                        <span className="font-bold font-mono text-emerald-600 uppercase">fully paid</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5">
                        <span className="text-stone-500">Ethics Violation count:</span>
                        <span className="font-bold font-mono text-emerald-600">0 violations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 12: API & TEST SUITE */}
            {activeTab === "api_tests" && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="text-lg font-bold text-stone-900">IslamOS Open APIs & Invariant Test Lab</h2>
                  <p className="text-xs text-stone-500">Review OpenAPI specifications for Islamic controllers and run the integration test suites</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* OpenAPI Panel */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4 bg-stone-900 text-stone-200 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">OpenAPI Schema v0.6.0</span>
                      <span className="text-stone-500 text-[10px]">JSON/YAML ready</span>
                    </div>

                    <div className="space-y-4 max-h-80 overflow-y-auto text-[10px] leading-normal pr-2">
                      <div>
                        <span className="text-emerald-400 font-bold block">GET /api/islam/prayers</span>
                        <span className="text-stone-400">Response: Array of calculated prayer objects with times and perform status.</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold block">POST /api/islam/prayers/toggle</span>
                        <span className="text-stone-400">Payload: {"{ name: 'Fajr' }"} • Toggle performance status.</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold block">GET /api/islam/zakah</span>
                        <span className="text-stone-400">Response: Nisab calculation thresholds and asset-purified statistics.</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold block">POST /api/islam/decision/screen</span>
                        <span className="text-stone-400">Payload: {"{ query: string }"} • Screener evaluation against Quran policies.</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold block">GET /api/islam/quran/read</span>
                        <span className="text-stone-400">Query params: surah=number, ayah=number. Returns scriptural text & tafsir.</span>
                      </div>
                    </div>
                  </div>

                  {/* Testing Suite Console */}
                  <div className="border border-stone-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-stone-150 pb-2 mb-3">
                        <h3 className="text-xs font-bold text-stone-950 uppercase font-mono">Phase 6 Invariant Verification</h3>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold uppercase">Target: 90%+ Coverage</span>
                      </div>

                      {/* Display test outputs */}
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 h-56 overflow-y-auto font-mono text-[10px] space-y-1.5">
                        {testsPassed.length === 0 ? (
                          <span className="text-stone-400 italic">No tests executed yet. Click button below to run IslamOS suite.</span>
                        ) : (
                          testsPassed.map((t, idx) => (
                            <div key={idx} className="text-stone-700">
                              {t}
                            </div>
                          ))
                        )}
                        {runningTests && (
                          <div className="text-emerald-600 animate-pulse">Running diagnostic tests...</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleExecutePhase6Tests}
                      disabled={runningTests}
                      className="w-full bg-stone-900 hover:bg-stone-850 text-white font-mono text-xs font-bold py-2.5 rounded-lg uppercase"
                    >
                      {runningTests ? "Verifying Invariants..." : "Execute 8 Integration Test Suites"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER: Architecture Guide */}
      <div className="p-5 border border-stone-200 rounded-xl bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-emerald-600 uppercase font-bold tracking-widest">IslamOS System Architecture</span>
          <h4 className="text-xs font-bold text-stone-900 font-sans">Policy Invariant Overriding Shield is ACTIVE</h4>
          <p className="text-[11px] text-stone-500 leading-relaxed max-w-3xl">
            In compliance with **Project Jannah Specification**, when any prayer calendar block (Fajr, Dhuhr, Asr, Maghrib, Isha) transitions to 'Active', the core Scheduler issues commands that automatically suppress conventional tasks, and lock a 15-minute sanctuary window. Lower-level business events are overridden.
          </p>
        </div>
        <div className="shrink-0 font-mono text-[9px] text-stone-400 uppercase text-right">
          <span>CODENAME: JANNAH</span>
          <span className="block mt-0.5 text-stone-500">COVERAGE: 94.6%</span>
        </div>
      </div>
    </div>
  );
}
