export interface FileItem {
  id: string;
  name: string;
  type: "pdf";
  size: number;
  content: string; // base64 encoded content
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
  path: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

export interface FileUploadProps {
  onUpload: (files: File[]) => void | Promise<void>;
  onClose: () => void;
  isUploading?: boolean;
}

export interface CreateFolderModalProps {
  onCreateFolder: (name: string) => void | Promise<void>;
  onClose: () => void;
  existingNames: string[];
  isCreating?: boolean;
}

export interface RenameModalProps {
  currentName: string;
  itemType: "folder" | "file";
  onRename: (newName: string) => void | Promise<void>;
  onClose: () => void;
  existingNames: string[];
  isRenaming?: boolean;
}

// Service types
export interface DataRoomServiceInterface {
  loadFolderContents(folderId: string | null): Promise<{
    folders: FolderItem[];
    files: FileItem[];
  }>;
  searchItems(query: string): Promise<{
    folders: FolderItem[];
    files: FileItem[];
  }>;
  createFolder(name: string, parentId: string | null): Promise<FolderItem>;
  uploadFiles(files: File[], folderId: string | null): Promise<FileItem[]>;
  renameFolder(
    folderId: string,
    newName: string
  ): Promise<FolderItem | undefined>;
  renameFile(fileId: string, newName: string): Promise<FileItem | undefined>;
  deleteFolder(folderId: string): Promise<void>;
  deleteFile(fileId: string): Promise<void>;
}

// Error types
export interface DataRoomError {
  message: string;
  code?: string;
  details?: any;
}

// Authentication types
export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  role: "admin" | "user";
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
