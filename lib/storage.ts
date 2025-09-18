import { FileItem, FolderItem } from "@/types";
import Dexie, { Table } from "dexie";

interface DataRoomDB extends Dexie {
  folders: Table<FolderItem>;
  files: Table<FileItem>;
}

class DataRoomStorage {
  private db: DataRoomDB;

  constructor() {
    this.db = new Dexie("DataRoomDB") as DataRoomDB;
    
    this.db.version(1).stores({
      folders: "id, name, parentId, createdAt, updatedAt",
      files: "id, name, type, size, content, folderId, createdAt, updatedAt"
    });

    if (typeof window !== "undefined") {
      this.initializeStorage();
    }
  }

  private async initializeStorage() {
    try {
      // Storage başlatıldı - artık migration veya otomatik klasör oluşturma yok
      console.log("Storage initialized");
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  // Folder operations
  async getFolders(): Promise<FolderItem[]> {
    try {
      return await this.db.folders.toArray();
    } catch (error) {
      console.error("Failed to get folders:", error);
      return [];
    }
  }

  async getFolderById(id: string): Promise<FolderItem | null> {
    try {
      const folder = await this.db.folders.get(id);
      return folder || null;
    } catch (error) {
      console.error("Failed to get folder by id:", error);
      return null;
    }
  }

  async getFoldersByParent(parentId: string | null): Promise<FolderItem[]> {
    try {
      if (parentId === null) {
        return await this.db.folders.filter(folder => folder.parentId === null).toArray();
      }
      return await this.db.folders.where("parentId").equals(parentId).toArray();
    } catch (error) {
      console.error("Failed to get folders by parent:", error);
      return [];
    }
  }

  async createFolder(name: string, parentId: string | null): Promise<FolderItem> {
    const newFolder: FolderItem = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await this.db.folders.add(newFolder);
      return newFolder;
    } catch (error) {
      console.error("Failed to create folder:", error);
      throw error;
    }
  }

  async updateFolder(
    id: string,
    updates: Partial<Omit<FolderItem, "id" | "createdAt">>
  ): Promise<FolderItem | null> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date(),
      };

      await this.db.folders.update(id, updatedData);
      return await this.getFolderById(id);
    } catch (error) {
      console.error("Failed to update folder:", error);
      return null;
    }
  }

  async deleteFolder(id: string): Promise<boolean> {
    if (id === "root") return false; // Prevent root deletion

    try {
      const folders = await this.getFolders();
      const files = await this.getFiles();

      // Get all descendant folder IDs
      const getAllDescendants = (folderId: string): string[] => {
        const children = folders.filter((f) => f.parentId === folderId);
        const descendants = [folderId];

        children.forEach((child) => {
          descendants.push(...getAllDescendants(child.id));
        });

        return descendants;
      };

      const foldersToDelete = getAllDescendants(id);

      // Delete folders
      await this.db.folders.where("id").anyOf(foldersToDelete).delete();

      // Delete files in these folders
      await this.db.files.where("folderId").anyOf(foldersToDelete).delete();

      return true;
    } catch (error) {
      console.error("Failed to delete folder:", error);
      return false;
    }
  }

  // File operations
  async getFiles(): Promise<FileItem[]> {
    try {
      return await this.db.files.toArray();
    } catch (error) {
      console.error("Failed to get files:", error);
      return [];
    }
  }

  async getFilesByFolder(folderId: string | null): Promise<FileItem[]> {
    try {
      if (folderId === null) {
        return await this.db.files.filter(file => file.folderId === null).toArray();
      }
      return await this.db.files.where("folderId").equals(folderId).toArray();
    } catch (error) {
      console.error("Failed to get files by folder:", error);
      return [];
    }
  }

  async getFileById(id: string): Promise<FileItem | null> {
    try {
      const file = await this.db.files.get(id);
      return file || null;
    } catch (error) {
      console.error("Failed to get file by id:", error);
      return null;
    }
  }

  async createFile(
    name: string,
    content: string,
    size: number,
    folderId: string | null
  ): Promise<FileItem> {
    const newFile: FileItem = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: "pdf",
      size,
      content,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await this.db.files.add(newFile);
      return newFile;
    } catch (error) {
      console.error("Failed to create file:", error);
      throw error;
    }
  }

  async updateFile(
    id: string,
    updates: Partial<Omit<FileItem, "id" | "createdAt">>
  ): Promise<FileItem | null> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date(),
      };

      await this.db.files.update(id, updatedData);
      return await this.getFileById(id);
    } catch (error) {
      console.error("Failed to update file:", error);
      return null;
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      await this.db.files.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete file:", error);
      return false;
    }
  }

  // Utility methods
  async getFullPath(folderId: string | null): Promise<FolderItem[]> {
    if (!folderId || folderId === "root") {
      const rootFolder = await this.getFolderById("root");
      return rootFolder ? [rootFolder] : [];
    }

    const folders = await this.getFolders();
    const path: FolderItem[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (!folder) break;

      path.unshift(folder);
      currentId = folder.parentId;
    }

    return path;
  }

  async searchItems(
    query: string,
    folderId: string | null = null
  ): Promise<{ folders: FolderItem[]; files: FileItem[] }> {
    const allFolders = await this.getFolders();
    const allFiles = await this.getFiles();

    const lowerQuery = query.toLowerCase();

    let folders = allFolders.filter((folder) =>
      folder.name.toLowerCase().includes(lowerQuery)
    );

    let files = allFiles.filter((file) =>
      file.name.toLowerCase().includes(lowerQuery)
    );

    // If folderId specified, filter to that folder's contents
    if (folderId !== null) {
      folders = folders.filter((folder) => folder.parentId === folderId);
      files = files.filter((file) => file.folderId === folderId);
    }

    return { folders, files };
  }
}

export const storage = new DataRoomStorage();
