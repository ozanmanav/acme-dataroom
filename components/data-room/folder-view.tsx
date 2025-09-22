"use client";
import { Folder, FileText, Download, Edit2, Trash2 } from "lucide-react";
import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useModalActions } from "@/hooks/use-modal-router";
import { downloadFile } from "@/lib/utils-data-room";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ContextMenu as UIContextMenu,
  ContextMenuTrigger as UIContextMenuTrigger,
  ContextMenuContent as UIContextMenuContent,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator as UIContextMenuSeparator,
} from "@/components/ui/context-menu";
import { FolderItem, FileItem } from "@/types";

export function FolderView() {
  const {
    getDisplayData,
    setCurrentFolderId,
    loadFolderContents,
    updateBreadcrumbs,
    isLoading,
  } = useDataRoomStore();
  const { openRename, openDelete, openPreview } = useModalActions();

  const { folders: displayFolders, files: displayFiles } = getDisplayData();

  const handleNavigate = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
    await updateBreadcrumbs(folderId);
  };

  const handleDownloadFile = (file: any) => {
    downloadFile(file.content, file.name);
  };

  // Context menu actions (used with shadcn/ui ContextMenu)
  const folderActions = (folder: FolderItem) => ({
    rename: () => openRename(folder, "folder"),
    del: () => openDelete(folder, "folder"),
  });

  const fileActions = (file: FileItem) => ({
    rename: () => openRename(file, "file"),
    download: () => handleDownloadFile(file),
    del: () => openDelete(file, "file"),
  });

  const handleItemClick = (
    item: FolderItem | FileItem,
    type: "folder" | "file"
  ) => {
    if (type === "folder") {
      handleNavigate((item as FolderItem).id);
    } else {
      openPreview(item as FileItem);
    }
  };

  const isEmpty = displayFolders.length === 0 && displayFiles.length === 0;

  return (
    <div className="min-h-[calc(100vh-200px)] relative">
      {isLoading ? (
        <LoadingState />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {displayFolders.map((folder) => (
              <GridItem
                key={folder.id}
                item={folder}
                type="folder"
                onItemClick={handleItemClick}
                actions={folderActions(folder)}
              />
            ))}
            {displayFiles.map((file) => (
              <GridItem
                key={file.id}
                item={file}
                type="file"
                onItemClick={handleItemClick}
                actions={fileActions(file)}
                showDownloadButton={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable context menu content for both folders and files
function ItemContextMenuContent({
  actions,
  showDownload = false,
}: {
  actions: { rename: () => void; del: () => void; download?: () => void };
  showDownload?: boolean;
}) {
  return (
    <>
      <UIContextMenuItem onClick={actions.rename}>
        <Edit2 size={16} /> Rename
      </UIContextMenuItem>
      {showDownload && actions.download && (
        <UIContextMenuItem onClick={actions.download}>
          <Download size={16} /> Download
        </UIContextMenuItem>
      )}
      <UIContextMenuSeparator />
      <UIContextMenuItem variant="destructive" onClick={actions.del}>
        <Trash2 size={16} /> Delete
      </UIContextMenuItem>
    </>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-96">
      <LoadingSpinner size="lg" text="Yükleniyor..." />
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Folder size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-gray-500">
          This folder is empty or no results match your search.
        </p>
      </div>
    </div>
  );
}

// Unified grid item component for both folders and files
function GridItem({
  item,
  type,
  onItemClick,
  actions,
  showDownloadButton = false,
}: {
  item: FolderItem | FileItem;
  type: "folder" | "file";
  onItemClick: (item: FolderItem | FileItem, type: "folder" | "file") => void;
  actions: { rename: () => void; del: () => void; download?: () => void };
  showDownloadButton?: boolean;
}) {
  const isFolder = type === "folder";
  const Icon = isFolder ? Folder : FileText;
  const iconColor = isFolder ? "text-blue-500" : "text-red-500";

  return (
    <UIContextMenu>
      <UIContextMenuTrigger asChild>
        <div
          className="relative flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
          onClick={() => onItemClick(item, type)}
        >
          <Icon size={48} className={`${iconColor} mb-2`} />
          <span
            className="text-sm text-center text-gray-700 truncate w-full"
            title={item.name}
          >
            {item.name}
          </span>
        </div>
      </UIContextMenuTrigger>

      <UIContextMenuContent className="w-56">
        <ItemContextMenuContent
          actions={actions}
          showDownload={showDownloadButton}
        />
      </UIContextMenuContent>
    </UIContextMenu>
  );
}
