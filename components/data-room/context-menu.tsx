"use client";

import { useRef } from "react";
import {
  ContextMenuItem as ContextMenuItemType,
  ContextMenuPosition,
} from "@/types";
import { useClickOutside } from "@/hooks/ui/use-click-outside";
import { useKeyboardShortcut } from "@/hooks/ui/use-keyboard-shortcut";
import {
  calculateContextMenuPosition,
  CONTEXT_MENU_CONSTANTS,
} from "@/lib/utils-context-menu";
import { ContextMenuItem } from "./context-menu-item";
import { Separator } from "@/components/ui/separator";

interface ContextMenuProps {
  position: ContextMenuPosition;
  items: ContextMenuItemType[];
  onClose: () => void;
}

/**
 * Context menu styles
 */
const CONTEXT_MENU_STYLES = {
  container: `
    bg-white rounded-lg shadow-lg border border-gray-200 py-2
    min-w-[${CONTEXT_MENU_CONSTANTS.MIN_WIDTH}px]
  `,
} as const;

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for better separation of concerns
  useClickOutside(menuRef, onClose);
  useKeyboardShortcut("Escape", onClose);

  // Calculate adjusted position using utility function
  const adjustedStyle = calculateContextMenuPosition(position, items.length);

  // Handle item click with automatic menu close
  const handleItemClick = (item: ContextMenuItemType) => {
    item.action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className={CONTEXT_MENU_STYLES.container}
    >
      {items.map((item) => (
        <ContextMenuItem
          key={item.id}
          item={item}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
}
