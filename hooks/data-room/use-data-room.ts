import { useEffect } from "react";
import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useUIStore } from "@/lib/stores/ui-store";

export const useDataRoom = () => {
  // Data store
  const {
    folders,
    files,
    breadcrumbs,
    currentFolderId,
    isLoading,
    isSearching,
    isUploading,
    error,
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
    uploadFiles,
    getDisplayData,
    getExistingNames,
    clearError,
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

  // Get display data using the store's computed method
  const { folders: displayFolders, files: displayFiles } = getDisplayData();

  return {
    // Data
    folders,
    files,
    breadcrumbs,
    currentFolderId,
    displayFolders,
    displayFiles,

    // Loading states
    isLoading,
    isSearching,
    isUploading,
    error,

    // UI State
    viewMode,
    showFileUpload,
    showCreateFolder,
    renameItem,
    deleteItem,
    previewFile,
    isDeleting,

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
    createFile,
    updateFile,
    deleteFile,
    createFolder,
    updateFolder,
    deleteFolder,
    searchItems,
    clearSearch,
    setCurrentFolderId,
    uploadFiles,

    // Utilities
    getExistingNames,
  };
};
