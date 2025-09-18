"use client";

import { useEffect } from "react";
import { FileItem, FolderItem } from "@/types";
import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  generateUniqueFileName,
  readFileAsBase64,
  downloadFile,
} from "@/lib/utils-data-room";

// Components
import { NavigationBreadcrumb } from "@/components/data-room/NavigationBreadcrumb";
import { Toolbar } from "@/components/data-room/Toolbar";
import { FolderView } from "@/components/data-room/FolderView";
import { FileUpload } from "@/components/data-room/FileUpload";
import { CreateFolderModal } from "@/components/data-room/CreateFolderModal";
import { RenameModal } from "@/components/data-room/RenameModal";
import { DeleteConfirmModal } from "@/components/data-room/DeleteConfirmModal";
import { FilePreview } from "@/components/data-room/FilePreview";

export default function DataRoomPage() {
  // Data store
  const {
    folders,
    files,
    breadcrumbs,
    currentFolderId,
    searchResults: dataSearchResults,
    loadFolderContents,
    updateBreadcrumbs,
    createFile,
    updateFile,
    deleteFile,
    createFolder,
    updateFolder,
    deleteFolder,
    searchItems,
    clearSearch,
    setCurrentFolderId,
  } = useDataRoomStore();

  // UI store
  const {
    viewMode,
    showFileUpload,
    showCreateFolder,
    renameItem,
    deleteItem,
    previewFile,
    isDeleting,
    setViewMode,
    setShowFileUpload,
    setShowCreateFolder,
    setRenameItem,
    setDeleteItem,
    setPreviewFile,
    setIsDeleting,
  } = useUIStore();

  // Initialize on mount
  useEffect(() => {
    const initializeApp = async () => {
      await loadFolderContents(null);
      await updateBreadcrumbs(null);
    };
    initializeApp();
  }, [loadFolderContents, updateBreadcrumbs]);

  // Handle search
  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchItems(query);
    } else {
      clearSearch();
    }
  };

  // Handle navigation
  const handleNavigate = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
    updateBreadcrumbs(folderId);
  };

  // File operations
  const handleFileUpload = async (uploadFiles: File[]) => {
    const existingNames = files.map((f) => f.name);

    for (const file of uploadFiles) {
      try {
        const content = await readFileAsBase64(file);
        const uniqueName = generateUniqueFileName(file.name, existingNames);

        await createFile({
          name: uniqueName,
          type: "pdf",
          content,
          size: file.size,
          folderId: currentFolderId,
        });
        existingNames.push(uniqueName);
      } catch (error) {
        console.error("Failed to upload file:", file.name, error);
        throw error;
      }
    }
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolderId);
  };

  const handleRenameFolder = async (newName: string) => {
    if (!renameItem || renameItem.type !== "folder") return;

    await updateFolder(renameItem.item.id, { name: newName });
  };

  const handleRenameFile = async (newName: string) => {
    if (!renameItem || renameItem.type !== "file") return;

    await updateFile(renameItem.item.id, { name: newName });
  };

  const handleDeleteFolder = async () => {
    if (!deleteItem || deleteItem.type !== "folder") return;

    await deleteFolder(deleteItem.item.id);
  };

  const handleDeleteFile = async () => {
    if (!deleteItem || deleteItem.type !== "file") return;

    setIsDeleting(true);
    try {
      await deleteFile(deleteItem.item.id);
      setDeleteItem(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadFile = (file: FileItem) => {
    downloadFile(file.content, file.name);
  };

  // Get existing names for validation
  const getExistingNames = () => {
    return [...folders.map((f) => f.name), ...files.map((f) => f.name)];
  };

  // Display data - use search results if searching, otherwise use current folder data
  const displayFolders = dataSearchResults
    ? dataSearchResults.folders
    : folders;
  const displayFiles = dataSearchResults ? dataSearchResults.files : files;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto bg-white shadow-xs">
        {/* Navigation */}
        <NavigationBreadcrumb path={breadcrumbs} onNavigate={handleNavigate} />

        {/* Toolbar */}
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateFolder={() => setShowCreateFolder(true)}
          onUploadFiles={() => setShowFileUpload(true)}
          onSearch={handleSearch}
        />

        {/* Main Content */}
        <div className="min-h-[calc(100vh-200px)]">
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
            onRenameFile={(file) => setRenameItem({ item: file, type: "file" })}
            onDeleteFile={(file) => setDeleteItem({ item: file, type: "file" })}
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
          onRename={
            renameItem.type === "folder" ? handleRenameFolder : handleRenameFile
          }
          onClose={() => setRenameItem(null)}
          existingNames={getExistingNames()}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          itemName={deleteItem.item.name}
          itemType={deleteItem.type}
          hasChildren={false}
          childrenCount={0}
          onConfirm={
            deleteItem.type === "folder" ? handleDeleteFolder : handleDeleteFile
          }
          onClose={() => setDeleteItem(null)}
          isDeleting={isDeleting}
        />
      )}

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
