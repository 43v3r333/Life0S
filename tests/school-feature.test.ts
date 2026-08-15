import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const view=fs.readFileSync("src/components/SchoolView.tsx","utf8");
const app=fs.readFileSync("src/App.tsx","utf8");
const navigation=fs.readFileSync("src/ui/navigation.ts","utf8");

test("school is an active lazy-loaded LifeOS destination",()=>{
 assert.match(navigation,/id:"school"/);
 assert.match(app,/SchoolView = lazy/);
 assert.match(app,/activeTab === "school"/);
});

test("semester timetable includes every supplied module and webinar date",()=>{
 for(const module of ["Enterprise Analysis","Process Modelling and Analysis","Effective Business Requirements"])assert.match(view,new RegExp(module));
 for(const date of ["2026-07-25","2026-08-22","2026-09-12","2026-10-17","2026-10-24"])assert.match(view,new RegExp(date));
 for(const time of ["10:30","11:30","12:00","13:00","13:30","14:30"])assert.match(view,new RegExp(time));
});

test("schoolwork reuses durable task APIs and school scoping tags",()=>{
 assert.match(view,/fetch\("\/api\/tasks"\)/);
 assert.match(view,/fetch\("\/api\/tasks",\{method:"POST"/);
 assert.match(view,/school:module:/);
 assert.match(view,/contextTags:\["school"/);
 assert.match(view,/\/api\/tasks\/delete/);
});
