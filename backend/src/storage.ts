import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import type { DailySummary, RawGame } from "./types.js";

const GAMES_FILENAME = "games.json";
const SUMMARY_FILENAME = "daily-summary.json";
const META_FILENAME = "last-sync.json";

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function readJsonOrDefault<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  const parent = path.dirname(filePath);
  await ensureDir(parent);
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function readExistingGames(): Promise<RawGame[]> {
  const file = path.join(config.frontendDataDir, GAMES_FILENAME);
  return readJsonOrDefault<RawGame[]>(file, []);
}

export async function writeGames(games: RawGame[]): Promise<void> {
  const file = path.join(config.frontendDataDir, GAMES_FILENAME);
  await writeJson(file, games);
}

export async function readDailySummary(): Promise<DailySummary[]> {
  const file = path.join(config.frontendDataDir, SUMMARY_FILENAME);
  return readJsonOrDefault<DailySummary[]>(file, []);
}

export async function writeDailySummary(summary: DailySummary[]): Promise<void> {
  const file = path.join(config.frontendDataDir, SUMMARY_FILENAME);
  await writeJson(file, summary);
}

export async function writeLastSyncMeta(meta: Record<string, unknown>): Promise<void> {
  const file = path.join(config.backendDataDir, META_FILENAME);
  await writeJson(file, meta);
}
