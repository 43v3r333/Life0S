import React, { useEffect, useMemo, useRef, useState } from "react";
import { Brain, BriefcaseBusiness, Clock, Compass, Key, Layers, MessageSquare, Search, Settings, WalletCards, X } from "lucide-react";

type Result = { id:string; type:string; title:string; description:string; target:string };
interface Props { isOpen:boolean; onClose:()=>void; onNavigate:(target:string)=>void }

const destinations = [
  { id:"dashboard", title:"Dashboard", description:"Home command centre", icon:Layers },
  { id:"executive_planner", title:"Plan", description:"Goals, tasks, projects and habits", icon:Compass },
  { id:"planner", title:"Daily", description:"Daily logs, prayer, health and routines", icon:Clock },
  { id:"operations", title:"Finance", description:"Accounts, transactions, debts and statements", icon:WalletCards },
  { id:"work", title:"Work", description:"Shift calendar and work tasks", icon:BriefcaseBusiness },
  { id:"chat", title:"Assistant", description:"Ask LifeOS using saved evidence", icon:MessageSquare },
  { id:"memory", title:"Memory", description:"Review what AI remembers", icon:Brain },
  { id:"vault", title:"Connections", description:"AI provider and integration keys", icon:Key },
  { id:"settings", title:"Preferences", description:"Profile, privacy and appearance", icon:Settings },
];

export default function CommandPalette({ isOpen,onClose,onNavigate }:Props) {
  const [query,setQuery]=useState(""),[results,setResults]=useState<Result[]>([]),[searching,setSearching]=useState(false); const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(isOpen){setQuery("");setResults([]);window.setTimeout(()=>input.current?.focus(),50)}},[isOpen]);
  useEffect(()=>{if(!isOpen)return;const listener=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose();};window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener)},[isOpen,onClose]);
  useEffect(()=>{if(query.trim().length<2){setResults([]);return;}const controller=new AbortController(),timer=window.setTimeout(async()=>{setSearching(true);try{const response=await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`,{signal:controller.signal});if(response.ok)setResults((await response.json()).results||[]);}finally{setSearching(false)}},180);return()=>{window.clearTimeout(timer);controller.abort();}},[query]);
  const visibleDestinations=useMemo(()=>destinations.filter(item=>`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())),[query]);
  const choose=(target:string)=>{onNavigate(target);onClose();}; if(!isOpen)return null;
  return <div className="fixed inset-0 z-[70] bg-stone-950/60 px-3 pt-16 backdrop-blur-sm" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-2xl"><div className="flex items-center gap-3 border-b p-4"><Search className="h-5 w-5 text-stone-400"/><input ref={input} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a page, goal, task, transaction, account or memory" className="min-w-0 flex-1 border-0 text-sm outline-none"/><button onClick={onClose} aria-label="Close search"><X className="h-4 w-4"/></button></div><div className="max-h-[65vh] overflow-y-auto p-2"><p className="px-2 py-1 text-[9px] font-bold uppercase text-stone-400">Navigate</p>{visibleDestinations.map(item=><button key={item.id} onClick={()=>choose(item.id)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-stone-50"><item.icon className="h-4 w-4 text-stone-500"/><span><strong className="block text-xs">{item.title}</strong><small className="text-stone-500">{item.description}</small></span></button>)}{query.trim().length>=2&&<><p className="mt-2 px-2 py-1 text-[9px] font-bold uppercase text-stone-400">Saved LifeOS records</p>{results.map(item=><button key={`${item.type}-${item.id}`} onClick={()=>choose(item.target)} className="block w-full rounded-xl p-3 text-left hover:bg-purple-50"><span className="text-[9px] font-bold uppercase text-purple-700">{item.type}</span><strong className="block truncate text-xs">{item.title}</strong><small className="block truncate text-stone-500">{item.description}</small></button>)}{searching&&<p className="p-4 text-center text-xs text-stone-500">Searching saved records…</p>}{!searching&&!results.length&&<p className="p-4 text-center text-xs text-stone-500">No saved records match.</p>}</>}</div><div className="border-t bg-stone-50 px-4 py-2 text-[10px] text-stone-500">Press ⌘K anywhere to open · results come from your local LifeOS database</div></div></div>;
}
