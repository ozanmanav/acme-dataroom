"use client";

import { FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/forms/search-bar";
import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useModalActions } from "@/hooks/use-modal-router";

export function Toolbar() {
  const { searchItems, clearSearch } = useDataRoomStore();
  const { openFileUpload, openCreateFolder } = useModalActions();

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchItems(query);
    } else {
      clearSearch();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Left side - Search */}
      <div className="flex-1 max-w-md">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Action Buttons */}
        <Button
          onClick={openCreateFolder}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <FolderPlus size={16} />
          <span>New Folder</span>
        </Button>

        <Button
          onClick={openFileUpload}
          size="sm"
          className="flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>Upload</span>
        </Button>
      </div>
    </div>
  );
}
