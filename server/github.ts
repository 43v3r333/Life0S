import { DbState } from "./db.js";

export interface GitHubSyncResult {
  success: boolean;
  issueNumber?: number;
  url?: string;
  logs: string[];
  usingRealIntegration: boolean;
}

export async function syncGoalToGitHub(
  goalTitle: string,
  goalDesc: string,
  vault: Record<string, string>,
  repoOwnerAndName: string = "43v3r-Ecosystem/LifeOS"
): Promise<GitHubSyncResult> {
  const token = vault.githubToken || process.env.GITHUB_TOKEN;
  const logs: string[] = [];

  logs.push(`[EXTERNAL GATEWAY] Preparing synchronization payload for repo: ${repoOwnerAndName}`);
  logs.push(`[EXTERNAL GATEWAY] Target Entity: "Goal" | Title: "${goalTitle}"`);

  // Check if we have an active real GitHub token configured
  const hasRealToken = token && !token.includes("JannahCoreSecuredToken");

  if (hasRealToken) {
    logs.push(`[EXTERNAL GATEWAY] Real GITHUB_TOKEN detected. Initiating secure HTTPS outbound connection...`);
    logs.push(`[EXTERNAL GATEWAY] POST https://api.github.com/repos/${repoOwnerAndName}/issues`);

    try {
      const response = await fetch(`https://api.github.com/repos/${repoOwnerAndName}/issues`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "aistudio-build-lifeos",
        },
        body: JSON.stringify({
          title: `[LifeOS Goal] ${goalTitle}`,
          body: `## Jannah LifeOS Strategic Goal Sync\n\n**Definition:** ${goalDesc}\n\n*Synchronized automatically via LifeOS v6.0 Gateway.*`,
          labels: ["LifeOS", "Goal"],
        }),
      });

      const responseBody = await response.json() as any;

      if (response.ok) {
        logs.push(`[EXTERNAL GATEWAY] [SUCCESS] Outbound sync complete. HTTP Status: ${response.status} Created`);
        logs.push(`[EXTERNAL GATEWAY] GitHub Issue Created: #${responseBody.number} - ${responseBody.html_url}`);
        return {
          success: true,
          issueNumber: responseBody.number,
          url: responseBody.html_url,
          logs,
          usingRealIntegration: true,
        };
      } else {
        logs.push(`[EXTERNAL GATEWAY] [ERROR] GitHub API responded with status ${response.status}: ${JSON.stringify(responseBody)}`);
        logs.push(`[EXTERNAL GATEWAY] Cascading to local fallback loop.`);
        throw new Error(`GitHub responded with ${response.status}`);
      }
    } catch (err: any) {
      logs.push(`[EXTERNAL GATEWAY] [FAIL] Outbound connection failed: ${err.message}`);
    }
  }

  // High-fidelity fallback / explanation sequence if no real token is set
  logs.push(`[EXTERNAL GATEWAY] No real custom GITHUB_TOKEN configured. Executing fully validated integration simulation.`);
  logs.push(`[EXTERNAL GATEWAY] Simulated Request Command:`);
  logs.push(`  curl -X POST \\`);
  logs.push(`    -H "Authorization: Bearer <GITHUB_TOKEN>" \\`);
  logs.push(`    -H "Accept: application/vnd.github.v3+json" \\`);
  logs.push(`    -d '{"title":"[LifeOS Goal] ${goalTitle}","labels":["LifeOS"]}' \\`);
  logs.push(`    https://api.github.com/repos/${repoOwnerAndName}/issues`);
  
  logs.push(`[EXTERNAL GATEWAY] No external write was performed.`);
  logs.push(`[EXTERNAL GATEWAY] [GUIDE] To connect this live to your actual GitHub repositories, open the Settings -> Secrets menu or edit the .env file to configure a valid 'GITHUB_TOKEN'.`);

  return {
    success: false,
    logs,
    usingRealIntegration: false,
  };
}
