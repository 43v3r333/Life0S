/**
 * Local-first personalization derived from the LifeOS discovery workbook.
 *
 * This file intentionally excludes credentials, private contact details, raw
 * financial records, and health data. External integrations remain disabled
 * until their individual OAuth/consent flows are completed.
 */
export const personalProfile = {
  name: "Iisan",
  location: "Ladysmith, South Africa",
  timezone: "Africa/Johannesburg",
  language: "en",
  occupation: "IT Engineer at Sumitomo Rubber",
  education: "Diploma in IT Engineering; Advanced Diploma in Business Analysis (in progress)",
  vision: "Plan and monitor my life and finances while building a successful AI software company, growing as a developer, and remaining grounded in Islam.",
  currentGoal: "Build 43v3r Technology and create a practical plan to become debt-free",
  values: ["Islamic integrity", "Truthfulness", "Family", "Learning", "Financial responsibility"],
  principles: ["Never lie", "Keep Islamic guidance central", "Ask before taking external actions"],
  workPattern: "Two day shifts followed by two night shifts",
} as const;

export const personalGoals = [
  { id: "goal_43v3r", title: "Build 43v3r Technology", type: "Business", priority: "High" },
  { id: "goal_debt_free", title: "Manage my finances and get out of debt", type: "Finance", priority: "Critical" },
  { id: "goal_islam_arabic", title: "Learn Islam and Arabic", type: "Spiritual", priority: "High" },
  { id: "goal_productivity", title: "Use my time more productively", type: "Personal", priority: "High" },
  { id: "goal_ceo", title: "Develop into an effective CEO", type: "Business", priority: "Medium" },
  { id: "goal_work", title: "Become excellent in my IT engineering role", type: "Career", priority: "High" },
] as const;

export const personalRoutines = [
  { id: "routine_business", name: "Work on 43v3r Technology", category: "business", frequency: "Daily" },
  { id: "routine_shift", name: "Track rotating day/night work shifts", category: "career", frequency: "2 days / 2 nights" },
  { id: "routine_workout", name: "Complete a short workout", category: "health", frequency: "Flexible" },
] as const;

export const integrationPreferences = [
  { service: "Google Calendar", priority: "First", requestedAccess: "read-write" },
  { service: "Microsoft Outlook/Calendar", priority: "Soon", requestedAccess: "read-write" },
  { service: "Gmail", priority: "Soon", requestedAccess: "read-write" },
  { service: "Apple Calendar", priority: "Soon", requestedAccess: "read-write" },
  { service: "Contacts", priority: "Soon", requestedAccess: "read-write" },
  { service: "GitHub", priority: "Soon", requestedAccess: "read-write" },
  { service: "Slack", priority: "Soon", requestedAccess: "read-write" },
  { service: "Notion", priority: "Soon", requestedAccess: "read-write" },
  { service: "Google Drive", priority: "Soon", requestedAccess: "read-write" },
  { service: "OneDrive", priority: "Soon", requestedAccess: "read-write" },
  { service: "Dropbox", priority: "Soon", requestedAccess: "read-write" },
  { service: "Bank CSV exports", priority: "Soon", requestedAccess: "import-only" },
  { service: "Health service", priority: "Soon", requestedAccess: "read-only" },
  { service: "WhatsApp exports", priority: "Soon", requestedAccess: "import-only" },
] as const;

export const conservativePrivacyDefaults = {
  localFirst: true,
  externalWritesRequireApproval: true,
  externalAiSensitiveDataRequiresApproval: true,
  telemetrySharing: false,
  vectorDbSync: false,
  storeConversationSummariesOnly: true,
} as const;
