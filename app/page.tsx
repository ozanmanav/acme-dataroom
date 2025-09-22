import { DataRoomShell } from "@/components/data-room/data-room-shell";
import { DataRoomPageClient } from "@/components/data-room/data-room-page-client";

export default async function DataRoomPage() {
  // Server component - SEO friendly, faster initial load
  // Initial data could be fetched here if needed for SSR

  return (
    <DataRoomShell>
      <DataRoomPageClient />
    </DataRoomShell>
  );
}
