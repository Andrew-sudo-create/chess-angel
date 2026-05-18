import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { StreaksClient } from "@/components/streaks/StreaksClient";

export default function StreaksPage() {
  return (
    <AppShell>
      <PageHeader
        title="Streaks & Tilt"
        description="Win/loss streaks, session clusters, and tilt detection"
      />
      <StreaksClient />
    </AppShell>
  );
}
