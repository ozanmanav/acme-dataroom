"use client";

import { useDataRoom } from "@/hooks/data-room/use-data-room";
import { downloadFile } from "@/lib/utils-data-room";

// Component imports
import { ErrorBoundary } from "@/components/common/error-boundary";
import {
  LoadingSpinner,
  FullPageLoader,
} from "@/components/common/loading-spinner";
import { ErrorAlert } from "@/components/common/error-alert";
import { NavigationBreadcrumb } from "@/components/data-room/navigation-breadcrumb";
import { FolderView } from "@/components/data-room/folder-view";
import { FileUpload } from "@/components/forms/file-upload";
import { CreateFolderModal } from "@/components/modals/create-folder-modal";
import { RenameModal } from "@/components/modals/rename-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { FilePreview } from "@/components/data-room/file-preview";
import { Toolbar } from "@/components/data-room/toolbar";

export default function DataRoomPage() {
  const {
    // Data
    displayFolders,
    displayFiles,
    breadcrumbs,
    currentFolderId,

    // Loading states
    isLoading,
    error,

    // UI State
    viewMode,
    showFileUpload,
    showCreateFolder,
    renameItem,
    deleteItem,
    previewFile,

    // Actions
    setViewMode,
    setShowFileUpload,
    setShowCreateFolder,
    setRenameItem,
    setDeleteItem,
    setPreviewFile,
    setIsDeleting,
    clearError,

    // Data Actions
    loadFolderContents,
    updateBreadcrumbs,
    searchItems,
    clearSearch,
    createFolder,
    uploadFiles,
    updateFolder,
    updateFile,
    deleteFolder,
    deleteFile,
    setCurrentFolderId,

    // Utilities
    getExistingNames,
  } = useDataRoom();

  // Event handlers
  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchItems(query);
    } else {
      clearSearch();
    }
  };

  const handleNavigate = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
    await updateBreadcrumbs(folderId);
  };

  const handleFileUpload = async (files: File[]) => {
    await uploadFiles(files);
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolderId);
  };

  const handleRename = async (newName: string) => {
    if (!renameItem) return;

    if (renameItem.type === "folder") {
      await updateFolder(renameItem.item.id, { name: newName });
    } else {
      await updateFile(renameItem.item.id, { name: newName });
    }
    setRenameItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      if (deleteItem.type === "folder") {
        await deleteFolder(deleteItem.item.id);
      } else {
        await deleteFile(deleteItem.item.id);
      }
      setDeleteItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadFile = (file: any) => {
    downloadFile(file.content, file.name);
  };

  // Show full page loader on initial load
  if (isLoading && displayFolders.length === 0 && displayFiles.length === 0) {
    return <FullPageLoader text="Data Room yükleniyor..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto bg-white shadow-xs">
          {/* Error Alert */}
          {error && (
            <div className="p-4">
              <ErrorAlert error={error} onClose={clearError} />
            </div>
          )}

          {/* Navigation */}
          <NavigationBreadcrumb
            path={breadcrumbs}
            onNavigate={handleNavigate}
          />

          {/* Toolbar */}
          <Toolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateFolder={() => setShowCreateFolder(true)}
            onUploadFiles={() => setShowFileUpload(true)}
            onSearch={handleSearch}
          />

          {/* Main Content */}
          <div className="min-h-[calc(100vh-200px)] relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <LoadingSpinner size="lg" text="Yükleniyor..." />
              </div>
            )}

            <FolderView
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
              onRenameFile={(file) =>
                setRenameItem({ item: file, type: "file" })
              }
              onDeleteFile={(file) =>
                setDeleteItem({ item: file, type: "file" })
              }
              onDownloadFile={handleDownloadFile}
            />
          </div>
        </div>

        {/* Modals */}
        {showFileUpload && (
          <FileUpload
            onUpload={handleFileUpload}
            onClose={() => setShowFileUpload(false)}
          />
        )}

        {showCreateFolder && (
          <CreateFolderModal
            onCreateFolder={handleCreateFolder}
            onClose={() => setShowCreateFolder(false)}
            existingNames={getExistingNames()}
          />
        )}

        {renameItem && (
          <RenameModal
            currentName={renameItem.item.name}
            itemType={renameItem.type}
            onRename={handleRename}
            onClose={() => setRenameItem(null)}
            existingNames={getExistingNames()}
          />
        )}

        {deleteItem && (
          <DeleteConfirmModal
            itemName={deleteItem.item.name}
            itemType={deleteItem.type}
            onConfirm={handleDelete}
            onClose={() => setDeleteItem(null)}
          />
        )}

        {previewFile && (
          <FilePreview
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
