'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
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
  maxWidth = 'md',
  maxHeight,
  showCloseButton = true,
  closeButtonDisabled = false,
}: BaseModalProps) {
  if (!isOpen) return null;

  const getMaxWidthClass = (width: string) => {
    const predefinedSizes = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
    };
    
    return predefinedSizes[width as keyof typeof predefinedSizes] || width;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div 
        className={`bg-white rounded-lg shadow-xl ${getMaxWidthClass(maxWidth)} w-full mx-4 ${maxHeight || ''} ${maxHeight ? 'overflow-hidden' : ''}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {icon && <div className="flex items-center justify-center">{icon}</div>}
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={closeButtonDisabled}
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className={`p-6 ${maxHeight ? 'overflow-y-auto' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}