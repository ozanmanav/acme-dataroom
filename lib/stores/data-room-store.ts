import { create } from 'zustand';
import { FileItem, FolderItem, BreadcrumbItem } from '@/types';
import { storage } from '@/lib/storage';
import { generateUniqueFileName, readFileAsBase64 } from '@/lib/utils-data-room';

interface DataRoomState {
  // Data
  folders: FolderItem[];
  files: FileItem[];
  breadcrumbs: BreadcrumbItem[];
  currentFolderId: string | null;
  searchResults: { folders: FolderItem[]; files: FileItem[] } | null;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isUploading: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  setFolders: (folders: FolderItem[]) => void;
  setFiles: (files: FileItem[]) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setCurrentFolderId: (id: string | null) => void;
  setSearchResults: (results: { folders: FolderItem[]; files: FileItem[] } | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Data operations
  loadFolderContents: (folderId?: string | null) => Promise<void>;
  updateBreadcrumbs: (folderId?: string | null) => Promise<void>;
  searchItems: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // CRUD operations
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  updateFolder: (id: string, updates: Partial<FolderItem>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  createFile: (file: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFile: (id: string, updates: Partial<FileItem>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  
  // Computed values
  getDisplayData: () => { folders: FolderItem[]; files: FileItem[] };
  getExistingNames: () => string[];
}

export const useDataRoomStore = create<DataRoomState>((set, get) => ({
  // Initial state
  folders: [],
  files: [],
  breadcrumbs: [],
  currentFolderId: null,
  searchResults: null,
  isLoading: false,
  isSearching: false,
  isUploading: false,
  error: null,
  
  // Basic setters
  setFolders: (folders) => set({ folders }),
  setFiles: (files) => set({ files }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setCurrentFolderId: (currentFolderId) => set({ currentFolderId }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Load folder contents
  loadFolderContents: async (folderId) => {
    const { currentFolderId } = get();
    const targetFolderId = folderId !== undefined ? folderId : currentFolderId;
    
    const [folders, files] = await Promise.all([
      storage.getFoldersByParent(targetFolderId),
      storage.getFilesByFolder(targetFolderId)
    ]);
    
    set({ 
      folders, 
      files, 
      currentFolderId: targetFolderId,
      searchResults: null // Clear search when loading folder
    });
  },
  
  // Update breadcrumbs
  updateBreadcrumbs: async (folderId) => {
    const { currentFolderId } = get();
    const targetFolderId = folderId !== undefined ? folderId : currentFolderId;
    
    if (!targetFolderId) {
      set({ breadcrumbs: [] }); // Root seviyede breadcrumb yok
      return;
    }
    
    const folderPath = await storage.getFullPath(targetFolderId);
    const breadcrumbs: BreadcrumbItem[] = folderPath.map((folder: FolderItem) => ({
      id: folder.id,
      name: folder.name,
      path: `/${folder.name}` // Simplified path for now
    }));
    
    set({ breadcrumbs });
  },
  
  // Search functionality
  searchItems: async (query) => {
    const results = await storage.searchItems(query);
    set({ searchResults: results });
  },
  
  clearSearch: () => {
    set({ searchResults: null });
  },
  
  // CRUD operations
  createFolder: async (name, parentId) => {
    const { loadFolderContents, currentFolderId } = get();
    const targetParentId = parentId !== undefined ? parentId : currentFolderId;
    
    await storage.createFolder(name, targetParentId);
    await loadFolderContents();
  },
  
  updateFolder: async (id, updates) => {
    const { loadFolderContents } = get();
    await storage.updateFolder(id, updates);
    await loadFolderContents();
  },
  
  deleteFolder: async (id) => {
    const { loadFolderContents } = get();
    await storage.deleteFolder(id);
    await loadFolderContents();
  },
  
  createFile: async (file) => {
    const { loadFolderContents, currentFolderId } = get();
    
    await storage.createFile(
      file.name,
      file.content,
      file.size,
      file.folderId || currentFolderId
    );
    
    await loadFolderContents();
  },
  
  updateFile: async (id, updates) => {
    const { loadFolderContents } = get();
    await storage.updateFile(id, updates);
    await loadFolderContents();
  },
  
  deleteFile: async (id) => {
    const { loadFolderContents } = get();
    await storage.deleteFile(id);
    await loadFolderContents();
  },

  // File upload functionality
  uploadFiles: async (files) => {
    const { currentFolderId, loadFolderContents, getExistingNames } = get();
    set({ isUploading: true, error: null });

    try {
      const existingNames = getExistingNames();
      
      for (const file of files) {
        const content = await readFileAsBase64(file);
        const uniqueName = generateUniqueFileName(file.name, existingNames);
        
        await storage.createFile(
          uniqueName,
          content,
          file.size,
          currentFolderId
        );
        
        existingNames.push(uniqueName);
      }
      
      await loadFolderContents();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      set({ isUploading: false });
    }
  },

  // Computed values
  getDisplayData: () => {
    const { folders, files, searchResults } = get();
    return searchResults || { folders, files };
  },

  getExistingNames: () => {
    const { folders, files } = get();
    return [...folders.map(f => f.name), ...files.map(f => f.name)];
  }
}));