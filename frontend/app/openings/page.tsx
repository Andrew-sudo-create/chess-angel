import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { OpeningsClient } from "@/components/openings/OpeningsClient";

export default function OpeningsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Opening Performance"
        description="Win rates, averages, and trends by opening"
      />
      <OpeningsClient />
    </AppShell>
  );
}
