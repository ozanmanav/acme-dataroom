'use client';

import { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RenameModalProps {
  currentName: string;
  itemType: 'folder' | 'file';
  onRename: (newName: string) => Promise<void>;
  onClose: () => void;
  existingNames: string[];
}

export function RenameModal({
  currentName,
  itemType,
  onRename,
  onClose,
  existingNames,
}: RenameModalProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const validateName = (newName: string): string | null => {
    if (!newName.trim()) {
      return `${itemType === 'folder' ? 'Folder' : 'File'} name cannot be empty`;
    }
    if (newName.length > 255) {
      return 'Name is too long';
    }
    if (newName.includes('/') || newName.includes('\\')) {
      return 'Name cannot contain / or \\';
    }
    if (newName.trim() !== currentName && existingNames.includes(newName.trim())) {
      return `A ${itemType} with this name already exists`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === currentName) {
      onClose();
      return;
    }
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsRenaming(true);
    try {
      await onRename(name.trim());
      onClose();
    } catch (err) {
      setError(`Failed to rename ${itemType}`);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (error) {
      const validationError = validateName(value);
      if (!validationError) {
        setError('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Edit2 size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold">
              Rename {itemType === 'folder' ? 'Folder' : 'File'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-2">
              {itemType === 'folder' ? 'Folder' : 'File'} Name
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
              disabled={isRenaming}
              onFocus={(e) => {
                // Select filename without extension for files
                if (itemType === 'file' && name.includes('.')) {
                  const lastDotIndex = name.lastIndexOf('.');
                  e.target.setSelectionRange(0, lastDotIndex);
                } else {
                  e.target.select();
                }
              }}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !!error || isRenaming}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}