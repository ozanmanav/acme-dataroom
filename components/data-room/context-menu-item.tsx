'use client';

import { ContextMenuItem as ContextMenuItemType } from '@/types';
import { Button } from '@/components/ui/button';

interface ContextMenuItemProps {
  item: ContextMenuItemType;
  onItemClick: (item: ContextMenuItemType) => void;
}

export function ContextMenuItem({ item, onItemClick }: ContextMenuItemProps) {
  const handleClick = () => {
    if (!item.disabled) {
      onItemClick(item);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={item.disabled}
      variant="ghost"
      size="sm"
      className="w-full justify-start px-4 py-2 text-sm h-auto"
    >
      <span>{item.label}</span>
    </Button>
  );
}