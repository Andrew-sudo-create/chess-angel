"use client";

import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import { useChessData, useSettings } from "@/lib/use-chess-data";
import { LoadingState, MockDataBanner } from "@/components/shared/States";
import { FilterBar, type GameFilters } from "./FilterBar";
import { GamesTable } from "./GamesTable";

const DEFAULT_FILTERS: GameFilters = {
  search: "",
  result: "all",
  timeClass: "all",
  rated: "all",
};

export function GamesClient() {
  const [settings] = useSettings();
  const { games, isLoading, isMock } = useChessData(settings.username);
  const [filters, setFilters] = useState<GameFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    const cutoff = subDays(new Date(), settings.dateRangeDays);
    return games
      .filter((g) => g.date >= cutoff)
      .filter((g) => {
        if (filters.result !== "all" && g.myResult !== filters.result) return false;
        if (filters.timeClass !== "all" && g.timeClass !== filters.timeClass) return false;
        if (filters.rated === "rated" && !g.rated) return false;
        if (filters.rated === "casual" && g.rated) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          if (
            !g.opponentUsername.toLowerCase().includes(q) &&
            !g.opening.toLowerCase().includes(q)
          ) return false;
        }
        return true;
      });
  }, [games, settings.dateRangeDays, filters]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isMock && <MockDataBanner />}
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="px-4 md:px-6 py-3 flex-1 min-h-0 flex flex-col">
        <div className="text-xs text-muted-foreground mb-2">
          {filtered.length} games
        </div>
        <GamesTable games={filtered} />
      </div>
    </div>
  );
}
