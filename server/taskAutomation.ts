import { createHash, randomUUID } from "node:crypto";

export type Recurrence = "None" | "Daily" | "Weekly" | "Monthly";

export function nextRecurringDate(date:string, recurrence:Recurrence){
  if(recurrence==="None"||!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
  const value=new Date(`${date}T12:00:00Z`);
  if(recurrence==="Daily")value.setUTCDate(value.getUTCDate()+1);
  if(recurrence==="Weekly")value.setUTCDate(value.getUTCDate()+7);
  if(recurrence==="Monthly"){const day=value.getUTCDate();value.setUTCDate(1);value.setUTCMonth(value.getUTCMonth()+1);const last=new Date(Date.UTC(value.getUTCFullYear(),value.getUTCMonth()+1,0)).getUTCDate();value.setUTCDate(Math.min(day,last));}
  return value.toISOString().slice(0,10);
}

export function dependencyState(task:any,tasks:any[]){
  const ids=Array.isArray(task.dependencies)?task.dependencies.map(String):[];
  const blockedBy=ids.map(id=>tasks.find(item=>String(item.id)===id)).filter(item=>!item||item.status!=="completed").map(item=>item?{id:item.id,title:item.title,status:item.status}:{id:"missing",title:"Missing dependency",status:"missing"});
  return {blockedBy,blocked:blockedBy.length>0};
}

export function recurrenceFingerprint(taskId:string,completedAt:string,nextDate:string){return createHash("sha256").update(`${taskId}|${completedAt}|${nextDate}`).digest("hex");}

export function createNextOccurrence(task:any,completedAt:string,instances:any[]){
  const recurrence=(task.recurrence||"None") as Recurrence,nextDate=nextRecurringDate(String(task.dueDate||completedAt.slice(0,10)),recurrence);
  if(!nextDate)return null;
  const fingerprint=recurrenceFingerprint(String(task.recurrenceRootId||task.id),completedAt,nextDate);
  if(instances.some(item=>item.fingerprint===fingerprint))return null;
  const now=new Date().toISOString(),rootId=String(task.recurrenceRootId||task.id),id=`t_${randomUUID()}`;
  const next={...task,id,status:"pending",dueDate:nextDate,actualTime:0,completedAt:undefined,completionHistory:[],rescheduleHistory:[],recurrenceRootId:rootId,previousOccurrenceId:task.id,createdAt:now,updatedAt:now};
  return {task:next,instance:{id:`recurrence_${randomUUID()}`,fingerprint,rootTaskId:rootId,sourceTaskId:task.id,generatedTaskId:id,dueDate:nextDate,createdAt:now}};
}

export function hasDependencyCycle(taskId:string,dependencies:string[],tasks:any[]){
  const graph=new Map(tasks.map(task=>[String(task.id),(Array.isArray(task.dependencies)?task.dependencies:[]).map(String)]));graph.set(taskId,dependencies);
  const visiting=new Set<string>(),visited=new Set<string>();
  const visit=(id:string):boolean=>{if(visiting.has(id))return true;if(visited.has(id))return false;visiting.add(id);for(const child of graph.get(id)||[])if(visit(child))return true;visiting.delete(id);visited.add(id);return false;};
  return visit(taskId);
}
