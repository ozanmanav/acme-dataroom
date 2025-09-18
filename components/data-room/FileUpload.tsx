'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils-data-room';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  onClose: () => void;
}

interface FileWithProgress {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string | null;
}

export function FileUpload({ onUpload, onClose }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are supported';
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileWithProgress[] = [];
    
    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      newFiles.push({
        file,
        status: error ? 'error' : 'pending',
        error,
      });
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending').map(f => f.file);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
      ));

      await onUpload(validFiles);
      
      // Update status to success
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'success' as const } : f
      ));

      // Auto-close after successful upload
      setTimeout(onClose, 1000);
      
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: 'Upload failed' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const validFilesCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Upload PDF Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop PDF files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Maximum file size: 50MB per file
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isUploading}
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Selected Files</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileItem, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="shrink-0">
                      {fileItem.status === 'error' ? (
                        <AlertCircle size={20} className="text-red-500" />
                      ) : (
                        <FileText size={20} className="text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      {fileItem.error && (
                        <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {fileItem.status === 'uploading' && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {fileItem.status === 'success' && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <X size={12} className="text-white" />
                        </div>
                      )}
                      {(fileItem.status === 'pending' || fileItem.status === 'error') && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                          disabled={isUploading}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {files.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {validFilesCount} file{validFilesCount !== 1 ? 's' : ''} ready to upload
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={validFilesCount === 0 || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}