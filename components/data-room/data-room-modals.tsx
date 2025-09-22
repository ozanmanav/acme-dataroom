"use client";

import { useDataRoomStore } from "@/lib/stores/data-room-store";
import { useModalRouter } from "@/hooks/use-modal-router";
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

  const { modal, closeModal } = useModalRouter();

  // Handler functions
  const handleFileUpload = async (files: File[]) => {
    await uploadFiles(files);
    closeModal();
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolderId);
    closeModal();
  };

  const handleRename = async (newName: string) => {
    const { item, type } = modal.props || {};
    if (!item || !type) return;

    if (type === "folder") {
      await updateFolder(item.id, { name: newName });
    } else {
      await updateFile(item.id, { name: newName });
    }
    closeModal();
  };

  const handleDelete = async () => {
    const { item, type } = modal.props || {};
    if (!item || !type) return;

    try {
      if (type === "folder") {
        await deleteFolder(item.id);
      } else {
        await deleteFile(item.id);
      }
      closeModal();
    } catch (error) {
      // Error handling can be done here if needed
      console.error("Delete failed:", error);
    }
  };

  // Modal renderer
  if (!modal.type) return null;

  const modalComponents = {
    "file-upload": (
      <FileUpload onUpload={handleFileUpload} onClose={closeModal} />
    ),
    "create-folder": (
      <CreateFolderModal
        onCreateFolder={handleCreateFolder}
        onClose={closeModal}
        existingNames={getExistingNames()}
      />
    ),
    rename: (
      <RenameModal
        currentName={modal.props?.item?.name || ""}
        itemType={modal.props?.type || "file"}
        onRename={handleRename}
        onClose={closeModal}
        existingNames={getExistingNames()}
      />
    ),
    delete: (
      <DeleteConfirmModal
        itemName={modal.props?.item?.name || ""}
        itemType={modal.props?.type || "file"}
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    ),
    preview: <FilePreview file={modal.props?.file} onClose={closeModal} />,
  };

  return modalComponents[modal.type] || null;
}
