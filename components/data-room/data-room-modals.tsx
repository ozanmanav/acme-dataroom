"use client";

import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { FileUpload } from "@/components/forms/file-upload";
import { CreateFolderModal } from "@/components/modals/create-folder-modal";
import { RenameModal } from "@/components/modals/rename-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { FilePreview } from "@/components/data-room/file-preview";

export function DataRoomModals() {
  const {
    currentFolderId,
    uploadFiles,
    createFolder,
    updateFolder,
    updateFile,
    deleteFolder,
    deleteFile,
    getExistingNames,
  } = useDataRoomStore();

  const {
    showFileUpload,
    showCreateFolder,
    renameItem,
    deleteItem,
    previewFile,
    setShowFileUpload,
    setShowCreateFolder,
    setRenameItem,
    setDeleteItem,
    setPreviewFile,
    setIsDeleting,
  } = useUIStore();

  const handleFileUpload = async (files: File[]) => {
    await uploadFiles(files);
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolderId);
  };

  const handleRename = async (newName: string) => {
    if (!renameItem) return;

    if (renameItem.type === "folder") {
      await updateFolder(renameItem.item.id, { name: newName });
    } else {
      await updateFile(renameItem.item.id, { name: newName });
    }
    setRenameItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      if (deleteItem.type === "folder") {
        await deleteFolder(deleteItem.item.id);
      } else {
        await deleteFile(deleteItem.item.id);
      }
      setDeleteItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
          onRename={handleRename}
          onClose={() => setRenameItem(null)}
          existingNames={getExistingNames()}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          itemName={deleteItem.item.name}
          itemType={deleteItem.type}
          onConfirm={handleDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
}
