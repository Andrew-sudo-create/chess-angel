import { cn } from "@/lib/utils";
import type { GameResult } from "@/lib/types";

interface ResultBadgeProps {
  result: GameResult;
  compact?: boolean;
}

const labels: Record<GameResult, string> = {
  win: "W",
  draw: "D",
  loss: "L",
  unknown: "?",
};

const classes: Record<GameResult, string> = {
  win: "bg-[oklch(0.65_0.18_142)]/20 text-[oklch(0.65_0.18_142)] border-[oklch(0.65_0.18_142)]/30",
  draw: "bg-[oklch(0.70_0.12_60)]/20 text-[oklch(0.70_0.12_60)] border-[oklch(0.70_0.12_60)]/30",
  loss: "bg-[oklch(0.55_0.22_25)]/20 text-[oklch(0.55_0.22_25)] border-[oklch(0.55_0.22_25)]/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export function ResultBadge({ result, compact = false }: ResultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border font-semibold tabular-nums",
        compact ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs",
        classes[result]
      )}
    >
      {labels[result]}
    </span>
  );
}
