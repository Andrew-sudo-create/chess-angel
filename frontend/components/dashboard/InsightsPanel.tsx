"use client";

import type { Game } from "@/lib/types";
import {
  bestTimeOfDay,
  colorPerformance,
  computeStreaks,
  computeActivityStreak,
  detectTiltEvents,
} from "@/lib/chess-utils";
import { InsightBadge } from "./InsightBadge";
import {
  Clock,
  Crown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CircleDot,
  CalendarDays,
} from "lucide-react";
import { ChartCard } from "./ChartCard";

export function InsightsPanel({ games }: { games: Game[] }) {
  const tod = bestTimeOfDay(games);
  const colors = colorPerformance(games);
  const streaks = computeStreaks(games);
  const activity = computeActivityStreak(games);
  const tilt = detectTiltEvents(games);

  const longestWin = streaks.longest.find((s) => s.type === "win");
  const longestLoss = streaks.longest.find((s) => s.type === "loss");

  return (
    <ChartCard
      title="Insights"
      description="Performance patterns"
      className="col-span-full lg:col-span-2"
    >
      <div className="flex flex-col gap-1.5">
        <InsightBadge
          icon={Clock}
          label="Best time to play"
          value={`${tod.label} (${tod.winRate}% win)`}
          variant="success"
        />
        <InsightBadge
          icon={Crown}
          label="White win rate"
          value={`${colors.white.winRate}% (${colors.white.total} games)`}
          variant="default"
        />
        <InsightBadge
          icon={CircleDot}
          label="Black win rate"
          value={`${colors.black.winRate}% (${colors.black.total} games)`}
          variant="default"
        />
        <InsightBadge
          icon={CalendarDays}
          label="Activity streak"
          value={`${activity.currentDays} days (best ${activity.longestDays})`}
          variant="default"
        />
        <InsightBadge
          icon={TrendingUp}
          label="Longest win streak"
          value={longestWin ? `${longestWin.length} games` : "N/A"}
          variant="success"
        />
        <InsightBadge
          icon={TrendingDown}
          label="Longest loss streak"
          value={longestLoss ? `${longestLoss.length} games` : "N/A"}
          variant="danger"
        />
        <InsightBadge
          icon={AlertTriangle}
          label="Tilt events (this period)"
          value={tilt.length > 0 ? `${tilt.length} detected` : "None detected"}
          variant={tilt.length > 0 ? "warning" : "default"}
        />
      </div>
    </ChartCard>
  );
}
