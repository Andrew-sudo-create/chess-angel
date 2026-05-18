import express from "express";
import cors from "cors";
import { z } from "zod";
import { config } from "./config.js";
import { syncGames } from "./sync.js";
import { readDailySummary, readExistingGames } from "./storage.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "chess-angel-backend", ts: new Date().toISOString() });
});

app.get("/api/games", async (req, res) => {
  const days = Number(req.query.days ?? 0);
  const games = await readExistingGames();

  if (!Number.isFinite(days) || days <= 0) {
    res.json({ games, count: games.length });
    return;
  }

  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = games.filter((g) => (g.end_time ?? 0) * 1000 >= since);
  res.json({ games: filtered, count: filtered.length });
});

app.get("/api/daily-summary", async (_req, res) => {
  const summary = await readDailySummary();
  res.json({ summary, count: summary.length });
});

const syncSchema = z.object({
  username: z.string().min(1).optional(),
  days: z.number().int().positive().optional(),
  todayOnly: z.boolean().optional()
});

app.post("/api/sync", async (req, res) => {
  const parsed = syncSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
    return;
  }

  const username = parsed.data.username ?? config.username;
  if (!username) {
    res.status(400).json({ error: "No username provided. Set CHESS_USERNAME or pass username." });
    return;
  }

  try {
    const result = await syncGames({
      username,
      days: parsed.data.days,
      todayOnly: parsed.data.todayOnly
    });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    res.status(500).json({ error: message });
  }
});

app.listen(config.port, () => {
  console.log(`Chess Angel backend listening on http://localhost:${config.port}`);
});
