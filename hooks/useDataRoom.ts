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

  // Display data - use search results if searching, otherwise use current folder data
  const displayFolders = dataSearchResults
    ? dataSearchResults.folders
    : folders;
  const displayFiles = dataSearchResults ? dataSearchResults.files : files;

  // Get existing names for validation
  const getExistingNames = () => {
    return [...folders.map((f) => f.name), ...files.map((f) => f.name)];
  };

  return {
    // Data
    folders,
    files,
    breadcrumbs,
    currentFolderId,
    displayFolders,
    displayFiles,

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

    // Utilities
    getExistingNames,
  };
};
