import { useState, useCallback } from 'react';
import { FileItem, FolderItem, BreadcrumbItem } from '@/types';
import { DataRoomService, SearchResults, FolderContents } from '@/services/dataRoomService';

export interface DataRoomState {
  // Data
  folders: FolderItem[];
  files: FileItem[];
  breadcrumbs: BreadcrumbItem[];
  currentFolderId: string | null;
  searchResults: SearchResults | null;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // UI states
  viewMode: 'grid' | 'list';
  showFileUpload: boolean;
  showCreateFolder: boolean;
  renameItem: { item: FolderItem | FileItem; type: 'folder' | 'file' } | null;
  deleteItem: { item: FolderItem | FileItem; type: 'folder' | 'file' } | null;
  previewFile: FileItem | null;
}

const initialState: DataRoomState = {
  folders: [],
  files: [],
  breadcrumbs: [],
  currentFolderId: null,
  searchResults: null,
  isLoading: false,
  isSearching: false,
  isUploading: false,
  isDeleting: false,
  error: null,
  viewMode: 'grid',
  showFileUpload: false,
  showCreateFolder: false,
  renameItem: null,
  deleteItem: null,
  previewFile: null,
};

export const useDataRoomState = () => {
  const [state, setState] = useState<DataRoomState>(initialState);

  // Generic state updater
  const updateState = useCallback((updates: Partial<DataRoomState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Load folder contents
  const loadFolderContents = useCallback(async (folderId: string | null) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const result = await DataRoomService.loadFolderContents(folderId);
      
      if (result.success && result.data) {
        updateState({
          folders: result.data.folders,
          files: result.data.files,
          breadcrumbs: result.data.breadcrumbs,
          currentFolderId: folderId,
          searchResults: null, // Clear search when loading folder
          isLoading: false
        });
      } else {
        updateState({
          error: result.error || 'Failed to load folder contents',
          isLoading: false
        });
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        isLoading: false
      });
    }
  }, [updateState]);

  // Search items
  const searchItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      updateState({ searchResults: null });
      return;
    }

    updateState({ isSearching: true, error: null });
    
    try {
      const result = await DataRoomService.searchItems(query);
      
      if (result.success && result.data) {
        updateState({
          searchResults: result.data,
          isSearching: false
        });
      } else {
        updateState({
          error: result.error || 'Search failed',
          isSearching: false
        });
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Search failed',
        isSearching: false
      });
    }
  }, [updateState]);

  // Clear search
  const clearSearch = useCallback(() => {
    updateState({ searchResults: null });
  }, [updateState]);

  // Create folder
  const createFolder = useCallback(async (name: string) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const result = await DataRoomService.createFolder(name, state.currentFolderId);
      
      if (result.success) {
        // Reload current folder to show new folder
        await loadFolderContents(state.currentFolderId);
        updateState({ showCreateFolder: false });
      } else {
        updateState({
          error: result.error || 'Failed to create folder',
          isLoading: false
        });
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to create folder',
        isLoading: false
      });
    }
  }, [state.currentFolderId, loadFolderContents, updateState]);

  // Upload files
  const uploadFiles = useCallback(async (files: File[]) => {
    updateState({ isUploading: true, error: null });
    
    try {
      const existingNames = DataRoomService.getExistingNames(state.folders, state.files);
      const result = await DataRoomService.uploadFiles(files, state.currentFolderId, existingNames);
      
      if (result.success) {
        // Reload current folder to show new files
        await loadFolderContents(state.currentFolderId);
        updateState({ showFileUpload: false, isUploading: false });
      } else {
        updateState({
          error: result.error || 'Failed to upload files',
          isUploading: false
        });
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to upload files',
        isUploading: false
      });
    }
  }, [state.folders, state.files, state.currentFolderId, loadFolderContents, updateState]);

  // Rename item
  const renameItem = useCallback(async (newName: string) => {
    if (!state.renameItem) return;

    updateState({ isLoading: true, error: null });
    
    try {
      const { item, type } = state.renameItem;
      const result = type === 'folder' 
        ? await DataRoomService.renameFolder(item.id, newName)
        : await DataRoomService.renameFile(item.id, newName);
      
      if (result.success) {
        // Reload current folder to show updated name
        await loadFolderContents(state.currentFolderId);
        updateState({ renameItem: null });
      } else {
        updateState({
          error: result.error || `Failed to rename ${type}`,
          isLoading: false
        });
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to rename item',
        isLoading: false
      });
    }
  }, [state.renameItem, state.currentFolderId, loadFolderContents, updateState]);

  // Delete item
  const deleteItem = useCallback(async () => {
    if (!state.deleteItem) return;

    updateState({ isDeleting: true, error: null });
    
    try {
      const { item, type } = state.deleteItem;
      const result = type === 'folder' 
        ? await DataRoomService.deleteFolder(item.id)
        : await DataRoomService.deleteFile(item.id);
      
      if (result.success) {
        // Reload current folder to remove deleted item
        await loadFolderContents(state.currentFolderId);
        updateState({ deleteItem: null, isDeleting: false });
      } else {
        updateState({
          error: result.error || `Failed to delete ${type}`,
          isDeleting: false
        });
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to delete item',
        isDeleting: false
      });
    }
  }, [state.deleteItem, state.currentFolderId, loadFolderContents, updateState]);

  // Navigate to folder
  const navigateToFolder = useCallback(async (folderId: string | null) => {
    await loadFolderContents(folderId);
  }, [loadFolderContents]);

  // Get display data (search results or current folder data)
  const getDisplayData = useCallback(() => {
    if (state.searchResults) {
      return {
        folders: state.searchResults.folders,
        files: state.searchResults.files
      };
    }
    return {
      folders: state.folders,
      files: state.files
    };
  }, [state.searchResults, state.folders, state.files]);

  // Get existing names for validation
  const getExistingNames = useCallback(() => {
    return DataRoomService.getExistingNames(state.folders, state.files);
  }, [state.folders, state.files]);

  return {
    // State
    state,
    
    // Computed values
    displayData: getDisplayData(),
    existingNames: getExistingNames(),
    
    // Actions
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
  };
};