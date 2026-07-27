import path from "path";

export function lifeOsDataDirectory(env: NodeJS.ProcessEnv = process.env): string {
  const configured = String(env.LIFEOS_DATA_DIR || "").trim();
  return configured ? path.resolve(process.cwd(), configured) : path.join(process.cwd(), "data");
}

export function lifeOsDataPath(...segments: string[]): string {
  return path.join(lifeOsDataDirectory(), ...segments);
}
