'use client';

import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseModal } from './BaseModal';

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
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      setError('Folder name is required');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Folder name must be 50 characters or less');
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_().]+$/.test(trimmedName)) {
      setError('Folder name contains invalid characters');
      return;
    }

    if (existingNames.includes(trimmedName)) {
      setError('A folder with this name already exists');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      await onCreateFolder(trimmedName);
      onClose();
    } catch (error) {
      setError('Failed to create folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFolderName(value);
    
    if (value.trim()) {
      if (error) {
        setError('');
      }
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Create New Folder"
      icon={<FolderPlus size={20} className="text-blue-600" />}
      closeButtonDisabled={isCreating}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
            Folder Name
          </label>
          <input
            type="text"
            id="folderName"
            value={folderName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter folder name"
            disabled={isCreating}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
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
            disabled={isCreating || !folderName.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Folder'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}