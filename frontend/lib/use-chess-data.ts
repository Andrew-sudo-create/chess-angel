"use client";

import { useState, useEffect, useCallback } from "react";
import type { Game, Settings } from "./types";
import { normalizeGame } from "./chess-utils";
import { generateMockGames } from "./mock-data";

const DEFAULT_SETTINGS: Settings = {
  username: "ChessAngel",
  dateRangeDays: 30,
  animateCharts: true,
  compactMode: false,
};

const SETTINGS_KEY = "chess-angel-settings";

export function useSettings(): [Settings, (s: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return [settings, update];
}

export interface ChessData {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  isMock: boolean;
}

export function useChessData(username: string): ChessData {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/data/games.json");
        if (!res.ok) throw new Error("File not found");
        const raw = await res.json();
        if (!cancelled) {
          const normalized = (Array.isArray(raw) ? raw : [])
            .map((g) => normalizeGame(g, username))
            .filter((g): g is Game => g !== null);
          setGames(normalized);
          setIsMock(false);
        }
      } catch {
        // Fall back to mock data
        const mockRaw = generateMockGames();
        const normalized = mockRaw
          .map((g) => normalizeGame(g, username))
          .filter((g): g is Game => g !== null);
        if (!cancelled) {
          setGames(normalized);
          setIsMock(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [username]);

  return { games, isLoading, error, isMock };
}
