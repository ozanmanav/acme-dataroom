"use client";

import { useState, useEffect } from "react";
import { FileItem, FolderItem, ViewMode, BreadcrumbItem } from "@/types";
import { storage } from "@/lib/storage";
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
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Modals
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [renameItem, setRenameItem] = useState<{
    item: FolderItem | FileItem;
    type: "folder" | "file";
  } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    item: FolderItem | FileItem;
    type: "folder" | "file";
  } | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await loadFolderContents();
      await updateBreadcrumbs();
    };
    loadData();
  }, [currentFolderId]);

  const updateBreadcrumbs = async () => {
    const path = await storage.getFullPath(currentFolderId);
    const breadcrumbItems = path.map((folder) => ({
      id: folder.id,
      name: folder.name,
      path: folder.id,
    }));
    setBreadcrumbs(breadcrumbItems);
  };

  const loadFolderContents = async () => {
    if (isSearching) return;

    const folderData = await storage.getFoldersByParent(currentFolderId);
    const fileData = await storage.getFilesByFolder(currentFolderId);

    setFolders(folderData);
    setFiles(fileData);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query);

    if (query) {
      const results = await storage.searchItems(query, currentFolderId);
      setFolders(results.folders);
      setFiles(results.files);
    } else {
      loadFolderContents();
    }
  };

  const handleNavigate = (folderId: string | null) => {
    const targetId = folderId || "root";
    setCurrentFolderId(targetId);
    setSearchQuery("");
    setIsSearching(false);
  };

  // File operations
  const handleFileUpload = async (uploadFiles: File[]) => {
    const existingNames = files.map((f) => f.name);

    for (const file of uploadFiles) {
      try {
        const content = await readFileAsBase64(file);
        const uniqueName = generateUniqueFileName(file.name, existingNames);

        await storage.createFile(uniqueName, content, file.size, currentFolderId);
        existingNames.push(uniqueName);
      } catch (error) {
        console.error("Failed to upload file:", file.name, error);
        throw error;
      }
    }

    loadFolderContents();
  };

  const handleCreateFolder = async (name: string) => {
    await storage.createFolder(name, currentFolderId);
    loadFolderContents();
  };

  const handleRenameFolder = async (newName: string) => {
    if (!renameItem || renameItem.type !== "folder") return;

    await storage.updateFolder(renameItem.item.id, { name: newName });
    loadFolderContents();
  };

  const handleRenameFile = async (newName: string) => {
    if (!renameItem || renameItem.type !== "file") return;

    await storage.updateFile(renameItem.item.id, { name: newName });
    loadFolderContents();
  };

  const handleDeleteFolder = async () => {
    if (!deleteItem || deleteItem.type !== "folder") return;

    setIsDeleting(true);
    try {
      await storage.deleteFolder(deleteItem.item.id);
      loadFolderContents();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteItem || deleteItem.type !== "file") return;

    setIsDeleting(true);
    try {
      await storage.deleteFile(deleteItem.item.id);
      loadFolderContents();
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

  const [deleteItemInfo, setDeleteItemInfo] = useState<{
    hasChildren: boolean;
    childrenCount: number;
  }>({ hasChildren: false, childrenCount: 0 });

  // Update delete item info when deleteItem changes
  useEffect(() => {
    const updateDeleteItemInfo = async () => {
      if (!deleteItem) {
        setDeleteItemInfo({ hasChildren: false, childrenCount: 0 });
        return;
      }

      if (deleteItem.type === "folder") {
        const allFolders = await storage.getFolders();
        const allFiles = await storage.getFiles();

        const countChildren = (folderId: string): number => {
          const subFolders = allFolders.filter((f) => f.parentId === folderId);
          const subFiles = allFiles.filter((f) => f.folderId === folderId);

          let count = subFolders.length + subFiles.length;

          subFolders.forEach((subFolder) => {
            count += countChildren(subFolder.id);
          });

          return count;
        };

        const childrenCount = countChildren(deleteItem.item.id);
        setDeleteItemInfo({ hasChildren: childrenCount > 0, childrenCount });
      } else {
        setDeleteItemInfo({ hasChildren: false, childrenCount: 0 });
      }
    };

    updateDeleteItemInfo();
  }, [deleteItem]);

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
            folders={folders}
            files={files}
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
          hasChildren={deleteItemInfo.hasChildren}
          childrenCount={deleteItemInfo.childrenCount}
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
