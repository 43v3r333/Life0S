import { randomBytes } from "crypto";
import type { Express, Request } from "express";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/contacts",
] as const;

type Dependencies = {
  state: Record<string, any>;
  saveState: () => Promise<void>;
  saveSecrets: (vault: Record<string, any>) => Promise<void>;
  audit: (action: string, details?: Record<string, any>) => unknown;
  getDayPlan: (date: string) => any;
};

const pending = new Map<string, { redirectUri: string; returnTo: string; expiresAt: number }>();
const cleanPending = () => { for (const [key, value] of pending) if (value.expiresAt < Date.now()) pending.delete(key); };
const safeRedirect = (value: unknown) => {
  const url = new URL(String(value || ""));
  const local = ["localhost", "127.0.0.1"].includes(url.hostname) && url.protocol === "http:";
  if (!local && url.protocol !== "https:") throw new Error("Google OAuth requires HTTPS, except on localhost.");
  if (url.pathname !== "/api/google/oauth/callback") throw new Error("Invalid Google OAuth callback path.");
  return url.toString();
};
const safeReturnTo = (value: unknown) => {
  const url = new URL(String(value || ""));
  const local = ["localhost", "127.0.0.1"].includes(url.hostname) && url.protocol === "http:";
  if (!local && url.protocol !== "https:") throw new Error("LifeOS return address must use HTTPS, except on localhost.");
  return url.origin;
};
const json = async (response: Response) => { const body: any = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body?.error_description || body?.error?.message || `Google request failed (${response.status}).`); return body; };

async function accessToken(vault: Record<string, any>) {
  if (!vault.googleRefreshToken) throw new Error("Google is not connected.");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: vault.googleClientId, client_secret: vault.googleClientSecret, refresh_token: vault.googleRefreshToken, grant_type: "refresh_token" }) });
  return String((await json(response)).access_token || "");
}

const googleFetch = async (url: string, token: string) => json(await fetch(url, { headers: { Authorization: `Bearer ${token}` } }));
const googleWrite = async (url: string, token: string, method: string, body: unknown) => json(await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }));
const headerValue = (message: any, name: string) => String(message?.payload?.headers?.find((header: any) => String(header.name).toLowerCase() === name.toLowerCase())?.value || "");
const proposalId = () => `google_${randomBytes(12).toString("hex")}`;
const nextDate = (date: string) => { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + 1); return value.toISOString().slice(0, 10); };
const calendarDateTime = (date: string, time: string) => time === "24:00" ? `${nextDate(date)}T00:00:00+02:00` : `${date}T${time}:00+02:00`;

async function uploadMarkdown(token: string, name: string, content: string, parentId: string) {
  const boundary = `lifeos_${randomBytes(10).toString("hex")}`;
  const metadata = JSON.stringify({ name, parents: [parentId], mimeType: "text/markdown", description: "Created from an approved LifeOS Google Workspace proposal." });
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: text/markdown; charset=UTF-8\r\n\r\n${content}\r\n--${boundary}--`;
  return json(await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body }));
}

async function uploadBinary(token: string, name: string, mimeType: string, dataBase64: string, parentId: string) {
  const boundary = `lifeos_${randomBytes(10).toString("hex")}`;
  const metadata = JSON.stringify({ name, parents: [parentId], description: "Explicitly uploaded through LifeOS." });
  const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`), Buffer.from(dataBase64.replace(/^data:[^,]+,/, "")), Buffer.from(`\r\n--${boundary}--`)]);
  return json(await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,version,md5Checksum", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body }));
}

export function registerGoogleWorkspaceRoutes(app: Express, dependencies: Dependencies) {
  const { state, saveState, saveSecrets, audit, getDayPlan } = dependencies;
  const configuredRedirectUri = () => safeRedirect(process.env.GOOGLE_REDIRECT_URI || `${String(process.env.APP_URL || "http://127.0.0.1:3001").replace(/\/$/, "")}/api/google/oauth/callback`);
  const status = () => { const granted = String(state.vault.googleGrantedScopes || "").split(/\s+/).filter(Boolean), scopeGranted = (scope: string) => granted.includes(scope) || (scope === "email" && granted.includes("https://www.googleapis.com/auth/userinfo.email")) || (scope === "profile" && granted.includes("https://www.googleapis.com/auth/userinfo.profile")), missingScopes = GOOGLE_SCOPES.filter(scope => !scopeGranted(scope)); return ({
    configured: Boolean(state.vault.googleClientId && state.vault.googleClientSecret),
    connected: Boolean(state.vault.googleRefreshToken),
    account: state.googleWorkspace?.account || null,
    scopes: GOOGLE_SCOPES,
    services: { calendar: "read and approval-only publishing", gmail: "important-message metadata only", drive: "read metadata and approval-only LifeOS files", tasks: "read constraints and approval-only LifeOS task list", sheets: "approval-only managed reporting ranges", contacts: "selected metadata and approval-only CRM linking" },
    lastSyncAt: state.googleWorkspace?.lastSyncAt || null,
    counts: { ...(state.googleWorkspace?.counts || { calendarEvents: 0, gmailMessages: 0, driveFiles: 0 }), googleTasks: state.googleBusinessWorkspace?.tasks?.length || 0, managedSheets: state.googleManagedSheets?.length || 0, crmContacts: state.googleCrmContacts?.length || 0 },
    importantEmails: (state.googleWorkspace?.gmailMessages || []).slice(0, 8).map((item: any) => ({ id: item.id, from: item.from, subject: item.subject, date: item.date, importance: item.importance, unread: item.unread })),
    upcomingEvents: (state.googleWorkspace?.calendarEvents || []).slice(0, 8),
    recentDriveFiles: (state.googleWorkspace?.driveFiles || []).slice(0, 8),
    lastError: state.googleWorkspace?.lastError || null,
    approvalRequiredForWrites: true,
    rawContentSentToAi: false,
    redirectUri: configuredRedirectUri(),
    needsReconnect: Boolean(state.vault.googleRefreshToken && missingScopes.length), missingScopes,
    proposals: (state.googleActionProposals || []).filter((item: any) => item.status === "pending").map((item: any) => ({ id: item.id, type: item.type, title: item.title, summary: item.summary, date: item.date, preview: item.preview, status: item.status, createdAt: item.createdAt })),
    createdResources: (state.googleActionProposals || []).filter((item: any) => item.status === "applied" && Array.isArray(item.result)).flatMap((item: any) => item.result.map((resource: any) => ({ ...resource, proposalType: item.type, createdAt: item.decidedAt }))).filter((item: any) => item.link).slice(0, 30),
  }); };

  app.get("/api/google/status", (_req, res) => res.json(status()));
  app.post("/api/google/oauth/start", (req, res) => {
    if (!state.vault.googleClientId || !state.vault.googleClientSecret) return res.status(409).json({ code: "GOOGLE_NOT_CONFIGURED", message: "Save a Google OAuth client ID and client secret first.", recovery: "Create a Web application OAuth client in Google Cloud and add the displayed callback URL." });
    try {
      cleanPending();
      // Use one server-controlled URI so opening LifeOS through localhost,
      // 127.0.0.1, or a mobile tunnel cannot silently change the OAuth URI.
      const redirectUri = configuredRedirectUri(), returnTo = safeReturnTo(req.body.returnTo || process.env.APP_URL || "http://127.0.0.1:3001"), requestOrigin = req.headers.origin ? safeReturnTo(req.headers.origin) : returnTo, nonce = randomBytes(32).toString("base64url");
      if (returnTo !== requestOrigin) throw new Error("LifeOS return address does not match the connection page origin.");
      pending.set(nonce, { redirectUri, returnTo, expiresAt: Date.now() + 10 * 60_000 });
      const query = new URLSearchParams({ client_id: state.vault.googleClientId, redirect_uri: redirectUri, response_type: "code", access_type: "offline", prompt: "consent", include_granted_scopes: "true", scope: GOOGLE_SCOPES.join(" "), state: nonce });
      res.json({ authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${query}` });
    } catch (error: any) { res.status(400).json({ code: "INVALID_REDIRECT_URI", message: error.message, recovery: "Use the exact callback URL shown in Connections." }); }
  });

  app.get("/api/google/oauth/callback", async (req, res) => {
    const nonce = String(req.query.state || ""), record = pending.get(nonce); pending.delete(nonce);
    const finish = (result: string) => res.redirect(`${record?.returnTo || String(process.env.APP_URL || "http://127.0.0.1:3001")}/?page=vault&google=${encodeURIComponent(result)}`);
    if (req.query.error) return finish(`error:${String(req.query.error)}`);
    if (!record || record.expiresAt < Date.now()) return finish("error:expired_state");
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: String(req.query.code || ""), client_id: state.vault.googleClientId, client_secret: state.vault.googleClientSecret, redirect_uri: record.redirectUri, grant_type: "authorization_code" }) });
      const tokens = await json(response);
      if (tokens.refresh_token) state.vault.googleRefreshToken = String(tokens.refresh_token);
      if (!state.vault.googleRefreshToken) throw new Error("Google did not return offline access. Revoke the old grant and connect again.");
      state.vault.googleGrantedScopes = String(tokens.scope || GOOGLE_SCOPES.join(" "));
      await saveSecrets(state.vault); audit("google_workspace_connected", { services: ["calendar", "gmail", "drive"] }); await saveState();
      finish("connected");
    } catch (error: any) { state.googleWorkspace = { ...(state.googleWorkspace || {}), lastError: error.message }; await saveState(); finish(`error:${error.message}`); }
  });

  app.post("/api/google/sync", async (_req, res) => {
    try {
      const token = await accessToken(state.vault), now = new Date(), timeMin = now.toISOString(), timeMax = new Date(now.getTime() + 60 * 86400000).toISOString();
      const [profile, calendar, gmailList, drive] = await Promise.all([
        googleFetch("https://www.googleapis.com/oauth2/v2/userinfo", token),
        googleFetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=100&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`, token),
        googleFetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=newer_than%3A30d%20in%3Ainbox%20(is%3Aimportant%20OR%20is%3Astarred%20OR%20is%3Aunread)", token),
        googleFetch("https://www.googleapis.com/drive/v3/files?pageSize=50&orderBy=modifiedTime%20desc&fields=files(id%2Cname%2CmimeType%2CmodifiedTime%2CwebViewLink%2Cowners(displayName))", token),
      ]);
      const gmailMessages: any[] = [], gmailIds = (gmailList.messages || []).slice(0, 30);
      // Gmail applies a per-user concurrent-request limit. Small batches avoid
      // losing the entire Workspace sync when a mailbox is busy.
      for (let index = 0; index < gmailIds.length; index += 3) {
        const batch = await Promise.all(gmailIds.slice(index, index + 3).map(async (item: any) => {
          const message = await googleFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(item.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, token);
          const labels = message.labelIds || [];
          return { id: message.id, threadId: message.threadId, from: headerValue(message, "From").slice(0, 300), subject: headerValue(message, "Subject").slice(0, 500), date: headerValue(message, "Date").slice(0, 100), labelIds: labels, importance: labels.includes("IMPORTANT") ? "important" : labels.includes("STARRED") ? "starred" : "unread", unread: labels.includes("UNREAD"), snippet: String(message.snippet || "").slice(0, 240) };
        }));
        gmailMessages.push(...batch);
      }
      const workspace: any = {
        account: { email: String(profile.email || ""), name: String(profile.name || "") },
        calendarEvents: (calendar.items || []).map((event: any) => ({ id: event.id, title: String(event.summary || "Untitled event").slice(0, 500), start: event.start?.dateTime || event.start?.date, end: event.end?.dateTime || event.end?.date, status: event.status, htmlLink: event.htmlLink })),
        gmailMessages,
        driveFiles: (drive.files || []).map((file: any) => ({ id: file.id, name: String(file.name || "").slice(0, 500), mimeType: file.mimeType, modifiedTime: file.modifiedTime, webViewLink: file.webViewLink, owner: file.owners?.[0]?.displayName || "" })),
        lastSyncAt: new Date().toISOString(), lastError: null,
      };
      workspace.counts = { calendarEvents: workspace.calendarEvents.length, gmailMessages: workspace.gmailMessages.length, driveFiles: workspace.driveFiles.length };
      state.googleWorkspace = workspace; audit("google_workspace_synced", workspace.counts); await saveState(); res.json(status());
    } catch (error: any) { state.googleWorkspace = { ...(state.googleWorkspace || {}), lastError: error.message }; audit("google_workspace_sync_failed", { message: error.message }); await saveState(); res.status(502).json({ code: "GOOGLE_SYNC_FAILED", message: error.message, recovery: "Reconnect Google if permission was revoked, then retry sync." }); }
  });

  app.post("/api/google/proposals/calendar-plan", async (req, res) => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(req.body.date || "")) ? String(req.body.date) : new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const plan = getDayPlan(date), selected = (plan.blocks || []).filter((block: any) => !["sleep", "work", "commute"].includes(block.category));
    const proposal = { id: proposalId(), type: "publish-calendar-plan", title: `Publish LifeOS plan for ${date}`, summary: `${selected.length} meals, routines, health, focus and relaxation blocks will be created in your primary Google Calendar.`, date, preview: selected.map((item: any) => `${item.start}–${item.end} ${item.title}`), payload: { blocks: selected }, status: "pending", createdAt: new Date().toISOString() };
    state.googleActionProposals = [proposal, ...(state.googleActionProposals || []).filter((item: any) => !(item.status === "pending" && item.type === proposal.type && item.date === date))].slice(0, 100); audit("google_calendar_plan_proposed", { proposalId: proposal.id, date, blocks: selected.length }); await saveState(); res.status(201).json(status());
  });

  app.post("/api/google/proposals/business-pack", async (_req, res) => {
    const goal = (state.goals || []).find((item: any) => item.id === "goal_43v3r"), project = (state.projects || []).find((item: any) => item.id === "project_43v3r"), tasks = (state.tasks || []).filter((item: any) => item.goalId === "goal_43v3r");
    const proposal = { id: proposalId(), type: "create-business-pack", title: "Create 43v3r business workspace in Google Drive", summary: "Creates one 43v3r Technology folder with a business plan, product roadmap, and customer-validation plan built from current LifeOS records.", preview: ["43v3r Business Plan.md", "43v3r Product Roadmap.md", "43v3r Customer Validation Plan.md"], payload: { snapshot: { goal: goal ? { title: goal.title, status: goal.status, targetDate: goal.targetDate, progress: goal.progress, smartDefinition: goal.smartDefinition } : null, project: project ? { title: project.title, objectives: project.objectives, deliverables: project.deliverables, risks: project.risks, issues: project.issues } : null, tasks: tasks.map((item: any) => ({ title: item.title, status: item.status, priority: item.priority, dueDate: item.dueDate })) } }, status: "pending", createdAt: new Date().toISOString() };
    state.googleActionProposals = [proposal, ...(state.googleActionProposals || []).filter((item: any) => !(item.status === "pending" && item.type === proposal.type))].slice(0, 100); audit("google_business_pack_proposed", { proposalId: proposal.id }); await saveState(); res.status(201).json(status());
  });

  app.patch("/api/google/proposals/:id", async (req, res) => {
    const proposal = (state.googleActionProposals || []).find((item: any) => item.id === req.params.id && item.status === "pending");
    if (!proposal) return res.status(404).json({ code: "GOOGLE_PROPOSAL_NOT_FOUND", message: "Pending Google proposal not found." });
    if (req.body.decision === "reject") { proposal.status = "rejected"; proposal.decidedAt = new Date().toISOString(); audit("google_action_rejected", { proposalId: proposal.id, type: proposal.type }); await saveState(); return res.json(status()); }
    if (req.body.decision !== "approve") return res.status(400).json({ code: "INVALID_GOOGLE_DECISION", message: "Choose approve or reject." });
    if (status().needsReconnect) return res.status(409).json({ code: "GOOGLE_RECONNECT_REQUIRED", message: "Reconnect Google to approve the new Calendar and Drive permissions first.", recovery: "Select Reconnect Google, approve the additional permissions, then approve this proposal again." });
    try {
      const token = await accessToken(state.vault), results: any[] = [];
      if (proposal.type === "publish-google-task") {
        let list=(state.googleBusinessWorkspace?.taskLists||[]).find((item:any)=>item.title==="LifeOS");
        if(!list){list=await googleWrite("https://tasks.googleapis.com/tasks/v1/users/@me/lists",token,"POST",{title:"LifeOS"});state.googleBusinessWorkspace={...(state.googleBusinessWorkspace||{}),taskLists:[list,...(state.googleBusinessWorkspace?.taskLists||[])]};}
        const snapshot=proposal.payload.snapshot,mapping=(state.googleTaskMappings||[]).find((item:any)=>item.lifeTaskId===proposal.payload.lifeTaskId),body={title:snapshot.title,notes:`${snapshot.notes||""}\n\nLifeOS task: ${proposal.payload.lifeTaskId}${snapshot.goalId?`\nGoal: ${snapshot.goalId}`:""}`,...(snapshot.dueDate?{due:`${snapshot.dueDate}T00:00:00.000Z`}:{})};
        const task=mapping?await googleWrite(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks/${encodeURIComponent(mapping.googleTaskId)}`,token,"PATCH",body):await googleWrite(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks`,token,"POST",body);
        const map={id:mapping?.id||`gtaskmap_${randomBytes(8).toString("hex")}`,fingerprint:`google-task:${proposal.payload.lifeTaskId}`,lifeTaskId:proposal.payload.lifeTaskId,googleTaskId:task.id,taskListId:list.id,lastPublishedHash:task.etag||"",updatedAt:new Date().toISOString()};state.googleTaskMappings=[map,...(state.googleTaskMappings||[]).filter((item:any)=>item.lifeTaskId!==map.lifeTaskId)];results.push({id:task.id,name:task.title,link:`https://tasks.google.com/task/${task.id}`});
      } else if(proposal.type === "import-google-task") {
        const snapshot=proposal.payload.snapshot,task={id:`task_${randomBytes(10).toString("hex")}`,title:snapshot.title,notes:snapshot.notes,dueDate:snapshot.dueDate||null,status:"not-started",priority:"Medium",source:"google-task-approved-import",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.tasks=[task,...(state.tasks||[])];state.googleTaskMappings=[{id:`gtaskmap_${randomBytes(8).toString("hex")}`,fingerprint:`google-task:${task.id}`,lifeTaskId:task.id,googleTaskId:proposal.payload.googleTaskId,taskListId:proposal.payload.taskListId,updatedAt:new Date().toISOString()},...(state.googleTaskMappings||[])];results.push({id:task.id,name:task.title,internal:true});
      } else if(proposal.type === "create-google-sheets") {
        const parent=(state.googleActionProposals||[]).filter((item:any)=>item.status==="applied").flatMap((item:any)=>item.result||[]).find((item:any)=>item.name==="43v3r Technology · LifeOS");
        for(const name of proposal.payload.names||[]){const created=await googleWrite("https://sheets.googleapis.com/v4/spreadsheets",token,"POST",{properties:{title:name},sheets:[{properties:{title:"Sheet1",gridProperties:{rowCount:1000,columnCount:12}}}]});if(parent?.id)await googleWrite(`https://www.googleapis.com/drive/v3/files/${created.spreadsheetId}?addParents=${encodeURIComponent(parent.id)}&fields=id,parents`,token,"PATCH",{});const record={id:`gsheet_${created.spreadsheetId}`,spreadsheetId:created.spreadsheetId,name,webViewLink:created.spreadsheetUrl,ownedRange:"Sheet1!A1:F1000",authority:"reporting-copy",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.googleManagedSheets=[record,...(state.googleManagedSheets||[]).filter((item:any)=>item.name!==name)];results.push({id:created.spreadsheetId,name,link:created.spreadsheetUrl});}
      } else if(proposal.type === "export-google-sheet") {
        const encoded=encodeURIComponent("Sheet1!A1:F1000");await googleWrite(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(proposal.payload.spreadsheetId)}/values/${encoded}:clear`,token,"POST",{});await googleWrite(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(proposal.payload.spreadsheetId)}/values/${encodeURIComponent("Sheet1!A1")}?valueInputOption=USER_ENTERED`,token,"PUT",{majorDimension:"ROWS",values:proposal.payload.rows});const run={id:`sheetexport_${randomBytes(8).toString("hex")}`,spreadsheetId:proposal.payload.spreadsheetId,name:proposal.payload.name,range:proposal.payload.range,rows:proposal.payload.rows.length,snapshotHash:proposal.payload.snapshotHash,status:"applied",createdAt:new Date().toISOString()};state.googleSheetExportRuns=[run,...(state.googleSheetExportRuns||[])].slice(0,200);const sheet=(state.googleManagedSheets||[]).find((item:any)=>item.spreadsheetId===proposal.payload.spreadsheetId);if(sheet){sheet.lastExportAt=run.createdAt;sheet.lastSnapshotHash=run.snapshotHash;sheet.updatedAt=run.createdAt}results.push({id:run.id,name:`${proposal.payload.name} export`,link:sheet?.webViewLink});
      } else if(proposal.type === "import-google-contact") {
        const snapshot=proposal.payload.snapshot,record={id:`crm_${randomBytes(8).toString("hex")}`,resourceName:proposal.payload.resourceName,displayName:snapshot.displayName,email:snapshot.email,phone:snapshot.phone,organization:snapshot.organization,title:snapshot.title,relationship:proposal.payload.relationship,leadStage:proposal.payload.leadStage,lastInteraction:null,nextFollowUp:proposal.payload.nextFollowUp,source:"google-contact-approved",sourceLink:snapshot.sourceLink,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.googleCrmContacts=[record,...(state.googleCrmContacts||[]).filter((item:any)=>item.resourceName!==record.resourceName)];results.push({id:record.id,name:record.displayName,link:record.sourceLink,internal:true});
      } else if(proposal.type === "create-google-contact") {
        const payload=proposal.payload,person=await googleWrite("https://people.googleapis.com/v1/people:createContact?personFields=names,emailAddresses,phoneNumbers,organizations,metadata",token,"POST",{names:[{givenName:payload.displayName}],...(payload.email?{emailAddresses:[{value:payload.email}]}:{}),...(payload.phone?{phoneNumbers:[{value:payload.phone}]}:{}),...(payload.organization?{organizations:[{name:payload.organization}]}:{})});const record={id:`crm_${randomBytes(8).toString("hex")}`,resourceName:person.resourceName,displayName:payload.displayName,email:payload.email,phone:payload.phone,organization:payload.organization,relationship:payload.relationship,leadStage:"New",source:"lifeos-created-google-contact",sourceLink:"https://contacts.google.com/",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.googleCrmContacts=[record,...(state.googleCrmContacts||[])];results.push({id:person.resourceName,name:record.displayName,link:record.sourceLink});
      } else if (proposal.type === "publish-calendar-plan") {
        for (const block of proposal.payload.blocks || []) results.push(await googleWrite("https://www.googleapis.com/calendar/v3/calendars/primary/events", token, "POST", { summary: `LifeOS · ${block.title}`, description: `${block.description || "Planned by LifeOS"}\n\nSource: approved LifeOS every-moment plan`, start: { dateTime: calendarDateTime(proposal.date, block.start), timeZone: "Africa/Johannesburg" }, end: { dateTime: calendarDateTime(proposal.date, block.end), timeZone: "Africa/Johannesburg" }, extendedProperties: { private: { lifeosProposalId: proposal.id, lifeosCategory: block.category } } }));
      } else if (proposal.type === "calendar-reconciliation") {
        const diff = proposal.payload.diff || {};
        for (const item of diff.creates || []) results.push(await googleWrite("https://www.googleapis.com/calendar/v3/calendars/primary/events", token, "POST", { summary: item.title, start: { dateTime: item.start, timeZone: "Africa/Johannesburg" }, end: { dateTime: item.end, timeZone: "Africa/Johannesburg" }, extendedProperties: { private: { lifeosOwned: "true", lifeosSourceKey: item.sourceKey, lifeosFingerprint: item.fingerprint, lifeosPlanDate: item.planDate, lifeosPlanVersion: String(item.planVersion) } } }));
        for (const item of diff.updates || []) results.push(await googleWrite(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(item.before.id)}`, token, "PATCH", { summary: item.after.title, start: { dateTime: item.after.start, timeZone: "Africa/Johannesburg" }, end: { dateTime: item.after.end, timeZone: "Africa/Johannesburg" }, extendedProperties: { private: { lifeosOwned: "true", lifeosSourceKey: item.after.sourceKey, lifeosFingerprint: item.after.fingerprint, lifeosPlanDate: item.after.planDate, lifeosPlanVersion: String(item.after.planVersion) } } }));
        for (const item of diff.removals || []) { await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(item.id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then(response => { if (!response.ok && response.status !== 404) throw new Error(`Calendar removal failed (${response.status}).`); }); results.push({ id: item.id, name: item.title, removed: true }); }
      } else if (proposal.type === "email-task" || proposal.type === "email-calendar") {
        const task = { id: `task_${randomBytes(10).toString("hex")}`, title: proposal.payload.title, description: proposal.summary, dueDate: proposal.payload.dueDate || null, status: "not-started", priority: "High", source: "google-email-review", sourceReviewId: proposal.payload.reviewId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        state.tasks = [task, ...(state.tasks || [])]; results.push({ id: task.id, name: task.title, internal: true });
      } else if (proposal.type === "email-business-lead") {
        const workTask = { id: `work_${randomBytes(10).toString("hex")}`, title: proposal.payload.title, description: proposal.summary, status: "not-started", priority: "High", category: "customer-research", source: "google-email-review", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        state.workTasks = [workTask, ...(state.workTasks || [])]; results.push({ id: workTask.id, name: workTask.title, internal: true });
      } else if (proposal.type === "email-ignore-rule") {
        const rule = { id: `gmailrule_${randomBytes(8).toString("hex")}`, name: `Ignore ${proposal.payload.sender}`, sender: proposal.payload.sender, action: "ignore", active: true, approvedAt: new Date().toISOString() };
        state.googleEmailRules = [rule, ...(state.googleEmailRules || [])]; results.push({ id: rule.id, name: rule.name, internal: true });
      } else if (proposal.type === "create-drive-structure") {
        const parentId = proposal.payload.parentId;
        for (const name of proposal.payload.folders || []) results.push(await googleWrite("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", token, "POST", { name, parents: [parentId], mimeType: "application/vnd.google-apps.folder", description: "LifeOS managed knowledge workspace folder." }));
      } else if (proposal.type === "upload-drive-file") {
        results.push(await uploadBinary(token, proposal.payload.name, proposal.payload.mimeType, proposal.payload.dataBase64, proposal.payload.parentId));
      } else if (proposal.type === "create-business-pack") {
        const folder = await googleWrite("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", token, "POST", { name: "43v3r Technology · LifeOS", mimeType: "application/vnd.google-apps.folder", description: "Approved 43v3r planning workspace created by LifeOS." }), snapshot = proposal.payload.snapshot, generated = new Date().toISOString();
        const tasks = (snapshot.tasks || []).map((item: any) => `- [${item.status === "completed" ? "x" : " "}] ${item.title} — ${item.priority || "Medium"}${item.dueDate ? ` — due ${item.dueDate}` : ""}`).join("\n") || "- Define the first validated execution tasks.";
        const files = [
          ["43v3r Business Plan.md", `# 43v3r Technology Business Plan\n\nGenerated from approved LifeOS records on ${generated}.\n\n## Vision\n${snapshot.goal?.title || "Build 43v3r Technology"}\n\n## Current objective\n${snapshot.project?.objectives || "Define a focused AI software product around a validated customer problem."}\n\n## Value proposition\nHelp a clearly selected customer group solve a costly, repeated operational problem with trustworthy AI-assisted software.\n\n## Business model assumptions to validate\n- Target customer and urgent problem\n- Buyer and purchasing process\n- Minimum useful product\n- Pricing and willingness to pay\n- Distribution and customer support model\n\n## Delivery\n${snapshot.project?.deliverables || "Customer discovery, MVP, pilot, measurement, and launch."}\n\n## Risks\n${snapshot.project?.risks || "Focus, available time around shifts, and insufficient customer evidence."}\n\n## Current execution\n${tasks}\n`],
          ["43v3r Product Roadmap.md", `# 43v3r Product Roadmap\n\n## Phase 1 — Validate\n- Select one customer segment and one painful workflow.\n- Complete at least 10 structured customer interviews.\n- Record evidence, frequency, cost, and current alternatives.\n\n## Phase 2 — Prototype\n- Define one measurable outcome.\n- Build the smallest testable workflow.\n- Test security, reliability, and usability with real examples.\n\n## Phase 3 — Pilot\n- Recruit 1–3 design partners.\n- Measure time saved, accuracy, adoption, and willingness to pay.\n- Keep AI changes reviewable and auditable.\n\n## Phase 4 — Launch\n- Package onboarding, pricing, support, privacy, and a repeatable sales process.\n- Publish evidence-backed case studies.\n\n## LifeOS-linked tasks\n${tasks}\n`],
          ["43v3r Customer Validation Plan.md", `# 43v3r Customer Validation Plan\n\n## Interview goal\nUnderstand a repeated, costly customer problem before committing to a solution.\n\n## Interview questions\n1. Walk me through the last time this problem happened.\n2. What triggered it, and who was involved?\n3. How much time, money, risk, or frustration did it cause?\n4. What do you use today, and what fails?\n5. Who owns the budget and approval?\n6. What result would make a new solution worth paying for?\n\n## Evidence log\nFor each interview record segment, role, problem, frequency, impact, current workaround, buying authority, quoted evidence, and next experiment.\n\n## Decision rule\nProceed to an MVP only after repeated evidence shows a painful problem, an identifiable buyer, and willingness to test or pay.\n`]
        ];
        for (const [name, content] of files) results.push(await uploadMarkdown(token, name, content, folder.id)); results.unshift(folder);
      } else throw new Error("Unsupported Google action proposal.");
      proposal.status = "applied"; proposal.decidedAt = new Date().toISOString(); proposal.result = results.map(item => ({ id: item.id, name: item.name || item.summary, link: item.webViewLink || item.htmlLink })); audit("google_action_applied", { proposalId: proposal.id, type: proposal.type, records: results.length }); await saveState(); res.json({ ...status(), applied: proposal.result });
    } catch (error: any) { proposal.lastError = error.message; audit("google_action_failed", { proposalId: proposal.id, type: proposal.type, message: error.message }); await saveState(); res.status(502).json({ code: "GOOGLE_ACTION_FAILED", message: error.message, recovery: "The proposal remains pending. Verify Google permissions and retry." }); }
  });

  app.post("/api/google/disconnect", async (_req, res) => {
    const refreshToken = String(state.vault.googleRefreshToken || "");
    if (refreshToken) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } }).catch(() => undefined);
    state.vault.googleRefreshToken = ""; state.vault.googleGrantedScopes = ""; state.googleWorkspace = null;
    audit("google_workspace_disconnected"); await saveSecrets(state.vault); await saveState(); res.json(status());
  });
}
