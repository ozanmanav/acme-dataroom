'use client';

import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface NavigationBreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export function NavigationBreadcrumb({ path, onNavigate }: NavigationBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 py-4 px-6 bg-white border-b border-gray-200">
      <button
        onClick={() => onNavigate('root')}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors duration-150"
      >
        <Home size={16} />
        <span className="text-sm font-medium">Data Room</span>
      </button>
      
      {path.length > 1 && (
        <>
          {path.slice(1).map((item, index) => (
            <div key={item.id} className="flex items-center space-x-2">
              <ChevronRight size={16} className="text-gray-400" />
              <button
                onClick={() => onNavigate(item.id)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150 max-w-[200px] truncate"
                title={item.name}
              >
                {item.name}
              </button>
            </div>
          ))}
        </>
      )}
    </nav>
  );
}