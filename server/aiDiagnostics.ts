type RecordMap = Record<string, any>;

const rows = (state: RecordMap, key: string) => Array.isArray(state[key]) ? state[key] : [];
const timestamp = (value: any) => String(value?.updatedAt || value?.balanceUpdatedAt || value?.createdAt || value?.date || "");
const latest = (items: any[]) => items.map(timestamp).filter(Boolean).sort().at(-1) || null;

export function excludeMemoriesSupersededByCurrentRecords(state: RecordMap, memories: any[]) {
  const entityCollections: Record<string, any[]> = { account: rows(state, "bankAccounts"), liability: rows(state, "debts"), goal: rows(state, "goals"), task: rows(state, "tasks"), "work-task": rows(state, "workTasks") };
  return memories.filter((memory: any) => {
    if (!memory.entityType || !memory.entityId || memory.sourceType === "system-snapshot") return true;
    const current = entityCollections[memory.entityType]?.find(item => String(item.id) === String(memory.entityId));
    return !(current && timestamp(current) && timestamp(memory) && timestamp(memory) < timestamp(current));
  });
}

export function buildAiDiagnostics(state: RecordMap, provider: { connected: boolean; provider: string; model: string | null }) {
  const now = new Date().toISOString();
  const active = rows(state, "aiMemories").filter((item: any) => item.lifecycleStatus === "active");
  const domains = [
    { id: "finance", label: "Finance", records: [...rows(state, "bankAccounts"), ...rows(state, "financeEntries"), ...rows(state, "debts")], match: /finance|bank|debt|income|spending|statement/i },
    { id: "goals", label: "Goals", records: rows(state, "goals"), match: /goal|vision/i },
    { id: "tasks", label: "Tasks", records: rows(state, "tasks"), match: /task|planning/i },
    { id: "work", label: "Work", records: [...rows(state, "workTasks"), ...rows(state, "workShifts")], match: /work|shift|career/i },
    { id: "routines", label: "Routines", records: rows(state, "habits"), match: /habit|routine/i },
    { id: "preferences", label: "Preferences", records: rows(state, "aiMemories").filter((item: any) => /preference|principle/i.test(`${item.category} ${item.memoryType}`)), match: /preference|principle/i },
  ];
  const coverage = domains.map(domain => {
    const memories = active.filter((item: any) => domain.match.test(`${item.category} ${item.memoryType} ${item.entityType}`));
    return { domain: domain.id, label: domain.label, recordCount: domain.records.length, memoryCount: memories.length, confirmedCount: memories.filter((item: any) => item.verificationStatus === "user-confirmed").length, covered: domain.records.length > 0 || memories.length > 0, asOf: latest(domain.records) };
  });
  const entityCollections: Record<string, any[]> = { account: rows(state, "bankAccounts"), liability: rows(state, "debts"), goal: rows(state, "goals"), task: rows(state, "tasks"), "work-task": rows(state, "workTasks") };
  const staleRecords = active.filter((memory: any) => {
    if (!memory.entityType || !memory.entityId || memory.sourceType === "system-snapshot") return false;
    const current = entityCollections[memory.entityType]?.find(item => String(item.id) === String(memory.entityId));
    return current && timestamp(current) && timestamp(memory) && timestamp(memory) < timestamp(current);
  });
  const conflicts = staleRecords.filter((item: any) => item.verificationStatus === "user-confirmed").map((item: any) => ({ memoryId: item.id, entityType: item.entityType, entityId: item.entityId, category: item.category, reason: "A newer authoritative LifeOS record exists. Review this confirmed memory before relying on it." }));
  const pendingActions = rows(state, "aiActionProposals").filter((item: any) => !["approved", "rejected", "completed"].includes(String(item.status).toLowerCase()));
  return {
    generatedAt: now,
    provider: { ...provider, deterministicFallback: !provider.connected },
    grounding: { currentRecordsFirst: true, sourceLabels: true, asOfTimestamps: true, secretsExcluded: true, rawDocumentsExcluded: true, writesRequireApproval: true },
    coverage,
    memory: { active: active.length, confirmed: active.filter((item: any) => item.verificationStatus === "user-confirmed").length, systemDerived: active.filter((item: any) => item.verificationStatus !== "user-confirmed").length, excludedStale: staleRecords.length, conflicts: conflicts.length },
    conflicts,
    retrieval: { strategy: "hybrid keyword and vector retrieval", maximumOrdinaryPromptMemories: 8, staleLinkedRecordsExcluded: true },
    pendingActions: pendingActions.map((item: any) => ({ id: item.id, type: item.type || item.actionType || "proposed-change", status: item.status || "pending", createdAt: item.createdAt || null })).slice(0, 50),
  };
}
