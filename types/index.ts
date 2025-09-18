export interface FileItem {
  id: string;
  name: string;
  type: 'pdf';
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

export type ViewMode = 'grid' | 'list';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}