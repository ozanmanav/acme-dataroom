'use client';

import { useEffect, useRef } from 'react';
import { ContextMenuItem, ContextMenuPosition } from '@/types';

interface ContextMenuProps {
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  const adjustedStyle = {
    position: 'fixed' as const,
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - items.length * 40),
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px]"
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (!item.disabled) {
              item.action();
              onClose();
            }
          }}
          disabled={item.disabled}
          className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 transition-colors duration-150 ${
            item.disabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}