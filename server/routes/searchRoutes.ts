import { Router } from "express";

export function createSearchRouter(getState: () => Record<string, any>) {
  const router = Router();
  router.get("/", (req, res) => {
    const query = String(req.query.q || "").trim().toLowerCase();
    if (query.length < 2) return res.json({ query, results: [] });
    const state = getState(), contains = (value: unknown) => String(value || "").toLowerCase().includes(query);
    const candidates = [
      ...(state.goals || []).map((item: any) => ({ id: item.id, type: "Goal", title: item.title, description: `${item.status || "Active"} · ${item.priority || "Medium"}`, target: "executive_planner" })),
      ...(state.tasks || []).map((item: any) => ({ id: item.id, type: "Task", title: item.title, description: `${item.status || "pending"}${item.dueDate ? ` · due ${item.dueDate}` : ""}`, target: "executive_planner" })),
      ...(state.workTasks || []).map((item: any) => ({ id: item.id, type: "Work task", title: item.title, description: `${item.status || "Not started"}${item.dueDate ? ` · due ${item.dueDate}` : ""}`, target: "work" })),
      ...(state.bankAccounts || []).map((item: any) => ({ id: item.id, type: "Account", title: item.name, description: `${item.institution || "Bank"} · balance R${Number(item.balance || 0).toFixed(2)}`, target: "operations" })),
      ...(state.financeEntries || []).map((item: any) => ({ id: item.id, type: "Transaction", title: item.description || item.category, description: `${item.date} · ${item.type} · R${Number(item.amount || 0).toFixed(2)}`, target: "operations" })),
      ...(state.aiMemories || []).filter((item: any) => item.lifecycleStatus === "active").map((item: any) => ({ id: item.id, type: "Memory", title: String(item.content).slice(0, 100), description: `${item.category} · ${item.verificationStatus}`, target: "memory" })),
    ];
    const results = candidates.filter((item: any) => contains(`${item.title} ${item.description} ${item.type}`)).slice(0, 30);
    res.json({ query, results, generatedAt: new Date().toISOString() });
  });
  return router;
}
