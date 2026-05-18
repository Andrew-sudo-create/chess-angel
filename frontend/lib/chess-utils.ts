import { format, subDays, startOfDay } from "date-fns";
import type {
  RawGame,
  Game,
  GameResult,
  TimeClass,
  OpeningStat,
  StreakInfo,
  TiltEvent,
  SessionCluster,
} from "./types";

// ─── Result Normalization ────────────────────────────────────────────────────

const WIN_RESULTS = new Set([
  "win",
  "checkmated",
  "resigned",
  "timeout",
  "abandoned",
]);
const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

export function normalizeResult(raw?: string): GameResult {
  if (!raw) return "unknown";
  const r = raw.toLowerCase();
  if (r === "win") return "win";
  if (DRAW_RESULTS.has(r)) return "draw";
  if (WIN_RESULTS.has(r)) return "loss"; // opponent won via these
  return "unknown";
}

export function normalizeTimeClass(raw?: string): TimeClass {
  if (!raw) return "unknown";
  const r = raw.toLowerCase();
  if (r === "bullet") return "bullet";
  if (r === "blitz") return "blitz";
  if (r === "rapid") return "rapid";
  if (r === "daily") return "daily";
  return "unknown";
}

// ─── Game Normalization ──────────────────────────────────────────────────────

export function normalizeGame(raw: RawGame, myUsername: string): Game | null {
  try {
    const id =
      raw.id ?? raw.url?.split("/").pop() ?? Math.random().toString(36).slice(2);
    const url = raw.url ?? "";
    const date = raw.end_time
      ? new Date(raw.end_time * 1000)
      : new Date(0);

    let myColor: "white" | "black";
    let myResult: GameResult;
    let myRating: number;
    let opponentRating: number;
    let opponentUsername: string;

    if (raw.my_color) {
      myColor = raw.my_color;
      myResult = normalizeResult(raw.my_result);
      myRating = raw.my_rating ?? 0;
      opponentRating = raw.opponent_rating ?? 0;
      const opp =
        myColor === "white" ? raw.black?.username : raw.white?.username;
      opponentUsername = opp ?? "Unknown";
    } else {
      const whiteName = raw.white?.username?.toLowerCase() ?? "";
      const blackName = raw.black?.username?.toLowerCase() ?? "";
      const myLower = myUsername.toLowerCase();

      if (whiteName === myLower) {
        myColor = "white";
        myResult = normalizeResult(raw.white?.result);
        myRating = raw.white?.rating ?? 0;
        opponentRating = raw.black?.rating ?? 0;
        opponentUsername = raw.black?.username ?? "Unknown";
      } else if (blackName === myLower) {
        myColor = "black";
        myResult = normalizeResult(raw.black?.result);
        myRating = raw.black?.rating ?? 0;
        opponentRating = raw.white?.rating ?? 0;
        opponentUsername = raw.white?.username ?? "Unknown";
      } else {
        // Default to white
        myColor = "white";
        myResult = normalizeResult(raw.white?.result);
        myRating = raw.white?.rating ?? 0;
        opponentRating = raw.black?.rating ?? 0;
        opponentUsername = raw.black?.username ?? "Unknown";
      }
    }

    const ratingDelta = opponentRating - myRating;

    return {
      id,
      url,
      date,
      timeControl: raw.time_control ?? "",
      timeClass: normalizeTimeClass(raw.time_class),
      rated: raw.rated ?? true,
      myColor,
      myResult,
      myRating,
      opponentRating,
      opponentUsername,
      ratingDelta,
      eco: raw.eco ?? "",
      opening: raw.opening ?? "Unknown",
      pgn: raw.pgn ?? "",
    };
  } catch {
    return null;
  }
}

// ─── Aggregation Helpers ─────────────────────────────────────────────────────

export function groupByDay(games: Game[]): Map<string, Game[]> {
  const map = new Map<string, Game[]>();
  for (const g of games) {
    const key = format(g.date, "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(g);
  }
  return map;
}

export function getDailyStats(games: Game[], days = 30) {
  const byDay = groupByDay(games);
  const result = [];
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    const dayGames = byDay.get(key) ?? [];
    result.push({
      date: key,
      label: format(d, "MMM d"),
      total: dayGames.length,
      wins: dayGames.filter((g) => g.myResult === "win").length,
      draws: dayGames.filter((g) => g.myResult === "draw").length,
      losses: dayGames.filter((g) => g.myResult === "loss").length,
    });
  }
  return result;
}

export function getRatingTrend(games: Game[]) {
  const sorted = [...games].sort((a, b) => a.date.getTime() - b.date.getTime());
  return sorted.map((g) => ({
    date: format(g.date, "MMM d"),
    rating: g.myRating,
    timeClass: g.timeClass,
  }));
}

export function getRatingTrendByTimeClass(
  games: Game[],
  timeClass: TimeClass
) {
  return games
    .filter((g) => g.timeClass === timeClass)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((g) => ({
      date: format(g.date, "MMM d"),
      rating: g.myRating,
      fullDate: g.date.toISOString(),
    }));
}

export function computeOpeningStats(games: Game[]): OpeningStat[] {
  const map = new Map<
    string,
    { eco: string; name: string; games: Game[] }
  >();

  for (const g of games) {
    const key = g.eco || g.opening || "Unknown";
    if (!map.has(key)) {
      map.set(key, { eco: g.eco, name: g.opening, games: [] });
    }
    map.get(key)!.games.push(g);
  }

  const stats: OpeningStat[] = [];
  for (const { eco, name, games: gs } of map.values()) {
    const wins = gs.filter((g) => g.myResult === "win").length;
    const draws = gs.filter((g) => g.myResult === "draw").length;
    const losses = gs.filter((g) => g.myResult === "loss").length;
    const total = gs.length;
    const avgRatingDelta =
      gs.reduce((sum, g) => sum + g.ratingDelta, 0) / total;
    const avgGameLength =
      gs.reduce((sum, g) => sum + (g.pgn.split(" ").length / 2 || 20), 0) /
      total;

    stats.push({
      eco,
      name: name || eco || "Unknown",
      games: total,
      wins,
      draws,
      losses,
      winRate: total > 0 ? (wins / total) * 100 : 0,
      avgRatingDelta: Math.round(avgRatingDelta),
      avgGameLength: Math.round(avgGameLength),
    });
  }

  return stats.sort((a, b) => b.games - a.games);
}

// ─── Streaks ─────────────────────────────────────────────────────────────────

export function computeStreaks(games: Game[]): {
  current: { type: GameResult; length: number };
  longest: StreakInfo[];
  all: StreakInfo[];
} {
  const sorted = [...games].sort((a, b) => a.date.getTime() - b.date.getTime());

  if (sorted.length === 0) {
    return {
      current: { type: "unknown", length: 0 },
      longest: [],
      all: [],
    };
  }

  const streaks: StreakInfo[] = [];
  let cur: Game[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].myResult === cur[0].myResult) {
      cur.push(sorted[i]);
    } else {
      if (cur[0].myResult !== "unknown" && cur.length >= 2) {
        streaks.push({
          type: cur[0].myResult as "win" | "loss" | "draw",
          length: cur.length,
          startDate: cur[0].date,
          endDate: cur[cur.length - 1].date,
          games: cur,
        });
      }
      cur = [sorted[i]];
    }
  }
  if (cur.length >= 2 && cur[0].myResult !== "unknown") {
    streaks.push({
      type: cur[0].myResult as "win" | "loss" | "draw",
      length: cur.length,
      startDate: cur[0].date,
      endDate: cur[cur.length - 1].date,
      games: cur,
    });
  }

  const last = sorted[sorted.length - 1];
  let currentLength = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (sorted[i].myResult === last.myResult) currentLength++;
    else break;
  }

  const winStreaks = streaks.filter((s) => s.type === "win");
  const lossStreaks = streaks.filter((s) => s.type === "loss");
  const longest = [
    ...(winStreaks.length > 0
      ? [winStreaks.reduce((a, b) => (a.length > b.length ? a : b))]
      : []),
    ...(lossStreaks.length > 0
      ? [lossStreaks.reduce((a, b) => (a.length > b.length ? a : b))]
      : []),
  ];

  return {
    current: { type: last.myResult, length: currentLength },
    longest,
    all: streaks,
  };
}

// ─── Activity Streaks (consecutive active days) ──────────────────────────────

export function computeActivityStreak(games: Game[]): {
  currentDays: number;
  longestDays: number;
  lastActiveDate: Date | null;
} {
  if (games.length === 0) {
    return { currentDays: 0, longestDays: 0, lastActiveDate: null };
  }

  const daySet = new Set<string>();
  for (const game of games) {
    daySet.add(format(game.date, "yyyy-MM-dd"));
  }

  const activeDays = [...daySet]
    .map((day) => new Date(`${day}T00:00:00`))
    .sort((a, b) => a.getTime() - b.getTime());

  const lastActiveDate = activeDays[activeDays.length - 1];
  const today = startOfDay(new Date());
  const oneDayMs = 24 * 60 * 60 * 1000;
  const gapFromToday = Math.floor((today.getTime() - lastActiveDate.getTime()) / oneDayMs);

  // If you haven't played today or yesterday, streak is considered broken.
  let currentDays = 0;
  if (gapFromToday <= 1) {
    currentDays = 1;
    let expected = lastActiveDate.getTime() - oneDayMs;
    for (let i = activeDays.length - 2; i >= 0; i--) {
      if (activeDays[i].getTime() === expected) {
        currentDays += 1;
        expected -= oneDayMs;
      } else {
        break;
      }
    }
  }

  let longestDays = 1;
  let run = 1;
  for (let i = 1; i < activeDays.length; i++) {
    if (activeDays[i].getTime() - activeDays[i - 1].getTime() === oneDayMs) {
      run += 1;
    } else {
      longestDays = Math.max(longestDays, run);
      run = 1;
    }
  }
  longestDays = Math.max(longestDays, run);

  return { currentDays, longestDays, lastActiveDate };
}

// ─── Tilt Detection ──────────────────────────────────────────────────────────

export function detectTiltEvents(
  games: Game[],
  lossThreshold = 3,
  windowMinutes = 60
): TiltEvent[] {
  const sorted = [...games].sort((a, b) => a.date.getTime() - b.date.getTime());
  const events: TiltEvent[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].myResult !== "loss") continue;
    const windowGames: Game[] = [sorted[i]];

    for (let j = i + 1; j < sorted.length; j++) {
      const diff =
        (sorted[j].date.getTime() - sorted[i].date.getTime()) / 60000;
      if (diff > windowMinutes) break;
      windowGames.push(sorted[j]);
    }

    const losses = windowGames.filter((g) => g.myResult === "loss").length;
    if (losses >= lossThreshold) {
      events.push({
        startTime: windowGames[0].date,
        endTime: windowGames[windowGames.length - 1].date,
        losses,
        games: windowGames,
      });
      i += windowGames.length - 1;
    }
  }

  return events;
}

// ─── Session Clustering ──────────────────────────────────────────────────────

export function clusterSessions(
  games: Game[],
  gapMinutes = 30
): SessionCluster[] {
  if (games.length === 0) return [];
  const sorted = [...games].sort((a, b) => a.date.getTime() - b.date.getTime());
  const clusters: SessionCluster[] = [];
  let cur: Game[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap =
      (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / 60000;
    if (gap > gapMinutes) {
      clusters.push(makeCluster(cur));
      cur = [];
    }
    cur.push(sorted[i]);
  }
  if (cur.length > 0) clusters.push(makeCluster(cur));
  return clusters.reverse();
}

function makeCluster(games: Game[]): SessionCluster {
  return {
    start: games[0].date,
    end: games[games.length - 1].date,
    games,
    wins: games.filter((g) => g.myResult === "win").length,
    draws: games.filter((g) => g.myResult === "draw").length,
    losses: games.filter((g) => g.myResult === "loss").length,
  };
}

// ─── Best Time of Day ────────────────────────────────────────────────────────

export function bestTimeOfDay(games: Game[]) {
  const hours: { wins: number; total: number }[] = Array.from({ length: 24 }, () => ({
    wins: 0,
    total: 0,
  }));

  for (const g of games) {
    const h = g.date.getHours();
    hours[h].total++;
    if (g.myResult === "win") hours[h].wins++;
  }

  let bestHour = 12;
  let bestRate = 0;
  for (let h = 0; h < 24; h++) {
    if (hours[h].total >= 3) {
      const rate = hours[h].wins / hours[h].total;
      if (rate > bestRate) {
        bestRate = rate;
        bestHour = h;
      }
    }
  }

  const label =
    bestHour === 0
      ? "12 AM"
      : bestHour < 12
      ? `${bestHour} AM`
      : bestHour === 12
      ? "12 PM"
      : `${bestHour - 12} PM`;

  return { hour: bestHour, label, winRate: Math.round(bestRate * 100) };
}

// ─── Color Performance ───────────────────────────────────────────────────────

export function colorPerformance(games: Game[]) {
  const white = games.filter((g) => g.myColor === "white");
  const black = games.filter((g) => g.myColor === "black");

  const calc = (gs: Game[]) => ({
    total: gs.length,
    wins: gs.filter((g) => g.myResult === "win").length,
    winRate:
      gs.length > 0
        ? Math.round((gs.filter((g) => g.myResult === "win").length / gs.length) * 100)
        : 0,
  });

  return { white: calc(white), black: calc(black) };
}

// ─── Win Rate Helpers ─────────────────────────────────────────────────────────

export function winRateForPeriod(games: Game[], days: number): number {
  const cutoff = subDays(new Date(), days);
  const recent = games.filter((g) => g.date >= cutoff);
  if (recent.length === 0) return 0;
  const wins = recent.filter((g) => g.myResult === "win").length;
  return Math.round((wins / recent.length) * 100);
}

export function ratingChangeForPeriod(games: Game[], days: number): number {
  const cutoff = subDays(new Date(), days);
  const recent = games.filter((g) => g.date >= cutoff);
  if (recent.length < 2) return 0;
  const sorted = recent.sort((a, b) => a.date.getTime() - b.date.getTime());
  return sorted[sorted.length - 1].myRating - sorted[0].myRating;
}

export function gamesToday(games: Game[]): number {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  return games.filter((g) => format(g.date, "yyyy-MM-dd") === todayStr).length;
}
