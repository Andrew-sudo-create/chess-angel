"use client";

import { useMemo, useState } from "react";
import { subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useChessData, useSettings } from "@/lib/use-chess-data";
import { LoadingState, MockDataBanner, EmptyState } from "@/components/shared/States";
import { computeOpeningStats } from "@/lib/chess-utils";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { cn } from "@/lib/utils";
import { Trophy, AlertCircle } from "lucide-react";
import type { OpeningStat } from "@/lib/types";

const WIN_COLOR = "oklch(0.65 0.18 142)";
const LOSS_COLOR = "oklch(0.55 0.22 25)";
const tooltipStyle = {
  backgroundColor: "oklch(0.16 0 0)",
  border: "1px solid oklch(0.25 0 0)",
  borderRadius: "6px",
  fontSize: "12px",
  color: "oklch(0.94 0 0)",
};

type SortKey = keyof Pick<OpeningStat, "games" | "winRate" | "avgRatingDelta" | "avgGameLength">;

export function OpeningsClient() {
  const [settings] = useSettings();
  const { games, isLoading, isMock } = useChessData(settings.username);
  const [sortKey, setSortKey] = useState<SortKey>("games");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const stats = useMemo(() => {
    const cutoff = subDays(new Date(), settings.dateRangeDays);
    const filtered = games.filter((g) => g.date >= cutoff);
    return computeOpeningStats(filtered);
  }, [games, settings.dateRangeDays]);

  const sorted = useMemo(() => {
    return [...stats].sort((a, b) => {
      const cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [stats, sortKey, sortDir]);

  if (isLoading) return <LoadingState />;
  if (stats.length === 0) return <EmptyState message="No opening data available" />;

  const best = [...stats].sort((a, b) => b.winRate - a.winRate).find((s) => s.games >= 3);
  const worst = [...stats].sort((a, b) => a.winRate - b.winRate).find((s) => s.games >= 3);

  const chartData = stats.slice(0, 12).map((s) => ({
    name: s.name.length > 16 ? s.name.slice(0, 16) + "…" : s.name,
    winRate: Math.round(s.winRate),
    games: s.games,
  }));

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 py-4">
      {isMock && <MockDataBanner />}

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {best && (
          <div className="rounded-lg border border-[oklch(0.65_0.18_142)]/30 bg-[oklch(0.65_0.18_142)]/5 p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-[oklch(0.65_0.18_142)]/20 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-[oklch(0.65_0.18_142)]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[oklch(0.65_0.18_142)] uppercase tracking-wider mb-0.5">Best Opening</div>
              <div className="text-sm font-semibold text-foreground">{best.name}</div>
              <div className="text-xs text-muted-foreground">{Math.round(best.winRate)}% win rate over {best.games} games</div>
            </div>
          </div>
        )}
        {worst && worst !== best && (
          <div className="rounded-lg border border-[oklch(0.55_0.22_25)]/30 bg-[oklch(0.55_0.22_25)]/5 p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-[oklch(0.55_0.22_25)]/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-[oklch(0.55_0.22_25)]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[oklch(0.55_0.22_25)] uppercase tracking-wider mb-0.5">Needs Work</div>
              <div className="text-sm font-semibold text-foreground">{worst.name}</div>
              <div className="text-xs text-muted-foreground">{Math.round(worst.winRate)}% win rate over {worst.games} games</div>
            </div>
          </div>
        )}
      </div>

      {/* Win rate chart */}
      <ChartCard title="Win Rate by Opening" description="Top 12 most-played openings">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Win Rate"]} />
            <Bar dataKey="winRate" name="Win Rate" radius={[0, 2, 2, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.winRate >= 50 ? WIN_COLOR : LOSS_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card border-b border-border">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Opening</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">ECO</th>
                {(["games", "winRate", "avgRatingDelta", "avgGameLength"] as SortKey[]).map((key) => (
                  <th
                    key={key}
                    className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                    onClick={() => handleSort(key)}
                  >
                    {key === "games" ? "Games" : key === "winRate" ? "Win %" : key === "avgRatingDelta" ? "Avg Δ" : "Avg Length"}
                    {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">W/D/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((s) => (
                <tr key={s.eco + s.name} className="hover:bg-accent/40 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-foreground font-medium max-w-[200px] truncate">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground font-mono">{s.eco || "—"}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-right text-foreground">{s.games}</td>
                  <td className={cn(
                    "px-3 py-2.5 text-xs tabular-nums text-right font-semibold",
                    s.winRate >= 55 ? "text-[oklch(0.65_0.18_142)]" : s.winRate < 40 ? "text-[oklch(0.55_0.22_25)]" : "text-foreground"
                  )}>
                    {Math.round(s.winRate)}%
                  </td>
                  <td className={cn(
                    "px-3 py-2.5 text-xs tabular-nums text-right",
                    s.avgRatingDelta > 0 ? "text-[oklch(0.65_0.18_142)]" : s.avgRatingDelta < 0 ? "text-[oklch(0.55_0.22_25)]" : "text-muted-foreground"
                  )}>
                    {s.avgRatingDelta > 0 ? `+${s.avgRatingDelta}` : s.avgRatingDelta}
                  </td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-right text-muted-foreground">{s.avgGameLength}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[oklch(0.65_0.18_142)]">{s.wins}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-[oklch(0.70_0.12_60)]">{s.draws}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-[oklch(0.55_0.22_25)]">{s.losses}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
