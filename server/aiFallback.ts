export function safeProviderError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim().slice(0, 300);
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || "provider failure").slice(0, 300);
  return String(error || "provider failure").slice(0, 300);
}

export function buildLocalAssistantFallback(state: Record<string, any>, name: string, reason: string) {
  const goals = Array.isArray(state.goals) ? state.goals : [];
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  const debts = Array.isArray(state.debts) ? state.debts : [];
  const habits = Array.isArray(state.habits) ? state.habits : [];
  const completed = tasks.filter((task: any) => task.status === "completed").length;
  return {
    content: `Assalamu alaykum, ${name}. The external AI provider is unavailable, so this is a deterministic local summary from current LifeOS records. LifeOS records **${goals.length} goals**, **${tasks.length} tasks** (${completed} completed), **${debts.length} debts or bills**, and **${habits.length} routines**. No authoritative records were changed.\n\n### Evidence used\n- Current structured LifeOS records at the time of this request.`,
    provider: "Deterministic local capability",
    model: null,
    fallbackReason: reason,
  };
}
