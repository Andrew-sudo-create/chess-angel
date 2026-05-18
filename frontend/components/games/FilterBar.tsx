"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameFilters {
  search: string;
  result: "all" | "win" | "draw" | "loss";
  timeClass: "all" | "bullet" | "blitz" | "rapid" | "daily";
  rated: "all" | "rated" | "casual";
}

const DEFAULT_FILTERS: GameFilters = {
  search: "",
  result: "all",
  timeClass: "all",
  rated: "all",
};

interface FilterBarProps {
  filters: GameFilters;
  onChange: (f: GameFilters) => void;
}

type FilterChip<T extends string> = { value: T; label: string };

const RESULT_CHIPS: FilterChip<GameFilters["result"]>[] = [
  { value: "all", label: "All" },
  { value: "win", label: "Win" },
  { value: "draw", label: "Draw" },
  { value: "loss", label: "Loss" },
];

const TC_CHIPS: FilterChip<GameFilters["timeClass"]>[] = [
  { value: "all", label: "All" },
  { value: "bullet", label: "Bullet" },
  { value: "blitz", label: "Blitz" },
  { value: "rapid", label: "Rapid" },
  { value: "daily", label: "Daily" },
];

const RATED_CHIPS: FilterChip<GameFilters["rated"]>[] = [
  { value: "all", label: "All" },
  { value: "rated", label: "Rated" },
  { value: "casual", label: "Casual" },
];

function Chips<T extends string>({
  chips,
  value,
  onChange,
}: {
  chips: FilterChip<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {chips.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
            value === c.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const hasActive =
    filters.search !== "" ||
    filters.result !== "all" ||
    filters.timeClass !== "all" ||
    filters.rated !== "all";

  return (
    <div className="flex flex-col gap-3 px-4 md:px-6 py-3 border-b border-border">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search opponent or opening..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-8 pr-3 py-1.5 rounded-md bg-input text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Result</span>
          <Chips chips={RESULT_CHIPS} value={filters.result} onChange={(v) => onChange({ ...filters, result: v })} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Time</span>
          <Chips chips={TC_CHIPS} value={filters.timeClass} onChange={(v) => onChange({ ...filters, timeClass: v })} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Mode</span>
          <Chips chips={RATED_CHIPS} value={filters.rated} onChange={(v) => onChange({ ...filters, rated: v })} />
        </div>
        {hasActive && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
