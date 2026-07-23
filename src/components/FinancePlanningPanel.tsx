import React, { useEffect, useState } from "react";
import { Bot, Calculator, CalendarClock, TrendingDown, WalletCards } from "lucide-react";

const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });
const month = new Date().toISOString().slice(0, 7);

export default function FinancePlanningPanel({ onSaved }: { onSaved: () => Promise<void> }) {
  const [payday, setPayday] = useState<any>(null);
  const [strategies, setStrategies] = useState<any>(null);
  const [question, setQuestion] = useState("What should I do next to reduce my debts safely?");
  const [advice, setAdvice] = useState<any>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [salary, setSalary] = useState({ date: new Date().toISOString().slice(0, 10), basePay: "", overtime: "", allowances: "", deductions: "", notes: "" });
  const [budgetRows, setBudgetRows] = useState([{ name: "Groceries", planned: "" }, { name: "Transport", planned: "" }, { name: "Household", planned: "" }, { name: "Personal", planned: "" }]);
  const [planningView, setPlanningView] = useState<"monthly" | "commitments" | "forecast" | "strategy">("monthly");
  const [forecast, setForecast] = useState<any>(null);

  const refresh = async () => {
    const [paydayResponse, strategyResponse, forecastResponse] = await Promise.all([fetch("/api/personal/finance/payday-plan"), fetch("/api/personal/finance/debt-strategies"), fetch("/api/personal/finance/forecast")]);
    if (paydayResponse.ok) setPayday(await paydayResponse.json());
    if (strategyResponse.ok) setStrategies(await strategyResponse.json());
    if (forecastResponse.ok) setForecast(await forecastResponse.json());
  };
  useEffect(() => { refresh(); }, []);
  const submitSalary = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/personal/finance/salary-breakdowns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...salary, basePay: Number(salary.basePay || 0), overtime: Number(salary.overtime || 0), allowances: Number(salary.allowances || 0), deductions: Number(salary.deductions || 0) }) });
    if (!response.ok) return alert((await response.json()).error || "Salary save failed");
    setSalary({ ...salary, basePay: "", overtime: "", allowances: "", deductions: "", notes: "" });
    await onSaved(); await refresh();
  };
  const submitBudget = async (event: React.FormEvent) => {
    event.preventDefault();
    const categories = budgetRows.filter((row) => row.name.trim() && row.planned !== "").map((row) => ({ name: row.name.trim(), planned: Number(row.planned) }));
    const response = await fetch(`/api/personal/finance/budgets/${month}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categories }) });
    if (!response.ok) return alert((await response.json()).error || "Budget save failed");
    await onSaved();
  };
  const askAdvisor = async (event: React.FormEvent) => {
    event.preventDefault(); setAdviceLoading(true);
    try {
      const response = await fetch("/api/personal/finance/ai-advice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, useExternalAi: true }) });
      if (!response.ok) throw new Error("Debt advisor request failed");
      setAdvice(await response.json());
    } catch (error: any) { alert(error.message); }
    finally { setAdviceLoading(false); }
  };

  return <div className="space-y-5">
    <div className="flex gap-2 overflow-x-auto bg-stone-100 rounded-xl p-1">{[["monthly","Monthly plan"],["commitments","Commitments"],["forecast","3–12 month forecast"],["strategy","Debt strategy & AI"]].map(([id,label])=><button key={id} onClick={()=>setPlanningView(id as any)} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold ${planningView===id?"bg-white shadow-sm":"text-stone-500"}`}>{label}</button>)}</div>
    {planningView === "monthly" && <div className="grid lg:grid-cols-2 gap-5">
      <form onSubmit={submitSalary} className="bg-white border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-emerald-700"/><h3 className="font-semibold">Record salary breakdown</h3></div>
        <p className="text-xs text-stone-500">This creates one actual salary income record. Net pay is calculated from the components.</p>
        <input type="date" value={salary.date} onChange={(event) => setSalary({ ...salary, date: event.target.value })} className="border rounded-lg p-2 w-full"/>
        <div className="grid grid-cols-2 gap-3">{[["basePay", "Base pay"], ["overtime", "Overtime"], ["allowances", "Allowances"], ["deductions", "Deductions"]].map(([key, label]) => <input key={key} type="number" min="0" step="0.01" value={(salary as any)[key]} onChange={(event) => setSalary({ ...salary, [key]: event.target.value })} placeholder={`${label} (R)`} className="border rounded-lg p-2"/>)}</div>
        <input value={salary.notes} onChange={(event) => setSalary({ ...salary, notes: event.target.value })} placeholder="Payslip notes" className="border rounded-lg p-2 w-full"/>
        <button className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold">Save actual salary</button>
      </form>

      <form onSubmit={submitBudget} className="bg-white border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2"><Calculator className="h-4 w-4 text-blue-700"/><h3 className="font-semibold">{month} spending budget</h3></div>
        <p className="text-xs text-stone-500">Plan flexible spending categories. Debts and recurring bills are handled by the payday plan.</p>
        {budgetRows.map((row, index) => <div key={index} className="grid grid-cols-2 gap-2"><input value={row.name} onChange={(event) => setBudgetRows((rows) => rows.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} placeholder="Category" className="border rounded-lg p-2"/><input type="number" min="0" step="0.01" value={row.planned} onChange={(event) => setBudgetRows((rows) => rows.map((item, i) => i === index ? { ...item, planned: event.target.value } : item))} placeholder="Planned (R)" className="border rounded-lg p-2"/></div>)}
        <button type="button" onClick={() => setBudgetRows((rows) => [...rows, { name: "", planned: "" }])} className="text-xs border rounded-lg px-3 py-2">Add category</button>
        <button className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold ml-2">Save budget</button>
      </form>
    </div>}

    {planningView === "commitments" && payday && <div className="bg-white border rounded-2xl p-5"><div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-amber-700"/><h3 className="font-semibold">Payday allocation for {payday.month}</h3></div><div className="grid grid-cols-3 gap-3 mt-4 text-sm"><div className="bg-stone-50 rounded-xl p-3">Income recorded<strong className="block mt-1">{money.format(payday.available)}</strong></div><div className="bg-stone-50 rounded-xl p-3">Required commitments<strong className="block mt-1">{money.format(payday.committed)}</strong></div><div className={`rounded-xl p-3 ${payday.remainingAfterCommitments >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>After commitments<strong className="block mt-1">{money.format(payday.remainingAfterCommitments)}</strong></div></div><div className="mt-4 grid md:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto">{payday.commitments.map((item: any) => <div key={item.id} className="border rounded-lg p-3 text-sm flex justify-between gap-3"><span>{item.name}<small className="block text-stone-500">{item.kind} · Due {item.due}</small></span><strong>{money.format(item.amount)}</strong></div>)}</div></div>}

    {planningView === "forecast" && forecast && <section className="bg-white border rounded-2xl p-5"><div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-blue-700"/><h3 className="font-semibold">Variable-income cash forecast</h3></div><p className="text-xs text-stone-500 mt-2">Uses {forecast.salaryHistoryMonths} saved salary months, current cash, the latest flexible budget, and required debt or bill payments. It is a planning estimate, not a guaranteed balance.</p>{!forecast.ready&&<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4"><strong className="text-sm text-amber-900">Forecast needs more data</strong><ul className="list-disc pl-5 text-xs text-amber-800 mt-2">{forecast.missing.map((item:string)=><li key={item}>{item}</li>)}</ul></div>}{forecast.basis.pendingTransactionWarning&&<p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-3">Some bank transactions still await review, so actual spending may differ.</p>}{forecast.ready&&<div className="overflow-x-auto mt-4"><table className="w-full text-xs"><thead><tr className="text-left border-b"><th className="py-2">Scenario</th><th>Income/month</th><th>Outflow/month</th><th>Margin</th><th>3 months</th><th>6 months</th><th>12 months</th></tr></thead><tbody>{forecast.scenarios.map((scenario:any)=><tr key={scenario.name} className="border-b last:border-0"><td className="py-3 font-semibold">{scenario.name}</td><td>{money.format(scenario.monthlyIncome)}</td><td>{money.format(scenario.monthlyOutflow)}</td><td className={scenario.monthlyMargin>=0?"text-emerald-700":"text-red-700"}>{money.format(scenario.monthlyMargin)}</td>{scenario.horizons.map((item:any)=><td key={item.months} className={item.projectedCash>=0?"":"text-red-700"}>{money.format(item.projectedCash)}</td>)}</tr>)}</tbody></table></div>}<div className="grid grid-cols-3 gap-2 mt-4 text-[10px]"><div className="bg-stone-50 rounded p-2">Starting cash<strong className="block text-xs mt-1">{money.format(forecast.startingCash)}</strong></div><div className="bg-stone-50 rounded p-2">Flexible budget<strong className="block text-xs mt-1">{money.format(forecast.basis.flexibleBudget)}</strong></div><div className="bg-stone-50 rounded p-2">Commitments<strong className="block text-xs mt-1">{money.format(forecast.basis.requiredCommitments)}</strong></div></div></section>}

    {planningView === "strategy" && <>{strategies && <div className="bg-white border rounded-2xl p-5"><div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-purple-700"/><h3 className="font-semibold">Debt strategy comparison</h3></div><p className="text-xs text-stone-500 mt-2">{strategies.note}</p><div className="grid md:grid-cols-2 gap-5 mt-4">{[["Snowball", strategies.snowball], ["Avalanche", strategies.avalanche]].map(([label, rows]: any) => <div key={label}><h4 className="text-xs uppercase font-bold">{label} order</h4><div className="space-y-2 mt-2">{rows.map((row: any) => <div key={row.id} className="bg-stone-50 rounded-lg p-3 text-sm"><strong>{row.rank}. {row.name}</strong><span className="block text-xs text-stone-500 mt-1">{money.format(row.balance)} · {row.interestRate}% · minimum {money.format(row.minimumPayment)}</span></div>)}</div></div>)}</div></div>}
    <div className="bg-stone-900 text-white rounded-2xl p-5"><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-emerald-400"/><h3 className="font-semibold">LifeOS Debt Advisor</h3></div><p className="text-xs text-stone-400 mt-2">Uses recorded LifeOS figures only. Local analysis is private and works without an API key.</p><form onSubmit={askAdvisor} className="flex gap-2 mt-4"><input value={question} onChange={(event) => setQuestion(event.target.value)} className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-sm"/><button disabled={adviceLoading || !question.trim()} className="bg-emerald-500 text-stone-950 rounded-xl px-4 text-xs font-bold disabled:opacity-50">{adviceLoading ? "Checking…" : "Ask advisor"}</button></form>{advice && <div className="mt-5 grid lg:grid-cols-2 gap-4"><div><h4 className="text-xs uppercase font-bold text-amber-300">Checks and warnings</h4>{advice.warnings.length ? <ul className="list-disc pl-5 mt-2 text-sm text-stone-300 space-y-2">{advice.warnings.map((warning: string) => <li key={warning}>{warning}</li>)}</ul> : <p className="text-sm text-emerald-300 mt-2">No missing-data warnings detected.</p>}</div><div><h4 className="text-xs uppercase font-bold text-emerald-300">Recommended next actions</h4><ol className="list-decimal pl-5 mt-2 text-sm text-stone-200 space-y-2">{advice.recommendations.map((recommendation: string) => <li key={recommendation}>{recommendation}</li>)}</ol></div>{advice.narrative && <div className="lg:col-span-2 border-t border-stone-700 pt-4 text-sm whitespace-pre-wrap">{advice.narrative}</div>}</div>}</div></>}
  </div>;
}
