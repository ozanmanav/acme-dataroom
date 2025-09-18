"use client";

import { useEffect } from "react";
import { useDataRoomState } from "@/hooks/useDataRoomState";
import { downloadFile } from "@/lib/utils-data-room";

// Components
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner, FullPageLoader } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { NavigationBreadcrumb } from "@/components/data-room/NavigationBreadcrumb";
import { Toolbar } from "@/components/data-room/Toolbar";
import { FolderView } from "@/components/data-room/FolderView";
import { FileUpload } from "@/components/data-room/FileUpload";
import { CreateFolderModal } from "@/components/data-room/CreateFolderModal";
import { RenameModal } from "@/components/data-room/RenameModal";
import { DeleteConfirmModal } from "@/components/data-room/DeleteConfirmModal";
import { FilePreview } from "@/components/data-room/FilePreview";

export default function DataRoomPage() {
  const {
    state,
    displayData,
    existingNames,
    updateState,
    clearError,
    loadFolderContents,
    searchItems,
    clearSearch,
    createFolder,
    uploadFiles,
    renameItem,
    deleteItem,
    navigateToFolder,
  } = useDataRoomState();

  // Initialize on mount
  useEffect(() => {
    loadFolderContents(null);
  }, []);

  // Event handlers
  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchItems(query);
    } else {
      clearSearch();
    }
  };

  const handleNavigate = async (folderId: string | null) => {
    await navigateToFolder(folderId);
  };

  const handleFileUpload = async (files: File[]) => {
    await uploadFiles(files);
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name);
  };

  const handleRename = async (newName: string) => {
    await renameItem(newName);
  };

  const handleDelete = async () => {
    await deleteItem();
  };

  const handleDownloadFile = (file: any) => {
    downloadFile(file.content, file.name);
  };

  // Show full page loader on initial load
  if (state.isLoading && state.folders.length === 0 && state.files.length === 0) {
    return <FullPageLoader text="Data Room yükleniyor..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto bg-white shadow-xs">
          {/* Error Alert */}
          {state.error && (
            <div className="p-4">
              <ErrorAlert error={state.error} onClose={clearError} />
            </div>
          )}

          {/* Navigation */}
          <NavigationBreadcrumb 
            path={state.breadcrumbs} 
            onNavigate={handleNavigate} 
          />

          {/* Toolbar */}
          <Toolbar
            viewMode={state.viewMode}
            onViewModeChange={(mode) => updateState({ viewMode: mode })}
            onCreateFolder={() => updateState({ showCreateFolder: true })}
            onUploadFiles={() => updateState({ showFileUpload: true })}
            onSearch={handleSearch}
          />

          {/* Main Content */}
          <div className="min-h-[calc(100vh-200px)] relative">
            {state.isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <LoadingSpinner size="lg" text="Yükleniyor..." />
              </div>
            )}
            
            <FolderView
              folders={displayData.folders}
              files={displayData.files}
              viewMode={state.viewMode}
              onFolderClick={handleNavigate}
              onFileClick={(file) => updateState({ previewFile: file })}
              onRenameFolder={(folder) =>
                updateState({ renameItem: { item: folder, type: "folder" } })
              }
              onDeleteFolder={(folder) =>
                updateState({ deleteItem: { item: folder, type: "folder" } })
              }
              onRenameFile={(file) => 
                updateState({ renameItem: { item: file, type: "file" } })
              }
              onDeleteFile={(file) => 
                updateState({ deleteItem: { item: file, type: "file" } })
              }
              onDownloadFile={handleDownloadFile}
            />
          </div>
        </div>

        {/* Modals */}
        {state.showFileUpload && (
          <FileUpload
            onUpload={handleFileUpload}
            onClose={() => updateState({ showFileUpload: false })}
          />
        )}

        {state.showCreateFolder && (
          <CreateFolderModal
            onCreateFolder={handleCreateFolder}
            onClose={() => updateState({ showCreateFolder: false })}
            existingNames={existingNames}
          />
        )}

        {state.renameItem && (
          <RenameModal
            currentName={state.renameItem.item.name}
            itemType={state.renameItem.type}
            onRename={handleRename}
            onClose={() => updateState({ renameItem: null })}
            existingNames={existingNames}
          />
        )}

        {state.deleteItem && (
          <DeleteConfirmModal
            itemName={state.deleteItem.item.name}
            itemType={state.deleteItem.type}
            hasChildren={false}
            childrenCount={0}
            onConfirm={handleDelete}
            onClose={() => updateState({ deleteItem: null })}
            isDeleting={state.isDeleting}
          />
        )}

        {state.previewFile && (
          <FilePreview 
            file={state.previewFile} 
            onClose={() => updateState({ previewFile: null })} 
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
