import { createHash, randomUUID } from "crypto";
import type { Express } from "express";

type State=Record<string,any>;
type Save=()=>Promise<void>;
type Audit=(action:string,details?:Record<string,unknown>)=>void;
type ProviderResult={claims?:Array<Record<string,unknown>>;proposals?:Array<Record<string,unknown>>;usage?:{inputTokens?:number;outputTokens?:number}};
type Provider=(request:{domains:string[];records:Record<string,unknown>;purpose:string})=>Promise<ProviderResult>;

const VERSION="knowledge-v1";
const day=86_400_000;
const domainCollections:Record<string,string[]>={
 finance:["bankAccounts","financeEntries","debts","liabilityPayments","bankTransactions","merchantCategoryRules","accountBalanceHistory"],
 goals:["goals","projects"],tasks:["tasks"],daily:["habits","focusSessions","dailyReviews"],
 work:["workShifts","workTasks","careerProfiles"],school:["tasks"],memory:["aiMemories","aiMemoryCandidates","aiDecisions"]
};
const sourcePriority:Record<string,number>={"user-confirmed":100,"source-document":95,"structured-record":80,"deterministic":70,"confirmed-knowledge":60,"conversation":30,"ai-inference":10};
const rows=(state:State,key:string)=>Array.isArray(state[key])?state[key]:[];
const hash=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const timestamp=(item:any)=>String(item?.updatedAt||item?.balanceUpdatedAt||item?.createdAt||item?.date||"");
const cleanText=(value:unknown,max=500)=>String(value||"").trim().slice(0,max);
const blockedKey=/vault|secret|password|token|cookie|session|authorization|cipher|privatekey|apikey/i;
const rawKey=/raw|binary|base64|visionresponsepreview|filedata|buffer/i;

export type KnowledgeSettings={enabled:boolean;eventAnalysis:boolean;nightlyTime:string;timezone:string;providerPolicy:"full-relevant"|"summaries"|"local-only";domains:string[];dailyTokenBudget:number;retentionDays:number;lastNightlyDate:string|null};

export function sanitizeKnowledgePayload(value:unknown,depth=0):unknown{
 if(depth>6)return "[depth-limited]";
 if(value===null||typeof value==="boolean"||typeof value==="number")return value;
 if(typeof value==="string")return value.slice(0,4000);
 if(Array.isArray(value))return value.slice(0,500).map(item=>sanitizeKnowledgePayload(item,depth+1));
 if(typeof value!=="object")return undefined;
 const result:Record<string,unknown>={};
 for(const [key,item] of Object.entries(value as Record<string,unknown>)){
  if(blockedKey.test(key)||rawKey.test(key))continue;
  const sanitized=sanitizeKnowledgePayload(item,depth+1);if(sanitized!==undefined)result[key]=sanitized;
 }
 return result;
}

export function ensureKnowledgeState(state:State){
 state.knowledgeAnalysisQueue=rows(state,"knowledgeAnalysisQueue");
 state.knowledgeAnalysisRuns=rows(state,"knowledgeAnalysisRuns");
 state.knowledgeClaims=rows(state,"knowledgeClaims");
 state.knowledgeEvidence=rows(state,"knowledgeEvidence");
 state.knowledgeFeedback=rows(state,"knowledgeFeedback");
 state.knowledgeMetrics=state.knowledgeMetrics&&typeof state.knowledgeMetrics==="object"?state.knowledgeMetrics:{proposalsApproved:0,proposalsRejected:0,financeClassificationsApproved:0};
 state.knowledgeCheckpoints=state.knowledgeCheckpoints&&typeof state.knowledgeCheckpoints==="object"?state.knowledgeCheckpoints:{};
 state.knowledgeSettings={enabled:true,eventAnalysis:true,nightlyTime:"02:30",timezone:"Africa/Johannesburg",providerPolicy:"full-relevant",domains:Object.keys(domainCollections),dailyTokenBudget:20_000,retentionDays:365,lastNightlyDate:null,...(state.knowledgeSettings||{})} as KnowledgeSettings;
 const recoveredAt=new Date().toISOString();
 for(const item of state.knowledgeAnalysisQueue){
  if(item.status==="processing"){
   item.status="pending";
   item.dueAt=recoveredAt;
   item.recoveredAfterRestart=true;
  }
 }
 for(const memory of rows(state,"aiMemories")){
  memory.domain=memory.domain||memory.category||"memory";memory.claimType=memory.claimType||memory.memoryType||"fact";
  memory.truthStatus=memory.truthStatus||(memory.verificationStatus==="user-confirmed"?"confirmed":"derived");
  memory.sourcePriority=Number(memory.sourcePriority||sourcePriority[memory.sourceType]||20);
  memory.evidenceRefs=Array.isArray(memory.evidenceRefs)?memory.evidenceRefs:[];
  memory.lastVerifiedAt=memory.lastVerifiedAt||(memory.verificationStatus==="user-confirmed"?memory.updatedAt||memory.createdAt:null);
  memory.freshnessStatus=memory.freshnessStatus||"current";
  memory.effectiveDate=memory.effectiveDate||memory.validFrom||memory.createdAt||null;
  memory.supersessionHistory=Array.isArray(memory.supersessionHistory)?memory.supersessionHistory:[];
 }
 return state.knowledgeSettings as KnowledgeSettings;
}

function domainRecords(state:State,domain:string){
 const collections=domainCollections[domain]||[];const result:Record<string,unknown>={};
 for(const key of collections){
  let items=rows(state,key);
  if(domain==="school"&&key==="tasks")items=items.filter((item:any)=>(item.contextTags||[]).includes("school"));
  result[key]=sanitizeKnowledgePayload(items);
 }
 return result;
}
function domainFingerprint(state:State,domain:string){return hash({version:VERSION,domain,records:domainRecords(state,domain)});}
function localDate(timezone:string){return new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
function localTime(timezone:string){return new Intl.DateTimeFormat("en-GB",{timeZone:timezone,hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());}

export function analyzeFinanceDeterministically(state:State){
 const now=Date.now(),findings:Array<Record<string,unknown>>=[];
 for(const account of rows(state,"bankAccounts"))if(!account.balanceUpdatedAt||now-new Date(account.balanceUpdatedAt).getTime()>30*day)findings.push({id:`stale-account:${account.id}`,kind:"stale-balance",severity:"medium",entityType:"account",entityId:account.id,title:`${cleanText(account.name,120)} balance is older than 30 days`,evidence:[account.balanceUpdatedAt||"missing"]});
 for(const debt of rows(state,"debts"))if(debt.status!=="Paid"&&!debt.nextDueDate)findings.push({id:`missing-due:${debt.id}`,kind:"missing-field",severity:"high",entityType:"liability",entityId:debt.id,title:`${cleanText(debt.name,120)} has no next due date`,evidence:[]});
 const unreconciled=rows(state,"bankTransactions").filter((item:any)=>item.status!=="reconciled");
 if(unreconciled.length)findings.push({id:"unreconciled-transactions",kind:"reconciliation-gap",severity:"medium",title:`${unreconciled.length} transactions await reconciliation`,evidence:unreconciled.slice(0,50).map((item:any)=>item.id)});
 const fingerprints=new Map<string,any[]>();for(const transaction of rows(state,"bankTransactions")){const key=cleanText(transaction.fingerprint||`${transaction.bankAccountId||transaction.creditCardId}|${transaction.date}|${transaction.description}|${Number(transaction.amount).toFixed(2)}`,500).toLowerCase();if(!key)continue;fingerprints.set(key,[...(fingerprints.get(key)||[]),transaction]);}
 for(const [fingerprint,items] of fingerprints)if(items.length>1)findings.push({id:`duplicate:${hash(fingerprint).slice(0,16)}`,kind:"possible-duplicate",severity:"high",title:`${items.length} transactions share the same identity`,evidence:items.map(item=>item.id)});
 return findings;
}

export function buildKnowledgeGraph(state:State,domain="all"){
 const nodes:Array<Record<string,unknown>>=[],edges:Array<Record<string,unknown>>=[];const add=(id:string,type:string,label:string,meta:Record<string,unknown>={})=>{if(id&&!nodes.some(node=>node.id===id))nodes.push({id,type,label,...meta})};
 if(domain==="all"||domain==="finance"){
  for(const account of rows(state,"bankAccounts")){add(`account:${account.id}`,"account",cleanText(account.name,100),{asOf:account.balanceUpdatedAt||null});}
  for(const debt of rows(state,"debts")){add(`liability:${debt.id}`,"liability",cleanText(debt.name,100));}
  for(const tx of rows(state,"bankTransactions").slice(-300)){add(`transaction:${tx.id}`,"transaction",cleanText(tx.description,100),{date:tx.date,category:tx.suggestedCategory});const target=tx.bankAccountId?`account:${tx.bankAccountId}`:tx.creditCardId?`liability:${tx.creditCardId}`:"";if(target)edges.push({id:`tx-owner:${tx.id}`,source:`transaction:${tx.id}`,target,type:"belongs-to"});}
 }
 if(domain==="all"||domain==="planning"){
  for(const goal of rows(state,"goals")){add(`goal:${goal.id}`,"goal",cleanText(goal.title,100));}
  for(const task of rows(state,"tasks").slice(-300)){add(`task:${task.id}`,"task",cleanText(task.title,100),{status:task.status,dueDate:task.dueDate||null});if(task.goalId)edges.push({id:`task-goal:${task.id}`,source:`task:${task.id}`,target:`goal:${task.goalId}`,type:"supports"});for(const tag of task.contextTags||[])if(String(tag).startsWith("school:module:")){const module=String(tag).slice(14);add(`school:${module}`,"school-module",module.replaceAll("-"," "));edges.push({id:`task-school:${task.id}`,source:`task:${task.id}`,target:`school:${module}`,type:"coursework-for"});}}
 }
 for(const claim of rows(state,"knowledgeClaims").filter((item:any)=>item.status!=="rejected").slice(-300)){add(`claim:${claim.id}`,"claim",cleanText(claim.content,120),{confidence:claim.confidence,truthStatus:claim.truthStatus});for(const ref of claim.evidenceRefs||[])edges.push({id:`claim-evidence:${claim.id}:${ref}`,source:`claim:${claim.id}`,target:`evidence:${ref}`,type:"supported-by"});}
 for(const evidence of rows(state,"knowledgeEvidence").slice(-300))add(`evidence:${evidence.id}`,"evidence",cleanText(evidence.label||evidence.sourceType,100),{sourceType:evidence.sourceType,sourcePriority:evidence.sourcePriority});
 return {generatedAt:new Date().toISOString(),domain,nodes:nodes.slice(0,1000),edges:edges.slice(0,1500)};
}

export function createKnowledgeEngine({state,save,audit,provider}:{state:State;save:Save;audit:Audit;provider?:Provider}){
 const settings=ensureKnowledgeState(state);let timer:NodeJS.Timeout|null=null,processing=false,persisting=false;
 const enqueue=async(domains:string[],reason:string,dueAt=new Date(Date.now()+120_000).toISOString())=>{
  if(!settings.enabled)return null;const allowed=[...new Set(domains.filter(domain=>settings.domains.includes(domain)))];if(!allowed.length)return null;
  const dedupeKey=hash({version:VERSION,domains:allowed.sort(),fingerprints:allowed.map(domain=>domainFingerprint(state,domain))});
  const existing=rows(state,"knowledgeAnalysisQueue").find((item:any)=>item.dedupeKey===dedupeKey&&["pending","processing"].includes(item.status));if(existing)return existing;
  const item={id:randomUUID(),dedupeKey,domains:allowed,reason,status:"pending",attempts:0,dueAt,createdAt:new Date().toISOString()};state.knowledgeAnalysisQueue.push(item);persisting=true;await save();persisting=false;return item;
 };
 const observe=async()=>{if(persisting||!settings.enabled||!settings.eventAnalysis)return;const changed=settings.domains.filter(domain=>state.knowledgeCheckpoints[domain]!==domainFingerprint(state,domain));if(changed.length)await enqueue(changed,"record-change");};
 const execute=async(item:any)=>{const started=Date.now(),run:any={id:randomUUID(),queueId:item.id,analysisVersion:VERSION,domains:item.domains,reason:item.reason,status:"running",provider:"local-deterministic",inputFingerprint:item.dedupeKey,findings:[] as any[],proposalsCreated:0,claimsCreated:0,inputTokens:0,outputTokens:0,startedAt:new Date().toISOString(),completedAt:null as string|null,error:null as string|null,nextRetryAt:null as string|null,durationMs:0};state.knowledgeAnalysisRuns.push(run);item.status="processing";item.attempts+=1;await save();
  try{
   if(item.domains.includes("finance"))run.findings.push(...analyzeFinanceDeterministically(state));
   for(const finding of run.findings){const evidenceId=`finding:${finding.id}`;if(!state.knowledgeEvidence.some((entry:any)=>entry.id===evidenceId))state.knowledgeEvidence.push({id:evidenceId,label:finding.title,sourceType:"deterministic",sourcePriority:sourcePriority.deterministic,entityType:finding.entityType||null,entityId:finding.entityId||null,contentHash:hash(finding),createdAt:new Date().toISOString(),analysisRunId:run.id});}
   const today=localDate(settings.timezone);const todayUsage=rows(state,"knowledgeAnalysisRuns").filter((entry:any)=>String(entry.startedAt).startsWith(today)).reduce((sum:number,entry:any)=>sum+Number(entry.inputTokens||0)+Number(entry.outputTokens||0),0);
   if(provider&&settings.providerPolicy!=="local-only"&&todayUsage<settings.dailyTokenBudget&&(!state.knowledgeMetrics.circuitOpenUntil||state.knowledgeMetrics.circuitOpenUntil<new Date().toISOString())){const records=Object.fromEntries(item.domains.map((domain:string)=>{const full=domainRecords(state,domain);return[domain,settings.providerPolicy==="summaries"?Object.fromEntries(Object.entries(full).map(([key,value])=>[key,{count:Array.isArray(value)?value.length:0,latest:Array.isArray(value)?value.map(timestamp).filter(Boolean).sort().at(-1)||null:null}])):full]}));const result=await provider({domains:item.domains,records,purpose:"Find evidence-backed knowledge claims and guarded correction proposals. Never invent facts or propose balancing adjustments without source evidence."});run.provider="configured-provider";run.inputTokens=Number(result.usage?.inputTokens||0);run.outputTokens=Number(result.usage?.outputTokens||0);state.knowledgeMetrics.providerFailures=0;state.knowledgeMetrics.circuitOpenUntil=null;
    for(const candidate of (result.claims||[]).slice(0,30)){const content=cleanText(candidate.content,1000);if(!content)continue;const claimHash=hash({content,domain:candidate.domain});if(state.knowledgeClaims.some((claim:any)=>claim.claimHash===claimHash&&claim.status!=="rejected"))continue;const createdAt=new Date().toISOString();state.knowledgeClaims.push({id:randomUUID(),claimHash,content,domain:cleanText(candidate.domain||item.domains[0],50),claimType:cleanText(candidate.claimType||"inference",50),confidence:Math.max(0,Math.min(.89,Number(candidate.confidence)||.5)),truthStatus:"proposed",freshnessStatus:"unverified",effectiveDate:cleanText(candidate.effectiveDate,40)||null,lastVerifiedAt:null,sourceType:"ai-inference",sourcePriority:sourcePriority["ai-inference"],evidenceRefs:Array.isArray(candidate.evidenceRefs)?candidate.evidenceRefs.map(String).slice(0,20):[],analysisRunId:run.id,originatingRunId:run.id,supersessionHistory:[],status:"pending",createdAt,updatedAt:createdAt});run.claimsCreated++;}
    for(const candidate of (result.proposals||[]).slice(0,20)){const proposal={id:randomUUID(),dedupeKey:cleanText(candidate.dedupeKey||hash(candidate),100),type:cleanText(candidate.type||"knowledge_claim",60),title:cleanText(candidate.title||"Review AI knowledge proposal",160),explanation:cleanText(candidate.explanation,1000),payload:sanitizeKnowledgePayload(candidate.payload||{}),evidenceRefs:Array.isArray(candidate.evidenceRefs)?candidate.evidenceRefs.map(String).slice(0,20):[],confidence:Math.max(0,Math.min(.89,Number(candidate.confidence)||.5)),impact:cleanText(candidate.impact,500),rollback:sanitizeKnowledgePayload(candidate.rollback||{}),status:"pending",provider:"configured-provider",analysisRunId:run.id,createdAt:new Date().toISOString()};if(!rows(state,"aiActionProposals").some((entry:any)=>entry.dedupeKey===proposal.dedupeKey&&entry.status==="pending")){state.aiActionProposals.push(proposal);run.proposalsCreated++;}}
   }
   for(const domain of item.domains)state.knowledgeCheckpoints[domain]=domainFingerprint(state,domain);item.status="completed";run.status="completed";run.completedAt=new Date().toISOString();audit("knowledge_analysis_completed",{runId:run.id,domains:item.domains,findings:run.findings.length,proposals:run.proposalsCreated,claims:run.claimsCreated,provider:run.provider});
  }catch(error:any){run.status="failed";run.error=cleanText(error?.message||error,500);run.completedAt=new Date().toISOString();state.knowledgeMetrics.providerFailures=Number(state.knowledgeMetrics.providerFailures||0)+1;if(state.knowledgeMetrics.providerFailures>=3)state.knowledgeMetrics.circuitOpenUntil=new Date(Date.now()+30*60_000).toISOString();if(item.attempts<3){item.status="pending";item.dueAt=new Date(Date.now()+Math.min(60,5*2**item.attempts)*60_000).toISOString();run.nextRetryAt=item.dueAt;}else item.status="failed";audit("knowledge_analysis_failed",{runId:run.id,domains:item.domains,attempts:item.attempts});}
  run.durationMs=Date.now()-started;const cutoff=Date.now()-settings.retentionDays*day;state.knowledgeAnalysisRuns=rows(state,"knowledgeAnalysisRuns").filter((entry:any)=>entry.status==="running"||new Date(entry.startedAt||0).getTime()>=cutoff);state.knowledgeAnalysisQueue=rows(state,"knowledgeAnalysisQueue").filter((entry:any)=>!["completed","failed"].includes(entry.status)||new Date(entry.createdAt||0).getTime()>=cutoff);await save();
 };
 const tick=async()=>{if(processing||!settings.enabled)return;processing=true;try{const now=new Date().toISOString(),item=rows(state,"knowledgeAnalysisQueue").filter((entry:any)=>entry.status==="pending"&&entry.dueAt<=now).sort((a:any,b:any)=>a.dueAt.localeCompare(b.dueAt))[0];if(item)await execute(item);const date=localDate(settings.timezone),time=localTime(settings.timezone);if(time>=settings.nightlyTime&&settings.lastNightlyDate!==date){settings.lastNightlyDate=date;await enqueue(settings.domains,"nightly",new Date().toISOString());}}finally{processing=false;}};
 const start=async()=>{ensureKnowledgeState(state);const date=localDate(settings.timezone);if(settings.lastNightlyDate!==date)await enqueue(settings.domains,"startup-catch-up",new Date().toISOString());timer=setInterval(()=>void tick(),60_000);timer.unref();await tick();};
 const stop=()=>{if(timer)clearInterval(timer);timer=null;};
 const overview=()=>{const claims=rows(state,"knowledgeClaims"),runs=rows(state,"knowledgeAnalysisRuns"),proposals=rows(state,"aiActionProposals").filter((item:any)=>item.status==="pending"&&item.analysisRunId);const findings=runs.filter((run:any)=>run.status==="completed").at(-1)?.findings||[];return{generatedAt:new Date().toISOString(),settings,health:{domains:settings.domains.length,claims:claims.filter((item:any)=>item.status!=="rejected").length,confirmed:claims.filter((item:any)=>item.truthStatus==="confirmed").length,pendingClaims:claims.filter((item:any)=>item.status==="pending").length,pendingProposals:proposals.length,conflicts:findings.filter((item:any)=>item.severity==="high").length,queue:rows(state,"knowledgeAnalysisQueue").filter((item:any)=>item.status==="pending").length,lastSuccessfulRun:runs.filter((item:any)=>item.status==="completed").at(-1)?.completedAt||null},finance:{findings:analyzeFinanceDeterministically(state),unreconciled:rows(state,"bankTransactions").filter((item:any)=>item.status!=="reconciled").length,approvedRules:rows(state,"merchantCategoryRules").length},metrics:state.knowledgeMetrics,recentRuns:runs.slice(-20).reverse()};};
 return{settings,enqueue,observe,start,stop,tick,overview,graph:(domain?:string)=>buildKnowledgeGraph(state,domain),runs:()=>rows(state,"knowledgeAnalysisRuns").slice().reverse(),claims:()=>[...rows(state,"knowledgeClaims"),...rows(state,"aiMemories").map((memory:any)=>({id:memory.id,content:memory.content,domain:memory.domain||memory.category,claimType:memory.claimType||memory.memoryType,confidence:memory.confidence,truthStatus:memory.truthStatus||memory.verificationStatus,status:memory.lifecycleStatus,sourceType:memory.sourceType,evidenceRefs:memory.evidenceRefs||[],sourcePriority:memory.sourcePriority,lastVerifiedAt:memory.lastVerifiedAt,createdAt:memory.createdAt,updatedAt:memory.updatedAt}))].sort((a:any,b:any)=>timestamp(b).localeCompare(timestamp(a))),proposals:()=>rows(state,"aiActionProposals").filter((item:any)=>item.analysisRunId).slice().reverse()};
}

export function registerKnowledgeRoutes(app:Express,{engine,state,save,audit}:{engine:ReturnType<typeof createKnowledgeEngine>;state:State;save:Save;audit:Audit}){
 app.get("/api/ai/knowledge/overview",(_req,res)=>res.json(engine.overview()));
 app.get("/api/ai/knowledge/graph",(req,res)=>res.json(engine.graph(String(req.query.domain||"all"))));
 app.get("/api/ai/knowledge/runs",(_req,res)=>res.json(engine.runs()));
 app.get("/api/ai/knowledge/claims",(_req,res)=>res.json(engine.claims()));
 app.get("/api/ai/knowledge/proposals",(_req,res)=>res.json(engine.proposals()));
 app.get("/api/ai/knowledge/settings",(_req,res)=>res.json(engine.settings));
 app.patch("/api/ai/knowledge/settings",async(req,res)=>{const allowed=["enabled","eventAnalysis","nightlyTime","providerPolicy","domains","dailyTokenBudget","retentionDays"] as const;for(const key of allowed)if(req.body[key]!==undefined)(engine.settings as any)[key]=req.body[key];if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(engine.settings.nightlyTime))return res.status(400).json({error:"nightlyTime must use HH:MM."});engine.settings.dailyTokenBudget=Math.max(0,Math.min(1_000_000,Number(engine.settings.dailyTokenBudget)||0));engine.settings.retentionDays=Math.max(30,Math.min(3650,Number(engine.settings.retentionDays)||365));audit("knowledge_settings_updated",{enabled:engine.settings.enabled,eventAnalysis:engine.settings.eventAnalysis,nightlyTime:engine.settings.nightlyTime,providerPolicy:engine.settings.providerPolicy});await save();res.json(engine.settings);});
 app.post("/api/ai/knowledge/analyze",async(req,res)=>{const domains=Array.isArray(req.body.domains)?req.body.domains.map(String):engine.settings.domains;const item=await engine.enqueue(domains,"manual",new Date().toISOString());await engine.tick();res.status(202).json({queued:item,overview:engine.overview()});});
 app.post("/api/ai/knowledge/feedback",async(req,res)=>{const rating=Math.max(-1,Math.min(1,Number(req.body.rating)||0)),record={id:randomUUID(),targetType:cleanText(req.body.targetType,50),targetId:cleanText(req.body.targetId,100),rating,comment:cleanText(req.body.comment,500),createdAt:new Date().toISOString()};state.knowledgeFeedback.push(record);const feedback=state.knowledgeFeedback;state.knowledgeMetrics.feedbackCount=feedback.length;state.knowledgeMetrics.averageFeedback=feedback.length?feedback.reduce((total:number,item:any)=>total+Number(item.rating||0),0)/feedback.length:0;audit("knowledge_feedback_recorded",{targetType:record.targetType,targetId:record.targetId,rating});await save();res.status(201).json(record);});
 app.patch("/api/ai/knowledge/proposals/:id",async(req,res)=>{const proposal=rows(state,"aiActionProposals").find((item:any)=>item.id===req.params.id&&item.analysisRunId);if(!proposal)return res.status(404).json({error:"Knowledge proposal not found."});if(proposal.status!=="pending")return res.status(409).json({error:"Knowledge proposal has already been decided."});const decision=String(req.body.decision);if(!["approve","reject"].includes(decision))return res.status(400).json({error:"decision must be approve or reject."});if(decision==="approve"){if(proposal.type!=="knowledge_claim")return res.status(409).json({error:"This proposal type requires a domain-specific approval workflow and was not applied."});const content=cleanText(req.body.content||proposal.payload?.content||proposal.title,1000);state.aiMemories.push({id:randomUUID(),content,category:cleanText(proposal.payload?.domain||"knowledge",80),memoryType:"learned-fact",verificationStatus:"user-confirmed",lifecycleStatus:"active",confidence:1,sourceType:"user-confirmed",sourcePriority:sourcePriority["user-confirmed"],evidenceRefs:proposal.evidenceRefs||[],truthStatus:"confirmed",validFrom:new Date().toISOString(),lastVerifiedAt:new Date().toISOString(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});proposal.status="approved";proposal.decidedAt=new Date().toISOString();state.knowledgeMetrics.proposalsApproved++;}else{proposal.status="rejected";proposal.decidedAt=new Date().toISOString();state.knowledgeMetrics.proposalsRejected++;}audit(`knowledge_proposal_${proposal.status}`,{proposalId:proposal.id,type:proposal.type});await save();res.json(proposal);});
}
