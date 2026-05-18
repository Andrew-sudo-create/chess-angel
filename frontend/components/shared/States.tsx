import { cn } from "@/lib/utils";
import { Crown, AlertCircle, Inbox } from "lucide-react";

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function EmptyState({ message = "No data found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Inbox className="w-8 h-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function MockDataBanner() {
  return (
    <div className="flex items-center gap-2 px-4 md:px-6 py-2 bg-[oklch(0.70_0.12_60)]/10 border-b border-[oklch(0.70_0.12_60)]/30 text-xs text-[oklch(0.70_0.12_60)]">
      <Crown className="w-3.5 h-3.5 shrink-0" />
      <span>
        Using mock data. Place your{" "}
        <code className="font-mono bg-[oklch(0.70_0.12_60)]/20 px-1 rounded">
          games.json
        </code>{" "}
        in <code className="font-mono bg-[oklch(0.70_0.12_60)]/20 px-1 rounded">/public/data/</code>{" "}
        to load real data.
      </span>
    </div>
  );
}
