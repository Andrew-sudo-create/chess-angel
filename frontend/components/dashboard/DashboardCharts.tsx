"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Game } from "@/lib/types";
import {
  getDailyStats,
  getRatingTrendByTimeClass,
  computeOpeningStats,
} from "@/lib/chess-utils";
import { ChartCard } from "./ChartCard";

const WIN_COLOR = "oklch(0.65 0.18 142)";
const DRAW_COLOR = "oklch(0.70 0.12 60)";
const LOSS_COLOR = "oklch(0.55 0.22 25)";
const BULLET_COLOR = "oklch(0.65 0.18 255)";
const BLITZ_COLOR = "oklch(0.70 0.15 300)";
const RAPID_COLOR = "oklch(0.70 0.12 60)";

const tooltipStyle = {
  backgroundColor: "oklch(0.16 0 0)",
  border: "1px solid oklch(0.25 0 0)",
  borderRadius: "6px",
  fontSize: "12px",
  color: "oklch(0.94 0 0)",
};

interface Props {
  games: Game[];
  animate?: boolean;
}

export function DailyGamesChart({ games, animate = true }: Props) {
  const data = getDailyStats(games, 30);
  return (
    <ChartCard
      title="Games per Day"
      description="Last 30 days — total games"
      className="col-span-full lg:col-span-2"
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.18 0 0)" }} />
          <Bar dataKey="total" fill={BULLET_COLOR} radius={[2, 2, 0, 0]} isAnimationActive={animate} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function WinDrawLossChart({ games, animate = true }: Props) {
  const data = getDailyStats(games, 30);
  return (
    <ChartCard
      title="Results per Day"
      description="Win / Draw / Loss stacked"
      className="col-span-full lg:col-span-2"
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.18 0 0)" }} />
          <Legend
            wrapperStyle={{ fontSize: 10, color: "oklch(0.52 0 0)" }}
            iconType="square"
            iconSize={8}
          />
          <Bar dataKey="wins" name="Win" stackId="a" fill={WIN_COLOR} isAnimationActive={animate} />
          <Bar dataKey="draws" name="Draw" stackId="a" fill={DRAW_COLOR} isAnimationActive={animate} />
          <Bar dataKey="losses" name="Loss" stackId="a" fill={LOSS_COLOR} radius={[2, 2, 0, 0]} isAnimationActive={animate} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RatingTrendChart({ games, animate = true }: Props) {
  const bullet = getRatingTrendByTimeClass(games, "bullet").slice(-40);
  const blitz = getRatingTrendByTimeClass(games, "blitz").slice(-40);
  const rapid = getRatingTrendByTimeClass(games, "rapid").slice(-40);

  // Merge all dates
  const allDates = Array.from(
    new Set([
      ...bullet.map((d) => d.date),
      ...blitz.map((d) => d.date),
      ...rapid.map((d) => d.date),
    ])
  ).sort();

  const data = allDates.map((date) => ({
    date,
    bullet: bullet.find((d) => d.date === date)?.rating,
    blitz: blitz.find((d) => d.date === date)?.rating,
    rapid: rapid.find((d) => d.date === date)?.rating,
  }));

  return (
    <ChartCard
      title="Rating Trend"
      description="By time control"
      className="col-span-full lg:col-span-2"
    >
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={36}
            domain={["auto", "auto"]}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: 10, color: "oklch(0.52 0 0)" }}
            iconType="plainline"
            iconSize={12}
          />
          <Line type="monotone" dataKey="bullet" name="Bullet" stroke={BULLET_COLOR} dot={false} strokeWidth={1.5} connectNulls isAnimationActive={animate} />
          <Line type="monotone" dataKey="blitz" name="Blitz" stroke={BLITZ_COLOR} dot={false} strokeWidth={1.5} connectNulls isAnimationActive={animate} />
          <Line type="monotone" dataKey="rapid" name="Rapid" stroke={RAPID_COLOR} dot={false} strokeWidth={1.5} connectNulls isAnimationActive={animate} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OpeningPerformanceChart({ games, animate = true }: Props) {
  const stats = computeOpeningStats(games).slice(0, 10);
  const data = stats.map((s) => ({
    name: s.name.length > 18 ? s.name.slice(0, 18) + "…" : s.name,
    games: s.games,
    winRate: Math.round(s.winRate),
  }));

  return (
    <ChartCard
      title="Opening Performance"
      description="Top 10 by games played"
      className="col-span-full"
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="games" name="Games" fill={BULLET_COLOR} radius={[0, 2, 2, 0]} isAnimationActive={animate} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
