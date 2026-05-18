"use client";

import { useMemo } from "react";
import { subDays, format, formatDistance } from "date-fns";
import { useChessData, useSettings } from "@/lib/use-chess-data";
import { LoadingState, MockDataBanner, EmptyState } from "@/components/shared/States";
import {
  computeStreaks,
  detectTiltEvents,
  clusterSessions,
  computeActivityStreak,
} from "@/lib/chess-utils";
import { ResultBadge } from "@/components/shared/ResultBadge";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Flame,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/types";

function OutcomeTimeline({ games }: { games: Game[] }) {
  const recent = [...games]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-80);

  return (
    <div className="flex flex-wrap gap-0.5">
      {recent.map((g) => (
        <div
          key={g.id}
          title={`${format(g.date, "MMM d, HH:mm")} — ${g.myResult} vs ${g.opponentUsername}`}
          className={cn(
            "w-3 h-3 rounded-sm transition-opacity hover:opacity-80 cursor-default",
            g.myResult === "win" && "bg-[oklch(0.65_0.18_142)]",
            g.myResult === "draw" && "bg-[oklch(0.70_0.12_60)]",
            g.myResult === "loss" && "bg-[oklch(0.55_0.22_25)]",
            g.myResult === "unknown" && "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

export function StreaksClient() {
  const [settings] = useSettings();
  const { games, isLoading, isMock } = useChessData(settings.username);

  const filtered = useMemo(() => {
    const cutoff = subDays(new Date(), settings.dateRangeDays);
    return games
      .filter((g) => g.date >= cutoff)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [games, settings.dateRangeDays]);

  const { current, longest } = useMemo(() => computeStreaks(filtered), [filtered]);
  const activity = useMemo(() => computeActivityStreak(games), [games]);
  const tiltEvents = useMemo(
    () =>
      detectTiltEvents(filtered).sort(
        (a, b) => b.startTime.getTime() - a.startTime.getTime()
      ),
    [filtered]
  );
  const sessions = useMemo(() => clusterSessions(filtered).slice(0, 10), [filtered]);

  if (isLoading) return <LoadingState />;
  if (filtered.length === 0) return <EmptyState message="No games in this period" />;

  const longestWin = longest.find((s) => s.type === "win");
  const longestLoss = longest.find((s) => s.type === "loss");

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 py-4">
      {isMock && <MockDataBanner />}

      {/* KPI streak cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[oklch(0.58_0.12_250)]/30 bg-[oklch(0.58_0.12_250)]/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.58_0.12_250)]/20 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4.5 h-4.5 text-[oklch(0.58_0.12_250)]" />
          </div>
          <div>
            <div className="text-xs text-[oklch(0.58_0.12_250)] uppercase tracking-wider">Active Days Streak</div>
            <div className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {activity.currentDays > 0 ? `${activity.currentDays} days` : "0 days"}
            </div>
            <div className="text-xs text-muted-foreground">
              Best: {activity.longestDays} days
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            current.type === "win" ? "bg-[oklch(0.65_0.18_142)]/15" :
            current.type === "loss" ? "bg-[oklch(0.55_0.22_25)]/15" :
            "bg-secondary"
          )}>
            <Flame className={cn(
              "w-4.5 h-4.5",
              current.type === "win" ? "text-[oklch(0.65_0.18_142)]" :
              current.type === "loss" ? "text-[oklch(0.55_0.22_25)]" :
              "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Streak</div>
            <div className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {current.length > 0 ? `${current.length} ${current.type}${current.length > 1 ? "s" : ""}` : "None"}
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[oklch(0.65_0.18_142)]/30 bg-[oklch(0.65_0.18_142)]/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.65_0.18_142)]/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-[oklch(0.65_0.18_142)]" />
          </div>
          <div>
            <div className="text-xs text-[oklch(0.65_0.18_142)] uppercase tracking-wider">Longest Win Streak</div>
            <div className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {longestWin ? `${longestWin.length} games` : "—"}
            </div>
            {longestWin && (
              <div className="text-xs text-muted-foreground">
                {format(longestWin.startDate, "MMM d")} – {format(longestWin.endDate, "MMM d")}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[oklch(0.55_0.22_25)]/30 bg-[oklch(0.55_0.22_25)]/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.55_0.22_25)]/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4.5 h-4.5 text-[oklch(0.55_0.22_25)]" />
          </div>
          <div>
            <div className="text-xs text-[oklch(0.55_0.22_25)] uppercase tracking-wider">Longest Loss Streak</div>
            <div className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {longestLoss ? `${longestLoss.length} games` : "—"}
            </div>
            {longestLoss && (
              <div className="text-xs text-muted-foreground">
                {format(longestLoss.startDate, "MMM d")} – {format(longestLoss.endDate, "MMM d")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outcome timeline */}
      <ChartCard title="Outcome Timeline" description="Last 80 games — hover for details">
        <div className="py-2">
          <OutcomeTimeline games={filtered} />
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[oklch(0.65_0.18_142)] inline-block" />Win</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[oklch(0.70_0.12_60)] inline-block" />Draw</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[oklch(0.55_0.22_25)] inline-block" />Loss</span>
          </div>
        </div>
      </ChartCard>

      {/* Tilt events */}
      <ChartCard
        title="Tilt Detector"
        description="Sessions with 3+ losses within 60 minutes"
      >
        {tiltEvents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">No tilt events detected — great discipline!</div>
        ) : (
          <div className="flex flex-col gap-2">
            {tiltEvents.map((event, i) => (
              <div
                key={i}
                className="rounded-md border border-[oklch(0.55_0.22_25)]/30 bg-[oklch(0.55_0.22_25)]/5 p-3 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-[oklch(0.55_0.22_25)]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-[oklch(0.55_0.22_25)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {event.losses} losses in {formatDistance(event.startTime, event.endTime)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(event.startTime, "MMM d, HH:mm")} – {format(event.endTime, "HH:mm")}
                    <span className="mx-1.5">·</span>
                    {event.games.length} games total
                  </div>
                  <div className="flex gap-0.5 mt-2 flex-wrap">
                    {event.games.map((g) => (
                      <ResultBadge key={g.id} result={g.myResult} compact />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* Session clusters */}
      <ChartCard title="Recent Sessions" description="Games clustered by 30-min gaps">
        <div className="flex flex-col gap-2">
          {sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">No sessions found</div>
          ) : (
            sessions.map((session, i) => {
              const total = session.games.length;
              const winPct = total > 0 ? Math.round((session.wins / total) * 100) : 0;
              return (
                <div
                  key={i}
                  className="rounded-md border border-border bg-secondary/30 p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">
                      {format(session.start, "MMM d, HH:mm")}
                      {" – "}
                      {format(session.end, "HH:mm")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {total} games
                      <span className="mx-1.5">·</span>
                      {winPct}% win rate
                    </div>
                    <div className="flex gap-0.5 mt-1.5 flex-wrap">
                      {session.games.map((g) => (
                        <ResultBadge key={g.id} result={g.myResult} compact />
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <div className="text-[oklch(0.65_0.18_142)]">{session.wins}W</div>
                    <div className="text-[oklch(0.70_0.12_60)]">{session.draws}D</div>
                    <div className="text-[oklch(0.55_0.22_25)]">{session.losses}L</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ChartCard>
    </div>
  );
}
