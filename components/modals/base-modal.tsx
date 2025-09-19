"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | string;
  maxHeight?: string;
  showCloseButton?: boolean;
  closeButtonDisabled?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = "md",
  maxHeight,
  showCloseButton = true,
  closeButtonDisabled = false,
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          getMaxWidthClass(maxWidth),
          "w-full mx-4",
          maxHeight && "overflow-hidden",
          maxHeight || ""
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex items-center justify-center">{icon}</div>
            )}
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>
          {showCloseButton && (
            <DialogClose
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={closeButtonDisabled}
            ></DialogClose>
          )}
        </DialogHeader>
        <div className={cn("pt-4", maxHeight && "overflow-y-auto")}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getMaxWidthClass = (width: string) => {
  const predefinedSizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return predefinedSizes[width as keyof typeof predefinedSizes] || width;
};
