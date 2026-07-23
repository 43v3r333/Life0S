import type { Express } from "express";
import path from "path";
import { randomUUID } from "crypto";

type Dependencies = {
  state: Record<string, any>;
  saveState: () => Promise<void>;
  audit: (action: string, details?: any) => unknown;
  dataDirectory: string;
};

export const RESUME_SHA256 = "ac8d31f8c29cd04d063942087b4fc26aa1badb0f75bbbc9d7477a636f9cab43f";

const githubAuditSeed = [
  ["Life0S", "AI Life Management", "TypeScript", true, true, false, false, false, "prototype"],
  ["43B3TZ", "AI Betting Intelligence platform", "TypeScript", true, true, false, false, false, "prototype"],
  ["43v3rknow", "Codebase Intelligence Dashboard", "JavaScript", true, false, false, false, false, "prototype"],
  ["43V3RMUS1C", "Autonomous Content Refinery", "Python", true, true, true, false, false, "prototype"],
  ["43v3rMES", "AI Manufacturing Execution System", "Python", true, true, true, false, false, "prototype"],
  ["43v3rScale", "AI Data Engine", "TypeScript", true, false, false, false, false, "prototype"],
  ["43v3r-platform", "Empty platform repository", null, false, false, false, false, false, "concept"],
  ["43V3R", "AI-powered blockchain concept", null, false, false, false, false, false, "concept"],
].map(([repo, description, language, hasReadme, hasTests, hasCi, hasRelease, hasLiveDemo, maturity]) => ({
  id: `github_${String(repo).toLowerCase()}`,
  repo,
  url: `https://github.com/43v3r333/${repo}`,
  description,
  language,
  maturity,
  publicSignals: { sourceCode: !["43v3r-platform", "43V3R"].includes(String(repo)), hasReadme, repeatableSetup: !["43v3rScale", "43v3r-platform", "43V3R"].includes(String(repo)), hasTests, hasCi, hasRelease, hasLiveDemo },
  verifiedEvidence: { reproducibleRun: false, automatedTestReport: false, demoMedia: false, caseStudy: false, userOutcome: false },
  evidenceLinks: {},
  auditStatus: "No verified proof that the public project works end-to-end.",
  auditedAt: "2026-07-23T09:45:00.000Z",
}));

export function projectEvidenceScore(project: any) {
  const publicValues = Object.values(project.publicSignals || {}).filter(Boolean).length;
  const verifiedValues = Object.values(project.verifiedEvidence || {}).filter(Boolean).length;
  return Math.round(((publicValues * 0.45) / 7 + (verifiedValues * 0.55) / 5) * 100);
}

const evidenceLevel = (project: any) => {
  const verified = Object.values(project.verifiedEvidence || {}).filter(Boolean).length;
  if (project.verifiedEvidence?.userOutcome && project.verifiedEvidence?.reproducibleRun) return "outcome-backed";
  if (verified >= 4) return "portfolio-ready";
  if (project.verifiedEvidence?.reproducibleRun && (project.verifiedEvidence?.automatedTestReport || project.publicSignals?.hasCi)) return "verified-build";
  if (project.publicSignals?.sourceCode) return "prototype";
  return "concept";
};

export const initialCareerProfile = {
  id: "career_ethan_barnes",
  name: "Ethan Barnes",
  headline: "IT Infrastructure Technician · OT / MES Support · AI & Software Builder",
  location: "Durban, KwaZulu-Natal, South Africa",
  targetDirection: "Grow into senior manufacturing technology, business analysis, AI/software product, and technology leadership roles while building 43v3r Technology.",
  currentRole: {
    title: "IT Infrastructure Technician",
    organization: "Sumitomo Rubber South Africa (Pty) Ltd.",
    status: "Current / recent role",
    focus: ["Industrial IT and OT support", "MES / SCADA / HMI", "Infrastructure and endpoint support", "Incident response and root-cause analysis"],
  },
  founderRole: {
    title: "Founder / Independent Software & AI Systems Builder",
    organization: "43v3r Technology",
    status: "Ongoing",
  },
  education: [
    { qualification: "Advanced Diploma in Business Analysis", institution: "", status: "Currently pursuing" },
    { qualification: "Computer Systems Engineering / Computer Engineering Degree", institution: "Durban University of Technology", period: "2020–2023", status: "Completed" },
    { qualification: "IT Diploma", institution: "", status: "Completed" },
  ],
  certifications: [
    "Introduction to Generative AI — Google",
    "Introduction to Large Language Models — Google",
    "Introduction to Responsible AI — Google",
    "Responsible AI: Applying AI Principles with Google Cloud — Google",
    "Prompt Design in Vertex AI Skill Badge — Google",
    "Think360 KZN — Think360 (Pty) Ltd.",
  ],
  skillGroups: {
    "Infrastructure & OT": ["Windows", "Networking", "MES", "SCADA", "HMI", "Industrial printers", "Barcode systems", "Virtual machines"],
    "Software & Data": ["Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "REST APIs", "SQL Server", "Qdrant"],
    "AI & Architecture": ["LLM applications", "RAG", "AI agents", "Docker", "Clean Architecture", "CQRS", "Event-driven systems"],
    "Business & Delivery": ["Business analysis", "Requirements", "Process improvement", "Stakeholder engagement", "Product ownership", "Technical documentation"],
  },
  projects: [
    { name: "43v3r MES / AI-MES", summary: "AI-powered manufacturing execution, downtime, analytics, and intelligent support.", technologies: ["Python", "Manufacturing data"] },
    { name: "43v3rScale", summary: "AI data engine and scalable platform foundations.", technologies: ["TypeScript"] },
    { name: "Project Jannah / LifeOS", summary: "Personal operating system combining goals, finance, work, knowledge, automation, and grounded AI.", technologies: ["React", "TypeScript", "SQLite", "Qdrant", "AI"] },
    { name: "43v3rKnow", summary: "Codebase intelligence and AI-assisted developer context.", technologies: ["JavaScript", "AI"] },
    { name: "43V3RMUS1C", summary: "Autonomous content workflow and creative-industry automation concept.", technologies: ["Python", "AI"] },
    { name: "Industrial Automation & Control", summary: "PLC, Factory I/O, HMI, and On-Off, PID, Fuzzy-PI, and NARX control exploration.", technologies: ["Siemens TIA Portal", "PLC"] },
  ],
  links: [
    { id: "github", label: "GitHub", url: "https://github.com/43v3r333", source: "public-profile" },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/ethan-barnes17/", source: "user-provided" },
    { id: "portfolio", label: "43v3r Technology", url: "https://43v3r.tech", source: "public-profile" },
  ],
  strengths: [
    "Calm, methodical troubleshooting in live production environments",
    "Bridges business, IT, engineering, production, and technology teams",
    "Combines infrastructure experience with software engineering and AI product development",
    "Strong ownership, systems thinking, and proactive self-learning",
  ],
  preferences: {
    targetRoles: ["Manufacturing Systems / MES Specialist", "Industrial IT / OT Engineer", "Business Systems Analyst", "AI / Software Product Builder", "Technology Lead"],
    weeklyCareerMinutes: 180,
    visibility: "private",
  },
  source: {
    type: "resume",
    label: "Ethan Barnes Full Resume",
    extractedAt: "2026-07-23T00:00:00.000Z",
    authoritative: true,
  },
  githubPortfolio: githubAuditSeed,
};

export function careerReadiness(profile: any, tasks: any[]) {
  const careerTasks = tasks.filter(item => (item.contextTags || []).includes("career"));
  const completed = careerTasks.filter(item => String(item.status).toLowerCase() === "completed").length;
  const evidence = [
    Boolean(profile?.source?.authoritative),
    (profile?.projects || []).length >= 3,
    (profile?.skillGroups ? Object.keys(profile.skillGroups).length : 0) >= 3,
    (profile?.links || []).some((item: any) => item.id === "github"),
    (profile?.links || []).some((item: any) => item.id === "linkedin"),
  ];
  return {
    score: Math.round((evidence.filter(Boolean).length / evidence.length) * 80 + Math.min(20, completed * 5)),
    careerTasks: careerTasks.length,
    completedCareerTasks: completed,
    gaps: [
      !careerTasks.some(item => /portfolio/i.test(item.title)) && "Prepare one focused portfolio case study",
      !careerTasks.some(item => /linkedin/i.test(item.title)) && "Align LinkedIn headline and About section with the résumé",
      !careerTasks.some(item => /interview/i.test(item.title)) && "Build an interview story bank using STAR examples",
    ].filter(Boolean),
  };
}

export function registerCareerRoutes(app: Express, { state, saveState, audit, dataDirectory }: Dependencies) {
  const needsSeed = !Array.isArray(state.careerProfiles) || !state.careerProfiles.length || !Array.isArray(state.careerDocuments) || !state.careerDocuments.length;
  if (!Array.isArray(state.careerProfiles) || !state.careerProfiles.length) state.careerProfiles = [{ ...initialCareerProfile, updatedAt: new Date().toISOString() }];
  if (!Array.isArray(state.careerProfiles[0].githubPortfolio)) {
    state.careerProfiles[0].githubPortfolio = githubAuditSeed;
    state.careerProfiles[0].updatedAt = new Date().toISOString();
  }
  if (!Array.isArray(state.careerDocuments) || !state.careerDocuments.length) state.careerDocuments = [{
    id: "career_resume_primary",
    type: "resume",
    label: "Ethan Barnes Full Resume",
    fileName: "Ethan_Barnes_Full_Resume.docx",
    storagePath: path.join(dataDirectory, "career", "Ethan_Barnes_Full_Resume.docx"),
    sha256: RESUME_SHA256,
    status: "verified",
    authoritative: true,
    createdAt: new Date().toISOString(),
  }];
  if (needsSeed) void saveState().catch(error => console.error("[CAREER] Could not persist initial career profile:", error));

  app.get("/api/personal/career", (_req, res) => {
    const profile = state.careerProfiles[0];
    const githubEvidence = (profile.githubPortfolio || []).map((project: any) => ({ ...project, evidenceScore: projectEvidenceScore(project), maturity: evidenceLevel(project) }));
    res.json({
      profile,
      documents: state.careerDocuments.map(({ storagePath, ...document }: any) => document),
      readiness: careerReadiness(profile, state.tasks || []),
      careerTasks: (state.tasks || []).filter((item: any) => (item.contextTags || []).includes("career")),
      githubEvidence,
      githubSummary: {
        total: githubEvidence.length,
        verifiedBuilds: githubEvidence.filter((item: any) => ["verified-build", "portfolio-ready", "outcome-backed"].includes(item.maturity)).length,
        portfolioReady: githubEvidence.filter((item: any) => ["portfolio-ready", "outcome-backed"].includes(item.maturity)).length,
        concepts: githubEvidence.filter((item: any) => item.maturity === "concept").length,
        recommendedFlagship: "Life0S",
        nextDomainProject: "43v3rMES",
      },
      privacy: "Résumé facts are private authoritative records. AI receives a compact career snapshot only for career-related questions.",
    });
  });

  app.patch("/api/personal/career", async (req, res) => {
    const profile = state.careerProfiles[0];
    const allowed = ["targetDirection", "preferences"];
    for (const key of allowed) if (req.body[key] !== undefined) profile[key] = req.body[key];
    profile.updatedAt = new Date().toISOString();
    audit("career_profile_updated", { profileId: profile.id, fields: allowed.filter(key => req.body[key] !== undefined) });
    await saveState();
    res.json(profile);
  });

  app.get("/api/personal/career/resume", (_req, res) => {
    const document = state.careerDocuments.find((item: any) => item.type === "resume");
    if (!document) return res.status(404).json({ error: { code: "RESUME_NOT_FOUND", message: "No résumé is saved.", fieldErrors: [] } });
    res.download(document.storagePath, document.fileName);
  });

  app.post("/api/personal/career/task-pack", async (_req, res) => {
    const templates = [
      ["Create a focused LifeOS portfolio case study", "Turn LifeOS into a concise problem, approach, architecture, evidence, and outcome case study.", 90],
      ["Align LinkedIn with my career positioning", "Update headline, About, skills, experience, and featured projects using the verified résumé.", 60],
      ["Build a STAR interview story bank", "Write six evidence-based examples covering incident response, root cause, stakeholders, improvement, leadership, and software building.", 90],
      ["Create a role-targeted résumé version", "Prepare a concise version for Manufacturing Systems / MES and another for AI/software product roles.", 90],
      ["Review GitHub portfolio presentation", "Add clear READMEs, screenshots, problem statements, architecture, setup, and outcomes to priority repositories.", 120],
    ];
    const existing = new Set((state.tasks || []).map((item: any) => String(item.title).toLowerCase()));
    const created = templates.filter(([title]) => !existing.has(String(title).toLowerCase())).map(([title, notes, estimatedTime]) => ({
      id: randomUUID(), title, notes, estimatedTime, priority: "High", status: "not_started", type: "Career", deepWork: true,
      contextTags: ["career", "professional-development", "portfolio"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }));
    state.tasks.push(...created);
    audit("career_task_pack_created", { created: created.length });
    await saveState();
    res.status(201).json({ created, skipped: templates.length - created.length });
  });

  app.get("/api/personal/career/github-evidence", (_req, res) => {
    const projects = (state.careerProfiles[0].githubPortfolio || []).map((project: any) => ({ ...project, evidenceScore: projectEvidenceScore(project), maturity: evidenceLevel(project) }));
    res.json({ projects, policy: "Code, documentation, and claims are not proof. Verified evidence requires a repeatable run plus tests, demo media, a case study, or a real user outcome.", asOf: state.careerProfiles[0].updatedAt });
  });

  app.post("/api/personal/career/github-evidence/refresh", async (_req, res) => {
    try {
      const response = await fetch("https://api.github.com/users/43v3r333/repos?per_page=100&sort=updated", { headers: { Accept: "application/vnd.github+json", "User-Agent": "LifeOS-career-audit" } });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);
      const repositories: any[] = await response.json();
      const previous = new Map((state.careerProfiles[0].githubPortfolio || []).map((item: any) => [item.repo, item]));
      const projects = await Promise.all(repositories.map(async repository => {
        const headers = { Accept: "application/vnd.github+json", "User-Agent": "LifeOS-career-audit" };
        const [rootResponse, workflowResponse, releaseResponse] = await Promise.all([
          fetch(`https://api.github.com/repos/43v3r333/${encodeURIComponent(repository.name)}/contents?ref=${encodeURIComponent(repository.default_branch)}`, { headers }),
          fetch(`https://api.github.com/repos/43v3r333/${encodeURIComponent(repository.name)}/actions/workflows`, { headers }),
          fetch(`https://api.github.com/repos/43v3r333/${encodeURIComponent(repository.name)}/releases?per_page=1`, { headers }),
        ]);
        const root: any = rootResponse.ok ? await rootResponse.json() : [];
        const workflows: any = workflowResponse.ok ? await workflowResponse.json() : {};
        const releases: any = releaseResponse.ok ? await releaseResponse.json() : [];
        const names = Array.isArray(root) ? root.map(item => String(item.name)) : [];
        const old: any = previous.get(repository.name) || {};
        const publicSignals = {
          sourceCode: Number(repository.size || 0) > 0 && names.some(name => !/^license|\\.gitattributes$/i.test(name)),
          hasReadme: names.some(name => /^readme/i.test(name)),
          repeatableSetup: names.some(name => /package\\.json|requirements|pyproject|docker-compose|makefile/i.test(name)),
          hasTests: names.some(name => /^tests?$|__tests__/i.test(name)),
          hasCi: Number(workflows.total_count || 0) > 0,
          hasRelease: Array.isArray(releases) && releases.length > 0,
          hasLiveDemo: Boolean(repository.homepage),
        };
        const project = { ...old, id: old.id || `github_${repository.name.toLowerCase()}`, repo: repository.name, url: repository.html_url, description: repository.description || "No description", language: repository.language, pushedAt: repository.pushed_at, publicSignals, verifiedEvidence: old.verifiedEvidence || {}, evidenceLinks: old.evidenceLinks || {}, auditedAt: new Date().toISOString() };
        return { ...project, maturity: evidenceLevel(project), auditStatus: evidenceLevel(project) === "concept" ? "Concept only; no meaningful public implementation evidence." : "Public source exists, but no verified end-to-end proof is recorded." };
      }));
      state.careerProfiles[0].githubPortfolio = projects;
      state.careerProfiles[0].updatedAt = new Date().toISOString();
      audit("career_github_evidence_refreshed", { repositories: projects.length });
      await saveState();
      res.json({ projects: projects.map(project => ({ ...project, evidenceScore: projectEvidenceScore(project) })), asOf: state.careerProfiles[0].updatedAt });
    } catch (error: any) {
      res.status(502).json({ error: { code: "GITHUB_AUDIT_FAILED", message: error.message || "GitHub evidence could not be refreshed.", fieldErrors: [], recovery: "Try again later; your last saved audit remains available." } });
    }
  });

  app.patch("/api/personal/career/github-evidence/:repo", async (req, res) => {
    const project = state.careerProfiles[0].githubPortfolio.find((item: any) => item.repo.toLowerCase() === req.params.repo.toLowerCase());
    if (!project) return res.status(404).json({ error: { code: "GITHUB_PROJECT_NOT_FOUND", message: "GitHub project not found.", fieldErrors: [] } });
    const allowedEvidence = ["reproducibleRun", "automatedTestReport", "demoMedia", "caseStudy", "userOutcome"];
    project.verifiedEvidence ||= {};
    for (const key of allowedEvidence) if (typeof req.body.verifiedEvidence?.[key] === "boolean") project.verifiedEvidence[key] = req.body.verifiedEvidence[key];
    if (req.body.evidenceLinks && typeof req.body.evidenceLinks === "object") {
      project.evidenceLinks ||= {};
      for (const key of allowedEvidence) if (typeof req.body.evidenceLinks[key] === "string" && /^https?:\/\//.test(req.body.evidenceLinks[key])) project.evidenceLinks[key] = req.body.evidenceLinks[key].slice(0, 500);
    }
    project.maturity = evidenceLevel(project);
    project.updatedAt = new Date().toISOString();
    state.careerProfiles[0].updatedAt = project.updatedAt;
    audit("career_github_evidence_updated", { repo: project.repo, maturity: project.maturity });
    await saveState();
    res.json({ ...project, evidenceScore: projectEvidenceScore(project) });
  });

  app.post("/api/personal/career/github-evidence/task-pack", async (_req, res) => {
    const templates = [
      ["Flagship proof 1: make LifeOS reproducible", "Create a clean setup path from clone to working app using safe sample data, environment documentation, and one command.", 120],
      ["Flagship proof 2: add LifeOS CI quality evidence", "Publish GitHub Actions checks for TypeScript, tests, production build, API docs, and migration verification.", 120],
      ["Flagship proof 3: record a LifeOS product demo", "Record a short private-data-safe walkthrough showing Dashboard, Daily, Finance, Career, Google, and grounded AI.", 90],
      ["Flagship proof 4: write the LifeOS case study", "Document the problem, users, constraints, architecture, decisions, screenshots, test results, and measurable outcomes.", 120],
      ["Flagship proof 5: publish a tagged LifeOS release", "Create a versioned release with changelog, supported setup, known limitations, and verification evidence.", 90],
      ["Second case study: narrow 43v3rMES", "Reduce 43v3rMES to one demonstrable manufacturing workflow aligned with real MES/OT experience.", 120],
    ];
    const existing = new Set((state.tasks || []).map((item: any) => String(item.title).toLowerCase()));
    const created = templates.filter(([title]) => !existing.has(String(title).toLowerCase())).map(([title, notes, estimatedTime]) => ({
      id: randomUUID(), title, notes, estimatedTime, priority: "High", status: "not_started", type: "Career", deepWork: true,
      goalId: "goal_43v3r", projectId: "project_43v3r", contextTags: ["career", "github-evidence", "portfolio", "flagship"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }));
    state.tasks.push(...created);
    audit("career_github_evidence_task_pack_created", { created: created.length });
    await saveState();
    res.status(201).json({ created, skipped: templates.length - created.length });
  });
}
