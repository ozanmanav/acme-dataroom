"use client";

import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useEffect } from "react";

// Component imports
import { ErrorBoundary } from "@/components/common/error-boundary";
import { FullPageLoader } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/common/error-alert";
import { NavigationBreadcrumb } from "@/components/data-room/navigation-breadcrumb";
import { FolderView } from "@/components/data-room/folder-view";
import { ActionToolbar } from "@/components/data-room/action-toolbar";
import { DataRoomModals } from "@/components/data-room/data-room-modals";

export function DataRoomPageClient() {
  const { getDisplayData, isLoading, error, clearError, loadFolderContents } =
    useDataRoomStore();

  const { folders: displayFolders, files: displayFiles } = getDisplayData();

  // Initial load
  useEffect(() => {
    loadFolderContents(null);
  }, [loadFolderContents]);

  // Show full page loader on initial load
  if (isLoading && displayFolders.length === 0 && displayFiles.length === 0) {
    return <FullPageLoader text="Data Room yükleniyor..." />;
  }

  return (
    <ErrorBoundary>
      {/* Error Alert */}
      {error && (
        <div className="p-4">
          <ErrorAlert error={error} onClose={clearError} />
        </div>
      )}

      {/* Navigation */}
      <NavigationBreadcrumb />

      {/* Toolbar */}
      <ActionToolbar />

      {/* Main Content */}
      <FolderView />

      {/* All Modals */}
      <DataRoomModals />
    </ErrorBoundary>
  );
}
