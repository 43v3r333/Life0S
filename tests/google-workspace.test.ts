import assert from "node:assert/strict";
import test from "node:test";
import { GOOGLE_SCOPES } from "../server/googleWorkspace";

test("Google Workspace limits writes to Calendar events and app-created Drive files",()=>{
 assert.ok(GOOGLE_SCOPES.includes("https://www.googleapis.com/auth/calendar.events"));
 assert.ok(GOOGLE_SCOPES.includes("https://www.googleapis.com/auth/gmail.readonly"));
 assert.ok(GOOGLE_SCOPES.includes("https://www.googleapis.com/auth/drive.file"));
 assert.ok(GOOGLE_SCOPES.includes("https://www.googleapis.com/auth/drive.metadata.readonly"));
 assert.equal(GOOGLE_SCOPES.some(scope=>scope.endsWith("/auth/calendar")||scope.endsWith("/auth/drive")||scope.endsWith("/auth/gmail.modify")),false);
});

test("Google Workspace implementation bounds Gmail metadata concurrency",async()=>{
 const source=await import("node:fs/promises").then(fs=>fs.readFile(new URL("../server/googleWorkspace.ts",import.meta.url),"utf8"));
 assert.match(source,/index \+= 3/);
 assert.match(source,/slice\(index, index \+ 3\)/);
 assert.match(source,/is%3Aimportant%20OR%20is%3Astarred%20OR%20is%3Aunread/);
 assert.match(source,/userinfo\.email/);
 assert.match(source,/userinfo\.profile/);
});
