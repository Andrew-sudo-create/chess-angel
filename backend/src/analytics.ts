import type { DailySummary, RawGame } from "./types.js";
import { normalizeResult } from "./normalize.js";

function dateKeyFromUnixSeconds(seconds?: number): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

export function computeDailySummary(games: RawGame[]): DailySummary[] {
  const map = new Map<string, DailySummary>();

  const ordered = [...games].sort((a, b) => (a.end_time ?? 0) - (b.end_time ?? 0));
  for (const game of ordered) {
    const key = dateKeyFromUnixSeconds(game.end_time);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, {
        date: key,
        games: 0,
        wins: 0,
        draws: 0,
        losses: 0
      });
    }

    const row = map.get(key)!;
    row.games += 1;

    const result = normalizeResult(game.my_result);
    if (result === "win") row.wins += 1;
    if (result === "draw") row.draws += 1;
    if (result === "loss") row.losses += 1;
    if (typeof game.my_rating === "number") row.ratingEnd = game.my_rating;
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}
