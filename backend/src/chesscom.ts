import { config } from "./config.js";
import type { RawGame } from "./types.js";

interface ArchiveListResponse {
  archives?: string[];
}

interface ArchiveGamesResponse {
  games?: RawGame[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": config.userAgent
    }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}) for ${url}: ${body}`);
  }

  return (await res.json()) as T;
}

function monthStampFromUrl(archiveUrl: string): string | null {
  const m = archiveUrl.match(/\/(\d{4})\/(\d{2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2]}`;
}

function isArchiveOnOrAfter(archiveUrl: string, since: Date): boolean {
  const stamp = monthStampFromUrl(archiveUrl);
  if (!stamp) return false;
  const [year, month] = stamp.split("-").map(Number);
  if (!year || !month) return false;
  const archiveStart = new Date(Date.UTC(year, month - 1, 1));
  return archiveStart >= new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), 1));
}

export async function getArchiveUrls(username: string): Promise<string[]> {
  const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`;
  const data = await fetchJson<ArchiveListResponse>(url);
  return Array.isArray(data.archives) ? data.archives : [];
}

export async function getGamesFromArchive(archiveUrl: string): Promise<RawGame[]> {
  const data = await fetchJson<ArchiveGamesResponse>(archiveUrl);
  return Array.isArray(data.games) ? data.games : [];
}

export async function getGamesSince(username: string, since: Date): Promise<RawGame[]> {
  const archiveUrls = await getArchiveUrls(username);
  const targets = archiveUrls.filter((url) => isArchiveOnOrAfter(url, since));
  const monthly = await Promise.all(targets.map((url) => getGamesFromArchive(url)));
  return monthly.flat();
}
