import { create } from "zustand";

export type ModalType =
  | "file-upload"
  | "create-folder"
  | "rename"
  | "delete"
  | "preview"
  | null;

export interface ModalState {
  type: ModalType;
  props?: Record<string, any>;
}

interface ModalRouterStore {
  modal: ModalState;
  openModal: (
    type: Exclude<ModalType, null>,
    props?: Record<string, any>
  ) => void;
  closeModal: () => void;
  isOpen: (type: Exclude<ModalType, null>) => boolean;
}

export const useModalRouter = create<ModalRouterStore>((set, get) => ({
  modal: { type: null },

  openModal: (type, props = {}) => {
    set({ modal: { type, props } });
  },

  closeModal: () => {
    set({ modal: { type: null, props: undefined } });
  },

  isOpen: (type) => {
    return get().modal.type === type;
  },
}));

// Helper hooks for specific modals
export const useModalActions = () => {
  const { openModal, closeModal } = useModalRouter();

  return {
    openFileUpload: () => openModal("file-upload"),
    openCreateFolder: () => openModal("create-folder"),
    openRename: (item: any, type: "folder" | "file") =>
      openModal("rename", { item, type }),
    openDelete: (item: any, type: "folder" | "file") =>
      openModal("delete", { item, type }),
    openPreview: (file: any) => openModal("preview", { file }),
    closeModal,
  };
};
