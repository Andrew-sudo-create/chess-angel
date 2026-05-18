import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface InsightBadgeProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantClasses = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-[oklch(0.65_0.18_142)]/15 text-[oklch(0.65_0.18_142)]",
  warning: "bg-[oklch(0.70_0.12_60)]/15 text-[oklch(0.70_0.12_60)]",
  danger: "bg-[oklch(0.55_0.22_25)]/15 text-[oklch(0.55_0.22_25)]",
};

export function InsightBadge({
  label,
  value,
  icon: Icon,
  variant = "default",
}: InsightBadgeProps) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-md bg-secondary/50 gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
            variantClasses[variant]
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
