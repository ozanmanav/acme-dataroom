"use client";

import { useState } from "react";
import {
  Folder,
  FileText,
  MoreVertical,
  Download,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  FolderItem,
  FileItem,
  ViewMode,
  ContextMenuPosition,
  ContextMenuItem,
} from "@/types";
import { formatFileSize, formatDate } from "@/lib/utils-data-room";
import { ContextMenu } from "./context-menu";
import { Button } from "@/components/ui/button";

interface FolderViewPresenterProps {
  folders: FolderItem[];
  files: FileItem[];
  viewMode: ViewMode;
  onFolderClick: (folderId: string) => void;
  onFileClick: (file: FileItem) => void;
  onRenameFolder: (folder: FolderItem) => void;
  onDeleteFolder: (folder: FolderItem) => void;
  onRenameFile: (file: FileItem) => void;
  onDeleteFile: (file: FileItem) => void;
  onDownloadFile: (file: FileItem) => void;
}

export function FolderViewPresenter({
  folders,
  files,
  viewMode,
  onFolderClick,
  onFileClick,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
}: FolderViewPresenterProps) {
  const [contextMenu, setContextMenu] = useState<{
    position: ContextMenuPosition;
    items: ContextMenuItem[];
  } | null>(null);

  const handleContextMenu = (
    e: React.MouseEvent,
    item: FolderItem | FileItem,
    type: "folder" | "file"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const items: ContextMenuItem[] = [
      {
        label: "Rename",
        icon: <Edit2 size={16} />,
        onClick: () => {
          if (type === "folder") {
            onRenameFolder(item as FolderItem);
          } else {
            onRenameFile(item as FileItem);
          }
          setContextMenu(null);
        },
      },
      ...(type === "file"
        ? [
            {
              label: "Download",
              icon: <Download size={16} />,
              onClick: () => {
                onDownloadFile(item as FileItem);
                setContextMenu(null);
              },
            },
          ]
        : []),
      {
        label: "Delete",
        icon: <Trash2 size={16} />,
        onClick: () => {
          if (type === "folder") {
            onDeleteFolder(item as FolderItem);
          } else {
            onDeleteFile(item as FileItem);
          }
          setContextMenu(null);
        },
        variant: "destructive" as const,
      },
    ];

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items,
    });
  };

  const handleItemClick = (
    item: FolderItem | FileItem,
    type: "folder" | "file"
  ) => {
    if (type === "folder") {
      onFolderClick((item as FolderItem).id);
    } else {
      onFileClick(item as FileItem);
    }
  };

  const isEmpty = folders.length === 0 && files.length === 0;

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Folder size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-500">
            This folder is empty or no results match your search.
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                onClick={() => handleItemClick(folder, "folder")}
                onContextMenu={(e) => handleContextMenu(e, folder, "folder")}
              >
                <Folder size={48} className="text-blue-500 mb-2" />
                <span
                  className="text-sm text-center text-gray-700 truncate w-full"
                  title={folder.name}
                >
                  {folder.name}
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, folder, "folder");
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                >
                  <MoreVertical size={14} />
                </Button>
              </div>
            ))}

            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                onClick={() => handleItemClick(file, "file")}
                onContextMenu={(e) => handleContextMenu(e, file, "file")}
              >
                <FileText size={48} className="text-red-500 mb-2" />
                <span
                  className="text-sm text-center text-gray-700 truncate w-full"
                  title={file.name}
                >
                  {file.name}
                </span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadFile(file);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Download"
                  >
                    <Download size={14} />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, file, "file");
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <MoreVertical size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {contextMenu && (
          <ContextMenu
            position={contextMenu.position}
            items={contextMenu.items}
            onClose={() => setContextMenu(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modified
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {folders.map((folder) => (
              <tr
                key={folder.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => handleItemClick(folder, "folder")}
                onContextMenu={(e) => handleContextMenu(e, folder, "folder")}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Folder size={20} className="text-blue-500 mr-3 shrink-0" />
                    <span
                      className="text-sm font-medium text-gray-900 truncate"
                      title={folder.name}
                    >
                      {folder.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(folder.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, folder, "folder");
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </td>
              </tr>
            ))}

            {files.map((file) => (
              <tr
                key={file.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => handleItemClick(file, "file")}
                onContextMenu={(e) => handleContextMenu(e, file, "file")}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText
                      size={20}
                      className="text-red-500 mr-3 shrink-0"
                    />
                    <span
                      className="text-sm font-medium text-gray-900 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(file.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadFile(file);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                      title="Download"
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, file, "file");
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
