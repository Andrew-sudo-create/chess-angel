import { getGamesSince } from "./chesscom.js";
import { config } from "./config.js";
import { computeDailySummary } from "./analytics.js";
import { enrichGameForUser } from "./normalize.js";
import {
  readExistingGames,
  writeDailySummary,
  writeGames,
  writeLastSyncMeta
} from "./storage.js";
import type { RawGame, SyncResult } from "./types.js";

export interface SyncOptions {
  username: string;
  days?: number;
  todayOnly?: boolean;
}

function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dedupeByUrl(games: RawGame[]): RawGame[] {
  const map = new Map<string, RawGame>();
  for (const game of games) {
    const key = game.url ?? game.id ?? game.uuid;
    if (!key) continue;

    const existing = map.get(key);
    if (!existing || (game.end_time ?? 0) >= (existing.end_time ?? 0)) {
      map.set(key, game);
    }
  }
  return [...map.values()];
}

export async function syncGames(options: SyncOptions): Promise<SyncResult> {
  const username = options.username.trim();
  if (!username) {
    throw new Error("Username is required.");
  }

  const since = options.todayOnly
    ? startOfTodayLocal()
    : new Date(Date.now() - 1000 * 60 * 60 * 24 * (options.days ?? config.syncDays));

  const fetchedRaw = await getGamesSince(username, since);
  const enriched = fetchedRaw
    .map((g) => enrichGameForUser(g, username))
    .filter((g): g is RawGame => g !== null);

  const existing = await readExistingGames();
  const merged = dedupeByUrl([...existing, ...enriched]).sort(
    (a, b) => (a.end_time ?? 0) - (b.end_time ?? 0)
  );
  const addedGames = Math.max(merged.length - existing.length, 0);

  const summary = computeDailySummary(merged);

  await writeGames(merged);
  await writeDailySummary(summary);
  await writeLastSyncMeta({
    username,
    fetchedGames: enriched.length,
    addedGames,
    totalGames: merged.length,
    summaries: summary.length,
    updatedAt: new Date().toISOString()
  });

  return {
    username,
    fetchedGames: enriched.length,
    addedGames,
    totalGames: merged.length,
    summaries: summary.length,
    updatedAt: new Date().toISOString()
  };
}
