import { FileItem, FolderItem } from '@/types';

class DataRoomStorage {
  private readonly FOLDERS_KEY = 'dataroom_folders';
  private readonly FILES_KEY = 'dataroom_files';

  // Initialize with root folder if empty
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeStorage();
    }
  }

  private initializeStorage() {
    const folders = this.getFolders();
    if (folders.length === 0) {
      const rootFolder: FolderItem = {
        id: 'root',
        name: 'Data Room',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.saveToStorage(this.FOLDERS_KEY, [rootFolder]);
    }
  }

  private saveToStorage(key: string, data: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private getFromStorage<T>(key: string): T[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Folder operations
  getFolders(): FolderItem[] {
    return this.getFromStorage<FolderItem>(this.FOLDERS_KEY);
  }

  getFolderById(id: string): FolderItem | null {
    const folders = this.getFolders();
    return folders.find(folder => folder.id === id) || null;
  }

  getFoldersByParent(parentId: string | null): FolderItem[] {
    const folders = this.getFolders();
    return folders.filter(folder => folder.parentId === parentId);
  }

  createFolder(name: string, parentId: string | null): FolderItem {
    const folders = this.getFolders();
    const newFolder: FolderItem = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    folders.push(newFolder);
    this.saveToStorage(this.FOLDERS_KEY, folders);
    return newFolder;
  }

  updateFolder(id: string, updates: Partial<Omit<FolderItem, 'id' | 'createdAt'>>): FolderItem | null {
    const folders = this.getFolders();
    const folderIndex = folders.findIndex(folder => folder.id === id);
    
    if (folderIndex === -1) return null;
    
    folders[folderIndex] = {
      ...folders[folderIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveToStorage(this.FOLDERS_KEY, folders);
    return folders[folderIndex];
  }

  deleteFolder(id: string): boolean {
    if (id === 'root') return false; // Prevent root deletion
    
    const folders = this.getFolders();
    const files = this.getFiles();
    
    // Get all descendant folder IDs
    const getAllDescendants = (folderId: string): string[] => {
      const children = folders.filter(f => f.parentId === folderId);
      const descendants = [folderId];
      
      children.forEach(child => {
        descendants.push(...getAllDescendants(child.id));
      });
      
      return descendants;
    };
    
    const foldersToDelete = getAllDescendants(id);
    
    // Delete folders
    const remainingFolders = folders.filter(folder => !foldersToDelete.includes(folder.id));
    this.saveToStorage(this.FOLDERS_KEY, remainingFolders);
    
    // Delete files in these folders
    const remainingFiles = files.filter(file => file.folderId && !foldersToDelete.includes(file.folderId));
    this.saveToStorage(this.FILES_KEY, remainingFiles);
    
    return true;
  }

  // File operations
  getFiles(): FileItem[] {
    return this.getFromStorage<FileItem>(this.FILES_KEY);
  }

  getFilesByFolder(folderId: string | null): FileItem[] {
    const files = this.getFiles();
    return files.filter(file => file.folderId === folderId);
  }

  getFileById(id: string): FileItem | null {
    const files = this.getFiles();
    return files.find(file => file.id === id) || null;
  }

  createFile(name: string, content: string, size: number, folderId: string | null): FileItem {
    const files = this.getFiles();
    const newFile: FileItem = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'pdf',
      size,
      content,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    files.push(newFile);
    this.saveToStorage(this.FILES_KEY, files);
    return newFile;
  }

  updateFile(id: string, updates: Partial<Omit<FileItem, 'id' | 'createdAt'>>): FileItem | null {
    const files = this.getFiles();
    const fileIndex = files.findIndex(file => file.id === id);
    
    if (fileIndex === -1) return null;
    
    files[fileIndex] = {
      ...files[fileIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveToStorage(this.FILES_KEY, files);
    return files[fileIndex];
  }

  deleteFile(id: string): boolean {
    const files = this.getFiles();
    const remainingFiles = files.filter(file => file.id !== id);
    this.saveToStorage(this.FILES_KEY, remainingFiles);
    return true;
  }

  // Utility methods
  getFullPath(folderId: string | null): FolderItem[] {
    if (!folderId || folderId === 'root') {
      const rootFolder = this.getFolderById('root');
      return rootFolder ? [rootFolder] : [];
    }
    
    const folders = this.getFolders();
    const path: FolderItem[] = [];
    let currentId: string | null = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      
      path.unshift(folder);
      currentId = folder.parentId;
    }
    
    return path;
  }

  searchItems(query: string, folderId: string | null = null): { folders: FolderItem[], files: FileItem[] } {
    const allFolders = this.getFolders();
    const allFiles = this.getFiles();
    
    const lowerQuery = query.toLowerCase();
    
    let folders = allFolders.filter(folder => 
      folder.name.toLowerCase().includes(lowerQuery)
    );
    
    let files = allFiles.filter(file => 
      file.name.toLowerCase().includes(lowerQuery)
    );
    
    // If folderId specified, filter to that folder's contents
    if (folderId !== null) {
      folders = folders.filter(folder => folder.parentId === folderId);
      files = files.filter(file => file.folderId === folderId);
    }
    
    return { folders, files };
  }
}

export const storage = new DataRoomStorage();