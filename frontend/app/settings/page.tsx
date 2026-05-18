import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="Configure your preferences and data source"
      />
      <SettingsClient />
    </AppShell>
  );
}
