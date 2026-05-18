import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  backendRoot: BACKEND_ROOT,
  backendDataDir: path.resolve(BACKEND_ROOT, "data"),
  frontendDataDir: path.resolve(
    BACKEND_ROOT,
    process.env.FRONTEND_DATA_DIR ?? "../frontend/public/data"
  ),
  username: process.env.CHESS_USERNAME ?? "",
  port: intFromEnv("PORT", 4010),
  syncDays: intFromEnv("SYNC_DAYS", 120),
  userAgent: "ChessAngel/1.0 (https://github.com/andre/chess-angel)"
};
