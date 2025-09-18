'use client';

import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateFolderModalProps {
  onCreateFolder: (name: string) => Promise<void>;
  onClose: () => void;
  existingNames: string[];
}

export function CreateFolderModal({
  onCreateFolder,
  onClose,
  existingNames,
}: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const validateName = (folderName: string): string | null => {
    if (!folderName.trim()) {
      return 'Folder name cannot be empty';
    }
    if (folderName.length > 255) {
      return 'Folder name is too long';
    }
    if (folderName.includes('/') || folderName.includes('\\')) {
      return 'Folder name cannot contain / or \\';
    }
    if (existingNames.includes(folderName.trim())) {
      return 'A folder with this name already exists';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    try {
      await onCreateFolder(name.trim());
      onClose();
    } catch (err) {
      setError('Failed to create folder');
    } finally {
      setIsCreating(false);
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
            <FolderPlus size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold">Create New Folder</h2>
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
            <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter folder name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
              disabled={isCreating}
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !!error || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}