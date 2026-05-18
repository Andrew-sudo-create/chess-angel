"use client";

import { useSettings } from "@/lib/use-chess-data";
import { cn } from "@/lib/utils";
import { User, Calendar, Zap, LayoutGrid, FolderOpen } from "lucide-react";

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: typeof User;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-secondary"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

const DATE_RANGE_OPTIONS = [7, 14, 30, 60, 90, 180, 365];

export function SettingsClient() {
  const [settings, updateSettings] = useSettings();

  return (
    <div className="px-4 md:px-6 py-4 max-w-lg">
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Profile
          </h2>
        </div>
        <div className="px-4">
          <SettingRow icon={User} label="Chess.com Username" description="Used to identify your games">
            <input
              type="text"
              value={settings.username}
              onChange={(e) => updateSettings({ username: e.target.value })}
              className="w-36 px-2.5 py-1.5 rounded-md bg-input text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="username"
            />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border mt-4">
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Display
          </h2>
        </div>
        <div className="px-4">
          <SettingRow icon={Calendar} label="Default Date Range" description="Filter period across all pages">
            <select
              value={settings.dateRangeDays}
              onChange={(e) => updateSettings({ dateRangeDays: Number(e.target.value) })}
              className="px-2.5 py-1.5 rounded-md bg-input text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DATE_RANGE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  Last {d} days
                </option>
              ))}
            </select>
          </SettingRow>
          <SettingRow icon={Zap} label="Animate Charts" description="Enable chart entry animations">
            <Toggle
              checked={settings.animateCharts}
              onChange={(v) => updateSettings({ animateCharts: v })}
              label="Toggle chart animations"
            />
          </SettingRow>
          <SettingRow icon={LayoutGrid} label="Compact Mode" description="Reduce padding and card spacing">
            <Toggle
              checked={settings.compactMode}
              onChange={(v) => updateSettings({ compactMode: v })}
              label="Toggle compact mode"
            />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border mt-4">
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Data
          </h2>
        </div>
        <div className="px-4">
          <SettingRow
            icon={FolderOpen}
            label="Data Files"
            description="Place JSON files in /public/data/"
          >
            <div className="text-xs text-muted-foreground text-right">
              <code className="bg-secondary px-1.5 py-0.5 rounded font-mono">games.json</code>
            </div>
          </SettingRow>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Data Format</h2>
        <p className="text-xs text-muted-foreground mb-2">
          Place your <code className="bg-secondary px-1 rounded font-mono">games.json</code> file in the{" "}
          <code className="bg-secondary px-1 rounded font-mono">/public/data/</code> directory. Each game object supports:
        </p>
        <pre className="text-xs bg-secondary rounded-md p-3 overflow-x-auto text-muted-foreground font-mono leading-relaxed">
{`{
  "url": "https://chess.com/game/...",
  "end_time": 1700000000,
  "time_class": "blitz",
  "time_control": "300",
  "rated": true,
  "eco": "B20",
  "opening": "Sicilian Defense",
  "white": { "username": "...", "result": "win", "rating": 1500 },
  "black": { "username": "...", "result": "resigned", "rating": 1480 }
}`}
        </pre>
      </div>
    </div>
  );
}
