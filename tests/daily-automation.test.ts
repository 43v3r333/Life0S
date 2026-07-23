import test from "node:test";
import assert from "node:assert/strict";
import { buildAutomationEvaluation, DEFAULT_AUTOMATION_RULES, shiftWindows } from "../server/dailyAutomation.js";

const daily=(date="2026-07-22",type="off")=>({asOfDate:date,generatedAt:`${date}T10:00:00Z`,execution:{currentShift:{type},habitsCompleted:0,totalHabits:1},day:{summary:{scheduled:2,completed:1,focusMinutes:30,spending:50}},finance:{cash:1000},recommendedAction:"Study",fullDayPlan:{mode:"off"}});

test("shift adaptive windows protect day, night and recovery sleep",()=>{
 assert.equal(shiftWindows(daily("2026-07-22","day"),"2026-07-22",DEFAULT_AUTOMATION_RULES).expectedWake,"04:30");
 assert.equal(shiftWindows(daily("2026-07-22","night"),"2026-07-22",DEFAULT_AUTOMATION_RULES).protectedSleepStart,"08:00");
 assert.equal(shiftWindows({...daily(),fullDayPlan:{mode:"after-night"}},"2026-07-22",DEFAULT_AUTOMATION_RULES).recovery,true);
});

test("automation candidates are deterministic and exclude already paid commitments",()=>{
 const state={tasks:[{id:"t1",title:"Late",status:"not-started",dueDate:"2026-07-20"}],workTasks:[],debts:[{id:"d1",name:"Paid bill",status:"Paid",nextDueDate:"2026-07-22",minimumPayment:500}],bankAccounts:[],bankTransactions:[],habits:[],aiMemoryCandidates:[],aiMemories:[],googleSyncServices:{},googleWorkspace:{gmailMessages:[]}};
 const first=buildAutomationEvaluation(state,daily(),new Date("2026-07-22T10:00:00Z"),DEFAULT_AUTOMATION_RULES),second=buildAutomationEvaluation(state,daily(),new Date("2026-07-22T10:00:00Z"),DEFAULT_AUTOMATION_RULES);
 assert.equal(first.candidates.length,1);assert.equal(first.candidates[0].title,"1 overdue personal task");assert.equal(first.candidates[0].fingerprint,second.candidates[0].fingerprint);assert.ok(!first.candidates.some(item=>item.sourceId==="d1"));
});

test("evening briefing contains only supplied deterministic totals",()=>{
 const result=buildAutomationEvaluation({tasks:[],workTasks:[],debts:[],bankAccounts:[],bankTransactions:[],habits:[],aiMemoryCandidates:[],aiMemories:[],googleSyncServices:{},googleWorkspace:{gmailMessages:[]}},daily(),new Date("2026-07-22T20:00:00+02:00"),DEFAULT_AUTOMATION_RULES);
 assert.match(result.briefings[1].summary,/30 focus minutes/);assert.match(result.briefings[1].summary,/R50.00 spending/);assert.equal(result.briefings[1].provider,"deterministic-local");
});
