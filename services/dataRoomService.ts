import { FileItem, FolderItem, BreadcrumbItem } from '@/types';
import { storage } from '@/lib/storage';
import { generateUniqueFileName, readFileAsBase64 } from '@/lib/utils-data-room';

export interface DataRoomServiceResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface SearchResults {
  folders: FolderItem[];
  files: FileItem[];
}

export interface FolderContents {
  folders: FolderItem[];
  files: FileItem[];
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Service layer for DataRoom operations
 * Handles all business logic and data operations
 */
export class DataRoomService {
  /**
   * Load folder contents with breadcrumbs
   */
  static async loadFolderContents(folderId: string | null): Promise<DataRoomServiceResult<FolderContents>> {
    try {
      const [folders, files, breadcrumbs] = await Promise.all([
        storage.getFoldersByParent(folderId),
        storage.getFilesByFolder(folderId),
        this.getBreadcrumbs(folderId)
      ]);

      return {
        success: true,
        data: { folders, files, breadcrumbs }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load folder contents'
      };
    }
  }

  /**
   * Search items across folders and files
   */
  static async searchItems(query: string): Promise<DataRoomServiceResult<SearchResults>> {
    try {
      if (!query.trim()) {
        return {
          success: true,
          data: { folders: [], files: [] }
        };
      }

      const results = await storage.searchItems(query);
      return {
        success: true,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Create a new folder
   */
  static async createFolder(name: string, parentId: string | null): Promise<DataRoomServiceResult<FolderItem>> {
    try {
      if (!name.trim()) {
        return {
          success: false,
          error: 'Folder name cannot be empty'
        };
      }

      const folder = await storage.createFolder(name.trim(), parentId);

      return {
        success: true,
        data: folder
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folder'
      };
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(files: File[], folderId: string | null, existingNames: string[]): Promise<DataRoomServiceResult<FileItem[]>> {
    try {
      const uploadedFiles: FileItem[] = [];
      const currentNames = [...existingNames];

      for (const file of files) {
        try {
          const content = await readFileAsBase64(file);
          const uniqueName = generateUniqueFileName(file.name, currentNames);

          const uploadedFile = await storage.createFile(
            uniqueName,
            content,
            file.size,
            folderId
          );

          uploadedFiles.push(uploadedFile);
          currentNames.push(uniqueName);
        } catch (fileError) {
          console.error(`Failed to upload file: ${file.name}`, fileError);
          // Continue with other files instead of failing completely
        }
      }

      return {
        success: true,
        data: uploadedFiles
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload files'
      };
    }
  }

  /**
   * Rename a folder
   */
  static async renameFolder(id: string, newName: string): Promise<DataRoomServiceResult<FolderItem>> {
    try {
      if (!newName.trim()) {
        return {
          success: false,
          error: 'Folder name cannot be empty'
        };
      }

      const updatedFolder = await storage.updateFolder(id, { name: newName.trim() });
      if (!updatedFolder) {
        return {
          success: false,
          error: 'Folder not found'
        };
      }

      return {
        success: true,
        data: updatedFolder
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rename folder'
      };
    }
  }

  /**
   * Rename a file
   */
  static async renameFile(id: string, newName: string): Promise<DataRoomServiceResult<FileItem>> {
    try {
      if (!newName.trim()) {
        return {
          success: false,
          error: 'File name cannot be empty'
        };
      }

      const updatedFile = await storage.updateFile(id, { name: newName.trim() });
      if (!updatedFile) {
        return {
          success: false,
          error: 'File not found'
        };
      }

      return {
        success: true,
        data: updatedFile
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rename file'
      };
    }
  }

  /**
   * Delete a folder
   */
  static async deleteFolder(id: string): Promise<DataRoomServiceResult<void>> {
    try {
      await storage.deleteFolder(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete folder'
      };
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(id: string): Promise<DataRoomServiceResult<void>> {
    try {
      await storage.deleteFile(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  }

  /**
   * Get breadcrumbs for a folder
   */
  private static async getBreadcrumbs(folderId: string | null): Promise<BreadcrumbItem[]> {
    if (!folderId) {
      return [];
    }

    try {
      const folderPath = await storage.getFullPath(folderId);
      return folderPath.map((folder: FolderItem) => ({
        id: folder.id,
        name: folder.name,
        path: `/${folder.name}`
      }));
    } catch (error) {
      console.error('Failed to get breadcrumbs:', error);
      return [];
    }
  }

  /**
   * Get file type from filename
   */
  private static getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'doc':
      case 'docx':
        return 'document';
      case 'xls':
      case 'xlsx':
        return 'spreadsheet';
      default:
        return 'file';
    }
  }

  /**
   * Get existing names in a folder for validation
   */
  static getExistingNames(folders: FolderItem[], files: FileItem[]): string[] {
    return [...folders.map(f => f.name), ...files.map(f => f.name)];
  }
}