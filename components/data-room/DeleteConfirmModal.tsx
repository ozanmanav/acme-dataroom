'use client';

import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  itemName: string;
  itemType: 'folder' | 'file';
  hasChildren?: boolean;
  childrenCount?: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  itemName,
  itemType,
  hasChildren = false,
  childrenCount = 0,
  onConfirm,
  onClose,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">
              Delete {itemType === 'folder' ? 'Folder' : 'File'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            disabled={isDeleting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-900 mb-4">
              Are you sure you want to delete <strong>"{itemName}"</strong>?
            </p>
            
            {hasChildren && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      This folder contains {childrenCount} item{childrenCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      All contents will be permanently deleted and cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!hasChildren && (
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
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
      </div>
    </div>
  );
}