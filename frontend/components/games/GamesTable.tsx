"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { Game } from "@/lib/types";
import { ResultBadge } from "@/components/shared/ResultBadge";
import { cn } from "@/lib/utils";

type SortKey = "date" | "opponent" | "result" | "myRating" | "opponentRating" | "ratingDelta" | "timeClass" | "opening";
type SortDir = "asc" | "desc";

interface GamesTableProps {
  games: Game[];
}

const PAGE_SIZE = 20;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 text-muted-foreground/50" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 text-primary" />
    : <ChevronDown className="w-3 h-3 text-primary" />;
}

export function GamesTable({ games }: GamesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Game | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(0);
  }

  const sorted = [...games].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "date": cmp = a.date.getTime() - b.date.getTime(); break;
      case "opponent": cmp = a.opponentUsername.localeCompare(b.opponentUsername); break;
      case "result": cmp = a.myResult.localeCompare(b.myResult); break;
      case "myRating": cmp = a.myRating - b.myRating; break;
      case "opponentRating": cmp = a.opponentRating - b.opponentRating; break;
      case "ratingDelta": cmp = a.ratingDelta - b.ratingDelta; break;
      case "timeClass": cmp = a.timeClass.localeCompare(b.timeClass); break;
      case "opening": cmp = a.opening.localeCompare(b.opening); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageGames = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const th = (label: string, key: SortKey, className?: string) => (
    <th
      key={key}
      className={cn(
        "px-3 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap",
        className
      )}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </th>
  );

  return (
    <div className="flex gap-3 overflow-hidden flex-1 min-h-0">
      {/* Table */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                {th("Date", "date")}
                {th("Opponent", "opponent")}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Color</th>
                {th("Result", "result")}
                {th("Opening", "opening", "hidden md:table-cell")}
                {th("Time", "timeClass", "hidden sm:table-cell")}
                {th("My Rating", "myRating", "hidden lg:table-cell")}
                {th("Opp Rating", "opponentRating", "hidden lg:table-cell")}
                {th("Δ Rating", "ratingDelta", "hidden md:table-cell")}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageGames.map((game) => (
                <tr
                  key={game.id}
                  onClick={() => setSelected(selected?.id === game.id ? null : game)}
                  className={cn(
                    "hover:bg-accent/50 cursor-pointer transition-colors",
                    selected?.id === game.id && "bg-accent/70"
                  )}
                >
                  <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {format(game.date, "MMM d, yy")}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium text-foreground max-w-[120px] truncate">
                    {game.opponentUsername}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">
                    {game.myColor}
                  </td>
                  <td className="px-3 py-2.5">
                    <ResultBadge result={game.myResult} compact />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[140px] truncate hidden md:table-cell">
                    {game.opening}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize hidden sm:table-cell">
                    {game.timeClass}
                  </td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-foreground hidden lg:table-cell">
                    {game.myRating}
                  </td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground hidden lg:table-cell">
                    {game.opponentRating}
                  </td>
                  <td className={cn(
                    "px-3 py-2.5 text-xs tabular-nums hidden md:table-cell",
                    game.ratingDelta > 0
                      ? "text-[oklch(0.65_0.18_142)]"
                      : game.ratingDelta < 0
                      ? "text-[oklch(0.55_0.22_25)]"
                      : "text-muted-foreground"
                  )}>
                    {game.ratingDelta > 0 ? `+${game.ratingDelta}` : game.ratingDelta}
                  </td>
                  <td className="px-3 py-2.5">
                    {game.url && (
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Open game on Chess.com"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageGames.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No games match filters</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-border text-xs text-muted-foreground">
            <span>{sorted.length} games</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 rounded hover:bg-secondary disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <span className="px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 rounded hover:bg-secondary disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <aside className="w-72 shrink-0 border-l border-border bg-card rounded-r-lg overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Game Details</span>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          <dl className="flex flex-col gap-2 text-xs">
            {[
              ["Date", format(selected.date, "PPpp")],
              ["Opponent", selected.opponentUsername],
              ["Color", selected.myColor],
              ["Result", selected.myResult],
              ["Opening", selected.opening],
              ["ECO", selected.eco],
              ["Time Class", selected.timeClass],
              ["Time Control", selected.timeControl],
              ["My Rating", selected.myRating],
              ["Opp Rating", selected.opponentRating],
              ["Rated", selected.rated ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-foreground font-medium text-right capitalize truncate max-w-[140px]">{String(v)}</dd>
              </div>
            ))}
          </dl>
          {selected.url && (
            <a
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Chess.com
            </a>
          )}
        </aside>
      )}
    </div>
  );
}
