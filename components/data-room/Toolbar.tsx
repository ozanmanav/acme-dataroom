"use client";

import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { ToolbarPresenter } from "./toolbar-presenter";

export function Toolbar() {
  const { searchItems, clearSearch } = useDataRoomStore();

  const { viewMode, setViewMode, setShowFileUpload, setShowCreateFolder } =
    useUIStore();

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchItems(query);
    } else {
      clearSearch();
    }
  };

  return (
    <ToolbarPresenter
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onCreateFolder={() => setShowCreateFolder(true)}
      onUploadFiles={() => setShowFileUpload(true)}
      onSearch={handleSearch}
    />
  );
}
