"use client";

import { useMemo } from "react";
import { subDays } from "date-fns";
import { useChessData, useSettings } from "@/lib/use-chess-data";
import { LoadingState, MockDataBanner } from "@/components/shared/States";
import { StatCard } from "./StatCard";
import {
  DailyGamesChart,
  WinDrawLossChart,
  RatingTrendChart,
  OpeningPerformanceChart,
} from "./DashboardCharts";
import { InsightsPanel } from "./InsightsPanel";
import {
  gamesToday,
  winRateForPeriod,
  ratingChangeForPeriod,
  computeStreaks,
} from "@/lib/chess-utils";
import {
  Gamepad2,
  Target,
  Flame,
  TrendingUp,
} from "lucide-react";

export function DashboardClient() {
  const [settings] = useSettings();
  const { games, isLoading, isMock } = useChessData(settings.username);

  const filtered = useMemo(() => {
    const cutoff = subDays(new Date(), settings.dateRangeDays);
    return games.filter((g) => g.date >= cutoff);
  }, [games, settings.dateRangeDays]);

  const today = useMemo(() => gamesToday(games), [games]);
  const winRate7d = useMemo(() => winRateForPeriod(games, 7), [games]);
  const ratingChange30d = useMemo(() => ratingChangeForPeriod(games, 30), [games]);
  const { current: streak } = useMemo(() => computeStreaks(games), [games]);

  if (isLoading) return <LoadingState message="Loading chess data..." />;

  const ratingTrend =
    ratingChange30d > 0 ? "up" : ratingChange30d < 0 ? "down" : "neutral";

  return (
    <>
      {isMock && <MockDataBanner />}
      <div className="px-4 md:px-6 py-4 flex flex-col gap-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Games Today"
            value={today}
            sub="vs yesterday"
            icon={Gamepad2}
          />
          <StatCard
            label="Win Rate (7d)"
            value={`${winRate7d}%`}
            sub="last 7 days"
            icon={Target}
            trend={winRate7d >= 50 ? "up" : "down"}
          />
          <StatCard
            label="Current Streak"
            value={streak.length > 0 ? `${streak.length} ${streak.type}` : "—"}
            sub={streak.length > 0 ? `${streak.type} streak` : "no streak"}
            icon={Flame}
            trend={
              streak.type === "win"
                ? "up"
                : streak.type === "loss"
                ? "down"
                : "neutral"
            }
          />
          <StatCard
            label="Rating Δ (30d)"
            value={ratingChange30d >= 0 ? `+${ratingChange30d}` : `${ratingChange30d}`}
            sub="rating change"
            icon={TrendingUp}
            trend={ratingTrend}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <DailyGamesChart games={filtered} animate={settings.animateCharts} />
          <WinDrawLossChart games={filtered} animate={settings.animateCharts} />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <RatingTrendChart games={filtered} animate={settings.animateCharts} />
          <InsightsPanel games={filtered} />
        </div>

        {/* Opening chart */}
        <div className="grid grid-cols-1 gap-3">
          <OpeningPerformanceChart games={filtered} animate={settings.animateCharts} />
        </div>
      </div>
    </>
  );
}
