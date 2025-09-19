"use client";

import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { downloadFile } from "@/lib/utils-data-room";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FolderViewPresenter } from "./folder-view-presenter";

export function FolderView() {
  const {
    getDisplayData,
    setCurrentFolderId,
    loadFolderContents,
    updateBreadcrumbs,
    isLoading,
  } = useDataRoomStore();
  const { viewMode, setPreviewFile, setRenameItem, setDeleteItem } =
    useUIStore();

  const { folders: displayFolders, files: displayFiles } = getDisplayData();

  const handleNavigate = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
    await updateBreadcrumbs(folderId);
  };

  const handleDownloadFile = (file: any) => {
    downloadFile(file.content, file.name);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner size="lg" text="Yükleniyor..." />
        </div>
      )}

      <FolderViewPresenter
        folders={displayFolders}
        files={displayFiles}
        viewMode={viewMode}
        onFolderClick={handleNavigate}
        onFileClick={setPreviewFile}
        onRenameFolder={(folder) =>
          setRenameItem({ item: folder, type: "folder" })
        }
        onDeleteFolder={(folder) =>
          setDeleteItem({ item: folder, type: "folder" })
        }
        onRenameFile={(file) => setRenameItem({ item: file, type: "file" })}
        onDeleteFile={(file) => setDeleteItem({ item: file, type: "file" })}
        onDownloadFile={handleDownloadFile}
      />
    </div>
  );
}
