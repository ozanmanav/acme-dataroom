'use client';

import { Grid, List, Plus, FolderPlus, Upload } from 'lucide-react';
import { ViewMode } from '@/types';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  onSearch: (query: string) => void;
}

export function Toolbar({
  viewMode,
  onViewModeChange,
  onCreateFolder,
  onUploadFiles,
  onSearch,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <Button onClick={onCreateFolder} variant="outline" size="sm">
          <FolderPlus size={16} className="mr-2" />
          New Folder
        </Button>
        <Button onClick={onUploadFiles} variant="outline" size="sm">
          <Upload size={16} className="mr-2" />
          Upload Files
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <SearchBar onSearch={onSearch} />
        
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 transition-colors duration-150 ${
              viewMode === 'grid'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors duration-150 ${
              viewMode === 'list'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}