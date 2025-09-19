"use client";

import { Home } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import {
  Breadcrumb,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface NavigationBreadcrumbPresenterProps {
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export function NavigationBreadcrumbPresenter({
  path,
  onNavigate,
}: NavigationBreadcrumbPresenterProps) {
  return (
    <nav className="py-4 px-6 bg-white border-b border-gray-200">
      <Breadcrumb>
        <BreadcrumbList>
          <ShadcnBreadcrumbItem>
            <BreadcrumbLink
              onClick={() => onNavigate(null)}
              className="flex items-center space-x-1 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Ana Dizin</span>
            </BreadcrumbLink>
          </ShadcnBreadcrumbItem>

          {path.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <BreadcrumbSeparator />
              <ShadcnBreadcrumbItem>
                {index === path.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onNavigate(item.id)}
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
