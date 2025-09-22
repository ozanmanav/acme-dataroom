"use client";

import { Home } from "lucide-react";
import { useDataRoomStore } from "@/lib/stores/data-room-store";
import {
  Breadcrumb,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function NavigationBreadcrumb() {
  const {
    breadcrumbs,
    setCurrentFolderId,
    loadFolderContents,
    updateBreadcrumbs,
  } = useDataRoomStore();

  const handleNavigate = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
    await updateBreadcrumbs(folderId);
  };

  return (
    <nav className="py-4 px-6 bg-white border-b border-gray-200">
      <Breadcrumb>
        <BreadcrumbList>
          <ShadcnBreadcrumbItem>
            <BreadcrumbLink
              onClick={() => handleNavigate(null)}
              className="flex items-center space-x-1 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Root Directory</span>
            </BreadcrumbLink>
          </ShadcnBreadcrumbItem>

          {breadcrumbs.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <BreadcrumbSeparator />
              <ShadcnBreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => handleNavigate(item.id)}
                    className="cursor-pointer"
                  >
                    {item.name}
                  </BreadcrumbLink>
                )}
              </ShadcnBreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
