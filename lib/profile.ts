import { promises as fs } from "fs";
import path from "path";

export type ProfileData = typeof import("@/docs/profile.json");
export type Project = ProfileData["proyectos_destacados"][number];

const profilePath = path.join(process.cwd(), "docs", "profile.json");

export async function loadProfile(): Promise<ProfileData> {
  const raw = await fs.readFile(profilePath, "utf-8");
  return JSON.parse(raw) as ProfileData;
}

