import { BellRing, Brain, BriefcaseBusiness, Clock, Compass, GraduationCap, Key, Layers, MessageSquare, Settings, WalletCards } from "lucide-react";

export type LifeOsPage = "dashboard"|"executive_planner"|"planner"|"operations"|"school"|"work"|"chat"|"memory"|"automation"|"vault"|"settings";
export type NavigationDestination = { id:LifeOsPage; label:string; shortLabel:string; description:string; icon:typeof Layers; group:"primary"|"system" };

export const navigation:NavigationDestination[]=[
 {id:"dashboard",label:"Dashboard",shortLabel:"Home",description:"Today and attention",icon:Layers,group:"primary"},
 {id:"executive_planner",label:"Plan",shortLabel:"Plan",description:"Goals and tasks",icon:Compass,group:"primary"},
 {id:"planner",label:"Daily",shortLabel:"Daily",description:"Logs and routines",icon:Clock,group:"primary"},
 {id:"operations",label:"Finance",shortLabel:"Finance",description:"Money and statements",icon:WalletCards,group:"primary"},
 {id:"school",label:"School",shortLabel:"School",description:"Classes and coursework",icon:GraduationCap,group:"primary"},
 {id:"work",label:"Work",shortLabel:"Work",description:"Shifts and business",icon:BriefcaseBusiness,group:"primary"},
 {id:"chat",label:"Assistant",shortLabel:"AI",description:"Grounded LifeOS AI",icon:MessageSquare,group:"primary"},
 {id:"memory",label:"Knowledge",shortLabel:"Knowledge",description:"AI learning and evidence",icon:Brain,group:"primary"},
 {id:"automation",label:"Automation",shortLabel:"Automate",description:"Briefings and reminders",icon:BellRing,group:"system"},
 {id:"vault",label:"Connections",shortLabel:"Connect",description:"AI and integrations",icon:Key,group:"system"},
 {id:"settings",label:"Preferences",shortLabel:"Settings",description:"System and privacy",icon:Settings,group:"system"}
];

export const pageFromUrl=():LifeOsPage=>{const value=new URLSearchParams(window.location.search).get("page");return navigation.some(item=>item.id===value)?value as LifeOsPage:"dashboard"};
export const updatePageUrl=(page:LifeOsPage,mode:"push"|"replace"="push")=>{const url=new URL(window.location.href);url.searchParams.set("page",page);if(page!=="executive_planner")url.searchParams.delete("planner");window.history[`${mode}State`]({page},"",url)};
export const readSection=(key:string,allowed:string[],fallback:string)=>{const value=new URLSearchParams(window.location.search).get(key);return value&&allowed.includes(value)?value:fallback};
export const updateSection=(key:string,value:string)=>{const url=new URL(window.location.href);url.searchParams.set(key,value);window.history.replaceState({},"",url)};
