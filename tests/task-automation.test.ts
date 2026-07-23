import assert from "node:assert/strict";
import test from "node:test";
import { createNextOccurrence, dependencyState, hasDependencyCycle, nextRecurringDate } from "../server/taskAutomation";

test("recurrence dates handle daily, weekly and month-end safely",()=>{assert.equal(nextRecurringDate("2026-07-21","Daily"),"2026-07-22");assert.equal(nextRecurringDate("2026-07-21","Weekly"),"2026-07-28");assert.equal(nextRecurringDate("2026-01-31","Monthly"),"2026-02-28");assert.equal(nextRecurringDate("2026-07-21","None"),null);});

test("a completed recurrence generates exactly one fingerprinted next task",()=>{const task={id:"task-1",title:"Review",dueDate:"2026-07-21",recurrence:"Weekly",status:"completed"};const first=createNextOccurrence(task,"2026-07-21T18:00:00.000Z",[]);assert.equal(first?.task.dueDate,"2026-07-28");assert.equal(first?.task.previousOccurrenceId,"task-1");assert.equal(createNextOccurrence(task,"2026-07-21T18:00:00.000Z",[first!.instance]),null);});

test("dependency state reports blockers and cycle detection rejects loops",()=>{const tasks=[{id:"a",status:"pending",dependencies:["b"]},{id:"b",status:"pending",dependencies:[]}];assert.equal(dependencyState(tasks[0],tasks).blocked,true);assert.equal(hasDependencyCycle("b",["a"],tasks),true);tasks[1].status="completed";assert.equal(dependencyState(tasks[0],tasks).blocked,false);});
