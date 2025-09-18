import { FileItem } from "@/types";
import {
  generateUniqueFileName,
  readFileAsBase64,
  downloadFile,
} from "@/lib/utils-data-room";

interface UseDataRoomHandlersProps {
  files: FileItem[];
  currentFolderId: string | null;
  renameItem: any;
  deleteItem: any;
  createFile: (file: any) => Promise<void>;
  createFolder: (name: string, folderId: string | null) => Promise<void>;
  updateFile: (id: string, updates: any) => Promise<void>;
  updateFolder: (id: string, updates: any) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  searchItems: (query: string) => Promise<void>;
  clearSearch: () => void;
  setCurrentFolderId: (id: string | null) => void;
  loadFolderContents: (id: string | null) => Promise<void>;
  updateBreadcrumbs: (id: string | null) => void;
  setDeleteItem: (item: any) => void;
  setIsDeleting: (deleting: boolean) => void;
}

export const useDataRoomHandlers = ({
  files,
  currentFolderId,
  renameItem,
  deleteItem,
  createFile,
  createFolder,
  updateFile,
  updateFolder,
  deleteFile,
  deleteFolder,
  searchItems,
  clearSearch,
  setCurrentFolderId,
  loadFolderContents,
  updateBreadcrumbs,
  setDeleteItem,
  setIsDeleting,
}: UseDataRoomHandlersProps) => {
  
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

  return {
    handleSearch,
    handleNavigate,
    handleFileUpload,
    handleCreateFolder,
    handleRenameFolder,
    handleRenameFile,
    handleDeleteFolder,
    handleDeleteFile,
    handleDownloadFile,
  };
};