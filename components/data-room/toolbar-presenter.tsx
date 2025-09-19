"use client";

import { Grid, List, FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/forms/search-bar";

interface ToolbarPresenterProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export function ToolbarPresenter({
  viewMode,
  onViewModeChange,
  onCreateFolder,
  onUploadFiles,
  onSearch,
  disabled = false,
}: ToolbarPresenterProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Left side - Search */}
      <div className="flex-1 max-w-md">
        <SearchBar onSearch={onSearch} disabled={disabled} />
      </div>

      {/* Right side - Actions and View Mode */}
      <div className="flex items-center space-x-3">
        {/* Action Buttons */}
        <Button
          onClick={onCreateFolder}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <FolderPlus size={16} />
          <span>New Folder</span>
        </Button>

        <Button
          onClick={onUploadFiles}
          disabled={disabled}
          size="sm"
          className="flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>Upload</span>
        </Button>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <Button
            onClick={() => onViewModeChange("grid")}
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-0"
          >
            <Grid size={16} />
          </Button>
          <Button
            onClick={() => onViewModeChange("list")}
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-0"
          >
            <List size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
