export interface RuntimeConfiguration {
  readonly nodeEnv: string;
  readonly appUrl?: string;
  readonly openaiApiKey?: string;
  readonly openaiModel?: string;
  readonly nvidiaApiKey?: string;
  readonly nvidiaModel?: string;
  readonly geminiApiKey?: string;
  readonly githubToken?: string;
  readonly dataDirectory?: string;
  readonly authRequired?: string;
  readonly authEmail?: string;
  readonly authPasswordHash?: string;
  readonly vaultSecret?: string;
}

export interface SafeVaultState extends Record<string, string> {
  openaiKey: string;
  nvidiaKey: string;
  geminiKey: string;
  anthropicKey: string;
  githubToken: string;
  microsoftToken: string;
  googleToken: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleGrantedScopes: string;
  dbConnectionString: string;
  smtpConnectionString: string;
}

export function loadRuntimeConfiguration(env: NodeJS.ProcessEnv = process.env): RuntimeConfiguration {
  return {
    nodeEnv: env.NODE_ENV || "development",
    appUrl: env.APP_URL,
    openaiApiKey: env.OPENAI_API_KEY,
    openaiModel: env.OPENAI_MODEL,
    nvidiaApiKey: env.NVIDIA_API_KEY,
    nvidiaModel: env.NVIDIA_MODEL,
    geminiApiKey: env.GEMINI_API_KEY,
    githubToken: env.GITHUB_TOKEN,
    dataDirectory: env.LIFEOS_DATA_DIR,
    authRequired: env.LIFEOS_AUTH_REQUIRED,
    authEmail: env.LIFEOS_AUTH_EMAIL,
    authPasswordHash: env.LIFEOS_AUTH_PASSWORD_HASH,
    vaultSecret: env.LIFEOS_VAULT_SECRET,
  };
}

export function validateRuntimeConfiguration(config: RuntimeConfiguration): void {
  if (config.nodeEnv !== "production") {
    return;
  }

  const missing: string[] = [];
  if (!config.appUrl || config.appUrl.trim() === "") {
    missing.push("APP_URL");
  }
  if (!config.dataDirectory || config.dataDirectory.trim() === "") {
    missing.push("LIFEOS_DATA_DIR");
  }
  if (config.authRequired !== "true") {
    missing.push("LIFEOS_AUTH_REQUIRED=true");
  }
  if (!config.authEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.authEmail.trim())) {
    missing.push("LIFEOS_AUTH_EMAIL");
  }
  if (!config.authPasswordHash || !/^[0-9a-f]{32,}:[0-9a-f]{64,}$/i.test(config.authPasswordHash.trim())) {
    missing.push("LIFEOS_AUTH_PASSWORD_HASH");
  }
  const vaultSecret = String(config.vaultSecret || "");
  if (vaultSecret.length < 32 || /^(change|replace|example|password|secret)/i.test(vaultSecret)) {
    missing.push("LIFEOS_VAULT_SECRET (at least 32 non-placeholder characters)");
  }

  if (missing.length > 0) {
    throw new Error(`[CONFIG] Missing required production configuration: ${missing.join(", ")}`);
  }
}

export function createSafeVaultState(config: RuntimeConfiguration = loadRuntimeConfiguration()): SafeVaultState {
  return {
    openaiKey: config.openaiApiKey || "",
    nvidiaKey: config.nvidiaApiKey || "",
    geminiKey: config.geminiApiKey || "",
    anthropicKey: "",
    githubToken: "",
    microsoftToken: "",
    googleToken: "",
    googleClientId: "",
    googleClientSecret: "",
    googleRefreshToken: "",
    googleGrantedScopes: "",
    dbConnectionString: "",
    smtpConnectionString: ""
  };
}

export function toVaultStatus(vault: SafeVaultState): Record<keyof SafeVaultState, boolean> {
  return {
    openaiKey: vault.openaiKey.trim() !== "",
    nvidiaKey: (vault.nvidiaKey || "").trim() !== "",
    geminiKey: vault.geminiKey.trim() !== "",
    anthropicKey: vault.anthropicKey.trim() !== "",
    githubToken: vault.githubToken.trim() !== "",
    microsoftToken: vault.microsoftToken.trim() !== "",
    googleToken: vault.googleToken.trim() !== "",
    googleClientId: vault.googleClientId.trim() !== "",
    googleClientSecret: vault.googleClientSecret.trim() !== "",
    googleRefreshToken: vault.googleRefreshToken.trim() !== "",
    googleGrantedScopes: vault.googleGrantedScopes.trim() !== "",
    dbConnectionString: vault.dbConnectionString.trim() !== "",
    smtpConnectionString: vault.smtpConnectionString.trim() !== ""
  };
}
