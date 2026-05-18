import type { GameResult, RawGame } from "./types.js";

const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
  "draw"
]);

const LOSS_RESULTS = new Set([
  "checkmated",
  "resigned",
  "timeout",
  "abandoned",
  "lose"
]);

function parsePgnHeaders(pgn?: string): Record<string, string> {
  if (!pgn) return {};
  const headers: Record<string, string> = {};
  const lines = pgn.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("[")) continue;
    const m = trimmed.match(/^\[(\w+)\s+"(.+)"\]$/);
    if (m) headers[m[1]] = m[2];
  }

  return headers;
}

function looksLikeUrl(value?: string): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function extractOpeningNameFromUrl(value?: string): string | null {
  if (!value || !looksLikeUrl(value)) return null;

  try {
    const url = new URL(value);
    const marker = "/openings/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const slug = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    const human = slug
      .replace(/[-_]+/g, " ")
      .replace(/\.\.\./g, " ")
      .replace(/\b\d+\.(?:\.\.)?/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return human.length > 0 ? human : null;
  } catch {
    return null;
  }
}

function extractEcoCodeFromUrl(value?: string): string | null {
  if (!value || !looksLikeUrl(value)) return null;
  const match = value.match(/\/openings\/([A-E]\d{2})\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function normalizeOpening(rawOpening?: string): string | null {
  if (!rawOpening) return null;
  const cleaned = rawOpening.trim();
  if (!cleaned || cleaned.toLowerCase() === "unknown") return null;
  return cleaned;
}

export function normalizeResult(playerRawResult?: string): GameResult {
  if (!playerRawResult) return "unknown";
  const value = playerRawResult.toLowerCase();
  if (value === "win") return "win";
  if (DRAW_RESULTS.has(value)) return "draw";
  if (LOSS_RESULTS.has(value)) return "loss";
  return "unknown";
}

export function enrichGameForUser(raw: RawGame, username: string): RawGame | null {
  const myLower = username.toLowerCase();
  const whiteName = raw.white?.username?.toLowerCase();
  const blackName = raw.black?.username?.toLowerCase();

  let myColor: "white" | "black" | null = null;
  if (whiteName === myLower) myColor = "white";
  if (blackName === myLower) myColor = "black";
  if (!myColor) return null;

  const mine = myColor === "white" ? raw.white : raw.black;
  const opp = myColor === "white" ? raw.black : raw.white;
  const headers = parsePgnHeaders(raw.pgn);
  const ecoFromHeader = headers.ECO?.trim();
  const ecoFromUrl = extractEcoCodeFromUrl(raw.eco) ?? extractEcoCodeFromUrl(headers.ECOUrl);
  const openingFromKnownFields =
    normalizeOpening(raw.opening) ?? normalizeOpening(headers.Opening);
  const openingFromUrl =
    extractOpeningNameFromUrl(headers.ECOUrl) ?? extractOpeningNameFromUrl(raw.eco);

  return {
    ...raw,
    id: raw.id ?? raw.uuid ?? raw.url?.split("/").pop(),
    eco: ecoFromHeader ?? ecoFromUrl ?? (looksLikeUrl(raw.eco) ? "" : raw.eco ?? ""),
    opening: openingFromKnownFields ?? openingFromUrl ?? "Unknown",
    my_color: myColor,
    my_result: mine?.result,
    my_rating: mine?.rating,
    opponent_rating: opp?.rating
  };
}
