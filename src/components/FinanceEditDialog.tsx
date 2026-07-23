import React, { useState } from "react";
import { X } from "lucide-react";

type Props = { kind: "liability" | "entry"; record: any; onClose: () => void; onSaved: () => Promise<void> };

export default function FinanceEditDialog({ kind, record, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...record });
  const [saving, setSaving] = useState(false);
  const field = (key: string, label: string, type = "text", options?: string[]) => <label className="block text-xs font-medium text-stone-700">{label}{options ? <select value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="border rounded-lg p-2 w-full mt-1">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="border rounded-lg p-2 w-full mt-1"/>}</label>;
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    const url = kind === "liability" ? `/api/personal/finance/debts/${record.id}` : `/api/personal/finance/entries/${record.id}`;
    const body = kind === "liability" ? { ...form, balance: Number(form.balance || 0), originalBalance: Number(form.originalBalance || 0), minimumPayment: Number(form.minimumPayment || 0), interestRate: Number(form.interestRate || 0) } : { ...form, amount: Number(form.amount || 0) };
    const response = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!response.ok) return alert((await response.json()).error || "Edit failed");
    await onSaved(); onClose();
  };

  return <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><form onSubmit={save} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"><div className="flex justify-between items-center"><div><h2 className="text-lg font-bold">Edit {kind === "liability" ? "debt or recurring bill" : "finance entry"}</h2><p className="text-xs text-stone-500 mt-1">Changes are saved locally. Balance edits create an adjustment-history record.</p></div><button type="button" onClick={onClose} className="p-2"><X className="h-5 w-5"/></button></div>
    {kind === "liability" ? <div className="grid md:grid-cols-2 gap-3 mt-5">
      {field("accountKind", "Record kind", "text", ["balance", "recurring"])}
      {field("liabilityType", "Liability type", "text", ["Loan", "Credit card", "Store account", "Utility bill", "Tax", "Subscription", "Family obligation", "Medical", "Other"])}
      {field("name", "Name")}{field("creditor", "Creditor / payee")}
      {form.accountKind !== "recurring" && field("balance", "Current outstanding balance (R)", "number")}
      {form.accountKind !== "recurring" && field("originalBalance", "Original balance (R)", "number")}
      {field("minimumPayment", form.accountKind === "recurring" ? "Recurring amount (R)" : "Minimum payment (R)", "number")}
      {form.accountKind !== "recurring" && field("interestRate", "Annual interest rate (%)", "number")}
      {form.liabilityType === "Credit card" && field("creditLimit", "Total credit limit (R)", "number")}
      {field("nextDueDate", "Next due date", "date")}{field("dueDay", "Usual due day")}
      {field("frequency", "Frequency", "text", ["Once", "Weekly", "Monthly", "Quarterly", "Annual"])}
      {field("priority", "Priority", "text", ["Critical", "High", "Medium", "Low"])}
      {field("status", "Status", "text", ["Active", "Paused", "Paid"])}
      <label className="md:col-span-2 text-xs font-medium">Notes<textarea value={form.notes ?? ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="border rounded-lg p-2 w-full mt-1" rows={3}/></label>
    </div> : <div className="grid md:grid-cols-2 gap-3 mt-5">{field("date", "Date", "date")}{field("type", "Type", "text", ["income", "expense"])}{field("amount", "Amount (R)", "number")}{field("category", "Category")}<label className="md:col-span-2 text-xs font-medium">Description<textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} className="border rounded-lg p-2 w-full mt-1" rows={3}/></label></div>}
    <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={onClose} className="border rounded-lg px-4 py-2 text-xs font-bold">Cancel</button><button disabled={saving} className="bg-stone-900 text-white rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div></form></div>;
}
