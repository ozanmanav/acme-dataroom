import { create } from 'zustand';
import { FileItem, FolderItem } from '@/types';

interface UIState {
  // View state
  viewMode: 'grid' | 'list';
  
  // Modal states
  showFileUpload: boolean;
  showCreateFolder: boolean;
  renameItem: { item: FolderItem | FileItem; type: 'folder' | 'file' } | null;
  deleteItem: { item: FolderItem | FileItem; type: 'folder' | 'file' } | null;
  previewFile: FileItem | null;
  
  // Loading states
  isDeleting: boolean;
  
  // Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowFileUpload: (show: boolean) => void;
  setShowCreateFolder: (show: boolean) => void;
  setRenameItem: (item: { item: FolderItem | FileItem; type: 'folder' | 'file' } | null) => void;
  setDeleteItem: (item: { item: FolderItem | FileItem; type: 'folder' | 'file' } | null) => void;
  setPreviewFile: (file: FileItem | null) => void;
  setIsDeleting: (deleting: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  viewMode: 'grid',
  showFileUpload: false,
  showCreateFolder: false,
  renameItem: null,
  deleteItem: null,
  previewFile: null,
  isDeleting: false,
  
  // Actions
  setViewMode: (viewMode) => set({ viewMode }),
  setShowFileUpload: (showFileUpload) => set({ showFileUpload }),
  setShowCreateFolder: (showCreateFolder) => set({ showCreateFolder }),
  setRenameItem: (renameItem) => set({ renameItem }),
  setDeleteItem: (deleteItem) => set({ deleteItem }),
  setPreviewFile: (previewFile) => set({ previewFile }),
  setIsDeleting: (isDeleting) => set({ isDeleting })
}));