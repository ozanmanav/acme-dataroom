'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseModal } from './BaseModal';

interface DeleteConfirmModalProps {
  itemName: string;
  itemType: 'folder' | 'file';
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteConfirmModal({
  itemName,
  itemType,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(`Failed to delete ${itemType}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={`Delete ${itemType === 'folder' ? 'Folder' : 'File'}`}
      icon={<Trash2 size={20} className="text-red-600" />}
      closeButtonDisabled={isDeleting}
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">"{itemName}"</span>?
        </p>
        
        {itemType === 'folder' && (
          <p className="text-sm text-red-600">
            This will permanently delete the folder and all its contents.
          </p>
        )}
        
        <p className="text-sm text-gray-500">
          This action cannot be undone.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}