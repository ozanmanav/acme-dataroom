"use client";

import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { NavigationBreadcrumbPresenter } from "./navigation-breadcrumb-presenter";

export function NavigationBreadcrumb() {
  const {
    breadcrumbs,
    setCurrentFolderId,
    loadFolderContents,
    updateBreadcrumbs,
  } = useDataRoomStore();

  const handleNavigate = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
    await updateBreadcrumbs(folderId);
  };

  return (
    <NavigationBreadcrumbPresenter
      path={breadcrumbs}
      onNavigate={handleNavigate}
    />
  );
}
