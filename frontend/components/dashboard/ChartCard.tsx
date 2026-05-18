import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card flex flex-col",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}
