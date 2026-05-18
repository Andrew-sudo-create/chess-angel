import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { GamesClient } from "@/components/games/GamesClient";

export default function GamesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Game History"
        description="Browse, search, and filter all your games"
      />
      <GamesClient />
    </AppShell>
  );
}
