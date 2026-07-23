import { readFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";

let config = ""; try { config = await readFile(".env.local", "utf8"); } catch {}
if (!/LIFEOS_AUTH_REQUIRED=true/.test(config) || !/LIFEOS_AUTH_EMAIL=.+/.test(config) || !/LIFEOS_AUTH_PASSWORD_HASH=.+:.+/.test(config)) { console.error("Run `npm run setup:auth` before exposing LifeOS."); process.exit(1); }
if (spawnSync("sh", ["-c", "command -v ngrok"], { stdio: "ignore" }).status !== 0) { console.error("ngrok is not installed. Install the official ngrok agent and configure its authtoken first."); process.exit(1); }
const inspectServer = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3001/api/auth/session");
    const result = await response.json();
    if (result.authRequired === true) return true;
    throw new Error("Port 3001 already has a LifeOS server without authentication enabled. Stop it with Ctrl+C before running mobile mode.");
  } catch (error) {
    if (error?.cause?.code === "ECONNREFUSED") return false;
    if (error instanceof SyntaxError) throw new Error("Port 3001 is occupied by another application. Stop it before running mobile mode.");
    throw error;
  }
};
const existingSecureServer = await inspectServer();
const server = existingSecureServer ? null : spawn("npm", ["start"], { stdio: "inherit", env: { ...process.env, PORT: "3001", HOST: "127.0.0.1" } });
if (existingSecureServer) console.log("Using the authenticated LifeOS server already running on port 3001.");
else {
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt++) { await new Promise(resolve => setTimeout(resolve, 250)); try { if (await inspectServer()) { ready = true; break; } } catch (error) { if (attempt === 19) throw error; } }
  if (!ready) { server?.kill("SIGTERM"); throw new Error("LifeOS did not become ready on port 3001 within five seconds."); }
}
let tunnel; const stop = () => { tunnel?.kill("SIGTERM"); server?.kill("SIGTERM"); };
process.on("SIGINT", stop); process.on("SIGTERM", stop);
const redactNgrokSecrets = chunk => String(chunk).replace(/((?:auth)?token:?\s+)[A-Za-z0-9_-]{20,}/gi, "$1[REDACTED]");
tunnel = spawn("ngrok", ["http", "3001"], { stdio: ["inherit", "pipe", "pipe"] });
tunnel.stdout.on("data", chunk => process.stdout.write(redactNgrokSecrets(chunk)));
tunnel.stderr.on("data", chunk => process.stderr.write(redactNgrokSecrets(chunk)));
tunnel.on("exit", code => { if (code) process.exitCode = code; stop(); });
server?.on("exit", code => { if (code) process.exitCode = code; tunnel?.kill("SIGTERM"); });

for (let attempt = 0; attempt < 30; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 250));
  try {
    const response = await fetch("http://127.0.0.1:4040/api/tunnels"), result = await response.json();
    const url = result.tunnels?.find(item => item.proto === "https")?.public_url;
    if (url) { console.log(`\nLifeOS mobile access is ready:\n${url}\n\nKeep this terminal open. Press Ctrl+C to stop private mobile access.\n`); break; }
  } catch {}
}
