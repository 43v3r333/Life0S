import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });
const email = (await rl.question("Private LifeOS login email: ")).trim().toLowerCase();
rl.close();
if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");

async function secret(question) {
  if (!input.isTTY || typeof input.setRawMode !== "function") throw new Error("Password setup requires an interactive terminal.");
  output.write(`${question}\n(Type your password; dots will appear for each character.)\n> `);
  input.resume(); input.setRawMode(true); input.setEncoding("utf8");
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => { input.off("data", onData); input.setRawMode(false); input.pause(); output.write("\n"); error ? reject(error) : resolve(value); };
    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\u0003") return finish(new Error("Password setup cancelled."));
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u007f" || character === "\b") { if (value) { value = value.slice(0, -1); output.write("\b \b"); } continue; }
        if (character >= " ") { value += character; output.write("•"); }
      }
    };
    input.on("data", onData);
  });
}
const password = await secret("New password (at least 12 characters): ");
const confirmation = await secret("Confirm password: ");
if (password.length < 12) throw new Error("Password must contain at least 12 characters.");
if (password !== confirmation) throw new Error("Passwords did not match.");
const salt = randomBytes(16), hash = scryptSync(password, salt, 64);
let existing = ""; try { existing = await readFile(".env.local", "utf8"); } catch {}
const values = new Map(existing.split(/\r?\n/).filter(line => line && !line.trim().startsWith("#") && line.includes("=")).map(line => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]));
values.set("LIFEOS_AUTH_REQUIRED", "true"); values.set("LIFEOS_AUTH_EMAIL", email); values.set("LIFEOS_AUTH_PASSWORD_HASH", `${salt.toString("hex")}:${hash.toString("hex")}`);
await writeFile(".env.local", [...values].map(([key, value]) => `${key}=${value}`).join("\n") + "\n", { mode: 0o600 });
console.log("LifeOS authentication configured in the gitignored .env.local file.");
